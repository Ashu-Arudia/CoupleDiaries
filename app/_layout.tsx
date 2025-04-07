import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { BackHandler, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { UserProvider } from "./UserContext";

// Define routes at module scope for consistent access
const ROUTES = {
  HOME: "(Auth)/home",
  GET_STARTED: "Get-started",
  EMAIL_VERIFICATION: "EmailVerification",
  INDEX: "index"
};

export default function Layout() {
  const [initializing, setinitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const router = useRouter();
  const segments = useSegments();
  // Add navigation lock to prevent navigation loops
  const [isNavigating, setIsNavigating] = useState(false);
  const [setupCompleted, setSetupCompleted] = useState<boolean | null>(null);
  const [lastNavigationTime, setLastNavigationTime] = useState(0);

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
        router.replace("index");
      }
      // Don't redirect if already on public routes (index, signup, verification)
      return;
    }

    // User is logged in - check verification status
    if (user.emailVerified) {
      // Check if we need to determine if setup is completed
      const checkSetupStatus = async () => {
        try {
          // Get current time
          const now = Date.now();

          // Prevent navigation if less than 2 seconds have passed since last navigation
          if (now - lastNavigationTime < 2000) {
            console.log("Too soon to navigate again. Waiting...");
            return;
          }

          // Prevent navigation loop
          if (isNavigating) {
            console.log("Navigation already in progress, skipping checks");
            return;
          }

          // Don't navigate if we're already on the home screen
          if (isOnHomeScreen()) {
            console.log("Already on home screen, no navigation needed");
            return;
          }

          // Log the current navigation attempt for debugging
          console.log("Navigation check: User verified, checking setup status");
          console.log("Current segments:", segments);

          // Safer navigation with logging
          const navigateTo = (route: string) => {
            console.log(`Safe navigation to route: ${route}`);
            setLastNavigationTime(now);
            setIsNavigating(true);
            router.replace(route);
          };

          // Fix all route paths to match expected format
          if (segments[0] === "Get-started" && setupCompleted === true) {
            console.log("On successful Get-started page, forcing navigation to home");
            setLastNavigationTime(now);
            setIsNavigating(true);
            navigateTo(ROUTES.HOME);
            return;
          }

          // In the window.setupCompleted check
          // @ts-ignore - This is a controlled hack to access window property
          if (typeof window !== 'undefined' && window.setupCompleted === true) {
            console.log("Detected global setup completed flag, navigating to home");
            setSetupCompleted(true);
            navigateTo(ROUTES.HOME);
            return;
          }

          // Only do full check if we haven't determined setup status yet
          if (setupCompleted === null) {
            try {
              console.log("Checking Firestore for setup completion status");

              // Get user data from Firestore to check setup status
              const firestore = require('@react-native-firebase/firestore').default();
              const userDoc = await firestore.collection('users').doc(user.uid).get();
              const userData = userDoc.data();

              // Log the data for debugging
              console.log("User data from Firestore:", JSON.stringify(userData, null, 2));

              // Check if setup is completed - look for various indicators
              const isSetupCompleted =
                userData?.setupCompleted === true ||
                (userData?.name !== undefined &&
                 userData?.partner_name !== undefined &&
                 userData?.date !== undefined);

              console.log("Setup completed determination:", isSetupCompleted);
              setSetupCompleted(isSetupCompleted);

              // Handle navigation based on setup status
              if (isSetupCompleted) {
                // If verified and setup is complete, go to home unless already there
                if (!isOnHomeScreen()) {
                  console.log("Setup completed, navigating to home");
                  navigateTo(ROUTES.HOME);
                }
              } else {
                // Not completed setup - verify vs. get-started routing
                if (segments[0] === "EmailVerification") {
                  // Check if setup is already completed before deciding where to navigate
                  const setupIsCompleted = isSetupCompleted || setupCompleted === true;

                  if (setupIsCompleted) {
                    console.log("User verified and setup completed, navigating from EmailVerification to home");
                    setLastNavigationTime(now);
                    setIsNavigating(true);
                    router.replace(ROUTES.HOME);
                  } else {
                    console.log("User verified but setup not completed, navigating from EmailVerification to Get-started");
                    setLastNavigationTime(now);
                    setIsNavigating(true);
                    router.replace(ROUTES.GET_STARTED);
                  }
                } else if (segments[0] !== "Get-started" && !isSignupOrIndex) {
                  console.log("Setup not completed, going to Get-started");
                  setLastNavigationTime(now);
                  setIsNavigating(true);
                  router.replace(ROUTES.GET_STARTED);
                }
              }
            } catch (error) {
              console.error("Error checking setup from Firestore:", error);

              // Default to home to avoid loops
              if (!segments[0]?.includes("home") && !isSignupOrIndex) {
                console.log("Error occurred, defaulting to home route");
                setLastNavigationTime(now);
                setIsNavigating(true);
                router.replace(ROUTES.HOME);
              }
            }
          }

          // Reset navigation lock after a reasonable time
          setTimeout(() => {
            if (isNavigating) {
              console.log("Resetting navigation lock");
              setIsNavigating(false);
            }
          }, 5000);

        } catch (error) {
          console.error("Fatal navigation error:", error);
        }
      };

      // Execute the check
      checkSetupStatus();
    } else {
      // User is not verified - verify email first
      if (inAuthGroup) {
        // If trying to access protected routes without verification, redirect
        console.log("User not verified, redirecting to verification");
        router.replace(ROUTES.EMAIL_VERIFICATION);
      }
      // If already on email verification or signup pages, stay there
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

  // Add a safe way to check which screen we're on
  const isOnScreen = (screenPath: string): boolean => {
    return segments.includes(screenPath);
  };

  const isOnHomeScreen = (): boolean => {
    // Use segments.at() which is safer than direct array access
    return segments.length > 1 &&
           segments.at(0) === "(Auth)" &&
           segments.at(1) === "home";
  };

  // Check segments format
  useEffect(() => {
    if (segments.length > 0) {
      console.log("Current segment format:", JSON.stringify(segments));
      // Log detailed segment info to fix parsing
      console.log("First segment:", segments.at(0));
      if (segments.length > 1) {
        console.log("Second segment:", segments.at(1));
      }
    }
  }, [segments]);

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
