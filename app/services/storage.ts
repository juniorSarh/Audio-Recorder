// services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Settings, VoiceNote } from '../types';

const VOICE_NOTES_KEY = '@voice_notes';
const SETTINGS_KEY = '@app_settings';

export const saveVoiceNote = async (note: Omit<VoiceNote, 'id'>): Promise<VoiceNote> => {
  try {
    const newNote: VoiceNote = {
      ...note,
      id: Date.now().toString(),
    };

    const existingNotes = await getVoiceNotes();
    const updatedNotes = [...existingNotes, newNote].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

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

export const updateVoiceNote = async (updatedNote: VoiceNote): Promise<VoiceNote | null> => {
  try {
    const notes = await getVoiceNotes();
    const noteIndex = notes.findIndex(note => note.id === updatedNote.id);
    
    if (noteIndex === -1) {
      throw new Error('Voice note not found');
    }

    const updatedNotes = [...notes];
    updatedNotes[noteIndex] = {
      ...updatedNotes[noteIndex],
      ...updatedNote,
      date: updatedNote.date || updatedNotes[noteIndex].date, // Preserve original date if not provided
    };

    // Sort by date (newest first)
    updatedNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    await AsyncStorage.setItem(VOICE_NOTES_KEY, JSON.stringify(updatedNotes));
    return updatedNotes[noteIndex];
  } catch (error) {
    console.error('Error updating voice note:', error);
    throw error;
  }
};

export const deleteVoiceNote = async (id: string): Promise<boolean> => {
  try {
    const notes = await getVoiceNotes();
    const noteToDelete = notes.find(note => note.id === id);

    if (noteToDelete) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(noteToDelete.uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(noteToDelete.uri);
        }
      } catch (fileError) {
        console.warn('Error deleting audio file:', fileError);
      }

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

export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const getSettings = async (): Promise<Settings | null> => {
  try {
    const settings = await AsyncStorage.getItem(SETTINGS_KEY);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
};

// Add default export to prevent expo-router warnings
export default {};