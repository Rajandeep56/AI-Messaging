import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

const CHATS_FILE = FileSystem.documentDirectory + 'chats.json';

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

type Chats = Record<string, Chat>;

class ChatManager {
  private static instance: ChatManager;
  private chats: Chats = {};
  private initialized = false;

  private constructor() {}

  static getInstance(): ChatManager {
    if (!ChatManager.instance) {
      ChatManager.instance = new ChatManager();
    }
    return ChatManager.instance;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Check if chats file exists
      const fileInfo = await FileSystem.getInfoAsync(CHATS_FILE);
      
      if (!fileInfo.exists) {
        // Copy initial chats from asset
        const initialChats = require('../data/chats.json');
        await this.saveChats(initialChats);
      }

      // Load chats from file
      await this.loadChats();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize chat manager:', error);
      Alert.alert('Error', 'Failed to load chats');
    }
  }

  private async loadChats() {
    try {
      const content = await FileSystem.readAsStringAsync(CHATS_FILE);
      this.chats = JSON.parse(content);
    } catch (error) {
      console.error('Failed to load chats:', error);
      throw error;
    }
  }

  private async saveChats(chats: Chats) {
    try {
      await FileSystem.writeAsStringAsync(CHATS_FILE, JSON.stringify(chats, null, 2));
      this.chats = chats;
    } catch (error) {
      console.error('Failed to save chats:', error);
      throw error;
    }
  }

  async getAllChats(): Promise<Chats> {
    if (!this.initialized) await this.initialize();
    return this.chats;
  }

  async getChat(chatId: string): Promise<Chat | null> {
    if (!this.initialized) await this.initialize();
    return this.chats[chatId] || null;
  }

  async addMessage(chatId: string, message: Omit<Message, 'id'>) {
    if (!this.initialized) await this.initialize();

    const chat = this.chats[chatId];
    if (!chat) throw new Error('Chat not found');

    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
    };

    const updatedChat = {
      ...chat,
      messages: [...chat.messages, newMessage],
    };

    const updatedChats = {
      ...this.chats,
      [chatId]: updatedChat,
    };

    await this.saveChats(updatedChats);
    return newMessage;
  }

  async markMessageAsRead(chatId: string, messageId: string) {
    if (!this.initialized) await this.initialize();

    const chat = this.chats[chatId];
    if (!chat) throw new Error('Chat not found');

    const updatedMessages = chat.messages.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    );

    const updatedChat = {
      ...chat,
      messages: updatedMessages,
    };

    const updatedChats = {
      ...this.chats,
      [chatId]: updatedChat,
    };

    await this.saveChats(updatedChats);
  }

  async createChat(chat: Omit<Chat, 'id' | 'messages'>) {
    if (!this.initialized) await this.initialize();

    const newChat: Chat = {
      ...chat,
      id: Date.now().toString(),
      messages: [],
    };

    const updatedChats = {
      ...this.chats,
      [newChat.id]: newChat,
    };

    await this.saveChats(updatedChats);
    return newChat;
  }

  // Get conversation context for better suggestions
  getConversationContext(chatId: string): {
    lastMessage: string;
    recentMessages: string[];
    conversationTone: 'formal' | 'casual' | 'professional' | 'friendly';
    commonTopics: string[];
  } {
    const chat = this.chats[chatId];
    if (!chat || chat.messages.length === 0) {
      return {
        lastMessage: '',
        recentMessages: [],
        conversationTone: 'casual',
        commonTopics: []
      };
    }

    const recentMessages = chat.messages.slice(-5).map(msg => msg.text);
    const lastMessage = recentMessages[recentMessages.length - 1] || '';
    
    // Analyze conversation tone
    const allText = recentMessages.join(' ').toLowerCase();
    let tone: 'formal' | 'casual' | 'professional' | 'friendly' = 'casual';
    
    if (allText.includes('meeting') || allText.includes('project') || allText.includes('deadline')) {
      tone = 'professional';
    } else if (allText.includes('thanks') || allText.includes('appreciate') || allText.includes('help')) {
      tone = 'friendly';
    } else if (allText.includes('emails') || allText.includes('document') || allText.includes('report')) {
      tone = 'formal';
    }

    // Extract common topics
    const topics = [];
    if (allText.includes('work') || allText.includes('project')) topics.push('work');
    if (allText.includes('meeting') || allText.includes('call')) topics.push('meetings');
    if (allText.includes('thanks') || allText.includes('appreciate')) topics.push('gratitude');
    if (allText.includes('hello') || allText.includes('hi')) topics.push('greetings');
    if (allText.includes('how are you') || allText.includes('doing')) topics.push('wellbeing');

    return {
      lastMessage,
      recentMessages,
      conversationTone: tone,
      commonTopics: topics
    };
  }

  // Get personalized response suggestions based on context
  getResponseSuggestions(chatId: string, chatName: string): string[] {
    const context = this.getConversationContext(chatId);
    const { lastMessage, conversationTone, commonTopics } = context;
    
    const lowerMessage = lastMessage.toLowerCase();
    
    // Professional tone suggestions
    if (conversationTone === 'professional') {
      if (lowerMessage.includes('meeting') || lowerMessage.includes('call')) {
        return [
          'I\'ll be there',
          'What time works for you?',
          'I\'ll prepare the agenda',
          'Looking forward to it'
        ];
      }
      if (lowerMessage.includes('project') || lowerMessage.includes('deadline')) {
        return [
          'I\'ll get it done',
          'On track for the deadline',
          'I\'ll update you soon',
          'Understood, will proceed'
        ];
      }
      return [
        'Understood',
        'I\'ll look into it',
        'Thanks for the update',
        'Will do'
      ];
    }
    
    // Friendly tone suggestions
    if (conversationTone === 'friendly') {
      if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return [
          'You\'re welcome! 😊',
          'Anytime!',
          'Happy to help!',
          'No problem at all!'
        ];
      }
      if (lowerMessage.includes('how are you') || lowerMessage.includes('doing')) {
        return [
          'I\'m doing great, thanks! How about you?',
          'Pretty good! 😊',
          'All good here!',
          'Doing well, thanks for asking!'
        ];
      }
      return [
        'Sounds good! 👍',
        'Perfect!',
        'Awesome! 😊',
        'Great!'
      ];
    }
    
    // Formal tone suggestions
    if (conversationTone === 'formal') {
      return [
        'I understand',
        'I\'ll review and respond',
        'Thank you for the information',
        'I\'ll follow up accordingly'
      ];
    }
    
    // Default casual suggestions
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return [
        `Hi ${chatName}! 👋`,
        'Hello! How are you?',
        'Hey there! 😊',
        'Hi! Nice to hear from you'
      ];
    }
    
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how\'s it going')) {
      return [
        'I\'m doing great, thanks! How about you?',
        'Pretty good! 😊',
        'All good here!',
        'Doing well, thanks for asking!'
      ];
    }
    
    if (lowerMessage.includes('project') || lowerMessage.includes('work') || lowerMessage.includes('meeting')) {
      return [
        'Sounds good! 👍',
        'I\'ll look into it',
        'Thanks for the update',
        'Got it, will do!'
      ];
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return [
        'You\'re welcome! 😊',
        'Anytime!',
        'Happy to help!',
        'No problem at all!'
      ];
    }
    
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
  }
}

export default ChatManager; 