// app/types/index.ts
export interface VoiceNote {
  id: string;
  uri: string;
  title: string;
  duration: number;
  date: string;
  size: number;
}

export type RecordingQuality = 'low' | 'medium' | 'high';
export type PlaybackSpeed = 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

export interface AppSettings {
  recordingQuality: RecordingQuality;
  playbackSpeed: PlaybackSpeed;
  autoSave: boolean;
  theme: 'light' | 'dark' | 'system';
}