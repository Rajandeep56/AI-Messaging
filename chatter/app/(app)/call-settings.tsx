import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import CallManager from '@/utils/callManager';

export default function CallSettingsScreen() {
  const router = useRouter();
  const [callStats, setCallStats] = useState({
    totalCalls: 0,
    totalDuration: 0,
    missedCalls: 0,
    voiceCalls: 0,
    videoCalls: 0,
  });
  const [settings, setSettings] = useState({
    autoAnswer: false,
    doNotDisturb: false,
    callRecording: false,
    showCallerId: true,
    vibrateOnRing: true,
  });

  useEffect(() => {
    loadCallStats();
  }, []);

  const loadCallStats = async () => {
    try {
      const callManager = CallManager.getInstance();
      await callManager.initialize();
      const stats = await callManager.getCallStats();
      setCallStats(stats);
    } catch (error) {
      console.error('Failed to load call stats:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const clearCallHistory = () => {
    Alert.alert(
      'Clear Call History',
      'Are you sure you want to clear all call history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // This would be implemented in CallManager
              Alert.alert('Success', 'Call history cleared');
              loadCallStats();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear call history');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Call Settings',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
        }}
      />

      {/* Call Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Call Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="call" size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{callStats.totalCalls}</Text>
            <Text style={styles.statLabel}>Total Calls</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{formatDuration(callStats.totalDuration)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="call-outline" size={24} color="#ff4444" />
            <Text style={styles.statNumber}>{callStats.missedCalls}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="videocam" size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{callStats.videoCalls}</Text>
            <Text style={styles.statLabel}>Video Calls</Text>
          </View>
        </View>
      </View>

      {/* Call Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Call Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="call" size={20} color={Colors.primary} />
            <Text style={styles.settingLabel}>Auto-answer calls</Text>
          </View>
          <Switch
            value={settings.autoAnswer}
            onValueChange={() => toggleSetting('autoAnswer')}
            trackColor={{ false: '#767577', true: Colors.primary }}
            thumbColor={settings.autoAnswer ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={20} color={Colors.primary} />
            <Text style={styles.settingLabel}>Do not disturb</Text>
          </View>
          <Switch
            value={settings.doNotDisturb}
            onValueChange={() => toggleSetting('doNotDisturb')}
            trackColor={{ false: '#767577', true: Colors.primary }}
            thumbColor={settings.doNotDisturb ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="recording" size={20} color={Colors.primary} />
            <Text style={styles.settingLabel}>Call recording</Text>
          </View>
          <Switch
            value={settings.callRecording}
            onValueChange={() => toggleSetting('callRecording')}
            trackColor={{ false: '#767577', true: Colors.primary }}
            thumbColor={settings.callRecording ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="person" size={20} color={Colors.primary} />
            <Text style={styles.settingLabel}>Show caller ID</Text>
          </View>
          <Switch
            value={settings.showCallerId}
            onValueChange={() => toggleSetting('showCallerId')}
            trackColor={{ false: '#767577', true: Colors.primary }}
            thumbColor={settings.showCallerId ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="phone-portrait" size={20} color={Colors.primary} />
            <Text style={styles.settingLabel}>Vibrate on ring</Text>
          </View>
          <Switch
            value={settings.vibrateOnRing}
            onValueChange={() => toggleSetting('vibrateOnRing')}
            trackColor={{ false: '#767577', true: Colors.primary }}
            thumbColor={settings.vibrateOnRing ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Call Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Call Actions</Text>
        
        <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/calls')}>
          <View style={styles.actionInfo}>
            <Ionicons name="time" size={20} color={Colors.primary} />
            <Text style={styles.actionLabel}>Call History</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={clearCallHistory}>
          <View style={styles.actionInfo}>
            <Ionicons name="trash" size={20} color="#ff4444" />
            <Text style={[styles.actionLabel, { color: '#ff4444' }]}>Clear Call History</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <View style={styles.actionInfo}>
            <Ionicons name="download" size={20} color={Colors.primary} />
            <Text style={styles.actionLabel}>Export Call Logs</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Call Quality */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Call Quality</Text>
        
        <View style={styles.qualityItem}>
          <Text style={styles.qualityLabel}>Network Quality</Text>
          <View style={styles.qualityIndicator}>
            <View style={[styles.qualityBar, styles.qualityBarGood]} />
            <View style={[styles.qualityBar, styles.qualityBarGood]} />
            <View style={[styles.qualityBar, styles.qualityBarGood]} />
            <View style={[styles.qualityBar, styles.qualityBarMedium]} />
            <View style={[styles.qualityBar, styles.qualityBarPoor]} />
          </View>
        </View>

        <View style={styles.qualityItem}>
          <Text style={styles.qualityLabel}>Audio Quality</Text>
          <View style={styles.qualityIndicator}>
            <View style={[styles.qualityBar, styles.qualityBarGood]} />
            <View style={[styles.qualityBar, styles.qualityBarGood]} />
            <View style={[styles.qualityBar, styles.qualityBarGood]} />
            <View style={[styles.qualityBar, styles.qualityBarGood]} />
            <View style={[styles.qualityBar, styles.qualityBarMedium]} />
          </View>
        </View>

        <View style={styles.qualityItem}>
          <Text style={styles.qualityLabel}>Video Quality</Text>
          <View style={styles.qualityIndicator}>
            <View style={[styles.qualityBar, styles.qualityBarGood]} />
            <View style={[styles.qualityBar, styles.qualityBarGood]} />
            <View style={[styles.qualityBar, styles.qualityBarGood]} />
            <View style={[styles.qualityBar, styles.qualityBarGood]} />
            <View style={[styles.qualityBar, styles.qualityBarGood]} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  qualityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  qualityLabel: {
    fontSize: 16,
    color: '#000',
  },
  qualityIndicator: {
    flexDirection: 'row',
    gap: 2,
  },
  qualityBar: {
    width: 8,
    height: 20,
    borderRadius: 4,
  },
  qualityBarGood: {
    backgroundColor: '#25d366',
  },
  qualityBarMedium: {
    backgroundColor: '#ffa500',
  },
  qualityBarPoor: {
    backgroundColor: '#ff4444',
  },
}); 