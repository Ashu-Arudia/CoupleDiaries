import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { UserProvider } from "./UserContext";

export default function Layout() {
  const [initializing, setinitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const router = useRouter();
  const segments = useSegments();

  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    console.log("onAuthStateChanged", user);
    setUser(user);
    if (initializing) setinitializing(false);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === "(Auth)";
    if (!user && inAuthGroup) {
      router.replace("/");
    }
  }, [user, initializing]);

  if (initializing) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false}}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="Signup" options={{ headerShown: false }} />
        <Stack.Screen name="Get-started" options={{ headerShown: false }} />
        <Stack.Screen name="(Auth)" options={{ headerShown: false }} />
      </Stack>
    </UserProvider>
  );
}
