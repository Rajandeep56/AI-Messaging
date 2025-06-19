import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, Image, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import ChatManager from '@/utils/chatManager';

// Define types for our chat data
interface Message {
  id: string;
  text: string;
  timestamp: string;
  sent: boolean;
  read: boolean;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  messages: Message[];
}

interface ChatListItem extends Chat {
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 7) {
    // Show date for messages older than a week
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (days > 0) {
    // Show day of week for messages within a week
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    // Show time for messages from today
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
}

export default function ChatsScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const chatManager = ChatManager.getInstance();

  const loadChats = async () => {
    try {
      const allChats = await chatManager.getAllChats();
      setChats(Object.values(allChats));
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  // Refresh chats when screen comes into focus (e.g., returning from chat)
  useFocusEffect(
    React.useCallback(() => {
      loadChats();
    }, [])
  );

  // Convert chats to chat list items with computed properties
  const chatListItems: ChatListItem[] = chats.map(chat => ({
    ...chat,
    lastMessage: chat.messages[chat.messages.length - 1]?.text || '',
    timestamp: chat.messages[chat.messages.length - 1]?.timestamp || new Date().toISOString(),
    unreadCount: chat.messages.filter(m => !m.sent && !m.read).length,
  }));

  const renderChatItem = ({ item }: { item: ChatListItem }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => {
        router.push({
          pathname: "/(app)/chat/[id]" as any,
          params: { id: item.id }
        });
      }}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        
        <View style={styles.lastMessageContainer}>
          <Text 
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.unreadMessage
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Chats',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => {
                router.push("/(app)/new-chat" as any);
              }}
            >
              <Ionicons name="create-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <FlatList
        data={chatListItems}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        style={styles.chatList}
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
  headerButton: {
    marginRight: 15,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  unreadMessage: {
    color: '#000',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
