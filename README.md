# react-native-hapticlabs

A package to play back rich, custom haptics on both Android and iOS. We recommend using [Hapticlabs Studio](https://hapticlabs.io/mobile), our no-code haptics development tool, to design and prototype custom haptic signals.

## Installation

```sh
npm install react-native-hapticlabs
```

## Usage

Play haptics on Android:

```typescript
import { playAndroidHaptics, playHLA, playOGG } from 'react-native-hapticlabs';

// Automatically selects the haptic feedback based on the device's haptic support level
playAndroidHaptics('Android samples/8bit.hac').then(() => {
  console.log('Android haptics played');
});

// Plays back the HLA file and associated audio files
playHLA('Android samples/8bit/main.hla').then(() => {
  console.log('HLA played');
});

// Plays back the OGG file with haptic feedback if the device supports it
playOGG('Android samples/8bit/main.ogg').then(() => {
  console.log('OGG played');
});
```

Play haptics on iOS:

```typescript
import { playAHAP } from 'react-native-hapticlabs';
import RNFS from 'react-native-fs';

// Plays back the AHAP files and associated other AHAP and audio files
playAHAP(RNFS.MainBundlePath + '/AHAP/Button.ahap').then(() => {
  console.log('Played ahap');
});
```

Play haptics on both Android and iOS:

```typescript
import { playHaptics } from 'react-native-hapticlabs';
import RNFS from 'react-native-fs';

// Plays back an AHAP file on iOS and an HLA or OGG file on Android
playHaptics({
  iosPath: RNFS.MainBundlePath + '/AHAP/Button.ahap',
  androidPath: 'Android samples/Button.hac',
}).then(() => {
  console.log('Played haptics');
});
```

For more information on these file formats, please consult our [documentation](https://docs.hapticlabs.io/mobile).

## API Reference

### Cross-Platform

#### playHaptics

```typescript
function playHaptics({
  iosPath,
  androidPath,
}: {
  iosPath: string;
  androidPath: string;
}): Promise<void>;
```

Plays an AHAP file on iOS and a haptic pattern on Android. Internally calls `playAHAP` or `playAndroidHaptics`.

- **Platform:** iOS and Android
- **Parameters:**
  - `iosPath`: string — Path to the AHAP file for iOS
  - `androidPath`: string — Path to a HAC file or a directory for Android. See [playAndroidHaptics](#playandroidhaptics) for expected directory structure.
- **Returns:** Promise<void>

---

#### playPredefinedHaptics

```typescript
function playPredefinedHaptics(signal: {
  android?: AndroidPredefinedHaptics;
  ios?: IOSPredefinedHaptics;
}): void;
```

Plays a predefined (built-in) haptic signal. Only one signal per platform is used.

- **Platform:** iOS and Android
- **Parameters:**
  - `signal`: object — `{ android?: AndroidPredefinedHaptics; ios?: IOSPredefinedHaptics }`

### Android

#### playHLA

```typescript
function playHLA(path: string): Promise<void>;
```

Plays an HLA file from the specified `path`, including corresponding audio files.

- **Platform:** Android only
- **Parameters:**
  - `path`: string — Path to the HLA file (relative to assets or fully qualified)
- **Returns:** A `Promise<void>` that resolves when the playback terminates

---

#### playOGG

```typescript
function playOGG(path: string): Promise<void>;
```

Plays an OGG file from the specified `path`, including encoded haptic feedback.

- **Platform:** Android only
- **Parameters:**
  - `path`: string — Path to the OGG file (relative to assets or fully qualified)
- **Returns:** A `Promise<void>` that resolves when the playback terminates
- **Note:** If the device's haptic support level is less than 3, only audio will play. Use `playAndroidHaptics` for auto-selection.

---

#### playHAC

```typescript
function playHAC(path: string): Promise<void>;
```

Plays a HAC file from the specified `path`, containing multiple haptic patterns for different support levels. The device will select the optimal pattern.

- **Platform:** Android only
- **Parameters:**
  - `path`: string — Path to the HAC file (relative to assets or fully qualified)
- **Returns:** A `Promise<void>` that resolves when the playback terminates

---

#### playAndroidHaptics

```typescript
function playAndroidHaptics(directoryOrHACPath: string): Promise<void>;
```

Plays a haptic pattern from a directory or HAC file. If a directory is specified, the pattern is selected based on device support level. If a HAC file is specified, behaves like `playHAC`.

If a directory is specified, the following structure is expected:

```
  directoryPath
  ├── lvl1
  │   └── main.hla
  ├── lvl2
  │   └── main.hla
  └── lvl3
      └── main.ogg
```

The most advanced signal supported by the device is chosen and played. For example, if the device reports haptic support level 2, `directoryPath/lvl2/main.hla` will be played.

Note that the directory-based structure is deprecated. We recommend using HAC files.

- **Platform:** Android only
- **Parameters:**
  - `directoryOrHACPath`: string — Path to a HAC file or the haptic pattern directory
- **Returns:** A `Promise<void>` that resolves when the playback terminates

---

#### preloadOGG

```typescript
function preloadOGG(path: string): void;
```

Preloads an OGG file to reduce latency. Only OGG files <1MB (uncompressed) can be preloaded.

- **Platform:** Android only
- **Parameters:**
  - `path`: string — Path to the OGG file

---

#### preloadAndroidHaptics

```typescript
function preloadAndroidHaptics(directoryOrHACPath: string): void;
```

Preloads haptic patterns from a directory or HAC file to reduce playback latency. Note that referenced OGG files >= 1MB (uncompressed) can not be preloaded.

- **Platform:** Android only
- **Parameters:**
  - `directoryOrHACPath`: string — Path to a HAC file or a directory for Android. See [playAndroidHaptics](#playandroidhaptics) for expected directory structure.

---

#### unloadOGG

```typescript
function unloadOGG(path: string): void;
```

Unloads a preloaded OGG file to free memory.

- **Platform:** Android only
- **Parameters:**
  - `path`: string — Path to the OGG file

---

#### unloadAndroidHaptics

```typescript
function unloadAndroidHaptics(directoryOrHACPath: string): void;
```

Unloads haptic patterns loaded from a directory or HAC file.

- **Platform:** Android only
- **Parameters:**
  - `directoryOrHACPath`: string — Path to a HAC file or a directory for Android. See [playAndroidHaptics](#playandroidhaptics) for expected directory structure.

---

#### unloadAllAndroidHaptics

```typescript
function unloadAllAndroidHaptics(): void;
```

Unloads all haptic patterns that have been preloaded or played.

- **Platform:** Android only

### iOS

#### playAHAP

```typescript
function playAHAP(path: string): Promise<void>;
```

Plays an AHAP file from the specified `path`, including corresponding AHAP and audio files.

- **Platform:** iOS only
- **Parameters:**
  - `path`: string — Path to the AHAP file
- **Returns:** Promise<void>

---

#### setHapticsMute

```typescript
function setHapticsMute(mute: boolean): void;
```

Mutes or unmutes haptic feedback.

- **Platform:** iOS only
- **Parameters:**
  - `mute`: boolean
- **Note:** This only applies to AHAP files

---

#### isHapticsMuted

```typescript
function isHapticsMuted(): Promise<boolean>;
```

Returns whether haptic feedback is muted.

- **Platform:** iOS only
- **Note:** This only applies to AHAP files

---

#### setAudioMute

```typescript
function setAudioMute(mute: boolean): void;
```

Mutes or unmutes audio playback.

- **Platform:** iOS only
- **Parameters:**
  - `mute`: boolean
- **Note:** This only applies to audio referenced in AHAP files

---

#### isAudioMuted

```typescript
function isAudioMuted(): Promise<boolean>;
```

Returns whether audio playback is muted.

- **Platform:** iOS only
- **Note:** This only applies to audio referenced in AHAP files

## Constants

- `androidHapticSupportLevel: 0 | 1 | 2 | 3 | 4` — Device haptic support level (Android only)
- `areOnOffHapticsSupported: boolean` — On/off haptic support (Android only)
- `areAmplitudeControlHapticsSupported: boolean` — Amplitude control support (Android only)
- `areAudioCoupledHapticsSupported: boolean` — Audio-coupled haptic support (Android only)
- `areEnvelopeHapticsSupported: boolean` — Envelope-controlled haptic support (Android only)
- `resonanceFrequency: number | null` — Resonance frequency (Android only)
- `qFactor: number | null` — Q factor (Android only)
- `minFrequency: number | null` — Minimum frequency (Android only)
- `maxFrequency: number | null` — Maximum frequency (Android only)
- `maxAcceleration: number | null` — Maximum acceleration (Android only)
- `frequencyResponse: Map<number, number> | null` — Frequency response (Android only)
- `envelopeControlPointMinDurationMillis: number | null` — Envelope control point min duration (Android only)
- `envelopeControlPointMaxDurationMillis: number | null` — Envelope control point max duration (Android only)
- `envelopeMaxDurationMillis: number | null` — Envelope max duration (Android only)
- `envelopeMaxControlPointCount: number | null` — Envelope max control points (Android only)

---

## Enums

### AndroidPredefinedHaptics

```typescript
enum AndroidPredefinedHaptics {
  CLICK = 'Click',
  DOUBLE_CLICK = 'Double Click',
  HEAVY_CLICK = 'Heavy Click',
  TICK = 'Tick',
}
```

### IOSPredefinedHaptics

```typescript
enum IOSPredefinedHaptics {
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
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
