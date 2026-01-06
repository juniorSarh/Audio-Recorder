// app/services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { VoiceNote } from '../types';

const VOICE_NOTES_KEY = '@voice_notes';
const SETTINGS_KEY = '@app_settings';

export const saveVoiceNote = async (note: Omit<VoiceNote, 'id'>): Promise<VoiceNote> => {
  try {
    const newNote = {
      ...note,
      id: Date.now().toString(),
    };
    
    const existingNotes = await getVoiceNotes();
    const updatedNotes = [...existingNotes, newNote];
    
    await AsyncStorage.setItem(VOICE_NOTES_KEY, JSON.stringify(updatedNotes));
    return newNote;
  } catch (error) {
    console.error('Error saving voice note:', error);
    throw error;
  }
};

export const getVoiceNotes = async (): Promise<VoiceNote[]> => {
  try {
    const notes = await AsyncStorage.getItem(VOICE_NOTES_KEY);
    return notes ? JSON.parse(notes) : [];
  } catch (error) {
    console.error('Error getting voice notes:', error);
    return [];
  }
};

export const deleteVoiceNote = async (id: string): Promise<boolean> => {
  try {
    const notes = await getVoiceNotes();
    const noteToDelete = notes.find(note => note.id === id);
    
    if (noteToDelete) {
      // Delete the audio file
      try {
        await FileSystem.deleteAsync(noteToDelete.uri);
      } catch (fileError) {
        console.warn('Error deleting audio file:', fileError);
      }
      
      // Remove from storage
      const updatedNotes = notes.filter(note => note.id !== id);
      await AsyncStorage.setItem(VOICE_NOTES_KEY, JSON.stringify(updatedNotes));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting voice note:', error);
    return false;
  }
};

export const saveSettings = async (settings: any) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const getSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(SETTINGS_KEY);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
};