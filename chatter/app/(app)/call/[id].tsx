import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import CallManager, { CallSession } from '@/utils/callManager';

const { width, height } = Dimensions.get('window');

export default function CallScreen() {
  const router = useRouter();
  const { id, mode = 'voice' } = useLocalSearchParams();
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(mode === 'video');
  const [isIncoming, setIsIncoming] = useState(false);
  
  const callManager = CallManager.getInstance();
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initializeCall();
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [id, mode]);

  const initializeCall = async () => {
    try {
      // For demo purposes, we'll simulate a call
      const contactId = id as string;
      const contactName = 'Demo Contact';
      const contactAvatar = 'https://i.pravatar.cc/150?img=1';
      const callMode = mode as 'voice' | 'video';

      // Simulate incoming call for demo
      if (Math.random() > 0.5) {
        const session = await callManager.simulateIncomingCall(contactId, contactName, contactAvatar, callMode);
        setCurrentCall(session);
        setIsIncoming(true);
      } else {
        // Start outgoing call
        const session = await callManager.startCall(contactId, contactName, contactAvatar, callMode);
        setCurrentCall(session);
        setIsIncoming(false);
        startCallTimer();
      }
    } catch (error) {
      console.error('Failed to initialize call:', error);
      Alert.alert('Error', 'Failed to start call');
      router.back();
    }
  };

  const startCallTimer = () => {
    durationInterval.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerCall = async () => {
    if (!currentCall) return;

    try {
      await callManager.answerCall();
      setIsIncoming(false);
      startCallTimer();
    } catch (error) {
      console.error('Failed to answer call:', error);
    }
  };

  const handleDeclineCall = async () => {
    if (!currentCall) return;

    try {
      await callManager.declineCall();
      router.back();
    } catch (error) {
      console.error('Failed to decline call:', error);
    }
  };

  const handleEndCall = async () => {
    if (!currentCall) return;

    try {
      await callManager.endCall();
      router.back();
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const handleToggleMute = async () => {
    if (!currentCall) return;

    try {
      await callManager.toggleMute();
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  };

  const handleToggleSpeaker = async () => {
    if (!currentCall) return;

    try {
      await callManager.toggleSpeaker();
      setIsSpeakerOn(!isSpeakerOn);
    } catch (error) {
      console.error('Failed to toggle speaker:', error);
    }
  };

  const handleToggleVideo = async () => {
    if (!currentCall || currentCall.callMode !== 'video') return;

    try {
      await callManager.toggleVideo();
      setIsVideoEnabled(!isVideoEnabled);
    } catch (error) {
      console.error('Failed to toggle video:', error);
    }
  };

  if (!currentCall) {
    return (
      <View style={styles.container}>
        <Text>Initializing call...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Video Background (for video calls) */}
      {currentCall.callMode === 'video' && isVideoEnabled && (
        <View style={styles.videoBackground}>
          <Image
            source={{ uri: currentCall.contactAvatar }}
            style={styles.videoBackgroundImage}
            resizeMode="cover"
          />
          <View style={styles.videoOverlay} />
        </View>
      )}

      {/* Call Info */}
      <View style={styles.callInfo}>
        <Image source={{ uri: currentCall.contactAvatar }} style={styles.avatar} />
        <Text style={styles.contactName}>{currentCall.contactName}</Text>
        
        {isIncoming ? (
          <Text style={styles.callStatus}>Incoming {currentCall.callMode} call</Text>
        ) : (
          <Text style={styles.callStatus}>
            {callDuration > 0 ? formatDuration(callDuration) : 'Calling...'}
          </Text>
        )}
      </View>

      {/* Call Controls */}
      <View style={styles.controls}>
        {isIncoming ? (
          // Incoming call controls
          <View style={styles.incomingControls}>
            <TouchableOpacity style={styles.declineButton} onPress={handleDeclineCall}>
              <Ionicons name="call" size={30} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.answerButton} onPress={handleAnswerCall}>
              <Ionicons name="call" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          // Active call controls
          <View style={styles.activeControls}>
            <TouchableOpacity 
              style={[styles.controlButton, isMuted && styles.controlButtonActive]} 
              onPress={handleToggleMute}
            >
              <Ionicons 
                name={isMuted ? "mic-off" : "mic"} 
                size={24} 
                color={isMuted ? "#fff" : "#000"} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]} 
              onPress={handleToggleSpeaker}
            >
              <Ionicons 
                name="volume-high" 
                size={24} 
                color={isSpeakerOn ? "#fff" : "#000"} 
              />
            </TouchableOpacity>

            {currentCall.callMode === 'video' && (
              <TouchableOpacity 
                style={[styles.controlButton, !isVideoEnabled && styles.controlButtonActive]} 
                onPress={handleToggleVideo}
              >
                <Ionicons 
                  name={isVideoEnabled ? "videocam" : "videocam-off"} 
                  size={24} 
                  color={isVideoEnabled ? "#000" : "#fff"} 
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
              <Ionicons name="call" size={30} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Additional Features */}
      <View style={styles.additionalFeatures}>
        <TouchableOpacity style={styles.featureButton}>
          <Ionicons name="keypad" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.featureButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.featureButton}>
          <Ionicons name="chatbubble" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
  },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  videoBackgroundImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  callInfo: {
    alignItems: 'center',
    marginTop: 100,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  contactName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  callStatus: {
    fontSize: 16,
    color: '#ccc',
  },
  controls: {
    alignItems: 'center',
    marginBottom: 50,
  },
  incomingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '90%',
  },
  declineButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#25d366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#ff4444',
  },
  additionalFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  featureButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 