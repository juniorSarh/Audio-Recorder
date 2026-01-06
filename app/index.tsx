// app/index.tsx
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Recording } from 'expo-av/build/Audio/Recording';
import * as FileSystem from 'expo-file-system';
import { format } from 'date-fns';


// Components
import VoiceNoteItem from './components/VoiceNoteItem';
import RecorderControls from './components/RecorderControls';

// Services
import * as storage from './services/storage';
import * as permissions from './services/permissions';

// Types
import { VoiceNote } from './types';

const AUDIO_DIR = `${FileSystem.documentDirectory}recordings/`;

export default function App() {
  const [recording, setRecording] = useState<Recording | null>(null);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load voice notes on mount
  useEffect(() => {
    const loadVoiceNotes = async () => {
      try {
        await permissions.ensureDirExists(AUDIO_DIR);
        const notes = await storage.getVoiceNotes();
        setVoiceNotes(notes);
      } catch (error) {
        console.error('Error loading voice notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVoiceNotes();
  }, []);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const startRecording = async () => {
    try {
      const hasPermission = await permissions.requestAudioPermission();
      if (!hasPermission) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        const newFileName = `${AUDIO_DIR}recording-${Date.now()}.m4a`;
        
        // Move the file to our app's directory
        await FileSystem.moveAsync({
          from: uri,
          to: newFileName,
        });

        const newNote: Omit<VoiceNote, 'id'> = {
          uri: newFileName,
          title: `Recording ${format(new Date(), 'MMM d, yyyy h:mm a')}`,
          duration: 0, // You can calculate this using a library like expo-av's getStatusAsync
          date: new Date().toISOString(),
          size: fileInfo.size || 0,
        };

        const savedNote = await storage.saveVoiceNote(newNote);
        setVoiceNotes(prev => [...prev, savedNote]);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to save recording. Please try again.');
    } finally {
      setRecording(null);
    }
  };

  const playRecording = async (uri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound', error);
      Alert.alert('Error', 'Failed to play recording. The file may be corrupted.');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const success = await storage.deleteVoiceNote(id);
      if (success) {
        setVoiceNotes(prev => prev.filter(note => note.id !== id));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      Alert.alert('Error', 'Failed to delete the voice note. Please try again.');
    }
  };

  const filteredNotes = voiceNotes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎤 Voice Notes</Text>
      
      <RecorderControls
        isRecording={!!recording}
        onStart={startRecording}
        onStop={stopRecording}
      />

      <TextInput
        style={styles.searchInput}
        placeholder="Search notes..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#9ca3af"
      />

      <FlatList
        data={filteredNotes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <VoiceNoteItem
            note={item}
            onPlay={playRecording}
            onDelete={deleteNote}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matching notes found' : 'No voice notes yet. Tap the record button to create one!'}
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0f172a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e5e7eb',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#1f2937',
    color: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 30,
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#e5e7eb',
    marginTop: 30,
    fontSize: 18,
  },
});