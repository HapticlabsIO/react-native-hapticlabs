import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { multiply, playHLA, playOGG } from 'react-native-hapticlabs';
import RNFS from 'react-native-fs';

export default function App() {
  const [result, setResult] = useState<number | undefined>();

  useEffect(() => {
    multiply(3, 7).then(setResult);
  }, []);

  useEffect(() => {
    getFilesThatNeedLoading().then((filesThatNeedLoading) => {
      for (const file of filesThatNeedLoading) {
        RNFS.exists(file.target).then((exists) => {
          if (!exists || true) {
            if (Platform.OS === 'ios') {
              RNFS.copyFile(file.origin, file.target);
            } else {
              RNFS.copyFileAssets(file.origin, file.target);
              console.log('Copied file from assets');
            }
          }
        });
      }
    });
  }, []);

  useEffect(() => {
    getExampleAndroidHapticTrackDirectory()
      .then((directory) => {
        return playHLA(directory + '/Spring.hla')
          .then(() => {
            console.log('HLA played');
            return playOGG(directory + '/Spring.ogg');
          })
          .then(() => {
            console.log('OGG played');
          });
      })
      .catch(console.error);
  });

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
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
            RNFS.DocumentDirectoryPath +
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
