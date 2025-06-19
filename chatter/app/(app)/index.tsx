import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export default function Welcome() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Welcome',
        headerShown: false 
      }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <MaterialCommunityIcons name="whatsapp" size={120} color={Colors.primary} />
        <Text style={styles.title}>Welcome to ChatApp</Text>
        <Text style={styles.subtitle}>Fast, Simple, Secure Messaging</Text>
        
        <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>Terms & Privacy Policy</Text>
          <Text style={styles.termsText}>
            Tap "Agree & Continue" to accept the ChatApp Terms of Service and Privacy Policy. You must be at least 16 years old to register.
          </Text>
        </View>

        <Link href="./otp" replace asChild> 
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Agree & Continue</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  termsContainer: {
    width: '100%',
    marginBottom: 40,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 