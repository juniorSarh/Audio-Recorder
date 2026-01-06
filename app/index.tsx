import { Audio } from "expo-av";
import { Recording } from "expo-av/build/Audio/Recording";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";

// Import components
import RecorderControls from "./components/RecorderControls";
import VoiceNoteItem from "./components/VoiceNoteItem";

interface VoiceNote {
  id: string;
  uri: string;
}

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
      <Text style={styles.title}>🎧 Audio Recording App</Text>

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
  empty: {
    textAlign: "center",
    color: "#e5e7eb",
    marginTop: 30,
  },
});
