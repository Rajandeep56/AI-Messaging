import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit as firestoreLimit,
  serverTimestamp,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateAIResponse as generateOpenAIResponse } from '../config/openai';
import authService from './authService';

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sent: boolean;
  read: boolean;
  senderId: string;
  senderName: string;
  isAI?: boolean;
  typing?: boolean;
  delivered?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  messages: Message[];
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isAIChat?: boolean;
}

export interface TypingStatus {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

class ChatService {
  private chats: Map<string, Chat> = new Map();
  private typingStatus: Map<string, TypingStatus[]> = new Map();
  private listeners: Map<string, () => void> = new Map();
  private currentUserId: string | null = null;

  constructor() {
    this.initializeCurrentUser();
  }

  private async initializeCurrentUser() {
    const user = authService.getCurrentUser();
    if (user) {
      this.currentUserId = user.uid;
      console.log('ChatService: User initialized with ID:', this.currentUserId);
    } else {
      console.log('ChatService: No user found during initialization');
    }

    // Listen for auth state changes
    authService.onAuthStateChanged((user) => {
      this.currentUserId = user?.uid || null;
      console.log('ChatService: Auth state changed, currentUserId:', this.currentUserId);
    });
  }

  // Create a new chat
  async createChat(name: string, avatar: string, isAIChat: boolean = false): Promise<Chat> {
    if (!this.currentUserId) throw new Error('User not authenticated');

    const chatData = {
      name,
      avatar,
      online: false,
      participants: isAIChat ? [this.currentUserId] : [this.currentUserId],
      isAIChat,
      createdAt: serverTimestamp(),
      lastMessage: null,
      unreadCount: 0,
    };

    const chatRef = await addDoc(collection(db, 'chats'), chatData);
    const chat: Chat = {
      id: chatRef.id,
      name,
      avatar,
      online: false,
      messages: [],
      participants: isAIChat ? [this.currentUserId] : [this.currentUserId],
      unreadCount: 0,
      isAIChat,
    };

    this.chats.set(chat.id, chat);
    return chat;
  }

  // Get all chats for current user
  async getChats(): Promise<Chat[]> {
    if (!this.currentUserId) return [];

    try {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', this.currentUserId),
        orderBy('lastMessage.timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const chats: Chat[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const chat: Chat = {
          id: doc.id,
          name: data.name,
          avatar: data.avatar,
          online: data.online || false,
          messages: data.messages || [],
          participants: data.participants || [],
          lastMessage: data.lastMessage,
          unreadCount: data.unreadCount || 0,
          isAIChat: data.isAIChat || false,
        };
        chats.push(chat);
        this.chats.set(chat.id, chat);
      });

