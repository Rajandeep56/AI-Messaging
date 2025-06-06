import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Welcome() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Welcome' }} />
      <MaterialCommunityIcons name="whatsapp" size={120} color="#FF0000" />
      <Text style={styles.title}>Welcome to ChatApp</Text>
      <Text style={styles.subtitle}>Your new messaging platform</Text>
      <Link href="./otp" replace asChild> 
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Agree & Continue</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 