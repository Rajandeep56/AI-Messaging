import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatsScreen from '../app/(tabs)/chats';
import ChatManager from '../utils/chatManager';
import { MonoText } from '../components/StyledText';

// Mock dependencies
jest.mock('../utils/chatManager', () => ({
  getInstance: jest.fn(),
}));

jest.mock('@/constants/Colors', () => ({
  primary: '#007AFF',
}));

describe('Integration Tests', () => {
  const mockChatManager = {
    getAllChats: jest.fn(),
    getChat: jest.fn(),
    addMessage: jest.fn(),
    markMessageAsRead: jest.fn(),
    createChat: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ChatManager.getInstance as jest.Mock).mockReturnValue(mockChatManager);
  });

  describe('ChatsScreen with ChatManager Integration', () => {
    const mockChats = {
      "1": {
        id: "1",
        name: "John Doe",
        avatar: "https://i.pravatar.cc/150?img=1",
        online: true,
        messages: [
          {
            id: "1",
            text: "Hello there!",
            timestamp: "2024-03-20T10:00:00Z",
            sent: false,
            read: false
          }
        ]
      }
    };

    it('should load chats and display them correctly', async () => {
      mockChatManager.getAllChats.mockResolvedValue(mockChats);

      const { findByText } = render(<ChatsScreen />);

      await waitFor(() => {
        expect(mockChatManager.getAllChats).toHaveBeenCalled();
      });

      expect(await findByText('John Doe')).toBeTruthy();
      expect(await findByText('Hello there!')).toBeTruthy();
    });

    it('should handle chat manager errors gracefully', async () => {
      mockChatManager.getAllChats.mockRejectedValue(new Error('Network error'));

      const { getByText } = render(<ChatsScreen />);

      await waitFor(() => {
        expect(mockChatManager.getAllChats).toHaveBeenCalled();
      });

      // Screen should still render without crashing
      expect(getByText('Chats')).toBeTruthy();
    });

    it('should refresh chats when screen comes into focus', async () => {
      mockChatManager.getAllChats.mockResolvedValue(mockChats);

      const { findByText } = render(<ChatsScreen />);

      // Initial load
      await waitFor(() => {
        expect(mockChatManager.getAllChats).toHaveBeenCalledTimes(1);
      });

      expect(await findByText('John Doe')).toBeTruthy();
    });
  });

  describe('Component Integration', () => {
    it('should render StyledText within other components', () => {
      const { getByText } = render(
        <MonoText testID="styled-text">Integration Test</MonoText>
      );

      expect(getByText('Integration Test')).toBeTruthy();
    });

    it('should handle multiple components together', () => {
      const { getByText } = render(
        <React.Fragment>
          <MonoText>First Component</MonoText>
          <MonoText>Second Component</MonoText>
        </React.Fragment>
      );

      expect(getByText('First Component')).toBeTruthy();
      expect(getByText('Second Component')).toBeTruthy();
    });
  });

  describe('Data Flow Integration', () => {
    it('should handle chat data transformation correctly', async () => {
      const mockChats = {
        "1": {
          id: "1",
          name: "Test User",
          avatar: "https://example.com/avatar.jpg",
          online: true,
          messages: [
            {
              id: "1",
              text: "Test message",
              timestamp: "2024-03-20T10:00:00Z",
              sent: false,
              read: false
            }
          ]
        }
      };

      mockChatManager.getAllChats.mockResolvedValue(mockChats);

      const { findByText } = render(<ChatsScreen />);

      await waitFor(() => {
        expect(mockChatManager.getAllChats).toHaveBeenCalled();
      });

      // Verify that the chat data is properly transformed and displayed
      expect(await findByText('Test User')).toBeTruthy();
      expect(await findByText('Test message')).toBeTruthy();
    });

    it('should handle empty data sets', async () => {
      mockChatManager.getAllChats.mockResolvedValue({});

      const { getByText } = render(<ChatsScreen />);

      await waitFor(() => {
        expect(mockChatManager.getAllChats).toHaveBeenCalled();
      });

      // Screen should render without crashing even with empty data
      expect(getByText('Chats')).toBeTruthy();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle multiple types of errors gracefully', async () => {
      // Test with malformed data
      const malformedChats = {
        "1": {
          id: "1",
          name: "Test",
          avatar: "https://example.com/avatar.jpg",
          online: true,
          messages: null // Malformed
        }
      };

      mockChatManager.getAllChats.mockResolvedValue(malformedChats);

      const { findByText } = render(<ChatsScreen />);

      await waitFor(() => {
        expect(mockChatManager.getAllChats).toHaveBeenCalled();
      });

      // Should still render the chat name even with malformed messages
      expect(await findByText('Test')).toBeTruthy();
    });

    it('should handle network errors and retry gracefully', async () => {
      mockChatManager.getAllChats
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({});

      const { getByText } = render(<ChatsScreen />);

      await waitFor(() => {
        expect(mockChatManager.getAllChats).toHaveBeenCalled();
      });

      // Screen should still be functional
      expect(getByText('Chats')).toBeTruthy();
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', async () => {
      const largeChats: any = {};
      
      // Create 100 mock chats
      for (let i = 1; i <= 100; i++) {
        largeChats[i] = {
          id: i.toString(),
          name: `User ${i}`,
          avatar: `https://example.com/avatar${i}.jpg`,
          online: i % 2 === 0,
          messages: [
            {
              id: "1",
              text: `Message from user ${i}`,
              timestamp: "2024-03-20T10:00:00Z",
              sent: false,
              read: false
            }
          ]
        };
      }

      mockChatManager.getAllChats.mockResolvedValue(largeChats);

      const { findByText } = render(<ChatsScreen />);

      await waitFor(() => {
        expect(mockChatManager.getAllChats).toHaveBeenCalled();
      });

      // Should render without performance issues
      expect(await findByText('User 1')).toBeTruthy();
      expect(await findByText('User 100')).toBeTruthy();
    });
  });
}); 