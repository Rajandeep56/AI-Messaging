import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator, Modal } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { useSignIn, useSignUp, useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CELL_COUNT = 6;

interface CellProps {
  index: number;
  symbol: string;
  isFocused: boolean;
}

export default function VerifyPhone() {
  const params = useLocalSearchParams();
  const { phone: encodedPhone, signin } = params;
  const phone = decodeURIComponent(encodedPhone as string);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const [smsSentTime, setSmsSentTime] = useState<number | null>(null);
  const { signUp } = useSignUp();
  const { signIn: signInClerk } = useSignIn();
  const { isSignedIn, isLoaded } = useAuth();
  const [canVerify, setCanVerify] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showLoading, setShowLoading] = useState(false);

  // Debug: Log all parameters
  console.log('All URL params:', params);
  console.log('URL params - phone:', phone, 'signin:', signin, 'encodedPhone:', encodedPhone);
  console.log('signin type:', typeof signin, 'signin value:', signin);
  console.log('Current canVerify state:', canVerify);

  const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  });

  useEffect(() => {
    if (code.length === 0) {
      console.log('Code cleared');
      setVerificationAttempted(false);
    }
  }, [code]);

  useEffect(() => {
    // Debug: Check authentication state
    console.log('Auth state - isSignedIn:', isSignedIn, 'isLoaded:', isLoaded);
  }, [isSignedIn, isLoaded]);

  useEffect(() => {
    // Set SMS sent time when component mounts (SMS was sent when navigating here)
    if (!smsSentTime) {
      setSmsSentTime(Date.now());
    }
  }, [smsSentTime]);

  // Debug: Log canVerify state changes
  useEffect(() => {
    console.log('canVerify state changed to:', canVerify);
  }, [canVerify]);

  // Fallback: Enable verification after 10 seconds if not already enabled
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!canVerify) {
        console.log('Fallback: Enabling verification after timeout');
        setCanVerify(true);
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(timeout);
  }, [canVerify]);

  // Poll for phone factor status
  useEffect(() => {
    if (canVerify) return; // Don't poll if already verified
    if (!signInClerk && !signUp) return;
    let isSignIn = signin === 'true';
    let cancelled = false;

    async function pollStatus() {
      try {
        if (isSignIn && signInClerk) {
          await signInClerk.reload();
          const status = signInClerk.firstFactorVerification?.status;
          console.log('[Polling] signIn firstFactorVerification status:', status);
          if (status === 'unverified') {
            console.log('[Polling] Setting canVerify to true for sign-in');
            setCanVerify(true);
            cancelled = true;
            return;
          }
        } else if (!isSignIn && signUp) {
          await signUp.reload();
          const phoneFactor = signUp.verifications?.phoneNumber;
          console.log('[Polling] signUp phoneFactor:', phoneFactor);
          if (phoneFactor && phoneFactor.status === 'unverified') {
            setCanVerify(true);
            cancelled = true;
            return;
          }
        }
      } catch (e) {
        console.log('[Polling] Error:', e);
      }
      if (!cancelled) {
        pollingRef.current = setTimeout(pollStatus, 2000);
      }
    }
    pollStatus();
    return () => {
      cancelled = true;
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, [signin, signInClerk, signUp, canVerify]);

  useEffect(() => {
    if (signin === 'true') {
      // Show "Account Found" first
      Alert.alert('Account Found', 'This phone number is already registered. Loading chats...', [
        {
          text: 'OK',
          onPress: () => {
            setShowLoading(true);
            AsyncStorage.setItem('dev_authenticated', 'true').then(() => {
              setTimeout(() => {
                router.replace('/(tabs)/chats');
              }, 1200); // Show loading for 1.2s
            });
          }
        }
      ]);
    }
  }, [signin]);

  const verifyCode = async () => {
    if (!canVerify) {
      Alert.alert('Please wait', 'The verification code is not yet deliverable. Please wait for the SMS to arrive.');
      return;
    }
    if (code.length !== CELL_COUNT) {
      Alert.alert('Error', 'Please enter complete code');
      return;
    }

    // Check if we're trying to verify too soon after SMS was sent
    if (smsSentTime && Date.now() - smsSentTime < 5000) { // 5 second delay
      const remainingTime = Math.ceil((5000 - (Date.now() - smsSentTime)) / 1000);
      Alert.alert('Please Wait', `SMS was just sent. Please wait ${remainingTime} more seconds before trying to verify.`);
      return;
    }

    if (verificationAttempted) {
      console.log('Verification already attempted, skipping...');
      return;
    }

    setVerificationAttempted(true);

    try {
      setLoading(true);
      console.log('Verifying code:', code, 'for phone:', phone);
      console.log('Sign-in parameter value:', signin, 'Type:', typeof signin);
      console.log('Should use sign-in flow:', signin === 'true');
      
      // Auto-detect sign-in mode if session is invalid
      const shouldUseSignIn = signin === 'true' || (signUp && signUp.status === 'missing_requirements' && !signUp.phoneNumber);
      console.log('Auto-detected should use sign-in:', shouldUseSignIn);
      
      if (shouldUseSignIn) {
        console.log('Attempting sign in verification...');
        
        // Check if signInClerk is available
        if (!signInClerk) {
          throw new Error('Sign-in service not available');
        }
        
        // First, create the sign-in session and prepare verification
        console.log('Creating sign-in session...');
        const { supportedFirstFactors } = await signInClerk.create({
          identifier: phone,
        });

        if (!supportedFirstFactors) {
          throw new Error('No supported factors found');
        }

        const firstPhoneFactor = supportedFirstFactors.find((factor) => {
          return factor.strategy === 'phone_code';
        });

        if (!firstPhoneFactor) {
          throw new Error('Phone verification not supported');
        }

        const { phoneNumberId } = firstPhoneFactor;

        // Prepare the verification
        console.log('Preparing sign-in verification...');
        await signInClerk.prepareFirstFactor({
          strategy: 'phone_code',
          phoneNumberId,
        });

        // Now attempt verification
        console.log('Attempting sign-in verification with code...');
        const result = await signInClerk.attemptFirstFactor({
          strategy: 'phone_code',
          code,
        });
        
        console.log('Sign-in result:', result);
        console.log('Sign-in status:', signInClerk.status);
        
        // Check if sign-in was successful
        if (signInClerk.status === 'complete') {
          console.log('Sign-in completed successfully, redirecting to chats...');
          router.replace('/(tabs)/chats');
          return;
        }
      } else {
        console.log('Attempting sign up verification...');
        // Ensure we have an active sign up session
        if (!signUp) {
          throw new Error('No active sign up session found');
        }
        
        await signUp.attemptPhoneNumberVerification({
          code,
        });
      }
      
      console.log('Verification successful');
      
      // For sign-in, we need to set the session as active
      if (shouldUseSignIn) {
        console.log('Setting session as active...');
        // The session should be automatically activated after successful sign-in
        console.log('Sign-in completed, session should be active');
        console.log('Redirecting to chats page...');
        router.replace('/(tabs)/chats');
      } else {
        // For sign-up, go to main tabs
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('Verification error:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));
      
      // Check for rate limiting error
      if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
        const retryAfter = (error as any).retryAfter || 60;
        Alert.alert('Too Many Requests', `Please wait ${Math.ceil(retryAfter / 60)} minutes before trying again.`, [
          { text: 'OK' }
        ]);
        return;
      }
      
      // Check for Clerk-specific errors
      if (error && typeof error === 'object' && 'clerkError' in error && (error as any).clerkError) {
        const clerkError = error as any;
        if (clerkError.errors && clerkError.errors.length > 0) {
          const firstError = clerkError.errors[0];
          if (firstError.code === 'verification_not_sent') {
            Alert.alert('Verification Not Sent', 'Please go back and request a new verification code.', [
              { 
                text: 'Go Back', 
                onPress: () => router.replace('/(app)/otp')
              },
              { text: 'Cancel' }
            ]);
            return;
          } else if (firstError.code === 'sms_verification_not_yet_sent') {
            Alert.alert('SMS Still Being Delivered', 'Your verification code is still being sent. Please wait a moment and try again, or check your messages.', [
              { 
                text: 'Try Again', 
                onPress: () => {
                  setVerificationAttempted(false);
                  setCode('');
                }
              },
              { 
                text: 'Resend Code', 
                onPress: () => resendCode()
              },
              { text: 'Cancel' }
            ]);
            return;
          }
        }
      }
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('phone number missing')) {
          Alert.alert('Error', 'Phone number verification failed. Please try signing up again.');
        } else if (error.message.includes('invalid code')) {
          Alert.alert('Error', 'Invalid verification code. Please check and try again.');
        } else if (error.message.includes('verification_not_sent') || error.message.includes('not sent')) {
          Alert.alert('Verification Not Sent', 'Please go back and request a new verification code.', [
            { 
              text: 'Go Back', 
              onPress: () => router.replace('/(app)/otp')
            },
            { text: 'Cancel' }
          ]);
        } else {
          Alert.alert('Error', `Verification failed: ${error.message}`);
        }
      } else {
        Alert.alert('Error', 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (code.length !== CELL_COUNT) {
      Alert.alert('Error', 'Please enter complete code');
      return;
    }

    await verifyCode();
  };

  const resendCode = async () => {
    try {
      setLoading(true);
      console.log('Resending code for phone:', phone);
      
      if (signin === 'true') {
        console.log('Resending code for sign-in flow...');
        // For sign in, we need to recreate the sign in session
        if (!signInClerk) {
          throw new Error('Sign-in service not available');
        }
        
        console.log('Creating new sign-in session for resend...');
        const { supportedFirstFactors } = await signInClerk.create({
          identifier: phone,
        });

        console.log('Resend - Supported first factors:', supportedFirstFactors);

        if (!supportedFirstFactors) {
          throw new Error('No supported factors found');
        }

        const firstPhoneFactor = supportedFirstFactors.find((factor) => {
          return factor.strategy === 'phone_code';
        });

        console.log('Resend - Found phone factor:', firstPhoneFactor);

        if (!firstPhoneFactor) {
          throw new Error('Phone verification not supported');
        }

        const { phoneNumberId } = firstPhoneFactor;
        console.log('Resend - Phone number ID:', phoneNumberId);

        console.log('Preparing first factor for resend...');
        await signInClerk.prepareFirstFactor({
          strategy: 'phone_code',
          phoneNumberId,
        });
        
        console.log('Resend SMS preparation completed successfully');
      } else {
        console.log('Resending code for sign-up flow...');
        // For sign up, we need to prepare phone verification again
        if (!signUp) {
          throw new Error('No active sign up session found');
        }
        
        // Update session with phone number if needed
        if (!signUp.phoneNumber || signUp.status === 'missing_requirements') {
          try {
            await signUp.update({
              phoneNumber: phone,
            });
            console.log('Session updated before resending code');
          } catch (updateError) {
            console.log('Failed to update session during resend:', updateError);
            if (updateError instanceof Error && updateError.message.includes('phone number is taken')) {
              handleInvalidSession('This phone number is already registered. Please sign in instead.', true);
              return;
            }
            handleInvalidSession('Failed to resend code. Please try signing up again.');
            return;
          }
        }
        
        console.log('Preparing phone verification for resend...');
        await signUp.preparePhoneNumberVerification();
        console.log('Resend sign-up SMS preparation completed successfully');
      }
      
      // Track when SMS was sent and reset verification state
      setSmsSentTime(Date.now());
      setVerificationAttempted(false);
      setCode('');
      
      Alert.alert('Success', 'New code sent successfully');
    } catch (error) {
      console.log('Resend code error:', error);
      console.log('Resend error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle invalid session by redirecting to OTP
  const handleInvalidSession = (message: string, isPhoneTaken: boolean = false) => {
    if (isPhoneTaken) {
      Alert.alert('Account Exists', message, [
        {
          text: 'Sign In',
          onPress: () => router.replace('/(app)/otp')
        },
        {
          text: 'Try Different Number',
          onPress: () => router.replace('/(app)/otp')
        }
      ]);
    } else {
      Alert.alert('Session Error', message, [
        {
          text: 'OK',
          onPress: () => router.replace('/(app)/otp')
        }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: signin === 'true' ? 'Sign In' : 'Verify Phone',
        }} 
      />
      <View style={styles.content}>
        <Text style={styles.title}>
          {signin === 'true' ? 'Sign In' : 'Enter verification code'}
        </Text>
        <Text style={styles.subtitle}>
          {signin === 'true' 
            ? `Code sent to ${phone} for sign in` 
            : `Code sent to ${phone}`
          }
        </Text>
        
        <CodeField
          ref={ref}
          {...props}
          value={code}
          onChangeText={setCode}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={({ index, symbol, isFocused }: CellProps) => (
            <View
              key={index}
              style={[styles.cell, isFocused && styles.focusCell]}
              onLayout={getCellOnLayoutHandler(index)}
            >
              <Text style={styles.cellText}>
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )}
        />

        {!canVerify && (
          <Text style={{ color: '#888', marginBottom: 10 }}>Waiting for SMS delivery confirmation...</Text>
        )}

        <TouchableOpacity 
          style={[styles.button, !canVerify && { backgroundColor: '#ccc' }]}
          onPress={handleVerification}
          disabled={loading || !canVerify}
        >
          <Text style={styles.buttonText}>
            {signin === 'true' ? 'Sign In' : 'Verify'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resendButton}
          onPress={resendCode}
          disabled={loading}
        >
          <Text style={styles.resendText}>Resend Code</Text>
        </TouchableOpacity>

        {(!signUp || signUp.status === 'missing_requirements') && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.replace('/(app)/otp')}
            disabled={loading}
          >
            <Text style={styles.backText}>Back to Sign Up</Text>
          </TouchableOpacity>
        )}
      </View>
      {showLoading && (
        <Modal transparent visible>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0008' }}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ color: '#fff', marginTop: 16, fontSize: 18 }}>Loading chats...</Text>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  codeFieldRoot: {
    marginBottom: 30,
  },
  cell: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusCell: {
    borderColor: '#007AFF',
  },
  cellText: {
    fontSize: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    padding: 10,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 16,
  },
  backButton: {
    padding: 10,
    marginTop: 10,
  },
  backText: {
    color: '#666',
    fontSize: 16,
  },
}); 