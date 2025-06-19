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
}

export default ChatManager; 