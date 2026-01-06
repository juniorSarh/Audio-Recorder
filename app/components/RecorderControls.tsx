import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface RecorderControlsProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

const RecorderControls: React.FC<RecorderControlsProps> = ({ isRecording, onStart, onStop }) => {
  return (
    <TouchableOpacity
      style={[styles.recordBtn, isRecording && styles.recording]}
      onPress={isRecording ? onStop : onStart}
    >
      <Text style={styles.recordText}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  recordBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  recording: {
    backgroundColor: '#ef4444',
  },
  recordText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecorderControls;