      return chats;
    } catch (error) {
      console.error('Error getting chats from Firebase:', error);
      console.log('Using fallback default chats');
      
      // Return default chats for fallback mode
      return this.getDefaultChats();
    }
  }

  // Get default chats for fallback mode
  private getDefaultChats(): Chat[] {
    const defaultChats: Chat[] = [
      {
        id: '1',
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?img=1',
        online: true,
        messages: [
          {
            id: '1',
            text: 'Hey, how are you?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            sent: false,
            read: true,
            senderId: 'other',
            senderName: 'John Doe',
          },
          {
            id: '2',
            text: 'I\'m good, thanks! How about you?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            sent: true,
            read: true,
            senderId: this.currentUserId || 'demo-user-fallback',
            senderName: 'Demo User',
          }
        ],
        participants: [this.currentUserId || 'demo-user-fallback'],
        lastMessage: {
          id: '2',
          text: 'I\'m good, thanks! How about you?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          sent: true,
          read: true,
          senderId: this.currentUserId || 'demo-user-fallback',
          senderName: 'Demo User',
        },
        unreadCount: 0,
        isAIChat: false,
      },
      {
        id: '2',
        name: 'Alice Smith',
        avatar: 'https://i.pravatar.cc/150?img=2',
        online: false,
        messages: [
          {
            id: '3',
            text: 'Did you see the new update?',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            sent: false,
            read: false,
            senderId: 'other',
            senderName: 'Alice Smith',
          }
        ],
        participants: [this.currentUserId || 'demo-user-fallback'],
        lastMessage: {
          id: '3',
          text: 'Did you see the new update?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          sent: false,
          read: false,
          senderId: 'other',
          senderName: 'Alice Smith',
        },
        unreadCount: 1,
        isAIChat: false,
      },
      {
        id: 'ai-chat',
        name: 'AI Assistant',
        avatar: 'https://i.pravatar.cc/150?img=3',
        online: true,
        messages: [
          {
            id: '4',
            text: 'Hello! I\'m your AI assistant. How can I help you today?',
            timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
            sent: false,
            read: true,
            senderId: 'ai',
            senderName: 'AI Assistant',
            isAI: true,
          }
        ],
        participants: [this.currentUserId || 'demo-user-fallback'],
        lastMessage: {
          id: '4',
          text: 'Hello! I\'m your AI assistant. How can I help you today?',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          sent: false,
          read: true,
          senderId: 'ai',
          senderName: 'AI Assistant',
          isAI: true,
        },
        unreadCount: 0,
        isAIChat: true,
      }
    ];

    // Store default chats in memory
    defaultChats.forEach(chat => {
      this.chats.set(chat.id, chat);
    });

    return defaultChats;
  }

  // Listen to chat messages in real-time
  listenToChat(chatId: string, callback: (messages: Message[]) => void): () => void {
    if (this.listeners.has(chatId)) {
      this.listeners.get(chatId)!();
    }

    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          text: data.text,
          timestamp: data.timestamp?.toDate() || new Date(),
          sent: data.senderId === this.currentUserId,
          read: data.read || false,
          senderId: data.senderId,
          senderName: data.senderName,
          isAI: data.isAI || false,
          typing: data.typing || false,
          delivered: data.delivered || false,
        });
      });

      callback(messages);
    });

    this.listeners.set(chatId, unsubscribe);
    return unsubscribe;
  }

  // Send a message
  async sendMessage(chatId: string, text: string): Promise<Message> {
    // Ensure user is authenticated
    if (!this.currentUserId) {
      await authService.ensureDemoUser();
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }
    }

    let user = authService.getCurrentUser();
    if (!user) {
      await authService.ensureDemoUser();
      user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not found');
      }
    }

    const messageData = {
      text,
      timestamp: serverTimestamp(),
      senderId: this.currentUserId,
      senderName: user.displayName || user.email || 'Unknown',
      read: false,
      delivered: false,
      isAI: false,
    };

    let message: Message;

    try {
      const messageRef = await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
      
      // Update chat's last message
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: {
          text,
          timestamp: serverTimestamp(),
          senderId: this.currentUserId,
          senderName: user.displayName || user.email || 'Unknown',
        },
        unreadCount: 0, // Reset unread count for sender
      });

      message = {
        id: messageRef.id,
        text,
        timestamp: new Date(),
        sent: true,
        read: false,
        senderId: this.currentUserId,
        senderName: user.displayName || user.email || 'Unknown',
        delivered: false,
      };

      return message;
    } catch (error) {
      console.error('Error sending message to Firebase:', error);
      console.log('Using fallback message storage for chat:', chatId);
      
      // Store message in fallback chat
      const fallbackChat = this.chats.get(chatId);
      if (fallbackChat) {
        message = {
          id: Date.now().toString(),
          text,
          timestamp: new Date(),
          sent: true,
          read: false,
          senderId: this.currentUserId,
          senderName: user.displayName || user.email || 'Unknown',
          delivered: false,
        };
        
        fallbackChat.messages.push(message);
        fallbackChat.lastMessage = message;
        
        return message;
      }
      
      throw new Error('Chat not found');
    }

    // If it's an AI chat, generate AI response
    const chat = this.chats.get(chatId);
    if (chat?.isAIChat) {
      this.generateAIResponse(chatId, text);
    }

    return message;
  }

  // Generate AI response
  private async generateAIResponse(chatId: string, userMessage: string) {
    try {
      // Get conversation history
      const conversationHistory = await this.getConversationHistory(chatId);
      
      // Generate AI response
      const aiResponse = await generateOpenAIResponse(
        conversationHistory.map(msg => `${msg.sent ? 'User:' : 'AI:'} ${msg.text}`),
        userMessage
      );

      // Send AI response
      const user = authService.getCurrentUser();
      const messageData = {
        text: aiResponse,
        timestamp: serverTimestamp(),
        senderId: 'ai',
        senderName: 'AI Assistant',
        read: false,
        delivered: false,
        isAI: true,
      };

      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
      
      // Update chat's last message
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: {
          text: aiResponse,
          timestamp: serverTimestamp(),
          senderId: 'ai',
          senderName: 'AI Assistant',
        },
        unreadCount: 1, // Increment unread count for AI message
      });
    } catch (error) {
      console.error('Error generating AI response:', error);
    }
  }

  // Mark message as read
  async markMessageAsRead(chatId: string, messageId: string): Promise<void> {
    try {
      await updateDoc(doc(db, `chats/${chatId}/messages`, messageId), {
        read: true,
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  // Mark all messages in chat as read
  async markChatAsRead(chatId: string): Promise<void> {
    if (!this.currentUserId) return;

    try {
      const q = query(
        collection(db, `chats/${chatId}/messages`),
        where('senderId', '!=', this.currentUserId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map(doc =>
        updateDoc(doc.ref, { read: true })
      );

      await Promise.all(updatePromises);

      // Reset unread count
      await updateDoc(doc(db, 'chats', chatId), {
        unreadCount: 0,
      });
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  }

  // Update typing status
  async updateTypingStatus(chatId: string, isTyping: boolean): Promise<void> {
    if (!this.currentUserId) return;

    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      const typingData = {
        userId: this.currentUserId,
        userName: user.displayName || user.email || 'Unknown',
        isTyping,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, `chats/${chatId}/typing`), typingData);
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }

  // Listen to typing status
  listenToTypingStatus(chatId: string, callback: (typingUsers: TypingStatus[]) => void): () => void {
    const q = query(
      collection(db, `chats/${chatId}/typing`),
      where('timestamp', '>', new Date(Date.now() - 5000)) // Only recent typing events
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typingUsers: TypingStatus[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        typingUsers.push({
          userId: data.userId,
          userName: data.userName,
          isTyping: data.isTyping,
          timestamp: data.timestamp?.toDate() || new Date(),
        });
      });

      callback(typingUsers);
    });

    return unsubscribe;
  }

  // Get conversation history
  async getConversationHistory(chatId: string, limit: number = 50): Promise<Message[]> {
    try {
      const q = query(
        collection(db, `chats/${chatId}/messages`),
        orderBy('timestamp', 'desc'),
        firestoreLimit(limit)
      );

      const snapshot = await getDocs(q);
      const messages: Message[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          text: data.text,
          timestamp: data.timestamp?.toDate() || new Date(),
          sent: data.senderId === this.currentUserId,
          read: data.read || false,
          senderId: data.senderId,
          senderName: data.senderName,
          isAI: data.isAI || false,
          typing: data.typing || false,
          delivered: data.delivered || false,
        });
      });

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting conversation history from Firebase:', error);
      console.log('Using fallback conversation history for chat:', chatId);
      
      // Return messages from fallback chat
      const fallbackChat = this.chats.get(chatId);
      if (fallbackChat) {
        return fallbackChat.messages.slice(-limit); // Return last N messages
      }
      
      return [];
    }
  }

  // Cleanup listeners
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

export default new ChatService(); 