import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Sample call data
const sampleCalls = [
  {
    id: '1',
    contactName: 'Alice',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    type: 'incoming', // 'outgoing', 'missed'
    callMode: 'voice', // 'video'
    time: '2024-07-11T10:30:00Z',
  },
  {
    id: '2',
    contactName: 'Bob',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    type: 'missed',
    callMode: 'video',
    time: '2024-07-10T15:45:00Z',
  },
  {
    id: '3',
    contactName: 'Carol',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    type: 'outgoing',
    callMode: 'voice',
    time: '2024-07-09T09:20:00Z',
  },
];

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
  const [calls] = useState(sampleCalls);

  const renderCallItem = ({ item }: { item: typeof sampleCalls[0] }) => (
    <TouchableOpacity style={styles.callItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.callInfo}>
        <View style={styles.callHeader}>
          <Text style={styles.contactName}>{item.contactName}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.time)}</Text>
        </View>
        <View style={styles.callDetails}>
          {getCallIcon(item.type, item.callMode)}
          <Text style={styles.callType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
        </View>
      </View>
      <TouchableOpacity>
        <Ionicons name={item.callMode === 'video' ? 'videocam' : 'call'} size={24} color="#075e54" />
      </TouchableOpacity>
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
});
