import { Platform } from 'react-native';
import NativeHapticlabs from './NativeHapticlabs';

/**
 * This command will play an HLA file from the specified `path`, including corresponding audio files.
 *
 * *Note*: This command is only supported on Android.
 * @param path The path to the HLA file. This can be a path relative to the assets directory or a fully qualified path.
 * @returns A promise that resolves when the HLA file has been played.
 */
export async function playHLA(path: string): Promise<void> {
  if (Platform.OS === 'android') {
    return await NativeHapticlabs.playHLA(path);
  } else {
    console.error('HLA playback is only supported on Android');
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
export async function playOGG(path: string): Promise<void> {
  if (Platform.OS === 'android') {
    return await NativeHapticlabs.playOGG(path);
  } else {
    console.error('OGG playback is only supported on Android');
  }
}

/**
 * This command will play a HAC file from the specified `path`, including corresponding audio files.
 *
 * The HAC file itself contains multiple haptic patterns for different haptic support levels.
 * The device will automatically select and play the optimal haptic pattern based on its haptic support level.
 *
 * *Note*: This command is only supported on Android.
 * @param path The path to the HAC file. This can be a path relative to the assets directory or a fully qualified path.
 * @returns A promise that resolves when the HAC file has been played.
 */
export async function playHAC(path: string): Promise<void> {
  if (Platform.OS === 'android') {
    return NativeHapticlabs.playHAC(path);
  } else {
    console.error('HAC playback is only supported on Android');
  }
}

/**
 * This command will play a haptic pattern from the specified `directoryOrHACPath`.
 *
 * The type of input will be automatically detected:
 *
 * If a HAC file is specified, the function behaves like `playHAC`.
 *
 * If a directory is specified, the function will select and play the appropriate haptic pattern based on the device's haptic support level.
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
 * @param directoryOrHACPath The path to the haptic pattern directory or HAC file. This can be a path relative to the assets directory or a fully qualified path.
 * @returns A promise that resolves when the haptic pattern has been played.
 */
export async function playAndroidHaptics(
  directoryOrHACPath: string
): Promise<void> {
  if (Platform.OS === 'android') {
    return await NativeHapticlabs.playAndroidHaptics(directoryOrHACPath);
  } else {
    console.error('Android haptics are only supported on Android');
  }
}

/**
 * This command will preload the OGG file from the specified `path`.
 *
 * This is useful for reducing latency when playing haptic patterns. Currently,
 * OGG filse will only be preloaded and cached if their uncompressed size is
 * less than 1 MB
 * (see [Android's SoundPool documentation](https://developer.android.com/reference/android/media/SoundPool)).
 *
 * @param path The path to the haptic pattern directory to unload. The same
 * you would pass to `playOGG`.
 */
export function preloadOGG(path: string): void {
  if (Platform.OS === 'android') {
    NativeHapticlabs.preloadOGG(path);
  } else {
    console.error('OGG haptics are only supported on Android');
  }
}

/**
 * This command will preload haptic patterns from the specified `directoryOrHACPath`.
 *
 * This is useful for reducing latency when playing haptic patterns. Currently,
 * only OGG files will be preloaded and cached, and only so if their
 * uncompressed size is less than 1 MB
 * (see [Android's SoundPool documentation](https://developer.android.com/reference/android/media/SoundPool)).
 *
 * @param directoryOrHACPath The path to the haptic pattern directory or HAC file. See the
 * `playAndroidHaptics` documentation for further details.
 */
export function preloadAndroidHaptics(directoryOrHACPath: string): void {
  if (Platform.OS === 'android') {
    NativeHapticlabs.preloadAndroidHaptics(directoryOrHACPath);
  } else {
    console.error('Android haptics are only supported on Android');
  }
}

/**
 * This command will unload the OGG file from the specified `path`.
 *
 * This is useful for freeing up memory when the haptic patterns are no longer
 * needed, and to clear the cache and enforce a reload if the file has changed.
 *
 * @param path The path to the haptic pattern directory to unload. The same
 * you would pass to `playOGG`.
 */
export function unloadOGG(path: string): void {
  if (Platform.OS === 'android') {
    NativeHapticlabs.unloadOGG(path);
  } else {
    console.error('Android haptics are only supported on Android');
  }
}

/**
 * This command will unload the haptic patterns loaded from the specified
 * `directoryOrHACPath`.
 *
 * This is useful for freeing up memory when the haptic patterns are no longer
 * needed, and to clear the cache and enforce a reload if the files have
 * changed.
 *
 * @param directoryOrHACPath The path to the haptic pattern directory or HAC file. See the
 * `playAndroidHaptics` documentation for further details
 */
export function unloadAndroidHaptics(directoryOrHACPath: string): void {
  if (Platform.OS === 'android') {
    NativeHapticlabs.unloadAndroidHaptics(directoryOrHACPath);
  } else {
    console.error('Android haptics are only supported on Android');
  }
}

/**
 * This command will unload all haptic patterns that have been preloaded or
 * played.
 *
 * Equivalent to calling `unloadAndroidHaptics()` for all directories and OGG
 * files that have been preloaded or played.
 */
export function unloadAllAndroidHaptics(): void {
  if (Platform.OS === 'android') {
    NativeHapticlabs.unloadAllAndroidHaptics();
  } else {
    console.error('Android haptics are only supported on Android');
  }
}

const constants =
  Platform.OS === 'android'
    ? NativeHapticlabs.getAndroidConstants?.() ??
      NativeHapticlabs.getConstants?.() ??
      {}
    : {
        hapticSupportLevel: 4 as const,
        areOnOffHapticsSupported: true,
        areAmplitudeControlHapticsSupported: true,
        areAudioCoupledHapticsSupported: true,
        areEnvelopeHapticsSupported: true,
        resonanceFrequency: null,
        qFactor: null,
        minFrequency: null,
        maxFrequency: null,
        maxAcceleration: null,
        frequencyResponseKeys: null,
        frequencyResponseValues: null,
        envelopeControlPointMinDurationMillis: null,
        envelopeControlPointMaxDurationMillis: null,
        envelopeMaxDurationMillis: null,
        envelopeMaxControlPointCount: null,
      };

/**
 * The device's haptic support level.
 * This value is a number between 0 and 4, where:
 * - 0: The device does not support haptics.
 * - 1: The device supports on / off haptic feedback.
 * - 2: The device supports amplitude control haptic feedback.
 * - 3: The device supports fully customizable audio-coupled haptic feedback.
 * - 4: The device supports parametric envelope-controlled haptic feedback.
 *
 * *Note*: This value is only supported on Android.
 */
export const androidHapticSupportLevel: 0 | 1 | 2 | 3 | 4 =
  constants.hapticSupportLevel ?? 0;

/**
 * Whether the device supports on/off haptic feedback.
 *
 * On/Off haptic feedback is the most basic form of haptic feedback with timing
 * being the only controllable parameter.
 *
 * *Note**: This value is only supported on Android.
 */
export const areOnOffHapticsSupported: boolean =
  constants.areOnOffHapticsSupported ?? false;

/**
 * Whether the device supports amplitude control haptic feedback.
 *
 * Amplitude control haptic feedback allows for more nuanced haptic feedback
 * by controlling the amplitude of the haptic signal over time.
 *
 * **Note**: This value is only supported on Android.
 */
export const areAmplitudeControlHapticsSupported: boolean =
  constants.areAmplitudeControlHapticsSupported ?? false;

/**
 * Whether the device supports audio coupled haptic feedback.
 *
 * Audio coupled haptic feedback allows for full control over the haptic
 * feedback, while at the same time offering playback synchronized with audio.
 *
 * **Note**: This value is only supported on Android.
 */
export const areAudioCoupledHapticsSupported: boolean =
  constants.areAudioCoupledHapticsSupported ?? false;

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
  constants.areEnvelopeHapticsSupported ?? false;

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
  constants.resonanceFrequency ?? null;

/**
 * The device's haptic actuator's q factor.
 *
 * See https://en.wikipedia.org/wiki/Q_factor for more information.
 *
 * **Note**: This value is only supported on Android.
 */
export const qFactor: number | null = constants.qFactor ?? null;

/**
 * The device's haptic actuator's self-reported minimum frequency.
 *
 * **Note**: This value is only supported on Android.
 *
 * **Note**: With audio-coupled haptics (OGG files), there are no frequency
 * limits.
 */
export const minFrequency: number | null = constants.minFrequency ?? null;

/**
 * The device's haptic actuator's self-reported maximum frequency.
 *
 * **Note**: This value is only supported on Android.
 *
 * **Note**: With audio-coupled haptics (OGG files), there are no frequency
 * limits.
 */
export const maxFrequency: number | null = constants.maxFrequency ?? null;

/**
 * The device's haptic actuator's self-reported maximum acceleration (in Gs).
 *
 * **Note**: This value is only supported on Android.
 */
export const maxAcceleration: number | null = constants.maxAcceleration ?? null;

// Deserialize the frequency response data from the native module
const frequencyResponseKeys = constants.frequencyResponseKeys;
const frequencyResponseValues = constants.frequencyResponseValues;

/**
 * The device's haptic actuator's self-reported frequency response.
 *
 * This is a map from frequency (in Hz) to acceleration (in Gs) at that
 * frequency.
 *
 * **Note**: This value is only supported on Android.
 */
let frequencyResponse: Map<number, number> | null = null;

if (frequencyResponseKeys != null && frequencyResponseValues != null) {
  if (frequencyResponseKeys.length === frequencyResponseValues.length) {
    // Valid frequency response data
    frequencyResponse = new Map<number, number>();
    for (let i = 0; i < frequencyResponseKeys.length; i++) {
      const frequency = frequencyResponseKeys[i];
      const acceleration = frequencyResponseValues[i];
      if (
        frequency != null &&
        acceleration != null &&
        !isNaN(frequency) &&
        !isNaN(acceleration)
      ) {
        frequencyResponse.set(frequency, acceleration);
      }
    }
  }
}

export { frequencyResponse };

/**
 * The minimum duration (in milliseconds) for an envelope control point.
 *
 * **Note**: This value is only supported on Android.
 */
export const envelopeControlPointMinDurationMillis: number | null =
  constants.envelopeControlPointMinDurationMillis ?? null;

/**
 * The maximum duration (in milliseconds) for an envelope control point.
 *
 * **Note**: This value is only supported on Android.
 */
export const envelopeControlPointMaxDurationMillis: number | null =
  constants.envelopeControlPointMaxDurationMillis ?? null;

/**
 * The maximum duration (in milliseconds) for an envelope effect.
 *
 * **Note**: This value is only supported on Android.
 */
export const envelopeMaxDurationMillis: number | null =
  constants.envelopeMaxDurationMillis ?? null;

/**
 * The maximum number of control points for an envelope effect.
 *
 * **Note**: This value is only supported on Android.
 */
export const envelopeMaxControlPointCount: number | null =
  constants.envelopeMaxControlPointCount ?? null;

/**
 * This command will play an AHAP file from the specified `path`, including corresponding AHAP files and audio files.
 *
 * *Note*: This command is only supported on iOS.
 * @param path The path to the AHAP file.
 * @returns A promise that resolves when the AHAP file has been played.
 */
export async function playAHAP(path: string): Promise<void> {
  if (Platform.OS === 'ios') {
    return await NativeHapticlabs.playAHAP(path);
  } else {
    console.error('AHAP is only supported on iOS');
  }
}

/**
 * This command will play the haptic pattern specified by the `iosPath` on iOS and the `androidPath` on Android.
 * @param iosPath The path to the AHAP file.
 * @param androidPath The path to the Android haptic pattern directory. This can be a path relative to the assets directory or a fully qualified path.
 * @returns A promise that resolves when the haptic pattern has finished playing.
 */
export async function playHaptics({
  iosPath,
  androidPath,
}: {
  iosPath: string;
  androidPath: string;
}): Promise<void> {
  if (Platform.OS === 'ios') {
    return NativeHapticlabs.playAHAP(iosPath);
  } else if (Platform.OS === 'android') {
    return NativeHapticlabs.playAndroidHaptics(androidPath);
  } else {
    console.error('Haptics are only supported on iOS and Android');
  }
}

/**
 * Predefined haptic signals available on Android.
 */
export enum AndroidPredefinedHaptics {
  CLICK = 'Click',
  DOUBLE_CLICK = 'Double Click',
  HEAVY_CLICK = 'Heavy Click',
  TICK = 'Tick',
}

/**
 * Predefined haptic signals available on iOS.
 */
export enum IOSPredefinedHaptics {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  RIGID = 'rigid',
  SOFT = 'soft',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SELECTION = 'selection',
}

/**
 * This command will play a predefined (built-in) haptic signal.
 *
 * For each platform, up to one predefined haptic signal can be specified.
 * If none is specified for the current platform, no haptic feedback will be played.
 *
 * @param android The predefined haptic signal to play on Android.
 * @param ios The predefined haptic signal to play on iOS.
 */
export function playPredefinedHaptics(signal: {
  android?: AndroidPredefinedHaptics;
  ios?: IOSPredefinedHaptics;
}): void {
  if (Platform.OS === 'android' && signal.android !== undefined) {
    NativeHapticlabs.playPredefinedHaptics(signal.android);
  } else if (Platform.OS === 'ios' && signal.ios !== undefined) {
    NativeHapticlabs.playPredefinedHaptics(signal.ios);
  }
}

/**
 * This command will mute or unmute haptic feedback from Hapticlabs.
 *
 * **Note**: This command is only supported on iOS.
 *
 * **Note**: This command will not affect predefined haptic signals played via `playPredefinedHaptics`.
 *
 * @param mute Whether to mute (true) or unmute (false) haptic feedback.
 */
export function setHapticsMute(mute: boolean): void {
  if (Platform.OS === 'ios') {
    NativeHapticlabs.setHapticsMute(mute);
  } else {
    console.error('Haptics mute state is only supported on iOS');
  }
}

/**
 * This command will return whether haptic feedback from Hapticlabs is muted.
 *
 * **Note**: This command is only supported on iOS.
 *
 * **Note**: This command will not reflect the mute state of predefined haptic signals played via `playPredefinedHaptics`.
 *
 * @returns A promise that resolves to whether haptic feedback is muted.
 */
export async function isHapticsMuted(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return await NativeHapticlabs.isHapticsMuted();
  } else {
    console.error('Haptics mute state is only supported on iOS');
    return false;
  }
}

/**
 * This command will mute or unmute audio playback from Hapticlabs.
 *
 * **Note**: This command is only supported on iOS.
 *
 * **Note**: This command exclusively affects audio playback associated with haptic patterns played via `playAHAP` or `playHaptics`.
 *
 * @param mute Whether to mute (true) or unmute (false) audio playback.
 */
export function setAudioMute(mute: boolean): void {
  if (Platform.OS === 'ios') {
    NativeHapticlabs.setAudioMute(mute);
  } else {
    console.error('Audio mute state is only supported on iOS');
  }
}

/**
 * This command will return whether audio playback from Hapticlabs is muted.
 *
 * **Note**: This command is only supported on iOS.
 *
 * **Note**: This command exclusively reflects the mute state of audio playback associated with haptic patterns played via `playAHAP` or `playHaptics`.
 *
 * @returns A promise that resolves to whether audio playback is muted.
 */
export async function isAudioMuted(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return await NativeHapticlabs.isAudioMuted();
  } else {
    console.error('Audio mute state is only supported on iOS');
    return false;
  }
}
