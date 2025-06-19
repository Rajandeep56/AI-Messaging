import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { PhoneCodeFactor } from '@clerk/types';

// Mask for exactly 10 digits after +1
const US_PHONE = [
  '+',
  '1',
  ' ',
  '(',
  /\d/,
  /\d/,
  /\d/,
  ')',
  ' ',
  /\d/,
  /\d/,
  /\d/,
  '-',
  /\d/,
  /\d/,
  /\d/,
  /\d/,
];

const Page = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0;
  const router = useRouter();
  const { signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();

  const validatePhoneNumber = (number: string) => {
    // Remove all non-digits and plus sign
    const cleanNumber = number.replace(/[^0-9+]/g, '');
    
    if (!cleanNumber) {
      setValidationMessage('Please enter a phone number');
      return false;
    }
    
    if (!cleanNumber.startsWith('+1')) {
      setValidationMessage('Must start with +1 for US numbers');
      return false;
    }

    // Get just the digits after +1
    const digitsAfterCountryCode = cleanNumber.slice(2);
    const digitsNeeded = 10 - digitsAfterCountryCode.length;

    if (digitsAfterCountryCode.length < 10) {
      setValidationMessage(`Enter ${digitsNeeded} more digit${digitsNeeded > 1 ? 's' : ''}`);
      return false;
    }
    
    if (digitsAfterCountryCode.length > 10) {
      setValidationMessage('Too many digits - please enter exactly 10 digits after +1');
      return false;
    }
    
    setValidationMessage('Valid phone number ✓');
    return true;
  };

  const handlePhoneChange = (masked: string, unmasked: string) => {
    // Get just the digits (no formatting)
    const digitsOnly = unmasked.replace(/[^0-9]/g, '');
    
    // Only allow up to 10 digits after potential country code
    if (digitsOnly.length <= 10) {
      console.log('Phone input - masked:', masked, 'unmasked:', unmasked, 'digits:', digitsOnly.length);
      setPhoneNumber(masked);
      validatePhoneNumber(masked);
    }
  };

  const isPhoneNumberValid = () => {
    const cleanPhoneNumber = phoneNumber.replace(/[^0-9+]/g, '');
    return cleanPhoneNumber.length >= 10;
  };

  const openLink = () => {
    Linking.openURL('https://galaxies.dev');
  };

  const updateStatus = (message: string) => {
    setStatus(message);
    console.log('Status:', message);
  };

  const sendOTP = async () => {
    const cleanPhoneNumber = phoneNumber.replace(/[^0-9+]/g, '');
    
    // Final validation before sending
    const digitsAfterCountryCode = cleanPhoneNumber.slice(2);
    if (digitsAfterCountryCode.length !== 10) {
      Alert.alert('Error', 'Please enter exactly 10 digits after +1');
      return;
    }

    updateStatus('Preparing to send verification code...');
    
    // Ensure phone number starts with +1 for US numbers
    const formattedPhoneNumber = cleanPhoneNumber.startsWith('+1') 
      ? cleanPhoneNumber 
      : `+1${cleanPhoneNumber.replace(/^\+/, '')}`;
    
    console.log('Formatted phone number:', formattedPhoneNumber);
    setLoading(true);

    try {
      // Always try sign up first
      if (!signUp) {
        throw new Error('Sign up session not available');
      }

      updateStatus('Creating your account...');
      try {
        // Attempt to create new account
        const signUpAttempt = await signUp.create({
          phoneNumber: formattedPhoneNumber,
        });
        console.log('Sign up attempt:', signUpAttempt);

        updateStatus('Saving your phone number...');
        await signUp.update({
          phoneNumber: formattedPhoneNumber,
        });

        updateStatus('Preparing verification...');
        await signUp.preparePhoneNumberVerification();
        console.log('Verification prepared');

        updateStatus('Sending verification code...');
        router.push(`/(app)/verify/${encodeURIComponent(formattedPhoneNumber)}`);
      } catch (err) {
        console.log('Sign up error:', JSON.stringify(err, null, 2));

        if (isClerkAPIResponseError(err)) {
          if (err.errors[0].code === 'form_identifier_exists' || err.errors[0].message.includes('phone number is taken')) {
            // Show account exists message and handle sign in
            updateStatus('Account found! Moving to sign in...');
            Alert.alert(
              'Account Found',
              'This phone number is already registered. Would you like to sign in?',
              [
                {
                  text: 'Sign In',
                  onPress: async () => {
                    try {
                      await handleSignIn(formattedPhoneNumber);
                    } catch (signInError) {
                      console.log('Sign in error:', signInError);
                      updateStatus('Sign in failed. Please try again.');
                      setLoading(false);
                      Alert.alert('Error', 'Failed to sign in. Please try again.');
                    }
                  },
                },
                {
                  text: 'Cancel',
                  style: 'cancel',
                  onPress: () => {
                    setLoading(false);
                    setPhoneNumber('');
                    setValidationMessage('');
                  },
                },
              ]
            );
            return;
          }
          setLoading(false);
          updateStatus('Error: ' + err.errors[0].message);
          Alert.alert('Error', err.errors[0].message);
        } else {
          setLoading(false);
          updateStatus('An unexpected error occurred');
          Alert.alert('Error', 'An unexpected error occurred');
        }
      }
    } catch (error) {
      console.log('Error:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to process request. Please try again.');
    }
  };

  const handleSignIn = async (formattedPhoneNumber: string) => {
    try {
      updateStatus('Creating sign in session...');
      const { supportedFirstFactors } = await signIn!.create({
        identifier: formattedPhoneNumber,
      });

      if (!supportedFirstFactors) {
        throw new Error('No supported factors found');
      }

      const firstPhoneFactor = supportedFirstFactors.find(
        (factor): factor is PhoneCodeFactor => factor.strategy === 'phone_code'
      );

      if (!firstPhoneFactor) {
        throw new Error('Phone verification not supported');
      }

      updateStatus('Preparing verification...');
      await signIn!.prepareFirstFactor({
        strategy: 'phone_code',
        phoneNumberId: firstPhoneFactor.phoneNumberId,
      });

      updateStatus('Sending verification code...');
      router.push({
        pathname: `/(app)/verify/${encodeURIComponent(formattedPhoneNumber)}` as any,
        params: { signin: 'true' }
      });
    } catch (error) {
      console.log('Sign in error:', error);
      updateStatus('Sign in failed. Please try again.');
      throw error;
    }
  };

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={{ flex: 1 }}
      behavior="padding">
      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.loading]}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{status || 'Processing...'}</Text>
        </View>
      )}

      <View style={styles.container}>
        <Text style={styles.description}>
          Enter your phone number to create an account or sign in
        </Text>

        <View style={styles.list}>
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>US</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
          </View>
          <View style={styles.separator} />

          <View style={styles.inputContainer}>
            <MaskInput
              value={phoneNumber}
              keyboardType="numeric"
              autoFocus
              placeholder="+1 (555) 555-5555"
              onChangeText={handlePhoneChange}
              mask={US_PHONE}
              style={[
                styles.input,
                validationMessage === 'Valid phone number ✓' && styles.validInput
              ]}
              maxLength={17}  // +1 (XXX) XXX-XXXX = 17 chars
            />
            {!!phoneNumber && (
              <Text style={[
                styles.validationMessage,
                validationMessage === 'Valid phone number ✓' ? styles.validMessage : styles.errorMessage
              ]}>
                {validationMessage}
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.formatHint}>
          Format: +1 (XXX) XXX-XXXX{'\n'}
          Enter exactly 10 digits after +1
        </Text>

        <Text style={styles.legal}>
          You must be{' '}
          <Text style={styles.link} onPress={openLink}>
            at least 16 years old
          </Text>{' '}
          to register. Learn how ChatApp works with the{' '}
          <Text style={styles.link} onPress={openLink}>
            Meta Companies
          </Text>
          .
        </Text>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[
            styles.button,
            validationMessage === 'Valid phone number ✓' ? styles.enabled : styles.disabled
          ]}
          onPress={sendOTP}
          disabled={validationMessage !== 'Valid phone number ✓' || loading}>
          <Text style={[
            styles.buttonText,
            validationMessage === 'Valid phone number ✓' ? styles.enabled : styles.disabled
          ]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  list: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  inputContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  input: {
    fontSize: 16,
    paddingVertical: 15,
    color: '#333',
  },
  validInput: {
    color: Colors.primary,
  },
  validationMessage: {
    marginTop: 5,
    fontSize: 12,
  },
  validMessage: {
    color: '#4CAF50',
  },
  errorMessage: {
    color: '#f44336',
  },
  formatHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  legal: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  link: {
    color: Colors.primary,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  enabled: {
    backgroundColor: Colors.primary,
    color: '#fff',
  },
  disabled: {
    backgroundColor: '#ccc',
    color: '#666',
  },
  loading: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});

export default Page;
