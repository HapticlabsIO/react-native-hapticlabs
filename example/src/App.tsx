import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import {
  androidHapticSupportLevel,
  playAndroidHaptics,
  playHLA,
  playOGG,
} from 'react-native-hapticlabs';
import RNFS from 'react-native-fs';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      copyAssetFolder(
        RNFS.MainBundlePath + '/AHAP',
        RNFS.DocumentDirectoryPath + '/AHAP'
      );
    } else {
      copyAssetFolder('rarri', RNFS.DocumentDirectoryPath + '/rarri');
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      playAHAP(RNFS.DocumentDirectoryPath + '/AHAP/8Bit.ahap').then(() => {
        console.log('Played ahap');
      });
    } else {
      getExampleAndroidHapticTrackDirectory()
        .then((directory) => {
          return playHLA(directory + '/Spring.hla')
            .then(() => {
              console.log('HLA played');
              return playOGG(directory + '/Spring.ogg');
            })
            .then(() => {
              console.log('OGG played');
              console.log('Level', androidHapticSupportLevel);
            })
            .then(() => {
              return playAndroidHaptics(RNFS.DocumentDirectoryPath + '/rarri');
            })
            .then(() => {
              console.log('Android haptics played');
            });
        })

        .catch(console.error);
    }
  });

  return (
    <View style={styles.container}>
      <Text>Nothing lol</Text>
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

async function getExampleAndroidHapticTrackDirectory(): Promise<string> {
  const exampleHapticTrackDirectory =
    RNFS.DocumentDirectoryPath + '/ExampleHapticTrack';

  // Create the directory if it doesn't exist
  await RNFS.mkdir(exampleHapticTrackDirectory);

  return exampleHapticTrackDirectory;
}

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
    : [
        {
          origin: 'ControllingHapticTrack/08e9d2f44da2463aba8f7ba62187135e.wav',
          target:
            (await getExampleAndroidHapticTrackDirectory()) +
            '/08e9d2f44da2463aba8f7ba62187135e.wav',
        },
        {
          origin: 'ControllingHapticTrack/Spring.hla',
          target:
            (await getExampleAndroidHapticTrackDirectory()) + '/Spring.hla',
        },
        {
          origin: 'ControllingHapticTrack/Spring.ogg',
          target:
            (await getExampleAndroidHapticTrackDirectory()) + '/Spring.ogg',
        },
      ];
}

const copyFolder = async (source: string, target: string) => {
  try {
    // Create the target directory if it doesn't exist
    await RNFS.mkdir(target);

    // Get the list of files and directories in the source directory
    const items = await RNFS.readDir(source);

    // Iterate through each item
    for (const item of items) {
      const sourcePath = item.path;
      const targetPath = `${target}/${item.name}`;

      if (item.isFile()) {
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

const copyAssetFolder = async (source: string, target: string) => {
  try {
    // Create the target directory if it doesn't exist
    await RNFS.mkdir(target);

    // Get the list of files and directories in the source directory
    const items = await RNFS.readDirAssets(source);

    // Iterate through each item
    for (const item of items) {
      const sourcePath = item.path;
      const targetPath = `${target}/${item.name}`;

      if (item.isFile()) {
        // Copy the file to the target directory
        await RNFS.copyFileAssets(sourcePath, targetPath);
      } else if (item.isDirectory()) {
        // Recursively copy the directory
        await copyAssetFolder(sourcePath, targetPath);
      }
    }
  } catch (error) {
    console.error('Error copying asset folder:', error);
  }
};
