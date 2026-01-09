import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as storage from '../services/storage';
import { AppSettings, PlaybackSpeed, RecordingQuality } from '../types';

interface SettingsScreenProps {
  onClose: () => void;
  onSettingsChange: (settings: AppSettings) => void;
}

const RECORDING_QUALITIES: { value: RecordingQuality; label: string }[] = [
  { value: 'low', label: 'Low (Small file size)' },
  { value: 'medium', label: 'Medium (Balanced)' },
  { value: 'high', label: 'High (Best quality)' },
];

const PLAYBACK_SPEEDS: { value: PlaybackSpeed; label: string }[] = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1.0, label: '1.0x (Normal)' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2.0, label: '2.0x' },
];

const THEMES: { value: 'light' | 'dark' | 'system'; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose, onSettingsChange }) => {
  const [settings, setSettings] = useState<AppSettings>({
    recordingQuality: 'high',
    playbackSpeed: 1.0,
    autoSave: true,
    theme: 'dark',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await storage.getSettings();
      if (savedSettings) {
        setSettings({
          recordingQuality: savedSettings.recordingQuality || 'high',
          playbackSpeed: savedSettings.playbackSpeed || 1.0,
          autoSave: savedSettings.autoSave !== undefined ? savedSettings.autoSave : true,
          theme: (savedSettings.theme as 'light' | 'dark' | 'system') || 'dark',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await storage.saveSettings(newSettings);
      setSettings(newSettings);
      onSettingsChange(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recording</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Recording Quality</Text>
            <View style={styles.qualityButtons}>
              {RECORDING_QUALITIES.map((quality) => (
                <TouchableOpacity
                  key={quality.value}
                  style={[
                    styles.qualityButton,
                    settings.recordingQuality === quality.value && styles.qualityButtonActive,
                  ]}
                  onPress={() => updateSetting('recordingQuality', quality.value)}
                >
                  <Text
                    style={[
                      styles.qualityButtonText,
                      settings.recordingQuality === quality.value && styles.qualityButtonTextActive,
                    ]}
                  >
                    {quality.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto-save Recordings</Text>
            <Switch
              value={settings.autoSave}
              onValueChange={(value) => updateSetting('autoSave', value)}
              trackColor={{ false: '#374151', true: '#3b82f6' }}
              thumbColor={settings.autoSave ? '#f3f4f6' : '#9ca3af'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Default Playback Speed</Text>
            <View style={styles.speedButtons}>
              {PLAYBACK_SPEEDS.map((speed) => (
                <TouchableOpacity
                  key={speed.value}
                  style={[
                    styles.speedButton,
                    settings.playbackSpeed === speed.value && styles.speedButtonActive,
                  ]}
                  onPress={() => updateSetting('playbackSpeed', speed.value)}
                >
                  <Text
                    style={[
                      styles.speedButtonText,
                      settings.playbackSpeed === speed.value && styles.speedButtonTextActive,
                    ]}
                  >
                    {speed.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Theme</Text>
            <View style={styles.themeButtons}>
              {THEMES.map((theme) => (
                <TouchableOpacity
                  key={theme.value}
                  style={[
                    styles.themeButton,
                    settings.theme === theme.value && styles.themeButtonActive,
                  ]}
                  onPress={() => updateSetting('theme', theme.value)}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      settings.theme === theme.value && styles.themeButtonTextActive,
                    ]}
                  >
                    {theme.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  closeButton: {
    fontSize: 24,
    color: '#9ca3af',
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#f3f4f6',
    marginBottom: 8,
    fontWeight: '500',
  },
  qualityButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  qualityButton: {
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  qualityButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  qualityButtonText: {
    fontSize: 14,
    color: '#f3f4f6',
  },
  qualityButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  speedButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speedButton: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#374151',
    minWidth: 60,
  },
  speedButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  speedButtonText: {
    fontSize: 12,
    color: '#f3f4f6',
    textAlign: 'center',
  },
  speedButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    flex: 1,
  },
  themeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  themeButtonText: {
    fontSize: 14,
    color: '#f3f4f6',
    textAlign: 'center',
    fontWeight: '500',
  },
  themeButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default SettingsScreen;
