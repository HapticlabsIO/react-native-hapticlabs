import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  /* Android */
  playHLA(path: string): Promise<void>;
  playOGG(path: string): Promise<void>;
  playHAC(path: string): Promise<void>;
  playAndroidHaptics(directoryOrHACPath: string): Promise<void>;
  preloadOGG(path: string): void;
  preloadAndroidHaptics(directoryOrHACPath: string): void;
  unloadOGG(path: string): void;
  unloadAndroidHaptics(directoryOrHACPath: string): void;
  unloadAllAndroidHaptics(): void;
  getAndroidConstants(): {
    readonly hapticSupportLevel: 0 | 1 | 2 | 3 | 4;
    readonly areOnOffHapticsSupported: boolean;
    readonly areAmplitudeControlHapticsSupported: boolean;
    readonly areAudioCoupledHapticsSupported: boolean;
    readonly areEnvelopeHapticsSupported: boolean;
    readonly resonanceFrequency: number | null;
    readonly qFactor: number | null;
    readonly minFrequency: number | null;
    readonly maxFrequency: number | null;
    readonly maxAcceleration: number | null;
    readonly frequencyResponseKeys: number[];
    readonly frequencyResponseValues: number[];
    readonly envelopeControlPointMinDurationMillis: number | null;
    readonly envelopeControlPointMaxDurationMillis: number | null;
    readonly envelopeMaxDurationMillis: number | null;
    readonly envelopeMaxControlPointCount: number | null;
  };

  /* iOS */
  playAHAP(path: string): Promise<void>;
  setHapticsMute(mute: boolean): void;
  isHapticsMuted(): Promise<boolean>;
  setAudioMute(mute: boolean): void;
  isAudioMuted(): Promise<boolean>;

  /* iOS & Android */
  playPredefinedHaptics(signal: string): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Hapticlabs');
