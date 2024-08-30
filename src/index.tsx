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

export function playHLA(path: string): Promise<void> {
  if (Platform.OS === 'android') {
    return Hapticlabs.playHLA(path);
  } else {
    return Promise.reject(new Error('HLA is only supported on Android'));
  }
}

export function playAHAP(path: string): Promise<void> {
  if (Platform.OS === 'ios') {
    console.log(Hapticlabs);
    return Hapticlabs.playAHAP(path);
  } else {
    return Promise.reject(new Error('AHAP is only supported on iOS'));
  }
}

export function playOGG(path: string): Promise<void> {
  if (Platform.OS === 'android') {
    return Hapticlabs.playOGG(path);
  } else {
    return Promise.reject(new Error('OGG is only supported on Android'));
  }
}

export function playAndroidHaptics(directoryPath: string): Promise<void> {
  if (Platform.OS === 'android') {
    return Hapticlabs.playAndroidHaptics(directoryPath);
  } else {
    return Promise.reject(
      new Error('Android haptics are only supported on Android')
    );
  }
}

export const androidHapticSupportLevel: 0 | 1 | 2 | 3 =
  Hapticlabs.hapticSupportLevel ?? -1;
