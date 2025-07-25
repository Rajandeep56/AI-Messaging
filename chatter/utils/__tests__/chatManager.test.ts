import * as FileSystem from 'expo-file-system';
import ChatManager from '../chatManager';

// Mock the initial chats data
jest.mock('../../data/chats.json', () => ({
  "1": {
    "id": "1",
    "name": "John Doe",
    "avatar": "https://i.pravatar.cc/150?img=1",
    "online": true,
    "messages": [
      {
        "id": "1",
        "text": "Hey, how are you?",
        "timestamp": "2024-03-20T10:00:00Z",
        "sent": false,
        "read": false
      }
    ]
  }
}), { virtual: true });

describe('ChatManager', () => {
  let chatManager: ChatManager;
  const mockFileSystem = FileSystem as any;

  beforeEach(() => {
    jest.clearAllMocks();
    chatManager = ChatManager.getInstance();
    // Reset the singleton instance for each test
    (chatManager as any).initialized = false;
    (chatManager as any).chats = {};
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = ChatManager.getInstance();
      const instance2 = ChatManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize with existing chats file', async () => {
      const mockChats = { "1": { id: "1", name: "Test", avatar: "", online: true, messages: [] } };
      
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(mockChats));

      await chatManager.initialize();

      expect(mockFileSystem.getInfoAsync).toHaveBeenCalledWith('/test/documents/chats.json');
      expect(mockFileSystem.readAsStringAsync).toHaveBeenCalledWith('/test/documents/chats.json');
      expect((chatManager as any).initialized).toBe(true);
    });

    it('should initialize with new chats file', async () => {
      const mockChats = { "1": { id: "1", name: "John Doe", avatar: "https://i.pravatar.cc/150?img=1", online: true, messages: [] } };
      
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false } as any);
      mockFileSystem.writeAsStringAsync.mockResolvedValue();

      await chatManager.initialize();

      expect(mockFileSystem.getInfoAsync).toHaveBeenCalledWith('/test/documents/chats.json');
      expect(mockFileSystem.writeAsStringAsync).toHaveBeenCalled();
      expect((chatManager as any).initialized).toBe(true);
    });

    it('should handle initialization errors', async () => {
      mockFileSystem.getInfoAsync.mockRejectedValue(new Error('File system error'));

      await expect(chatManager.initialize()).rejects.toThrow('File system error');
    });

    it('should not reinitialize if already initialized', async () => {
      (chatManager as any).initialized = true;
      
      await chatManager.initialize();

      expect(mockFileSystem.getInfoAsync).not.toHaveBeenCalled();
    });
  });

  describe('getAllChats', () => {
    it('should return all chats', async () => {
      const mockChats = { 
        "1": { id: "1", name: "John", avatar: "", online: true, messages: [] },
        "2": { id: "2", name: "Jane", avatar: "", online: false, messages: [] }
      };
      
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(mockChats));

      const result = await chatManager.getAllChats();

      expect(result).toEqual(mockChats);
    });

    it('should initialize if not already initialized', async () => {
      const mockChats = { "1": { id: "1", name: "John", avatar: "", online: true, messages: [] } };
      
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(mockChats));

      await chatManager.getAllChats();

      expect(mockFileSystem.getInfoAsync).toHaveBeenCalled();
    });
  });

  describe('getChat', () => {
    it('should return a specific chat', async () => {
      const mockChats = { 
        "1": { id: "1", name: "John", avatar: "", online: true, messages: [] }
      };
      
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(mockChats));

      const result = await chatManager.getChat("1");

      expect(result).toEqual(mockChats["1"]);
    });

    it('should return null for non-existent chat', async () => {
      const mockChats = { 
        "1": { id: "1", name: "John", avatar: "", online: true, messages: [] }
      };
      
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(mockChats));

      const result = await chatManager.getChat("999");

      expect(result).toBeNull();
    });
  });

  describe('addMessage', () => {
    it('should add a message to an existing chat', async () => {
      const mockChats = { 
        "1": { 
          id: "1", 
          name: "John", 
          avatar: "", 
          online: true, 
          messages: [] 
        }
      };
      
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(mockChats));
      mockFileSystem.writeAsStringAsync.mockResolvedValue();

      const newMessage = {
        text: "Hello!",
        timestamp: "2024-03-20T10:00:00Z",
        sent: true,
        read: false
      };

      const result = await chatManager.addMessage("1", newMessage);

      expect(result).toMatchObject({
        ...newMessage,
        id: expect.any(String)
      });
      expect(mockFileSystem.writeAsStringAsync).toHaveBeenCalled();
    });

    it('should throw error for non-existent chat', async () => {
      const mockChats = { 
        "1": { id: "1", name: "John", avatar: "", online: true, messages: [] }
      };
      
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(mockChats));

      const newMessage = {
        text: "Hello!",
        timestamp: "2024-03-20T10:00:00Z",
        sent: true,
        read: false
      };

      await expect(chatManager.addMessage("999", newMessage)).rejects.toThrow('Chat not found');
    });
  });

  describe('markMessageAsRead', () => {
    it('should mark a message as read', async () => {
      const mockChats = { 
        "1": { 
          id: "1", 
          name: "John", 
          avatar: "", 
          online: true, 
          messages: [
            { id: "msg1", text: "Hello", timestamp: "2024-03-20T10:00:00Z", sent: false, read: false }
          ]
        }
      };
      
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(mockChats));
      mockFileSystem.writeAsStringAsync.mockResolvedValue();

      await chatManager.markMessageAsRead("1", "msg1");

      expect(mockFileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        '/test/documents/chats.json',
        expect.stringContaining('"read": true')
      );
    });

    it('should throw error for non-existent chat', async () => {
      const mockChats = { 
        "1": { id: "1", name: "John", avatar: "", online: true, messages: [] }
      };
      
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(mockChats));

      await expect(chatManager.markMessageAsRead("999", "msg1")).rejects.toThrow('Chat not found');
    });
  });

  describe('createChat', () => {
    it('should create a new chat', async () => {
      const mockChats = {};
      
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(mockChats));
      mockFileSystem.writeAsStringAsync.mockResolvedValue();

      const newChatData = {
        name: "New Chat",
        avatar: "https://example.com/avatar.jpg",
        online: true
      };

      const result = await chatManager.createChat(newChatData);

      expect(result).toMatchObject({
        ...newChatData,
        id: expect.any(String),
        messages: []
      });
      expect(mockFileSystem.writeAsStringAsync).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle file read errors', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockRejectedValue(new Error('Read error'));

      await expect(chatManager.getAllChats()).rejects.toThrow('Read error');
    });

    it('should handle file write errors', async () => {
      const mockChats = { 
        "1": { id: "1", name: "John", avatar: "", online: true, messages: [] }
      };
      
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(mockChats));
      mockFileSystem.writeAsStringAsync.mockRejectedValue(new Error('Write error'));

      const newMessage = {
        text: "Hello!",
        timestamp: "2024-03-20T10:00:00Z",
        sent: true,
        read: false
      };

      await expect(chatManager.addMessage("1", newMessage)).rejects.toThrow('Write error');
    });
  });

  describe('getConversationContext', () => {
    it('should return default context for empty chat', () => {
      const context = chatManager.getConversationContext("1");
      expect(context).toEqual({
        lastMessage: '',
        recentMessages: [],
        conversationTone: 'casual',
        commonTopics: []
      });
    });

    it('should analyze conversation tone correctly', () => {
      const mockChats = {
        "1": {
          id: "1",
          name: "John",
          avatar: "",
          online: true,
          messages: [
            {
              id: "1",
              text: "Let's schedule a meeting",
              timestamp: "2024-03-20T10:00:00Z",
              sent: false,
              read: false
            },
            {
              id: "2",
              text: "I'll prepare the project report",
              timestamp: "2024-03-20T10:01:00Z",
              sent: false,
              read: false
            }
          ]
        }
      };
      
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(mockChats));
      
      chatManager.initialize();
      const context = chatManager.getConversationContext("1");
      
      expect(context.conversationTone).toBe('professional');
      expect(context.commonTopics).toContain('meetings');
      expect(context.commonTopics).toContain('work');
    });
  });

  describe('getResponseSuggestions', () => {
    it('should return professional suggestions for work context', () => {
      const mockChats = {
        "1": {
          id: "1",
          name: "John",
          avatar: "",
          online: true,
          messages: [
            {
              id: "1",
              text: "Can we schedule a meeting?",
              timestamp: "2024-03-20T10:00:00Z",
              sent: false,
              read: false
            }
          ]
        }
      };
      
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(mockChats));
      
      chatManager.initialize();
      const suggestions = chatManager.getResponseSuggestions("1", "John");
      
      expect(suggestions).toContain('I\'ll be there');
      expect(suggestions).toContain('What time works for you?');
    });

    it('should return friendly suggestions for thank you messages', () => {
      const mockChats = {
        "1": {
          id: "1",
          name: "Alice",
          avatar: "",
          online: true,
          messages: [
            {
              id: "1",
              text: "Thanks for your help!",
              timestamp: "2024-03-20T10:00:00Z",
              sent: false,
              read: false
            }
          ]
        }
      };
      
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(mockChats));
      
      chatManager.initialize();
      const suggestions = chatManager.getResponseSuggestions("1", "Alice");
      
      expect(suggestions).toContain('You\'re welcome! 😊');
      expect(suggestions).toContain('Anytime!');
    });
  });
}); 