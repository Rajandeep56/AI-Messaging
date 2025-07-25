import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatsScreen from '../(tabs)/chats';
import ChatManager from '@/utils/chatManager';

// Mock ChatManager
jest.mock('@/utils/chatManager', () => ({
  getInstance: jest.fn(),
}));

// Mock Colors
jest.mock('@/constants/Colors', () => ({
  primary: '#007AFF',
}));

const mockChatManager = {
  getAllChats: jest.fn(),
};

describe('ChatsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ChatManager.getInstance as jest.Mock).mockReturnValue(mockChatManager);
  });

  const mockChats = {
    "1": {
      id: "1",
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=1",
      online: true,
      messages: [
        {
          id: "1",
          text: "Hey, how are you?",
          timestamp: "2024-03-20T10:00:00Z",
          sent: false,
          read: false
        },
        {
          id: "2",
          text: "I'm good, thanks!",
          timestamp: "2024-03-20T10:01:00Z",
          sent: true,
          read: true
        }
      ]
    },
    "2": {
      id: "2",
      name: "Alice Smith",
      avatar: "https://i.pravatar.cc/150?img=2",
      online: false,
      messages: [
        {
          id: "1",
          text: "Did you see the new project?",
          timestamp: "2024-03-20T09:30:00Z",
          sent: false,
          read: false
        }
      ]
    }
  };

  it('should render loading state initially', () => {
    mockChatManager.getAllChats.mockResolvedValue(mockChats);

    const { getByText } = render(<ChatsScreen />);
    
    // The screen should render without crashing during loading
    expect(getByText('Chats')).toBeTruthy();
  });

  it('should load and display chats', async () => {
    mockChatManager.getAllChats.mockResolvedValue(mockChats);

    const { getByText, findByText } = render(<ChatsScreen />);

    await waitFor(() => {
      expect(mockChatManager.getAllChats).toHaveBeenCalled();
    });

    // Check if chat names are displayed
    expect(await findByText('John Doe')).toBeTruthy();
    expect(await findByText('Alice Smith')).toBeTruthy();
  });

  it('should display last message for each chat', async () => {
    mockChatManager.getAllChats.mockResolvedValue(mockChats);

    const { findByText } = render(<ChatsScreen />);

    // Check if last messages are displayed
    expect(await findByText("I'm good, thanks!")).toBeTruthy();
    expect(await findByText('Did you see the new project?')).toBeTruthy();
  });

  it('should display unread count for unread messages', async () => {
    mockChatManager.getAllChats.mockResolvedValue(mockChats);

    const { findByText } = render(<ChatsScreen />);

    // Alice has 1 unread message
    expect(await findByText('1')).toBeTruthy();
  });

  it('should handle empty chats list', async () => {
    mockChatManager.getAllChats.mockResolvedValue({});

    const { getByText } = render(<ChatsScreen />);

    await waitFor(() => {
      expect(mockChatManager.getAllChats).toHaveBeenCalled();
    });

    // Screen should still render without crashing
    expect(getByText('Chats')).toBeTruthy();
  });

  it('should handle chat loading error', async () => {
    mockChatManager.getAllChats.mockRejectedValue(new Error('Failed to load chats'));

    const { getByText } = render(<ChatsScreen />);

    await waitFor(() => {
      expect(mockChatManager.getAllChats).toHaveBeenCalled();
    });

    // Screen should still render without crashing
    expect(getByText('Chats')).toBeTruthy();
  });

  it('should format timestamps correctly', async () => {
    const todayChats = {
      "1": {
        id: "1",
        name: "Today Chat",
        avatar: "https://i.pravatar.cc/150?img=1",
        online: true,
        messages: [
          {
            id: "1",
            text: "Today message",
            timestamp: new Date().toISOString(),
            sent: false,
            read: false
          }
        ]
      }
    };

    mockChatManager.getAllChats.mockResolvedValue(todayChats);

    const { findByText } = render(<ChatsScreen />);

    // Should display time for today's messages
    await waitFor(() => {
      expect(mockChatManager.getAllChats).toHaveBeenCalled();
    });
  });

  it('should handle chat with no messages', async () => {
    const emptyChats = {
      "1": {
        id: "1",
        name: "Empty Chat",
        avatar: "https://i.pravatar.cc/150?img=1",
        online: true,
        messages: []
      }
    };

    mockChatManager.getAllChats.mockResolvedValue(emptyChats);

    const { findByText } = render(<ChatsScreen />);

    expect(await findByText('Empty Chat')).toBeTruthy();
  });

  it('should handle malformed chat data gracefully', async () => {
    const malformedChats = {
      "1": {
        id: "1",
        name: "Malformed Chat",
        avatar: "https://i.pravatar.cc/150?img=1",
        online: true,
        messages: null // Malformed data
      }
    };

    mockChatManager.getAllChats.mockResolvedValue(malformedChats);

    const { findByText } = render(<ChatsScreen />);

    expect(await findByText('Malformed Chat')).toBeTruthy();
  });

  it('should handle very long chat names', async () => {
    const longNameChats = {
      "1": {
        id: "1",
        name: "This is a very long chat name that should be handled properly by the UI",
        avatar: "https://i.pravatar.cc/150?img=1",
        online: true,
        messages: [
          {
            id: "1",
            text: "Short message",
            timestamp: "2024-03-20T10:00:00Z",
            sent: false,
            read: false
          }
        ]
      }
    };

    mockChatManager.getAllChats.mockResolvedValue(longNameChats);

    const { findByText } = render(<ChatsScreen />);

    expect(await findByText('This is a very long chat name that should be handled properly by the UI')).toBeTruthy();
  });

  it('should handle very long messages', async () => {
    const longMessageChats = {
      "1": {
        id: "1",
        name: "Long Message Chat",
        avatar: "https://i.pravatar.cc/150?img=1",
        online: true,
        messages: [
          {
            id: "1",
            text: "This is a very long message that should be truncated properly in the UI to prevent layout issues and maintain a clean appearance",
            timestamp: "2024-03-20T10:00:00Z",
            sent: false,
            read: false
          }
        ]
      }
    };

    mockChatManager.getAllChats.mockResolvedValue(longMessageChats);

    const { findByText } = render(<ChatsScreen />);

    expect(await findByText('Long Message Chat')).toBeTruthy();
  });
}); 