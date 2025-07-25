import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/constants/Theme';
import chatService from '@/services/chatService';

const AI_PERSONALITIES = [
  {
    id: 'assistant',
    name: 'AI Assistant',
    description: 'Helpful and friendly AI assistant',
    avatar: '🤖',
    color: '#007AFF',
  },
  {
    id: 'creative',
    name: 'Creative Writer',
    description: 'Creative writing and storytelling',
    avatar: '✍️',
    color: '#FF6B6B',
  },
  {
    id: 'business',
    name: 'Business Coach',
    description: 'Professional business advice',
    avatar: '💼',
    color: '#4ECDC4',
  },
  {
    id: 'teacher',
    name: 'Learning Tutor',
    description: 'Educational support and tutoring',
    avatar: '📚',
    color: '#45B7D1',
  },
  {
    id: 'friend',
    name: 'Friendly Chat',
    description: 'Casual conversation and friendship',
    avatar: '😊',
    color: '#96CEB4',
  },
];

export default function NewAIChatScreen() {
  const [selectedPersonality, setSelectedPersonality] = useState(AI_PERSONALITIES[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const handleCreateChat = async () => {
    if (!selectedPersonality) {
      Alert.alert('Error', 'Please select an AI personality');
      return;
    }

    setLoading(true);
    try {
      const chat = await chatService.createChat(
        selectedPersonality.name,
        selectedPersonality.avatar,
        true // isAIChat
      );

      // Navigate to the new chat
      router.push({
        pathname: '/(app)/chat/[id]' as any,
        params: { id: chat.id }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create AI chat');
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalityCard = (personality: typeof AI_PERSONALITIES[0]) => (
    <TouchableOpacity
      key={personality.id}
      style={[
        styles.personalityCard,
        { 
          backgroundColor: theme.surface,
          borderColor: selectedPersonality.id === personality.id ? personality.color : theme.border,
          borderWidth: selectedPersonality.id === personality.id ? 2 : 1,
        }
      ]}
      onPress={() => setSelectedPersonality(personality)}
    >
      <View style={styles.personalityHeader}>
        <Text style={styles.personalityAvatar}>{personality.avatar}</Text>
        <View style={styles.personalityInfo}>
          <Text style={[styles.personalityName, { color: theme.text }]}>
            {personality.name}
          </Text>
          <Text style={[styles.personalityDescription, { color: theme.textSecondary }]}>
            {personality.description}
          </Text>
        </View>
        {selectedPersonality.id === personality.id && (
          <Ionicons name="checkmark-circle" size={24} color={personality.color} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: 'New AI Chat',
          headerStyle: { backgroundColor: theme.header },
          headerTintColor: theme.headerText,
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="sparkles" size={60} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Start AI Conversation</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Choose an AI personality to chat with
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>AI Personalities</Text>
          {AI_PERSONALITIES.map(renderPersonalityCard)}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Custom Instructions (Optional)</Text>
          <View style={[styles.inputContainer, { borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Add custom instructions for the AI..."
              placeholderTextColor={theme.textTertiary}
              value={customPrompt}
              onChangeText={setCustomPrompt}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.createButton,
            { 
              backgroundColor: loading ? theme.textTertiary : selectedPersonality.color,
            }
          ]}
          onPress={handleCreateChat}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.headerText} />
          ) : (
            <>
              <Ionicons name="chatbubbles" size={20} color={theme.headerText} />
              <Text style={[styles.createButtonText, { color: theme.headerText }]}>
                Start Chatting with {selectedPersonality.name}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  personalityCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  personalityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personalityAvatar: {
    fontSize: 32,
    marginRight: 16,
  },
  personalityInfo: {
    flex: 1,
  },
  personalityName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  personalityDescription: {
    fontSize: 14,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
  },
  input: {
    fontSize: 16,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 