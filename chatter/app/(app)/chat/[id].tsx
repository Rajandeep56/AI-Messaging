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

// Response suggestions based on context
const getResponseSuggestions = (lastMessage: string, chatName: string): string[] => {
  const lowerMessage = lastMessage.toLowerCase();
  
  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return [
      `Hi ${chatName}! 👋`,
      'Hello! How are you?',
      'Hey there! 😊',
      'Hi! Nice to hear from you'
    ];
  }
  
  // Question responses
  if (lowerMessage.includes('how are you') || lowerMessage.includes('how\'s it going')) {
    return [
      'I\'m doing great, thanks! How about you?',
      'Pretty good! 😊',
      'All good here!',
      'Doing well, thanks for asking!'
    ];
  }
  
  // Work/Project related
  if (lowerMessage.includes('project') || lowerMessage.includes('work') || lowerMessage.includes('meeting')) {
    return [
      'Sounds good! 👍',
      'I\'ll look into it',
      'Thanks for the update',
      'Got it, will do!'
    ];
  }
  
  // Thank you responses
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return [
      'You\'re welcome! 😊',
      'Anytime!',
      'Happy to help!',
      'No problem at all!'
    ];
  }
  
  // General responses
  if (lowerMessage.includes('okay') || lowerMessage.includes('ok') || lowerMessage.includes('sure')) {
    return [
      'Perfect! 👍',
      'Great!',
      'Sounds good!',
      'Awesome! 😊'
    ];
  }
  
  // Default suggestions
  return [
    'Got it! 👍',
    'Thanks for letting me know',
    'I\'ll get back to you soon',
    'Sounds good!',
    'Perfect, thanks!',
    'Sure thing! 😊'
  ];
};

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
  const [showSuggestions, setShowSuggestions] = useState(false);
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
        
        // Show suggestions if there are any unread messages from the other person
        const hasUnreadMessages = loadedChat.messages.some(msg => !msg.sent && !msg.read);
        const lastMessage = loadedChat.messages[loadedChat.messages.length - 1];
        const hasReceivedMessages = loadedChat.messages.some(msg => !msg.sent);
        
        // Show suggestions if:
        // 1. There are unread messages from others, OR
        // 2. The last message is from the other person (even if read), OR
        // 3. There are any received messages (fallback)
        if (hasUnreadMessages || (lastMessage && !lastMessage.sent) || hasReceivedMessages) {
          setShowSuggestions(true);
          console.log('Showing suggestions for chat:', loadedChat.name);
          console.log('Last message:', lastMessage?.text, 'sent:', lastMessage?.sent);
          console.log('Has unread messages:', hasUnreadMessages);
          console.log('Has received messages:', hasReceivedMessages);
        } else {
          setShowSuggestions(false);
          console.log('Hiding suggestions for chat:', loadedChat.name);
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
      setShowSuggestions(false);

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

  const sendSuggestion = async (suggestion: string) => {
    if (!currentChat) return;
    
    try {
      await chatManager.addMessage(currentChat.id, {
        text: suggestion,
        timestamp: new Date().toISOString(),
        sent: true,
        read: true,
      });
      
      setShowSuggestions(false);
      loadChat();

      // Simulate received message after 1-2 seconds
      if (Math.random() > 0.5) {
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

          loadChat();
        }, 1000 + Math.random() * 1000);
      }
    } catch (error) {
      console.error('Failed to send suggestion:', error);
    }
  };

  const renderSuggestions = () => {
    console.log('renderSuggestions called:', { showSuggestions, currentChat: !!currentChat, messagesLength: currentChat?.messages?.length });
    
    if (!showSuggestions || !currentChat || currentChat.messages.length === 0) {
      console.log('Early return from renderSuggestions');
      return null;
    }

    const lastMessage = currentChat.messages[currentChat.messages.length - 1];
    console.log('Last message in renderSuggestions:', lastMessage?.text, 'sent:', lastMessage?.sent);
    
    // For debugging: show suggestions even if last message is from user
    if (lastMessage.sent && !showSuggestions) {
      console.log('Last message is sent by user, but suggestions are forced to show');
    }
    
    if (lastMessage.sent && !showSuggestions) {
      console.log('Last message is sent by user, hiding suggestions');
      return null;
    }

    // Use ChatManager's improved suggestion system
    const suggestions = chatManager.getResponseSuggestions(currentChat.id, currentChat.name);
    const context = chatManager.getConversationContext(currentChat.id);
    
    console.log('Generated suggestions:', suggestions);
    console.log('Context:', context);
    
    // Fallback suggestions if none are generated
    const finalSuggestions = suggestions.length > 0 ? suggestions : [
      'Got it! 👍',
      'Thanks for letting me know',
      'I\'ll get back to you soon',
      'Sounds good!'
    ];

    return (
      <View style={styles.suggestionsContainer}>
        <View style={styles.suggestionsHeader}>
          <Text style={styles.suggestionsTitle}>Quick replies</Text>
          <View style={styles.suggestionsActions}>
            <View style={styles.toneIndicator}>
              <Text style={styles.toneText}>{context.conversationTone}</Text>
            </View>
            <TouchableOpacity 
              style={styles.dismissButton}
              onPress={() => setShowSuggestions(false)}
            >
              <Ionicons name="close" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsScroll}
        >
          {finalSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.suggestionButton,
                context.conversationTone === 'professional' && styles.professionalSuggestion,
                context.conversationTone === 'friendly' && styles.friendlySuggestion,
                context.conversationTone === 'formal' && styles.formalSuggestion,
              ]}
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
          title: currentChat?.name,
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
        data={currentChat?.messages || []}
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
}); 