import auth from "@react-native-firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function EmailVerification() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const currentUser = auth().currentUser;
  const userEmail = currentUser?.email;

  useEffect(() => {
    // Only start the verification process if there's a logged in user
    if (currentUser) {
      startVerificationCheck();
    } else {
      // If no user, redirect to login
      router.replace("/login");
    }
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

  const startVerificationCheck = () => {
    setVerifying(true);
    // Start periodic check for email verification
    const checkInterval = setInterval(async () => {
      try {
        // Reload the user to get the latest verification status
        await currentUser?.reload();
        const isVerified = auth().currentUser?.emailVerified;

        console.log("Email verification status:", isVerified);

        if (isVerified) {
          clearInterval(checkInterval);
          setVerifying(false);
          router.replace("Get-started");
        }
      } catch (error) {
        console.error("Error checking email verification:", error);
      }
    }, 3000); // Check every 3 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(checkInterval);
  };

  const handleResendEmail = async () => {
    if (!canResend) return;

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

  return (
    <LinearGradient
      colors={["#0A0A0A", "#1A1A1A"]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image
          source={require("../assets/images/arr.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>Verify Your Email</Text>

        <Text style={styles.message}>
          We've sent a verification email to{"\n"}
          <Text style={styles.email}>{userEmail}</Text>
        </Text>

        <Text style={styles.instruction}>
          Please check your email and click on the verification link to activate your account.
        </Text>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFAA2C" />
          <Text style={styles.loadingText}>
            Waiting for verification...
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.resendButton,
            !canResend && styles.disabledButton
          ]}
          onPress={handleResendEmail}
          disabled={!canResend}
        >
          <Text style={styles.resendText}>
            {canResend
              ? "Resend Verification Email"
              : `Resend available in ${countdown}s`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => {
            auth().signOut();
            router.replace("/login");
          }}
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
  image: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 30,
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
});