import { MaterialIcons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function EmailVerification() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const currentUser = auth().currentUser;
  const userEmail = currentUser?.email;

  // Use useRef for navigation lock to prevent re-renders and timing issues
  const isNavigatingRef = useRef(false);
  // Use ref for interval ID to ensure we can clear it from any function
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Function to safely navigate without duplicates
  const safeNavigate = (destination: string, delay = 500) => {
    // Prevent duplicate navigation
    if (isNavigatingRef.current) return;

    // Set navigation lock
    isNavigatingRef.current = true;

    // Clear any verification checks
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    console.log(`Preparing to navigate to ${destination} (after ${delay}ms delay)...`);

    // Show success state and stop any loaders
    setVerifying(false);

    // Update Firestore status if needed
    if (currentUser) {
      try {
        const firestore = require('@react-native-firebase/firestore').default();
        firestore.collection('users').doc(currentUser.uid).update({
          emailVerified: true,
          verifiedAt: new Date().toISOString()
        }).catch((err: Error) => console.error("Firebase update error:", err));
      } catch (error) {
        console.error("Error updating verification status:", error);
      }
    }

    // Navigate after delay
    setTimeout(() => {
      console.log(`Now navigating to ${destination}`);
      router.replace(destination);
    }, delay);
  };

  // On mount - check if already verified and start verification if needed
  useEffect(() => {
    // Only start if user exists and not already navigating
    if (!currentUser || isNavigatingRef.current) {
      !currentUser && router.replace("/login");
      return;
    }

    // Check if already verified
    const checkVerification = async () => {
      try {
        await currentUser.reload();
        if (auth().currentUser?.emailVerified) {
          console.log("Already verified, navigating to Get-started");
          safeNavigate("Get-started");
          return;
        }

        // Not verified, start the verification check
        startVerificationCheck();
      } catch (error) {
        console.error("Initial verification check error:", error);
        setVerifying(false);
      }
    };

    checkVerification();

    // Clean up
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentUser]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Verify email periodically
  const startVerificationCheck = () => {
    setVerifying(true);

    // Start periodic check for email verification
    intervalRef.current = setInterval(async () => {
      try {
        // Skip if navigating or no user
        if (isNavigatingRef.current || !auth().currentUser) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }

        // Get latest status
        await auth().currentUser!.reload();
        const isVerified = auth().currentUser?.emailVerified;
        console.log("Email verification check status:", isVerified);

        if (isVerified) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          safeNavigate("Get-started");
        }
      } catch (error) {
        console.error("Error checking email verification:", error);
      }
    }, 3000);
  };

  // Resend email handler
  const handleResendEmail = async () => {
    if (!canResend || isNavigatingRef.current) return;

    try {
      setVerifying(true);
      await currentUser?.sendEmailVerification();
      setCountdown(60);
      setCanResend(false);
      Alert.alert(
        "Verification Email Sent",
        "A new verification email has been sent to your email address."
      );
    } catch (error) {
      console.error("Error sending verification email:", error);
      Alert.alert(
        "Error",
        "Failed to send verification email. Please try again later."
      );
    } finally {
      setVerifying(false);
    }
  };

  // Manual proceed handler
  const proceedToGetStarted = async () => {
    if (isNavigatingRef.current) return;

    try {
      setVerifying(true);

      if (!currentUser) {
        Alert.alert("Error", "You need to be logged in to continue.");
        setVerifying(false);
        return;
      }

      // Check one more time
      await currentUser.reload();
      const isVerified = auth().currentUser?.emailVerified;

      if (isVerified) {
        safeNavigate("Get-started");
      } else {
        Alert.alert(
          "Verification Status",
          "Our system hasn't detected your verification yet. Would you like to proceed anyway?",
          [
            { text: "Cancel", style: "cancel", onPress: () => setVerifying(false) },
            { text: "Continue", onPress: () => safeNavigate("Get-started", 300) }
          ]
        );
      }
    } catch (error) {
      console.error("Error in manual verification:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      setVerifying(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0A0A0A", "#1A1A1A"]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="mark-email-read" size={80} color="#FFAA2C" />
        </View>

        <Text style={styles.title}>Verify Your Email</Text>

        <Text style={styles.message}>
          We've sent a verification email to{"\n"}
          <Text style={styles.email}>{userEmail}</Text>
        </Text>

        <Text style={styles.instruction}>
          Please check your email and click on the verification link to activate your account.
        </Text>

        <View style={styles.loadingContainer}>
          {verifying ? (
            <>
              <ActivityIndicator size="large" color="#FFAA2C" />
              <Text style={styles.loadingText}>
                Waiting for verification...
              </Text>
            </>
          ) : (
            <Text style={styles.loadingText}>
              Ready to proceed to setup
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.resendButton,
            (!canResend || verifying) && styles.disabledButton
          ]}
          onPress={handleResendEmail}
          disabled={!canResend || verifying}
        >
          <Text style={styles.resendText}>
            {canResend
              ? "Resend Verification Email"
              : `Resend available in ${countdown}s`}
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.proceedButton}
          onPress={proceedToGetStarted}
          disabled={verifying || isNavigatingRef.current}
        >
          <Text style={styles.proceedText}>I've Verified My Email - Continue Setup</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => {
            if (isNavigatingRef.current) return;
            auth().signOut();
            router.replace("/login");
          }}
          disabled={verifying || isNavigatingRef.current}
        >
          <Text style={styles.signOutText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 30,
    backgroundColor: 'rgba(255, 170, 44, 0.1)',
    borderRadius: 50,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  email: {
    fontWeight: "bold",
    color: "#FFAA2C",
  },
  instruction: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: 10,
    color: "#FFFFFF",
    fontSize: 16,
  },
  resendButton: {
    backgroundColor: "#FFAA2C",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 15,
    width: "100%",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "rgba(255, 170, 44, 0.5)",
  },
  resendText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  signOutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    width: "100%",
    alignItems: "center",
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  proceedButton: {
    backgroundColor: "#2E7D32", // Green color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 15,
    width: "100%",
    alignItems: "center",
  },
  proceedText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});