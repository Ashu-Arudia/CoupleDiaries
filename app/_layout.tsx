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
    const isGettingStarted = segments[0] === "Get-started";
    const isEmailVerification = segments[0] === "EmailVerification";
    const isSignupOrIndex = segments[0] === "Signup" || segments[0] === "index";

    // Log for debugging
    console.log("Auth navigation check:", {
      user: user?.uid,
      emailVerified: user?.emailVerified,
      currentPath: segments[0],
      inAuthGroup,
      isGettingStarted,
      isEmailVerification
    });

    // If no user is logged in
    if (!user) {
      // Only redirect from protected routes to the login
      if (inAuthGroup || isGettingStarted) {
        router.replace("/");
      }
      // Don't redirect if already on public routes (index, signup, verification)
      return;
    }

    // User is logged in - check verification status
    if (user.emailVerified) {
      // Check if we need to determine if setup is completed
      const checkSetupStatus = async () => {
        try {
          // Get user data from Firestore to check setup status
          const firestore = require('@react-native-firebase/firestore').default();
          const userDoc = await firestore.collection('users').doc(user.uid).get();
          const userData = userDoc.data();

          // Check if setup is completed
          const setupCompleted = userData?.setupCompleted === true;

          console.log("User setup status:", setupCompleted ? "Completed" : "Not completed");

          if (isEmailVerification) {
            // If verified but on verification screen, go to Get-started
            router.replace("Get-started");
          }
          // If user has completed setup but is still on Get-started page, send to home
          else if (isGettingStarted && setupCompleted) {
            console.log("Setup completed but still on Get-started, redirecting to home");
            router.replace("/(Auth)/home");
          }
          // IMPORTANT: Don't redirect away from Get-started if not completed
          else if (!inAuthGroup && !isGettingStarted && !isSignupOrIndex && !setupCompleted) {
            // Not completed setup - send to Get-started
            router.replace("Get-started");
          }
          else if (!inAuthGroup && !isGettingStarted && !isSignupOrIndex && setupCompleted) {
            // Setup completed - send to home
            router.replace("/(Auth)/home");
          }
          // Otherwise stay on current route (already in correct place)
        } catch (error) {
          console.error("Error checking setup status:", error);
          // If error, use simpler logic as fallback
          if (isEmailVerification) {
            router.replace("Get-started");
          } else if (!inAuthGroup && !isGettingStarted && !isSignupOrIndex) {
            router.replace("/(Auth)/home");
          }
        }
      };

      // Execute the check
      checkSetupStatus();
    } else {
      // User is not verified - verify email first
      if (inAuthGroup) {
        // If trying to access protected routes without verification, redirect
        router.replace("/EmailVerification");
      }
      // If already on email verification or Get-started, stay there
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
