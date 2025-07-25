import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuth, ClerkProvider, useSignUp } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      // handle error
    }
  },
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();


function InitialLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const {isSignedIn, isLoaded} = useAuth();
  const router = useRouter();
  const segment = useSegments();
  const colorScheme = useColorScheme();
  const [devAuthenticated, setDevAuthenticated] = React.useState(false);

  // Check for dev auth flag
  useEffect(() => {
    AsyncStorage.getItem('dev_authenticated').then(val => {
      setDevAuthenticated(val === 'true');
    });
    // QUICK FIX: Auto-enable dev mode
    AsyncStorage.setItem('dev_authenticated', 'true');
    setDevAuthenticated(true);
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Only run navigation logic after everything is loaded
    if (!loaded || !isLoaded) return;
    
    const inTabsGroup = segment[0] === '(tabs)';
    const inAppGroup = segment[0] === '(app)';
    const inVerification = segment.some(seg => seg === 'verify');

    // Don't redirect if in verification flow
    if (inVerification) return;

    // Only redirect to chats if signed in and trying to access root
    if ((isSignedIn || devAuthenticated) && !inTabsGroup && !inAppGroup) {
      setTimeout(() => {
        router.replace('/(tabs)/chats' as any);
      }, 0);
    } 
    // Redirect to welcome screen if not signed in and not in app group
    else if (!isSignedIn && !devAuthenticated && !inAppGroup) {
      setTimeout(() => {
        router.replace('/(app)');
      }, 0);
    }
  }, [isSignedIn, isLoaded, loaded, segment, devAuthenticated]);

  if (!loaded || !isLoaded) {
    return <View />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Slot />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  if (!CLERK_PUBLISHABLE_KEY) {
    console.error('Missing Clerk Publishable Key');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Missing Clerk Configuration</Text>
      </View>
    );
  }

  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY} 
      tokenCache={tokenCache}
    >
      <InitialLayout />
    </ClerkProvider>
  );
}
