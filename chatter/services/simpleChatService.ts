// Simple Chat Service for immediate testing without Firebase
// This provides a working version while Firebase is being set up

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sent: boolean;
  read: boolean;
  senderId?: string;
  senderName?: string;
  isAI?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  messages: Message[];
  isAIChat?: boolean;
}

class SimpleChatService {
  private chats: Map<string, Chat> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockChats: Chat[] = [
      {
        id: '1',
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?img=1',
        online: true,
        messages: [
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
        ],
      },
      {
        id: '2',
        name: 'Alice Smith',
        avatar: 'https://i.pravatar.cc/150?img=2',
        online: true,
        messages: [
          {
            id: '1',
            text: 'Did you see the new project requirements?',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            sent: false,
            read: false,
          },
          {
            id: '2',
            text: 'Yes, I\'m reviewing them now',
            timestamp: new Date(Date.now() - 1000 * 60 * 25),
            sent: true,
            read: true,
          },
        ],
      },
      {
        id: '3',
        name: 'AI Assistant',
        avatar: '🤖',
        online: true,
        messages: [],
        isAIChat: true,
      },
    ];

    mockChats.forEach(chat => {
      this.chats.set(chat.id, chat);
    });
  }

  async getChats(): Promise<Chat[]> {
    return Array.from(this.chats.values());
  }

  async getChat(chatId: string): Promise<Chat | null> {
    return this.chats.get(chatId) || null;
  }

  async sendMessage(chatId: string, text: string): Promise<Message> {
    const chat = this.chats.get(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      sent: true,
      read: true,
      senderId: 'user',
      senderName: 'You',
    };

    chat.messages.push(newMessage);
    this.chats.set(chatId, chat);

    // If it's an AI chat, generate a response
    if (chat.isAIChat) {
      setTimeout(() => {
        this.generateAIResponse(chatId, text);
      }, 1000 + Math.random() * 2000);
    }

    return newMessage;
  }

  private async generateAIResponse(chatId: string, userMessage: string) {
    const chat = this.chats.get(chatId);
    if (!chat) return;

    const responses = [
      "That's interesting! Tell me more about that.",
      "I understand what you're saying. How can I help?",
      "Thanks for sharing that with me!",
      "I'm here to help. What would you like to know?",
      "That's a great point! Let me think about that...",
      "I appreciate you telling me that. Is there anything specific you'd like to discuss?",
    ];

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
      sent: false,
      read: false,
      senderId: 'ai',
      senderName: 'AI Assistant',
      isAI: true,
    };

    chat.messages.push(aiResponse);
    this.chats.set(chatId, chat);
  }

  async createChat(name: string, avatar: string, isAIChat: boolean = false): Promise<Chat> {
    const newChat: Chat = {
      id: Date.now().toString(),
      name,
      avatar,
      online: false,
      messages: [],
      isAIChat,
    };

    this.chats.set(newChat.id, newChat);
    return newChat;
  }

  async markChatAsRead(chatId: string): Promise<void> {
    const chat = this.chats.get(chatId);
    if (!chat) return;

    chat.messages.forEach(message => {
      if (!message.sent) {
        message.read = true;
      }
    });

    this.chats.set(chatId, chat);
  }

  // Mock typing status
  async updateTypingStatus(chatId: string, isTyping: boolean): Promise<void> {
    // Mock implementation - no real typing status for now
    console.log(`Typing status for ${chatId}: ${isTyping}`);
  }

  // Mock conversation history
  async getConversationHistory(chatId: string): Promise<Message[]> {
    const chat = this.chats.get(chatId);
    return chat?.messages || [];
  }
}

export default new SimpleChatService(); 