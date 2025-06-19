import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import ChatManager from '@/utils/chatManager';

// Mock contacts data
const mockContacts = [
  {
    id: '1',
    name: 'Alice Johnson',
    phone: '+1 (555) 123-4567',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Bob Smith',
    phone: '+1 (555) 234-5678',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    name: 'Carol Davis',
    phone: '+1 (555) 345-6789',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '4',
    name: 'David Wilson',
    phone: '+1 (555) 456-7890',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    id: '5',
    name: 'Eva Brown',
    phone: '+1 (555) 567-8901',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
];

export default function NewChatScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState(mockContacts);
  const chatManager = ChatManager.getInstance();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredContacts(mockContacts);
    } else {
      const filtered = mockContacts.filter(contact =>
        contact.name.toLowerCase().includes(query.toLowerCase()) ||
        contact.phone.includes(query)
      );
      setFilteredContacts(filtered);
    }
  };

  const startNewChat = async (contact: typeof mockContacts[0]) => {
    try {
      // Check if chat already exists
      const allChats = await chatManager.getAllChats();
      const existingChat = Object.values(allChats).find(chat => 
        chat.name === contact.name
      );

      if (existingChat) {
        // Navigate to existing chat
        router.push({
          pathname: "/(app)/chat/[id]" as any,
          params: { id: existingChat.id }
        });
      } else {
        // Create new chat
        const newChat = await chatManager.createChat({
          name: contact.name,
          avatar: contact.avatar,
          online: false,
        });

        // Navigate to new chat
        router.push({
          pathname: "/(app)/chat/[id]" as any,
          params: { id: newChat.id }
        });
      }
    } catch (error) {
      console.error('Failed to start new chat:', error);
    }
  };

  const renderContact = ({ item }: { item: typeof mockContacts[0] }) => (
    <TouchableOpacity 
      style={styles.contactItem}
      onPress={() => startNewChat(item)}
    >
      <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phone}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'New Chat',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
        }} 
      />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={item => item.id}
        style={styles.contactsList}
        showsVerticalScrollIndicator={false}
      />

      {/* Empty State */}
      {filteredContacts.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No contacts found</Text>
          <Text style={styles.emptySubtext}>Try searching with a different term</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
}); 