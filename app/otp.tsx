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
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();

  const openLink = () => {
    Linking.openURL('https://galaxies.dev');
  };

  const sendOTP = async () => {
    const cleanPhoneNumber = phoneNumber.replace(/[^0-9+]/g, '');
    console.log('sendOTP', cleanPhoneNumber);
    setLoading(true);

    try {
      const signUpAttempt = await signUp!.create({
        phoneNumber: cleanPhoneNumber,
      });
      console.log('Sign up attempt:', signUpAttempt);

      await signUp!.preparePhoneNumberVerification();
      console.log('Verification prepared');

      router.push(`/verify/${encodeURIComponent(cleanPhoneNumber)}`);
    } catch (err) {
      console.log('error', JSON.stringify(err, null, 2));

      if (isClerkAPIResponseError(err)) {
        if (err.errors[0].code === 'form_identifier_exists') {
          // User signed up before
          console.log('User signed up before, attempting sign in');
          try {
            await trySignIn();
          } catch (signInError) {
            console.log('Sign in error:', signInError);
            Alert.alert('Error', 'Failed to sign in. Please try again.');
            setLoading(false);
          }
        } else {
          setLoading(false);
          Alert.alert('Error', err.errors[0].message);
        }
      } else {
        setLoading(false);
        Alert.alert('Error', 'An unexpected error occurred');
      }
    }
  };

  const trySignIn = async () => {
    const cleanPhoneNumber = phoneNumber.replace(/[^0-9+]/g, '');
    console.log('trySignIn', cleanPhoneNumber);

    try {
      const { supportedFirstFactors } = await signIn!.create({
        identifier: cleanPhoneNumber,
      });

      if (!supportedFirstFactors) {
        throw new Error('No supported factors found');
      }

      const firstPhoneFactor: any = supportedFirstFactors.find((factor: any) => {
        return factor.strategy === 'phone_code';
      });

      if (!firstPhoneFactor) {
        throw new Error('Phone verification not supported');
      }

      const { phoneNumberId } = firstPhoneFactor;

      await signIn!.prepareFirstFactor({
        strategy: 'phone_code',
        phoneNumberId,
      });

      console.log('Sign in prepared, redirecting to verification');
      router.push(`/verify/${encodeURIComponent(cleanPhoneNumber)}?signin=true`);
    } catch (error) {
      console.log('Sign in error:', error);
      Alert.alert('Error', 'Failed to sign in. Please try again.');
      setLoading(false);
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
          <Text style={{ fontSize: 18, padding: 10 }}>Sending code...</Text>
        </View>
      )}

      <View style={styles.container}>
        <Text style={styles.description}>
          WhatsApp will need to verify your account. Carrier charges may apply.
        </Text>

        <View style={styles.list}>
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>US</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
          </View>
          <View style={styles.separator} />

          <MaskInput
            value={phoneNumber}
            keyboardType="numeric"
            autoFocus
            placeholder="+1 (555) 555-5555"
            onChangeText={(masked, unmasked) => {
              setPhoneNumber(masked);
            }}
            mask={US_PHONE}
            style={styles.input}
          />
        </View>

        <Text style={styles.legal}>
          You must be{' '}
          <Text style={styles.link} onPress={openLink}>
            at least 16 years old
          </Text>{' '}
          to register. Learn how WhatsApp works with the{' '}
          <Text style={styles.link} onPress={openLink}>
            Meta Companies
          </Text>
          .
        </Text>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[styles.button, phoneNumber !== '' ? styles.enabled : null, { marginBottom: 20 }]}
          onPress={sendOTP}>
          <Text style={[styles.buttonText, phoneNumber !== '' ? styles.enabled : null]}>Next</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.background,
    gap: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.gray,
  },
  legal: {
    fontSize: 12,
    textAlign: 'center',
    color: '#000',
  },
  link: {
    color: Colors.primary,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    padding: 10,
    borderRadius: 10,
  },
  enabled: {
    backgroundColor: Colors.primary,
    color: '#fff',
  },
  buttonText: {
    color: Colors.gray,
    fontSize: 22,
    fontWeight: '500',
  },
  list: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 10,
    padding: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
    marginBottom: 10,
  },
  listItemText: {
    fontSize: 18,
    color: Colors.primary,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.gray,
    opacity: 0.2,
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    fontSize: 16,
    padding: 6,
    marginTop: 10,
  },

  loading: {
    zIndex: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Page;
