import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { BackHandler, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { UserProvider } from "./UserContext";

export default function Layout() {
  const [initializing, setinitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const router = useRouter();
  const segments = useSegments();

  // Function to handle authentication state changes
  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    console.log("onAuthStateChanged", user);
    setUser(user);

    // Update login status in Firestore when auth state changes
    if (user) {
      try {
        const firestore = require('@react-native-firebase/firestore').default();
        firestore.collection('users').doc(user.uid).update({
          isLoggedIn: true,
          lastLoginTime: new Date().toISOString()
        }).catch((error: any) => {
          console.log("Firestore update error (may be first login):", error);
          // If document doesn't exist yet, create it
          firestore.collection('users').doc(user.uid).set({
            isLoggedIn: true,
            lastLoginTime: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            userId: user.uid,
            email: user.email
          });
        });
      } catch (error: any) {
        console.error("Error updating login status:", error);
        // Continue with navigation even if this fails
      }
    }

    if (initializing) setinitializing(false);
  };

  useEffect(() => {
    // Subscribe to authentication state changes
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === "(Auth)";

    if (!user && inAuthGroup) {
      // If user is not logged in but trying to access protected routes
      router.replace("/");
    } else if (user && !inAuthGroup && segments[0] !== "Get-started") {
      // If user is logged in but on non-protected routes (except Get-started which may be a transition)
      router.replace("/(Auth)/home");
    }
  }, [user, initializing, segments]);

  // Add back button handler to prevent navigation to auth screens after logout
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // If user is signed out and trying to go back to auth routes
        if (!user && (segments[0] === "(Auth)" || segments[0] === "/")) {
          return true; // Prevent default back behavior
        }
        return false; // Allow default back behavior in other cases
      }
    );

    return () => backHandler.remove();
  }, [user, segments]);

  if (initializing) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="large" color="#FFAA2C" />
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
