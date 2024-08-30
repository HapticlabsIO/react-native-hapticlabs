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
  return Hapticlabs.playHLA(path);
}

export function playOGG(path: string): Promise<void> {
  return Hapticlabs.playOGG(path);
}

export function playAndroidHaptics(directoryPath: string): Promise<void> {
  return Hapticlabs.playAndroidHaptics(directoryPath);
}

export const androidHapticSupportLevel: 0 | 1 | 2 | 3 =
  Hapticlabs.hapticSupportLevel ?? -1;
