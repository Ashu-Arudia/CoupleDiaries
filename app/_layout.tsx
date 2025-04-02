import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      {/* <Stack.Screen name="tab" options={{ headerShown: false }} /> */}
    </Stack>
  );
}