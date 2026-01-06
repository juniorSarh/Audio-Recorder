// app/components/VoiceNoteItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format } from "date-fns"
import { VoiceNote } from '../types';

interface VoiceNoteItemProps {
  note: VoiceNote;
  onPlay: (uri: string) => void;
  onDelete: (id: string) => void;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const VoiceNoteItem: React.FC<VoiceNoteItemProps> = ({ note, onPlay, onDelete }) => {
  return (
    <View style={styles.noteItem}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle}>{note.title || 'Untitled'}</Text>
        <Text style={styles.noteDate}>
          {format(new Date(note.date), 'MMM d, yyyy h:mm a')}
        </Text>
      </View>
      <View style={styles.noteDetails}>
        <Text style={styles.detailText}>{formatDuration(note.duration)}</Text>
        <Text style={styles.detailText}>{formatFileSize(note.size)}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.playBtn} 
          onPress={() => onPlay(note.uri)}
        >
          <Text style={styles.btnText}>▶️ Play</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => onDelete(note.id)}
        >
          <Text style={styles.btnText}>🗑️ Delete</Text>
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
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noteTitle: {
    color: '#f3f4f6',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  noteDate: {
    color: '#9ca3af',
    fontSize: 12,
  },
  noteDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  playBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    flex: 1,
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default VoiceNoteItem;