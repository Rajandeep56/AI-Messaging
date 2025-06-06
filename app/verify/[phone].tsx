import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';

const CELL_COUNT = 6;

interface CellProps {
  index: number;
  symbol: string;
  isFocused: boolean;
}

export default function VerifyPhone() {
  const { phone: encodedPhone, signIn } = useLocalSearchParams();
  const phone = decodeURIComponent(encodedPhone as string);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useSignUp();
  const { signIn: signInClerk } = useSignIn();

  const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  });

  useEffect(() => {
    if (code.length === 0) {
      console.log('Code cleared');
    }
  }, [code]);

  const verifyCode = async () => {
    if (code.length !== CELL_COUNT) {
      Alert.alert('Error', 'Please enter complete code');
      return;
    }

    try {
      setLoading(true);
      console.log('Verifying code:', code, 'for phone:', phone);
      
      if (signIn === 'true') {
        const { supportedFirstFactors } = await signInClerk!.create({
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

        await signInClerk!.attemptFirstFactor({
          strategy: 'phone_code',
          code,
        });
      } else {
        await signUp!.attemptPhoneNumberVerification({
          code,
        });
      }
      
      console.log('Verification successful');
      router.replace('/(tabs)');
    } catch (error) {
      console.log('Verification error:', error);
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifySignIn = async () => {
    try {
      setLoading(true);
      console.log('Signing in with code:', code);
      await signInClerk!.attemptFirstFactor({
        strategy: 'phone_code',
        code,
      });
      console.log('Sign in successful');
      router.replace('/(tabs)');
    } catch (error) {
      console.log('Sign in error:', error);
      Alert.alert('Error', 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (code.length !== CELL_COUNT) {
      Alert.alert('Error', 'Please enter complete code');
      return;
    }

    if (signIn === 'true') {
      await verifySignIn();
    } else {
      await verifyCode();
    }
  };

  const resendCode = async () => {
    try {
      setLoading(true);
      // TODO: Add your resend code logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'New code sent successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: signIn === 'true' ? 'Sign In' : 'Verify Phone',
        }} 
      />
      <View style={styles.content}>
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>Code sent to {phone}</Text>
        
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

        <TouchableOpacity 
          style={styles.button}
          onPress={handleVerification}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {signIn === 'true' ? 'Sign In' : 'Verify'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resendButton}
          onPress={resendCode}
          disabled={loading}
        >
          <Text style={styles.resendText}>Resend Code</Text>
        </TouchableOpacity>
      </View>
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
}); 