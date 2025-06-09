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
  Hapticlabs.hapticSupportLevel ?? 0;

/**
 * Whether the device supports on/off haptic feedback.
 *
 * On/Off haptic feedback is the most basic form of haptic feedback with timing
 * being the only controllable parameter.
 *
 * *Note**: This value is only supported on Android.
 */
export const areOnOffHapticsSupported: boolean =
  Hapticlabs.areOnOffHapticsSupported ?? false;

/**
 * Whether the device supports amplitude control haptic feedback.
 *
 * Amplitude control haptic feedback allows for more nuanced haptic feedback
 * by controlling the amplitude of the haptic signal over time.
 *
 * **Note**: This value is only supported on Android.
 */
export const areAmplitudeControlHapticsSupported: boolean =
  Hapticlabs.areAmplitudeControlHapticsSupported ?? false;

/**
 * Whether the device supports audio coupled haptic feedback.
 *
 * Audio coupled haptic feedback allows for full control over the haptic
 * feedback, while at the same time offering playback synchronized with audio.
 *
 * **Note**: This value is only supported on Android.
 */
export const areAudioCoupledHapticsSupported: boolean =
  Hapticlabs.areAudioCoupledHapticsSupported ?? false;

/**
 * Whether the device supports envelope-controlled haptic feedback.
 *
 * Similar to amplitude control haptic feedback, envelope-controlled haptic
 * feedback allows for controlling both the amplitude and the frequency of the
 * haptic signal over time.
 *
 * **Note**: This value is only supported on Android.
 */
export const areEnvelopeHapticsSupported: boolean =
  Hapticlabs.areEnvelopeHapticsSupported ?? false;

/**
 * The device's haptic actuator's resonance frequency.
 *
 * This is the frequency at which the haptic actuator is driven for e.g. HLA
 * level 2 files. At this frequency, the actuator will resonate and produce
 * the strongest and most energy-efficient haptic feedback.
 *
 * **Note**: This value is only supported on Android.
 */
export const resonanceFrequency: number | null =
  Hapticlabs.resonanceFrequency ?? null;

/**
 * The device's haptic actuator's q factor.
 *
 * See https://en.wikipedia.org/wiki/Q_factor for more information.
 *
 * **Note**: This value is only supported on Android.
 */
export const qFactor: number | null = Hapticlabs.qFactor ?? null;

/**
 * The device's haptic actuator's self-reported minimum frequency.
 *
 * **Note**: This value is only supported on Android.
 *
 * **Note**: With audio-coupled haptics (OGG files), there are no frequency
 * limits.
 */
export const minFrequency: number | null = Hapticlabs.minFrequency ?? null;

/**
 * The device's haptic actuator's self-reported maximum frequency.
 *
 * **Note**: This value is only supported on Android.
 *
 * **Note**: With audio-coupled haptics (OGG files), there are no frequency
 * limits.
 */
export const maxFrequency: number | null = Hapticlabs.maxFrequency ?? null;

/**
 * The device's haptic actuator's self-reported maximum acceleration (in Gs).
 *
 * **Note**: This value is only supported on Android.
 */
export const maxAcceleration: number | null =
  Hapticlabs.maxAcceleration ?? null;

// Deserialize the frequency response data from the native module
const frequencyResponseKeys = Hapticlabs.frequencyResponseKeys;
const frequencyResponseValues = Hapticlabs.frequencyResponseValues;

let frequencyResponse: Map<number, number> | null = null;

if (frequencyResponseKeys != null && frequencyResponseValues != null) {
  if (frequencyResponseKeys.length === frequencyResponseValues.length) {
    // Valid frequency response data
    frequencyResponse = new Map<number, number>();
    for (let i = 0; i < frequencyResponseKeys.length; i++) {
      const frequency = parseFloat(frequencyResponseKeys[i]);
      const acceleration = parseFloat(frequencyResponseValues[i]);
      if (!isNaN(frequency) && !isNaN(acceleration)) {
        frequencyResponse.set(frequency, acceleration);
      }
    }
  }
}

/**
 * The device's haptic actuator's self-reported frequency response.
 *
 * This is a map from frequency (in Hz) to acceleration (in Gs) at that
 * frequency.
 *
 * **Note**: This value is only supported on Android.
 */
export { frequencyResponse };

/**
 * The minimum duration (in milliseconds) for an envelope control point.
 *
 * **Note**: This value is only supported on Android.
 */
export const envelopeControlPointMinDurationMillis: number | null =
  Hapticlabs.envelopeControlPointMinDurationMillis ?? null;

/**
 * The maximum duration (in milliseconds) for an envelope control point.
 *
 * **Note**: This value is only supported on Android.
 */
export const envelopeControlPointMaxDurationMillis: number | null =
  Hapticlabs.envelopeControlPointMaxDurationMillis ?? null;

/**
 * The maximum duration (in milliseconds) for an envelope effect.
 *
 * **Note**: This value is only supported on Android.
 */
export const envelopeMaxDurationMillis: number | null =
  Hapticlabs.envelopeMaxDuration ?? null;

/**
 * The maximum number of control points for an envelope effect.
 *
 * **Note**: This value is only supported on Android.
 */
export const envelopeMaxControlPointCount: number | null =
  Hapticlabs.envelopeMaxControlPoints ?? null;

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

/**
 * This command will play the haptic pattern specified by the `iosPath` on iOS and the `androidPath` on Android.
 * @param iosPath The path to the AHAP file.
 * @param androidPath The path to the Android haptic pattern directory. This can be a path relative to the assets directory or a fully qualified path.
 * @returns A promise that resolves when the haptic pattern has finished playing.
 */
export function playHaptics({
  iosPath,
  androidPath,
}: {
  iosPath: string;
  androidPath: string;
}): Promise<void> {
  if (Platform.OS === 'ios') {
    return Hapticlabs.playAHAP(iosPath);
  } else if (Platform.OS === 'android') {
    return Hapticlabs.playAndroidHaptics(androidPath);
  } else {
    return Promise.reject(
      new Error('Haptics are only supported on iOS and Android')
    );
  }
}

export enum PredefinedHaptics {
  ANDROID_CLICK = 'Click',
  ANDROID_DOUBLE_CLICK = 'Double Click',
  ANDROID_HEAVY_CLICK = 'Heavy Click',
  ANDROID_TICK = 'Tick',
}

/**
 * This command will play a predefined (built-in) haptic signal.
 * @param signal The predefined haptic signal to play.
 */
export function playPredefinedHaptics(signal: PredefinedHaptics): void {
  if (Platform.OS === 'android') {
    Hapticlabs.playPredefinedAndroidVibration(signal);
  } else {
    throw new Error(
      'Predefined haptics are only supported on Android (for now)'
    );
  }
}
