import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="otp" options={{ headerShown: true }} />
      <Stack.Screen name="verify/[phone]" options={{ headerShown: true }} />
    </Stack>
  );
} 