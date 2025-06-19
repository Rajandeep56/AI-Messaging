import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import Colors from '@/constants/Colors';

export default function NewChatScreen() {
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
      <Text style={styles.text}>Start a new chat</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
}); 