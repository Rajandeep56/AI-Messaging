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
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import chatService from '@/services/chatService';
import authService from '@/services/authService';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sent: boolean;
  read: boolean;
  senderId?: string;
  senderName?: string;
  isAI?: boolean;
}

interface ChatInfo {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

function formatMessageTime(timestamp: Date) {
  return timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadChat();
    checkAuthStatus();
  }, [id]);

  const checkAuthStatus = async () => {
    try {
      const isAuth = authService.isAuthenticated();
      if (isAuth) {
        setAuthStatus('Authenticated');
      } else {
        setAuthStatus('Not authenticated - trying demo user...');
        await authService.ensureDemoUser();
        const retryAuth = authService.isAuthenticated();
        
        if (retryAuth) {
          setAuthStatus('Authenticated');
        } else {
          // Force fallback mode if Firebase is not working
          authService.forceFallbackMode();
          setAuthStatus('Using fallback mode');
        }
      }
    } catch (error) {
      setAuthStatus('Authentication error - using fallback');
      authService.forceFallbackMode();
    }
  };

  const loadChat = async () => {
    try {
      const chatId = id as string;
      
      // For now, we'll use mock chat info since Firebase requires authentication
      // In a real app, you'd get this from Firebase
      const mockChatInfo = {
        id: chatId,
        name: chatId === '1' ? 'John Doe' : chatId === '2' ? 'Alice Smith' : 'Chat',
        avatar: `https://i.pravatar.cc/150?img=${chatId}`,
        online: true
      };
      
      setChatInfo(mockChatInfo);

      // Load conversation history from Firebase
      try {
        const conversationHistory = await chatService.getConversationHistory(chatId);
        setMessages(conversationHistory);
        
        // Show suggestions if there are received messages
        const hasReceivedMessages = conversationHistory.some((msg: Message) => !msg.sent);
        if (hasReceivedMessages) {
          setShowSuggestions(true);
        }
      } catch (error) {
        console.log('Using mock messages for now');
        // Fallback to mock messages if Firebase fails
        setMessages([
          {
            id: '1',
            text: 'Hey, how are you?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            sent: false,
            read: false,
          },
          {
            id: '2',
            text: 'I\'m good, thanks! How about you?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
            sent: true,
            read: true,
          },
        ]);
      }

      // Listen to real-time message updates
      try {
        const unsubscribe = chatService.listenToChat(chatId, (updatedMessages) => {
          setMessages(updatedMessages);
          
          // Show suggestions for new received messages
          const hasNewReceivedMessages = updatedMessages.some((msg: Message) => !msg.sent);
          if (hasNewReceivedMessages) {
            setShowSuggestions(true);
          }
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
      } catch (error) {
        console.log('Real-time updates not available');
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
      setChatInfo(null);
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
    if (!message.trim() || !chatInfo) return;
    
    try {
      // Ensure authentication before sending
      if (!authService.isAuthenticated()) {
        await authService.ensureDemoUser();
      }
      
      // Send message via Firebase
      await chatService.sendMessage(chatInfo.id, message.trim());
      
      // Clear input and dismiss keyboard
      setMessage('');
      Keyboard.dismiss();
      setShowSuggestions(false);
    } catch (error) {
      console.error('Failed to send message via Firebase:', error);
      // Try to re-authenticate and retry
      try {
        await authService.ensureDemoUser();
        await chatService.sendMessage(chatInfo.id, message.trim());
        setMessage('');
        Keyboard.dismiss();
        setShowSuggestions(false);
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
    }
  };

  const sendSuggestion = async (suggestion: string) => {
    setMessage(suggestion);
    await sendMessage();
  };

  const renderSuggestions = () => {
    if (!showSuggestions || !chatInfo || messages.length === 0) {
      return null;
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sent) {
      return null;
    }

    const suggestions = [
      'Got it! 👍',
      'Thanks for letting me know',
      'I\'ll get back to you soon',
      'Sounds good!'
    ];

    return (
      <View style={styles.suggestionsContainer}>
        <View style={styles.suggestionsHeader}>
          <Text style={styles.suggestionsTitle}>Quick replies</Text>
          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={() => setShowSuggestions(false)}
          >
            <Ionicons name="close" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsScroll}
        >
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionButton}
              onPress={() => sendSuggestion(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!chatInfo) {
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
      {/* Authentication Status Indicator */}
      {authStatus !== 'Authenticated' && (
        <View style={styles.authStatusContainer}>
          <Text style={styles.authStatusText}>{authStatus}</Text>
          <TouchableOpacity 
            style={styles.forceFallbackButton}
            onPress={() => {
              authService.forceFallbackMode();
              setAuthStatus('Using fallback mode');
            }}
          >
            <Text style={styles.forceFallbackText}>Force Fallback Mode</Text>
          </TouchableOpacity>
        </View>
      )}
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/chats')}
              style={styles.headerButton}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          title: chatInfo?.name,
          headerTitleStyle: styles.headerTitle,
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => {
                  console.log('Debug: Forcing suggestions to show');
                  setShowSuggestions(true);
                }}
              >
                <Ionicons name="help-circle-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push(`/call/${id}?mode=video`)}
              >
                <Ionicons name="videocam-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push(`/call/${id}?mode=voice`)}
              >
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
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      {renderSuggestions()}

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
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  suggestionsActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  toneIndicator: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  toneText: {
    fontSize: 10,
    color: '#2E7D32',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  suggestionsScroll: {
    paddingHorizontal: 10,
  },
  suggestionButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  professionalSuggestion: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  friendlySuggestion: {
    backgroundColor: '#F3E5F5',
    borderColor: '#9C27B0',
  },
  formalSuggestion: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
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
  authStatusContainer: {
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFEAA7',
  },
  authStatusText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '500',
  },
  forceFallbackButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'center',
  },
  forceFallbackText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});