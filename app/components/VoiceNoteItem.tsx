// app/components/VoiceNoteItem.tsx
import { format } from "date-fns";
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VoiceNote } from '../types';

interface VoiceNoteItemProps {
  note: VoiceNote;
  onPlay: (uri: string) => void;
  onDelete: (id: string) => void;
  onEdit: (note: VoiceNote) => void;
  isCurrentlyPlaying?: boolean;
  currentPlaybackUri?: string | null;
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

const VoiceNoteItem: React.FC<VoiceNoteItemProps> = ({ 
  note, 
  onPlay, 
  onDelete, 
  onEdit, 
  isCurrentlyPlaying = false, 
  currentPlaybackUri = null 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  // Sync playing state with props
  useEffect(() => {
    setIsPlaying(isCurrentlyPlaying && currentPlaybackUri === note.uri);
  }, [isCurrentlyPlaying, currentPlaybackUri, note.uri]);

  const handlePlayPause = () => {
    if (isPlaying) {
      // Handle pause logic here
      setIsPlaying(false);
    } else {
      onPlay(note.uri);
      setIsPlaying(true);
      // Reset position for new playback
      setPlaybackPosition(0);
    }
  };

  const progress = playbackDuration > 0 ? (playbackPosition / playbackDuration) : 0;

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

      {/* Playback Progress Bar */}
      <View style={styles.playbackContainer}>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeText}>
            {formatDuration(playbackPosition)} / {formatDuration(playbackDuration || note.duration)}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.playBtn, isPlaying && styles.pauseBtn]} 
          onPress={handlePlayPause}
        >
          <Text style={styles.btnText}>
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => onEdit(note)}
        >
          <Text style={styles.btnText}>✏️ Edit</Text>
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
  pauseBtn: {
    backgroundColor: '#f59e0b',
  },
  editBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
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
  playbackContainer: {
    marginBottom: 12,
  },
  timeDisplay: {
    marginBottom: 4,
  },
  timeText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
});

export default VoiceNoteItem;