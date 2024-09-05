# react-native-hapticlabs

A package to play back haptics developed using Hapticlabs Studio.

## Installation

```sh
npm install react-native-hapticlabs
```

## Usage

Play haptics on Android:

```typescript
import {
  playAndroidHaptics,
  playHLA,
  playOGG,
} from 'react-native-hapticlabs';


// Automatically selects the haptic feedback based on the device's haptic support level
playAndroidHaptics(
  'Android samples/Double click with audio-Simple pattern-Single Vibration'
).then(() => {
  console.log('Android haptics played');
});

// Plays back the HLA file and associated audio files
playHLA(
  'Android samples/Double click with audio/lvl2/main.hla'
).then(() => {
  console.log('HLA played');
});

// Plays back the OGG file with haptic feedback if the device supports it
playOGG('Android samples/Simple pattern/lvl3/main.ogg').then(
  () => {
    console.log('OGG played');
  }
);
```

Play haptics on iOS:

```typescript
import {
  androidHapticSupportLevel,
  playAHAP,
  playAndroidHaptics,
  playHLA,
  playOGG,
} from 'react-native-hapticlabs';
import RNFS from 'react-native-fs';

// Plays back the AHAP files and associated other AHAP and audio files
playAHAP(RNFS.MainBundlePath + '/AHAP/9Bit.ahap').then(
  () => {
    console.log('Played ahap');
  }
);
```

## Functions

### playHLA

```typescript
function playHLA(path: string): Promise<void>;
```

This command will play an HLA file from the specified `path`, including corresponding audio files.

_Note_: This command is only supported on Android.

Parameters:

- `path` The path to the HLA file. This can be a path relative to the assets directory or a fully qualified path.

Returns:

A promise that resolves when the HLA file has been played.

### playOGG

```typescript
function playOGG(path: string): Promise<void>;
```

This command will play an OGG file from the specified `path`, including encoded haptic feedback.

If the device's haptic support level is less than 3, the device will play the audio file without haptic feedback.
To automatically select adequate haptic feedback for the device, use `playAndroidHaptics` instead.

_Note_: This command is only supported on Android.

Parameters:

- `path` The path to the OGG file. This can be a path relative to the assets directory or a fully qualified path.

Returns:

A promise that resolves when the OGG file has been played.

### playAndroidHaptics

```typescript
function playAndroidHaptics(directoryPath: string): Promise<void>;
```

This command will play a haptic pattern from the specified `directoryPath`.

Depending on the device's haptic support level, different haptic feedback will be played.
For instance, if the device's haptic support level is 3, the device will play the haptic pattern specified in the `lvl3` subdirectory. If the device's haptic support level is 0, no haptic feedback will be played.

Make sure that the directory follows the following structure:

```
directoryPath
├── lvl1
│   └── main.hla
├── lvl2
│   └── main.hla
└── lvl3
    └── main.ogg
```

_Note_: This command is only supported on Android.

Parameters:

- `directoryPath` The path to the haptic pattern directory. This can be a path relative to the assets directory or a fully qualified path.

Returns:

A promise that resolves when the haptic pattern and accompanying audio signals have been played.

### androidHapticSupportLevel

```typescript
const androidHapticSupportLevel: 0 | 1 | 2 | 3;
```

The device's haptic support level.
This value is a number between 0 and 3, where:

- 0: The device does not support haptics.
- 1: The device supports on / off haptic feedback.
- 2: The device supports amplitude control haptic feedback.
- 3: The device supports fully customizable haptic feedback.

_Note_: This value is only supported on Android.


### playAHAP

```typescript
function playAHAP(path: string): Promise<void>;
```

This command will play an AHAP file from the specified `path`, including corresponding AHAP files and audio files.

_Note_: This command is only supported on iOS.

Parameters:

- `path` The path to the AHAP file.

Returns:

A promise that resolves when the AHAP file has been played.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
