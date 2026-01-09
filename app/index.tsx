import { format } from 'date-fns';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Components
import RecorderControls from './components/RecorderControls';
import SettingsScreen from './components/SettingsScreen';
import VoiceNoteItem from './components/VoiceNoteItem';
// Services
import {
  ensureDirExists,
  requestAudioPermission,
} from './services/permissions';
import * as storage from './services/storage';

// Types
import { AppSettings, VoiceNote } from './types';

type AVRecording = Audio.Recording;
type AVSound = Audio.Sound;

const AUDIO_DIR = FileSystem.documentDirectory + 'recordings/';

export default function App() {
  const [recording, setRecording] = useState<AVRecording | null>(null);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [sound, setSound] = useState<AVSound | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<VoiceNote | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    recordingQuality: 'high',
    playbackSpeed: 1.0,
    autoSave: true,
    theme: 'dark',
  });

  useEffect(() => {
    const loadVoiceNotes = async () => {
      try {
        await ensureDirExists(AUDIO_DIR);
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

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const startRecording = async () => {
    try {
      const hasPermission = await requestAudioPermission();
      if (!hasPermission) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const newRecording = new Audio.Recording();
      
      // Use recording quality setting
      let recordingPreset;
      switch (settings.recordingQuality) {
        case 'low':
          recordingPreset = Audio.RecordingOptionsPresets.LOW_QUALITY;
          break;
        case 'medium':
          recordingPreset = Audio.RecordingOptionsPresets.MEDIUM_QUALITY;
          break;
        case 'high':
        default:
          recordingPreset = Audio.RecordingOptionsPresets.HIGH_QUALITY;
          break;
      }
      
      await newRecording.prepareToRecordAsync(recordingPreset);
      await newRecording.startAsync();

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
      const status = await recording.getStatusAsync();

      if (uri) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          throw new Error('Recording file does not exist at URI: ' + uri);
        }

        const newFileName = `${AUDIO_DIR}recording-${Date.now()}.m4a`;

        await FileSystem.moveAsync({
          from: uri,
          to: newFileName,
        });

        const newNote: Omit<VoiceNote, 'id'> = {
          uri: newFileName,
          title: `Recording ${format(new Date(), 'MMM d, yyyy h:mm a')}`,
          duration: status.durationMillis ? Math.round(status.durationMillis / 1000) : 0,
          date: new Date().toISOString(),
          size: fileInfo.size ?? 0,
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

      // Apply playback speed setting
      await newSound.setRateAsync(settings.playbackSpeed, true);
      
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

  const startEditNote = (note: VoiceNote) => {
    setEditingNote(note);
    setEditTitle(note.title);
  };

  const saveEditNote = async () => {
    if (!editingNote || !editTitle.trim()) return;

    try {
      const updatedNote = await storage.updateVoiceNote({
        ...editingNote,
        title: editTitle.trim(),
      });
      
      if (updatedNote) {
        setVoiceNotes(prev => 
          prev.map(note => note.id === updatedNote.id ? updatedNote : note)
        );
        setEditingNote(null);
        setEditTitle('');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      Alert.alert('Error', 'Failed to update the voice note. Please try again.');
    }
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditTitle('');
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
      <View style={styles.header}>
        <Text style={styles.title}>🎤 Voice Notes</Text>
        <TouchableOpacity onPress={() => setShowSettings(true)}>
          <Text style={styles.settingsButton}>⚙️</Text>
        </TouchableOpacity>
      </View>

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
            onEdit={startEditNote}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery
              ? 'No matching notes found'
              : 'No voice notes yet. Tap the record button to create one!'}
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={!!editingNote}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={cancelEdit}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Note</Text>
            <TouchableOpacity onPress={saveEditNote}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Enter note title..."
              placeholderTextColor="#9ca3af"
              autoFocus
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SettingsScreen
          onClose={() => setShowSettings(false)}
          onSettingsChange={setSettings}
        />
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsButton: {
    fontSize: 24,
    color: '#9ca3af',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  cancelButton: {
    color: '#9ca3af',
    fontSize: 16,
  },
  saveButton: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    color: '#e5e7eb',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  titleInput: {
    backgroundColor: '#1f2937',
    color: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
});