import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * This command will play an HLA file from the specified `path`, including corresponding audio files.
   *
   * *Note*: This command is only supported on Android.
   * @param path The path to the HLA file. This can be a path relative to the assets directory or a fully qualified path.
   * @returns A promise that resolves when the HLA file has been played.
   */
  playHLA(path: string): Promise<void>;

  /**
   * This command will play an OGG file from the specified `path`, including encoded haptic feedback.
   * If the device's haptic support level is less than 3, the device will play the audio file without haptic feedback.
   * To automatically select adequate haptic feedback for the device, use `playAndroidHaptics` instead.
   *
   * *Note*: This command is only supported on Android.
   * @param path The path to the OGG file. This can be a path relative to the assets directory or a fully qualified path.
   * @returns A promise that resolves when the OGG file has been played.
   */
  playOGG(path: string): Promise<void>;

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
  playAndroidHaptics(directoryPath: string): Promise<void>;

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
  preloadOGG(path: string): void;

  /**
   * This command will preload haptic patterns from the specified `directoryPath`.
   *
   * This is useful for reducing latency when playing haptic patterns. Currently,
   * only OGG files will be preloaded and cached, and only so if their
   * uncompressed size is less than 1 MB
   * (see [Android's SoundPool documentation](https://developer.android.com/reference/android/media/SoundPool)).
   *
   * @param directoryPath The path to the haptic pattern directory. See the
   * `playAndroidHaptics` documentation for the expected directory structure.
   */
  preloadAndroidHaptics(directoryPath: string): void;

  /**
   * This command will unload the OGG file from the specified `path`.
   *
   * This is useful for freeing up memory when the haptic patterns are no longer
   * needed, and to clear the cache and enforce a reload if the file has changed.
   *
   * @param path The path to the haptic pattern directory to unload. The same
   * you would pass to `playOGG`.
   */
  unloadOGG(path: string): void;

  /**
   * This command will unload the haptic patterns loaded from the specified
   * `path`.
   *
   * This is useful for freeing up memory when the haptic patterns are no longer
   * needed, and to clear the cache and enforce a reload if the files have
   * changed.
   *
   * @param path The path to the haptic pattern directory to unload. See the
   * `playAndroidHaptics` documentation for the expected directory structure.
   */
  unloadAndroidHaptics(path: string): void;

  /**
   * This command will unload all haptic patterns that have been preloaded or
   * played.
   *
   * Equivalent to calling `unloadAndroidHaptics()` for all directories and OGG
   * files that have been preloaded or played.
   */
  unloadAllAndroidHaptics(): void;

  getAndroidConstants(): {
    /**
     * The device's haptic support level.
     * This value is a number between 0 and 3, where:
     * - 0: The device does not support haptics.
     * - 1: The device supports on / off haptic feedback.
     * - 2: The device supports amplitude control haptic feedback.
     * - 3: The device supports fully customizable haptic feedback.
     * - 4: The device supports advanced haptic feedback with envelope control.
     *
     * *Note*: This value is only supported on Android.
     */
    readonly hapticSupportLevel: 0 | 1 | 2 | 3 | 4;

    /**
     * Whether the device supports on/off haptic feedback.
     *
     * On/Off haptic feedback is the most basic form of haptic feedback with timing
     * being the only controllable parameter.
     *
     * *Note**: This value is only supported on Android.
     */
    readonly areOnOffHapticsSupported: boolean;

    /**
     * Whether the device supports amplitude control haptic feedback.
     *
     * Amplitude control haptic feedback allows for more nuanced haptic feedback
     * by controlling the amplitude of the haptic signal over time.
     *
     * **Note**: This value is only supported on Android.
     */
    readonly areAmplitudeControlHapticsSupported: boolean;

    /**
     * Whether the device supports audio coupled haptic feedback.
     *
     * Audio coupled haptic feedback allows for full control over the haptic
     * feedback, while at the same time offering playback synchronized with audio.
     *
     * **Note**: This value is only supported on Android.
     */
    readonly areAudioCoupledHapticsSupported: boolean;

    /**
     * Whether the device supports envelope-controlled haptic feedback.
     *
     * Similar to amplitude control haptic feedback, envelope-controlled haptic
     * feedback allows for controlling both the amplitude and the frequency of the
     * haptic signal over time.
     *
     * **Note**: This value is only supported on Android.
     */
    readonly areEnvelopeHapticsSupported: boolean;

    /**
     * The device's haptic actuator's resonance frequency.
     *
     * This is the frequency at which the haptic actuator is driven for e.g. HLA
     * level 2 files. At this frequency, the actuator will resonate and produce
     * the strongest and most energy-efficient haptic feedback.
     *
     * **Note**: This value is only supported on Android.
     */
    readonly resonanceFrequency: number | null;

    /**
     * The device's haptic actuator's q factor.
     *
     * See https://en.wikipedia.org/wiki/Q_factor for more information.
     *
     * **Note**: This value is only supported on Android.
     */
    readonly qFactor: number | null;

    /**
     * The device's haptic actuator's self-reported minimum frequency.
     *
     * **Note**: This value is only supported on Android.
     *
     * **Note**: With audio-coupled haptics (OGG files), there are no frequency
     * limits.
     */
    readonly minFrequency: number | null;

    /**
     * The device's haptic actuator's self-reported maximum frequency.
     *
     * **Note**: This value is only supported on Android.
     *
     * **Note**: With audio-coupled haptics (OGG files), there are no frequency
     * limits.
     */
    readonly maxFrequency: number | null;

    /**
     * The device's haptic actuator's self-reported maximum acceleration (in Gs).
     *
     * **Note**: This value is only supported on Android.
     */
    readonly maxAcceleration: number | null;

    readonly frequencyResponseKeys: number[];
    readonly frequencyResponseValues: number[];

    /**
     * The minimum duration (in milliseconds) for an envelope control point.
     *
     * **Note**: This value is only supported on Android.
     */
    readonly envelopeControlPointMinDurationMillis: number | null;

    /**
     * The maximum duration (in milliseconds) for an envelope control point.
     *
     * **Note**: This value is only supported on Android.
     */
    readonly envelopeControlPointMaxDurationMillis: number | null;

    /**
     * The maximum duration (in milliseconds) for an envelope effect.
     *
     * **Note**: This value is only supported on Android.
     */
    readonly envelopeMaxDurationMillis: number | null;
    /**
     * The maximum number of control points for an envelope effect.
     *
     * **Note**: This value is only supported on Android.
     */
    readonly envelopeMaxControlPointCount: number | null;
  };

  /**
   * This command will play an AHAP file from the specified `path`, including corresponding AHAP files and audio files.
   *
   * *Note*: This command is only supported on iOS.
   * @param path The path to the AHAP file.
   * @returns A promise that resolves when the AHAP file has been played.
   */
  playAHAP(path: string): Promise<void>;

  /**
   * This command will play a predefined (built-in) haptic signal.
   *
   * For each platform, up to one predefined haptic signal can be specified.
   * If none is specified for the current platform, no haptic feedback will be played.
   *
   * @param signal The name of the predefined haptic signal to play.
   */
  playPredefinedHaptics(signal: string): void;

  /**
   * This command will mute or unmute haptic feedback from Hapticlabs.
   *
   * **Note**: This command is only supported on iOS.
   *
   * **Note**: This command will not affect predefined haptic signals played via `playPredefinedHaptics`.
   *
   * @param mute Whether to mute (true) or unmute (false) haptic feedback.
   */
  setHapticsMute(mute: boolean): void;

  /**
   * This command will return whether haptic feedback from Hapticlabs is muted.
   *
   * **Note**: This command is only supported on iOS.
   *
   * **Note**: This command will not reflect the mute state of predefined haptic signals played via `playPredefinedHaptics`.
   *
   * @returns A promise that resolves to whether haptic feedback is muted.
   */
  isHapticsMuted(): Promise<boolean>;

  /**
   * This command will mute or unmute audio playback from Hapticlabs.
   *
   * **Note**: This command is only supported on iOS.
   *
   * **Note**: This command exclusively affects audio playback associated with haptic patterns played via `playAHAP` or `playHaptics`.
   *
   * @param mute Whether to mute (true) or unmute (false) audio playback.
   */
  setAudioMute(mute: boolean): void;

  /**
   * This command will return whether audio playback from Hapticlabs is muted.
   *
   * **Note**: This command is only supported on iOS.
   *
   * **Note**: This command exclusively reflects the mute state of audio playback associated with haptic patterns played via `playAHAP` or `playHaptics`.
   *
   * @returns A promise that resolves to whether audio playback is muted.
   */
  isAudioMuted(): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Hapticlabs');
