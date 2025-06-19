import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import ChatManager from '@/utils/chatManager';

// Mock data for chats
const mockChats = {
  "1": {
    id: '1',
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=1',
    online: true,
    messages: [
      {
        id: '1',
        text: 'Hey, how are you?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        sent: false,
        read: false,
      },
      {
        id: '2',
        text: 'I\'m good, thanks! How about you?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23 hours ago
        sent: true,
        read: true,
      },
      {
        id: '3',
        text: 'Pretty good! Working on that new project.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22), // 22 hours ago
        sent: false,
        read: false,
      },
    ],
  },
  "2": {
    id: '2',
    name: 'Alice Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    online: true,
    messages: [
      {
        id: '1',
        text: 'Did you see the new project requirements?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        sent: false,
        read: false,
      },
      {
        id: '2',
        text: 'Yes, I\'m reviewing them now',
        timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 mins ago
        sent: true,
        read: true,
      },
      {
        id: '3',
        text: 'Let me know if you have any questions',
        timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 mins ago
        sent: false,
        read: false,
      },
    ],
  },
  "3": {
    id: '3',
    name: 'Team Chat',
    avatar: 'https://i.pravatar.cc/150?img=3',
    online: false,
    messages: [
      {
        id: '1',
        text: 'Team meeting at 3 PM',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        sent: false,
        read: false,
      },
      {
        id: '2',
        text: 'I\'ll be there',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
        sent: true,
        read: true,
      },
    ],
  },
  "4": {
    id: '4',
    name: 'Sarah Wilson',
    avatar: 'https://i.pravatar.cc/150?img=4',
    online: true,
    messages: [
      {
        id: '1',
        text: 'Thanks for your help!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        sent: false,
        read: false,
      },
      {
        id: '2',
        text: 'You\'re welcome! Let me know if you need anything else.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23 hours ago
        sent: true,
        read: true,
      },
    ],
  },
  "5": {
    id: '5',
    name: 'David Brown',
    avatar: 'https://i.pravatar.cc/150?img=5',
    online: false,
    messages: [
      {
        id: '1',
        text: 'See you at the conference!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        sent: false,
        read: false,
      },
      {
        id: '2',
        text: 'Looking forward to it!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        sent: true,
        read: true,
      },
    ],
  },
};

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

function formatMessageTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const chatManager = ChatManager.getInstance();

  useEffect(() => {
    loadChat();
  }, [id]);

  const loadChat = async () => {
    try {
      const loadedChat = await chatManager.getChat(id as string);
      setCurrentChat(loadedChat);
      
      // Mark all received messages as read when chat is opened
      if (loadedChat) {
        const unreadMessages = loadedChat.messages.filter(msg => !msg.sent && !msg.read);
        for (const msg of unreadMessages) {
          await chatManager.markMessageAsRead(loadedChat.id, msg.id);
        }
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sent ? styles.sentMessage : styles.receivedMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.sent ? styles.sentBubble : styles.receivedBubble
      ]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>{formatMessageTime(item.timestamp)}</Text>
      </View>
    </View>
  );

  const sendMessage = async () => {
    if (!message.trim() || !currentChat) return;
    
    try {
      // Add new message
      const newMessage = await chatManager.addMessage(currentChat.id, {
        text: message.trim(),
        timestamp: new Date().toISOString(),
        sent: true,
        read: true,
      });
      
      // Clear input and dismiss keyboard
      setMessage('');
      Keyboard.dismiss();

      // Reload chat to get updated messages
      loadChat();

      // Simulate received message after 1-2 seconds
      if (Math.random() > 0.5) { // 50% chance to get a reply
        setTimeout(async () => {
          const replies = [
            "Got it! 👍",
            "Thanks for letting me know",
            "Okay, sounds good!",
            "I'll get back to you soon",
            "Perfect, thanks!",
            "Sure thing! 😊",
          ];
          
          await chatManager.addMessage(currentChat.id, {
            text: replies[Math.floor(Math.random() * replies.length)],
            timestamp: new Date().toISOString(),
            sent: false,
            read: false,
          });

          // Reload chat to get the reply
          loadChat();
        }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!currentChat) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Chat not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          title: currentChat.name,
          headerTitleStyle: styles.headerTitle,
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="videocam-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="call-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          ),
          headerTitle: () => null,
        }}
      />

      <FlatList
        ref={flatListRef}
        data={currentChat.messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Message"
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons name="happy-outline" size={24} color={Colors.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera-outline" size={24} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.sendButton}
          onPress={sendMessage}
        >
          {message.trim() ? (
            <Ionicons name="send" size={24} color={Colors.primary} />
          ) : (
            <Ionicons name="mic-outline" size={24} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5DAC9', // WhatsApp chat background color
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 8,
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 10,
  },
  messageContainer: {
    marginVertical: 2,
    flexDirection: 'row',
  },
  sentMessage: {
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  sentBubble: {
    backgroundColor: '#DCF8C6', // WhatsApp sent message color
  },
  receivedBubble: {
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
    marginRight: 40, // Space for time
  },
  messageTime: {
    fontSize: 11,
    color: '#666',
    position: 'absolute',
    right: 8,
    bottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    maxHeight: 100,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 8,
  },
  attachButton: {
    padding: 4,
  },
  emojiButton: {
    padding: 4,
  },
  cameraButton: {
    padding: 4,
  },
  sendButton: {
    padding: 4,
  },
}); 