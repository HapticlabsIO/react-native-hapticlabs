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
          <Text>Haptic support level: {androidHapticSupportLevel}</Text>
          <Button
            title="Play Android Haptics"
            onPress={() => {
              playAndroidHaptics('rarri').then(() => {
                console.log('Android haptics played');
              });
            }}
          />
          <Button
            title="Play HLA"
            onPress={() => {
              playHLA('ControllingHapticTrack/Spring.hla').then(() => {
                console.log('HLA played');
              });
            }}
          />
          <Button
            title="Play OGG"
            onPress={() => {
              playOGG('ControllingHapticTrack/Spring.ogg').then(() => {
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
