import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VoiceNote {
  id: string;
  uri: string;
}

interface VoiceNoteItemProps {
  note: VoiceNote;
  onPlay: (uri: string) => void;
  onDelete: (id: string) => void;
}

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

const styles = StyleSheet.create({
  noteItem: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteText: {
    color: '#f3f4f6',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  playBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default VoiceNoteItem;
