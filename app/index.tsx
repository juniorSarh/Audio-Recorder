import { Audio } from "expo-av";
import { Recording } from 'expo-av/next';
import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";

interface VoiceNote {
  id: string;
  uri: string;
}

interface VoiceNoteItemProps {
  note: VoiceNote;
  onPlay: (uri: string) => void;
  onDelete: (id: string) => void;
}

interface RecorderControlsProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

// --------------------
// VoiceNoteItem Component
// --------------------
const VoiceNoteItem: React.FC<VoiceNoteItemProps> = ({ note, onPlay, onDelete }) => {
  return (
    <View style={styles.noteItem}>
      <Text style={styles.noteText}>🎤 Voice Note</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.playBtn} onPress={() => onPlay(note.uri)}>
          <Text style={styles.btnText}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(note.id)}>
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --------------------
// RecorderControls Component
// --------------------
const RecorderControls: React.FC<RecorderControlsProps> = ({ isRecording, onStart, onStop }) => {
  return (
    <TouchableOpacity
      style={[styles.recordBtn, isRecording && styles.recording]}
      onPress={isRecording ? onStop : onStart}
    >
      <Text style={styles.recordText}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Text>
    </TouchableOpacity>
  );
};

// --------------------
// Main App Component
// --------------------
export default function App() {
  const [recording, setRecording] = useState<Recording | null>(null);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Microphone access is needed");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        setVoiceNotes((prev) => [
          ...prev,
          { id: uuidv4(), uri },
        ]);
      }

      setRecording(null);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  const playRecording = async (uri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      await newSound.playAsync();
    } catch (err) {
      console.error("Error playing sound", err);
    }
  };

  const deleteNote = (id: string) => {
    setVoiceNotes(voiceNotes.filter((note) => note.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎧 Audio Journal</Text>

      <RecorderControls
        isRecording={!!recording}
        onStart={startRecording}
        onStop={stopRecording}
      />

      <FlatList
        data={voiceNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VoiceNoteItem
            note={item}
            onPlay={playRecording}
            onDelete={deleteNote}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No voice notes yet</Text>
        }
      />
    </View>
  );
}

// --------------------
// Styles
// --------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0f172a",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#e5e7eb",
    textAlign: "center",
    marginBottom: 20,
  },
  recordBtn: {
    backgroundColor: "#22c55e",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  recording: {
    backgroundColor: "#ef4444",
  },
  recordText: {
    color: "white",
    fontWeight: "bold",
  },
  noteItem: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  noteText: {
    color: "#f8fafc",
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  playBtn: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 8,
  },
  btnText: {
    color: "white",
  },
  empty: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 30,
  },
});
