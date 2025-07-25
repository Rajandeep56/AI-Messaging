import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/constants/Theme';
import chatService, { Message, Chat, TypingStatus } from '@/services/chatService';

interface EnhancedChatScreenProps {
  chatId: string;
  chat: Chat;
  onBack: () => void;
}

export default function EnhancedChatScreen({ chatId, chat, onBack }: EnhancedChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const theme = useTheme();

  // Animation for typing indicator
  const typingAnimation = useRef<Animated.Value>(new Animated.Value(0)).current;

  useEffect(() => {
    // Listen to messages in real-time
    const unsubscribeMessages = chatService.listenToChat(chatId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    // Listen to typing status
    const unsubscribeTyping = chatService.listenToTypingStatus(chatId, (users) => {
      setTypingUsers(users);
    });

    // Mark chat as read when opened
    chatService.markChatAsRead(chatId);

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [chatId]);

  // Animate typing indicator
  useEffect(() => {
    if (typingUsers.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [typingUsers]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText('');
    
    try {
      await chatService.sendMessage(chatId, messageText);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = useCallback((text: string) => {
    setInputText(text);
    
    // Update typing status
    const isCurrentlyTyping = text.length > 0;
    if (isCurrentlyTyping !== isTyping) {
      setIsTyping(isCurrentlyTyping);
      chatService.updateTypingStatus(chatId, isCurrentlyTyping);
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    if (isCurrentlyTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        chatService.updateTypingStatus(chatId, false);
      }, 3000);
    }
  }, [chatId, isTyping]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sent ? styles.sentMessage : styles.receivedMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.sent ? 
          { backgroundColor: theme.messageSent } : 
          { backgroundColor: theme.messageReceived }
      ]}>
        <Text style={[styles.messageText, { color: theme.messageText }]}>
          {item.text}
        </Text>
        
        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, { color: theme.messageTime }]}>
            {new Date(item.timestamp).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </Text>
          
          {item.sent && (
            <View style={styles.messageStatus}>
              {item.delivered && (
                <Ionicons 
                  name="checkmark-done" 
                  size={16} 
                  color={item.read ? theme.primary : theme.messageTime} 
                />
              )}
              {!item.delivered && (
                <Ionicons name="checkmark" size={16} color={theme.messageTime} />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    return (
      <View style={[styles.typingContainer, { backgroundColor: theme.messageReceived }]}>
        <View style={styles.typingContent}>
          <Text style={[styles.typingText, { color: theme.textSecondary }]}>
            {typingUsers.map(user => user.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
          </Text>
          <View style={styles.typingDots}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.typingDot,
                  {
                    backgroundColor: theme.typingIndicator,
                    opacity: typingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                    transform: [{
                      translateY: typingAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -5],
                      }),
                    }],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.header }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={theme.headerText} />
      </TouchableOpacity>
      
      <View style={styles.headerInfo}>
        <Text style={[styles.headerTitle, { color: theme.headerText }]}>
          {chat.name}
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.headerText }]}>
          {chat.isAIChat ? 'AI Assistant' : 'Online'}
        </Text>
      </View>
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="videocam-outline" size={24} color={theme.headerText} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="call-outline" size={24} color={theme.headerText} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={theme.headerText} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.chatBackground }]}>
      {renderHeader()}
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderTypingIndicator}
      />

      <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground }]}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
        
        <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={inputText}
            onChangeText={handleTyping}
            placeholder="Message"
            placeholderTextColor={theme.textTertiary}
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons name="happy-outline" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: inputText.trim() ? theme.primary : 'transparent' }]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          {inputText.trim() ? (
            <Ionicons name="send" size={20} color={theme.headerText} />
          ) : (
            <Ionicons name="mic-outline" size={24} color={theme.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
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
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
    marginRight: 4,
  },
  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingContainer: {
    marginTop: 8,
    marginBottom: 4,
    padding: 12,
    borderRadius: 18,
    maxWidth: '60%',
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  attachButton: {
    marginRight: 12,
    padding: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 80,
    marginRight: 8,
  },
  emojiButton: {
    padding: 4,
  },
  sendButton: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 