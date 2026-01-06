// app/services/permissions.ts
import { Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';

export const requestAudioPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Audio recording permission is needed to record voice notes.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error requesting audio permission:', error);
    return false;
  }
};

export const requestStoragePermission = async (): Promise<boolean> => {
  try {
    const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
    if (status !== 'granted') {
      Alert.alert(
        'Storage Permission Required',
        'Storage permission is needed to save voice notes.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error requesting storage permission:', error);
    return false;
  }
};

export const ensureDirExists = async (dir: string): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
};