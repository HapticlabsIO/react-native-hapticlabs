import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-hapticlabs' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const Hapticlabs = NativeModules.Hapticlabs
  ? NativeModules.Hapticlabs
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

/**
 * This command will play an HLA file from the specified `path`, including corresponding audio files.
 *
 * *Note*: This command is only supported on Android.
 * @param path The path to the HLA file. This can be a path relative to the assets directory or a fully qualified path.
 * @returns A promise that resolves when the HLA file has been played.
 */
export function playHLA(path: string): Promise<void> {
  if (Platform.OS === 'android') {
    return Hapticlabs.playHLA(path);
  } else {
    return Promise.reject(new Error('HLA is only supported on Android'));
  }
}

/**
 * This command will play an OGG file from the specified `path`, including encoded haptic feedback.
 * If the device's haptic support level is less than 3, the device will play the audio file without haptic feedback.
 * To automatically select adequate haptic feedback for the device, use `playAndroidHaptics` instead.
 *
 * *Note*: This command is only supported on Android.
 * @param path The path to the OGG file. This can be a path relative to the assets directory or a fully qualified path.
 * @returns A promise that resolves when the OGG file has been played.
 */
export function playOGG(path: string): Promise<void> {
  if (Platform.OS === 'android') {
    return Hapticlabs.playOGG(path);
  } else {
    return Promise.reject(new Error('OGG is only supported on Android'));
  }
}

/**
 * This command will play a haptic pattern from the specified `directoryPath`.
 * Depending on the device's haptic support level, different haptic feedback will be played.
 * For instance, if the device's haptic support level is 3, the device will play the haptic pattern
 * specified in the `lvl3` subdirectory. If the device's haptic support level is 0, no haptic feedback will be played.
 * Make sure that the directory follows the following structure:
 * ```
 * directoryPath
 * ├── lvl1
 * │   └── main.hla
 * ├── lvl2
 * │   └── main.hla
 * └── lvl3
 *     └── main.ogg
 * ```
 * *Note*: This command is only supported on Android.
 * @param directoryPath The path to the haptic pattern directory. This can be a path relative to the assets directory or a fully qualified path.
 * @returns A promise that resolves when the haptic pattern has been played.
 */
export function playAndroidHaptics(directoryPath: string): Promise<void> {
  if (Platform.OS === 'android') {
    return Hapticlabs.playAndroidHaptics(directoryPath);
  } else {
    return Promise.reject(
      new Error('Android haptics are only supported on Android')
    );
  }
}

/**
 * The device's haptic support level.
 * This value is a number between 0 and 3, where:
 * - 0: The device does not support haptics.
 * - 1: The device supports on / off haptic feedback.
 * - 2: The device supports amplitude control haptic feedback.
 * - 3: The device supports fully customizable haptic feedback.
 *
 * *Note*: This value is only supported on Android.
 */
export const androidHapticSupportLevel: 0 | 1 | 2 | 3 =
  Hapticlabs.hapticSupportLevel ?? -1;

/**
 * This command will play an AHAP file from the specified `path`, including corresponding AHAP files and audio files.
 *
 * *Note*: This command is only supported on iOS.
 * @param path The path to the AHAP file.
 * @returns A promise that resolves when the AHAP file has been played.
 */
export function playAHAP(path: string): Promise<void> {
  if (Platform.OS === 'ios') {
    return Hapticlabs.playAHAP(path);
  } else {
    return Promise.reject(new Error('AHAP is only supported on iOS'));
  }
}
