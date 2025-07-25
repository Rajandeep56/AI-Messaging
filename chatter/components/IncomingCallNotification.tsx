import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CallManager, { CallSession } from '@/utils/callManager';

const { width } = Dimensions.get('window');

interface IncomingCallNotificationProps {
  call: CallSession | null;
  onAnswer: () => void;
  onDecline: () => void;
}

export default function IncomingCallNotification({ 
  call, 
  onAnswer, 
  onDecline 
}: IncomingCallNotificationProps) {
  const router = useRouter();
  const [slideAnim] = useState(new Animated.Value(-200));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (call) {
      // Slide in animation
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Pulse animation for the avatar
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
    } else {
      // Slide out animation
      Animated.spring(slideAnim, {
        toValue: -200,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [call]);

  if (!call) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.avatarContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Image source={{ uri: call.contactAvatar }} style={styles.avatar} />
          <View style={styles.callTypeIndicator}>
            <Ionicons
              name={call.callMode === 'video' ? 'videocam' : 'call'}
              size={16}
              color="#fff"
            />
          </View>
        </Animated.View>

        <View style={styles.callInfo}>
          <Text style={styles.contactName}>{call.contactName}</Text>
          <Text style={styles.callType}>
            Incoming {call.callMode} call
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={onDecline}
          >
            <Ionicons name="call" size={24} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.answerButton]}
            onPress={onAnswer}
          >
            <Ionicons name="call" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50, // Account for status bar
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  callTypeIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#25d366',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  callType: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#ff4444',
  },
  answerButton: {
    backgroundColor: '#25d366',
  },
}); 