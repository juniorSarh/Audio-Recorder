// services/permissions.ts
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

export const requestAudioPermission = async (): Promise<boolean> => {
  try {
    // For now, continue using expo-av for permissions until full migration
    const { status } = await Audio.requestPermissionsAsync();
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
    const { status } = await MediaLibrary.requestPermissionsAsync();
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

// Add default export to prevent expo-router warnings
export default {};