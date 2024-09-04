import { useEffect } from 'react';
import { StyleSheet, View, Text, Platform, Button } from 'react-native';
import {
  androidHapticSupportLevel,
  playAHAP,
  playAndroidHaptics,
  playHLA,
  playOGG,
} from 'react-native-hapticlabs';
import RNFS from 'react-native-fs';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      copyFolder(
        RNFS.MainBundlePath + '/AHAP',
        RNFS.DocumentDirectoryPath + '/AHAP'
      ).then(() => {
        return getFilesThatNeedLoading().then((files) => {
          files.forEach((file) => {
            RNFS.copyFile(file.origin, file.target);
          });
        });
      });
    }
  }, []);

  return (
    <View style={styles.container}>
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
               * - `3`: The device supports fully customizable haptic feedback.
               */
              androidHapticSupportLevel
            }
          </Text>
          <Button
            title="Play Android Haptics"
            onPress={() => {
              /**
               * This command will play a haptic pattern from the directory
               * `Android samples/Double click with audio-Simple pattern-Single Vibration`.
               * Depending on the device's haptic support level, different haptic
               * feedback will be played.
               * For haptic support level 3, "Double click with audio" will be played.
               * For haptic support level 2, "Simple pattern" will be played.
               * For haptic support level 1, "Single Vibration" will be played.
               * For haptic support level 0, no haptic feedback will be played.
               */
              playAndroidHaptics(
                'Android samples/Double click with audio-Simple pattern-Single Vibration'
              ).then(() => {
                console.log('Android haptics played');
              });
            }}
          />
          <Button
            title="Play HLA"
            onPress={() => {
              /**
               * This command will play the .hla file located at
               * `Android samples/Double click with audio/lvl2/main.hla`.
               * Note that this .hla file references an audio file, which will be played
               * along with the haptic feedback.
               */
              playHLA(
                'Android samples/Double click with audio/lvl2/main.hla'
              ).then(() => {
                console.log('HLA played');
              });
            }}
          />
          <Button
            title="Play OGG"
            onPress={() => {
              /**
               * This command will play the .ogg file located at
               * `Ramp + click2-Vibration A-Subtle Repetitive Notification/lvl3/main.ogg`.
               * Note that .ogg playback requires the device to support haptics level 3:
               * If the device's haptic support is less than 3, no haptic feedback will be played.
               */
              playOGG('Android samples/Simple pattern/lvl3/main.ogg').then(
                () => {
                  console.log('OGG played');
                }
              );
            }}
          />
        </>
      )}
      {Platform.OS === 'ios' && (
        <Button
          title="Play AHAP"
          onPress={() => {
            playAHAP(RNFS.DocumentDirectoryPath + '/AHAP/9Bit.ahap').then(
              () => {
                console.log('Played ahap');
              }
            );
          }}
        />
      )}
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

async function getFilesThatNeedLoading() {
  return Platform.OS === 'ios'
    ? [
        {
          origin:
            RNFS.MainBundlePath +
            '/AHAP/4bab56049a1248eeac8397f6c3f850e9short.wav',
          target:
            RNFS.DocumentDirectoryPath +
            '/4bab56049a1248eeac8397f6c3f850e9short.wav',
        },
      ]
    : [];
}

const copyFolder = async (source: string, target: string) => {
  try {
    // Create the target directory if it doesn't exist
    await RNFS.mkdir(target);

    // Get the list of files and directories in the source directory
    const items = await RNFS.readDir(source);
    console.log('copying -------------------------------', items);

    // Iterate through each item
    for (const item of items) {
      const sourcePath = item.path;
      const targetPath = `${target}/${item.name}`;

      if (item.isFile() && !(await RNFS.exists(targetPath))) {
        // Copy the file to the target directory
        await RNFS.copyFile(sourcePath, targetPath);
      } else if (item.isDirectory()) {
        // Recursively copy the directory
        await copyFolder(sourcePath, targetPath);
      }
    }
  } catch (error) {
    console.error('Error copying folder:', error);
  }
};
