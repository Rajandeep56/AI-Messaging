import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CallManager, { Call } from '@/utils/callManager';

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 7) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (days > 0) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}

const getCallIcon = (type: string, callMode: string) => {
  if (callMode === 'video') return <Ionicons name="videocam" size={20} color="#075e54" />;
  if (type === 'missed') return <MaterialIcons name="call-missed" size={20} color="red" />;
  if (type === 'outgoing') return <MaterialIcons name="call-made" size={20} color="#25d366" />;
  return <MaterialIcons name="call-received" size={20} color="#34b7f1" />;
};

export default function CallsTab() {
  const router = useRouter();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const callManager = CallManager.getInstance();

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    try {
      setLoading(true);
      await callManager.initialize();
      const allCalls = await callManager.getAllCalls();
      const callsArray = Object.values(allCalls).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setCalls(callsArray);
    } catch (error) {
      console.error('Failed to load calls:', error);
      Alert.alert('Error', 'Failed to load call history');
    } finally {
      setLoading(false);
    }
  };

  const handleCallPress = (call: Call, mode: 'voice' | 'video') => {
    router.push(`/call/${call.contactId}?mode=${mode}`);
  };

  const renderCallItem = ({ item }: { item: Call }) => (
    <TouchableOpacity style={styles.callItem}>
      <Image source={{ uri: item.contactAvatar }} style={styles.avatar} />
      <View style={styles.callInfo}>
        <View style={styles.callHeader}>
          <Text style={styles.contactName}>{item.contactName}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        <View style={styles.callDetails}>
          {getCallIcon(item.type, item.callMode)}
          <Text style={styles.callType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
          {item.duration && (
            <Text style={styles.duration}> • {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}</Text>
          )}
        </View>
      </View>
      <View style={styles.callActions}>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => handleCallPress(item, 'voice')}
        >
          <Ionicons name="call" size={24} color="#075e54" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => handleCallPress(item, 'video')}
        >
          <Ionicons name="videocam" size={24} color="#075e54" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={calls}
        renderItem={renderCallItem}
        keyExtractor={item => item.id}
        style={styles.callList}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  callList: {
    flex: 1,
  },
  callItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  callInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callType: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  duration: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  callActions: {
    flexDirection: 'row',
    gap: 10,
  },
  callButton: {
    padding: 8,
  },
});
