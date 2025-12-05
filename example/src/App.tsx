import { StyleSheet, View, Text, Platform, Button } from 'react-native';
import {
  androidHapticSupportLevel,
  AndroidPredefinedHaptics,
  areAmplitudeControlHapticsSupported,
  areAudioCoupledHapticsSupported,
  areEnvelopeHapticsSupported,
  areOnOffHapticsSupported,
  envelopeControlPointMaxDurationMillis,
  envelopeControlPointMinDurationMillis,
  envelopeMaxControlPointCount,
  envelopeMaxDurationMillis,
  frequencyResponse,
  IOSPredefinedHaptics,
  isAudioMuted,
  isHapticsMuted,
  maxAcceleration,
  maxFrequency,
  minFrequency,
  playAHAP,
  playAndroidHaptics,
  playHAC,
  playHaptics,
  playHLA,
  playOGG,
  playPredefinedHaptics,
  preloadAndroidHaptics,
  preloadOGG,
  qFactor,
  resonanceFrequency,
  setAudioMute,
  setHapticsMute,
  unloadAllAndroidHaptics,
  unloadAndroidHaptics,
  unloadOGG,
} from 'react-native-hapticlabs';
import RNFS from 'react-native-fs';
import { useEffect, useState } from 'react';

export default function App() {
  const [hapticsMuted, setHapticsMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      // Check if haptics are muted on iOS
      isHapticsMuted().then((muted) => {
        setHapticsMuted(muted);
      });
      isAudioMuted().then((muted) => {
        setAudioMuted(muted);
      });
    }
  }, []);

  if (Platform.OS === 'android') {
    console.log('Android haptic support level:', androidHapticSupportLevel);
    console.log('Supports on / off haptics:', areOnOffHapticsSupported);
    console.log(
      'Supports amplitude control haptics:',
      areAmplitudeControlHapticsSupported
    );
    console.log(
      'Supports audio coupled haptics:',
      areAudioCoupledHapticsSupported
    );
    console.log(
      'Supports envelope-controlled haptics:',
      areEnvelopeHapticsSupported
    );
    console.log('Resonance frequency:', resonanceFrequency);
    console.log('Q Factor:', qFactor);
    console.log('Min frequency:', minFrequency);
    console.log('Max frequency:', maxFrequency);
    console.log('Max acceleration:', maxAcceleration);
    console.log('Frequency response:', frequencyResponse);
    console.log(
      'Envelope control point min duration (ms):',
      envelopeControlPointMinDurationMillis
    );
    console.log(
      'Envelope control point max duration (ms):',
      envelopeControlPointMaxDurationMillis
    );
    console.log('Envelope max duration (ms):', envelopeMaxDurationMillis);
    console.log(
      'Envelope max control point count:',
      envelopeMaxControlPointCount
    );
  }

  return (
    <View style={styles.container}>
      <Button
        title="Play haptics (cross-platform)"
        onPress={() => {
          /**
           * This command will play the haptic pattern specified by the `iosPath` on iOS
           * and the `androidPath` on Android.
           * On iOS devices, this will internally call `playAHAP(iosPath)`.
           * On Android devices, this will internally call `playAndroidHaptics(androidPath)`
           * and automatically select the appropriate haptic signal based on the device's
           * haptic capability level (see `playAndroidHaptics()`).
           * If the device does not support haptics, no haptic feedback will be played.
           */
          playHaptics({
            iosPath: RNFS.MainBundlePath + '/AHAP/Button.ahap',
            androidPath: 'Android samples/Button.hac',
          }).then(() => {
            console.log('Haptics played');
          });
        }}
      />
      {Platform.OS === 'ios' && (
        <>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: hapticsMuted ? 'red' : 'green',
              marginVertical: 8,
            }}
          >
            Haptics muted: {hapticsMuted ? 'Yes' : 'No'}
          </Text>
          <Button
            title="Toggle Haptics Mute"
            onPress={() => {
              /**
               * This command will toggle the haptics mute state on iOS.
               * If haptics are currently muted, they will be unmuted, and vice versa.
               *
               * This only affects haptic feedback played through this library,
               * not system haptics or haptics played through other libraries.
               */
              const newMuteState = !hapticsMuted;
              setHapticsMute(newMuteState);
              isHapticsMuted().then((muted) => {
                setHapticsMuted(muted);
              });
            }}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: audioMuted ? 'red' : 'green',
              marginVertical: 8,
            }}
          >
            Audio muted: {audioMuted ? 'Yes' : 'No'}
          </Text>
          <Button
            title="Toggle Audio Mute"
            onPress={() => {
              /**
               * This command will toggle the audio mute state on iOS.
               * If audio is currently muted, it will be unmuted, and vice versa.
               *
               * This only affects audio played through this library,
               * not system audio or audio played through other libraries.
               */
              const newMuteState = !audioMuted;
              setAudioMute(newMuteState);
              isAudioMuted().then((muted) => {
                setAudioMuted(muted);
              });
            }}
          />
        </>
      )}
      {Platform.OS === 'android' && (
        <>
          <Text>
            Haptic support level:{' '}
            {
              /**
               * This value indicates the device's haptic support level.
               * The possible values are:
               * - `0`: The device does not support haptics.
               * - `1`: The device supports on/off haptic feedback.
               * - `2`: The device supports amplitude control haptic feedback.
               * - `3`: The device supports fully customizable audio-coupled haptic feedback.
               * - `4`: The device supports parametric envelope-controlled haptic feedback.
               */
              androidHapticSupportLevel
            }
          </Text>
          <Button
            title="Preload Android Haptics"
            onPress={() => {
              /**
               * This command will preload the `Android samples/Purring cat.hac` pattern.
               *
               * This is useful for reducing latency when playing haptic patterns. Currently,
               * only OGG files will be preloaded and cached, and only so if their
               * uncompressed size is less than 1 MB
               * (see [Android's SoundPool documentation](https://developer.android.com/reference/android/media/SoundPool)).
               */
              preloadAndroidHaptics('Android samples/Purring cat.hac');
              console.log('Android haptics preloaded');
            }}
          />
          <Button
            title="Unload Android Haptics"
            onPress={() => {
              /**
               * This command will unload the `Android samples/Purring cat.hac` pattern.
               *
               * This is useful for freeing up memory when the haptic patterns are no longer
               * needed, and to clear the cache and enforce a reload if the files have
               * changed.
               */
              unloadAndroidHaptics('Android samples/Purring cat.hac');
              console.log('Android haptics unloaded');
            }}
          />
          <Button
            title="Unload all Android Haptics"
            onPress={() => {
              /**
               * This command will unload all haptic patterns that have been preloaded or
               * played.
               *
               * Equivalent to calling `unloadAndroidHaptics()` for all directories and OGG
               * files that have been preloaded or played.
               */
              unloadAllAndroidHaptics();
              console.log('All Android haptics unloaded');
            }}
          />
          <Button
            title="Play Android Haptics"
            onPress={() => {
              /**
               * This command will play the Purring cat HAC file located at
               * `Android samples/Purring cat.hac`. Internally, the most
               * advanced available haptics API will be used based on the device's
               * haptic support level.
               */
              playAndroidHaptics('Android samples/Purring cat.hac').then(() => {
                console.log('Android haptics played');
              });
            }}
          />
          <Button
            title="Play HLA"
            onPress={() => {
              /**
               * This command will play the .hla file located at
               * `Android samples/Double click with audio/main.hla`.
               * Note that this .hla file references an audio file, which will be played
               * along with the haptic feedback.
               */
              playHLA('Android samples/8bit/main.hla').then(() => {
                console.log('HLA played');
              });
            }}
          />
          <Button
            title="Play HAC"
            onPress={() => {
              /**
               * This command will play the .hac file located at
               * `Android samples/8bit.hac`. The optimal haptics API will be used
               * based on the device's haptic support level.
               */
              playHAC('Android samples/8bit.hac').then(() => {
                console.log('HAC played');
              });
            }}
          />
          <Button
            title="Preload OGG"
            onPress={() => {
              /**
               * This command will preload the OGG file
               * `Android samples/8bit/main.ogg`.
               *
               * This is useful for reducing latency. Note that currently, OGG
               * files will only be preloaded and cached if their uncompressed
               * size is less than 1 MB
               * (see [Android's SoundPool documentation](https://developer.android.com/reference/android/media/SoundPool)).
               */
              preloadOGG('Android samples/8bit/main.ogg');
            }}
          />
          <Button
            title="Unload OGG"
            onPress={() => {
              /**
               * This command will unload the OGG file
               * `Android samples/8bit/main.ogg`.
               *
               * This is useful for freeing up memory when the haptic patterns
               * are no longer needed, and to clear the cache and enforce a
               * reload if the file has changed.
               */
              unloadOGG('Android samples/8bit/main.ogg');
              console.log('OGG unloaded');
            }}
          />
          <Button
            title="Play OGG"
            onPress={() => {
              /**
               * This command will play the .ogg file located at
               * `Android samples/8bit/main.ogg`.
               * Note that .ogg playback requires the device to support haptics level 3:
               * If the device's haptic support is less than 3, no haptic feedback will be played.
               */
              playOGG('Android samples/8bit/main.ogg').then(() => {
                console.log('OGG played');
              });
            }}
          />
        </>
      )}
      {Platform.OS === 'ios' && (
        <Button
          title="Play AHAP"
          onPress={() => {
            playAHAP(RNFS.MainBundlePath + '/AHAP/CatPurring.ahap').then(() => {
              console.log('Played ahap');
            });
          }}
        />
      )}
      <Button
        title='Predefined: "Heavy"'
        onPress={() => {
          playPredefinedHaptics({
            ios: IOSPredefinedHaptics.HEAVY,
            android: AndroidPredefinedHaptics.HEAVY_CLICK,
          });
          console.log('Played predefined "Heavy" haptics');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
