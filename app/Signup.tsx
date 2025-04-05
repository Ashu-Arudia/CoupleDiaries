import auth from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import { FirebaseError } from "firebase/app";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const { width, height } = Dimensions.get("window");

export default function App() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cnfPassword, setcnfPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [partner_name, set_p_name] = useState("");
  const [partner_email, set_p_email] = useState("");
  const [date, setDate] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCnfPassword, setShowCnfPassword] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const genders = ["Male", "Female", "Other"];
  const [loading, setLoading] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);

  let next_btn = "";
  const progress = currentStep / 4;

  const signUp = async () => {
    setLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      const user = auth().currentUser;
      if (user) {
        await user.sendEmailVerification();
        router.replace("/EmailVerification");
        return true;
      }
    } catch (e: any) {
      const err = e as FirebaseError;
      alert("Registration failed: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
    return false;
  };

  const signIn = async () => {
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      const user = auth().currentUser;

      if (user) {
        // Check if email is verified
        await user.reload();
        if (!user.emailVerified) {
          // Email is verified, proceed to home
          router.replace("/EmailVerification");
        } else {
          // Email not verified, go to verification screen
          router.replace("/(Auth)/home");
        }
      }
    } catch (e: any) {
      const err = e as FirebaseError;
      alert("Sign In failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (email.trim() === "" || password.trim() === "") {
        alert("Email and password cannot be empty!");
        return false;
      }

      // For sign up, check password confirmation
      if (!isSignIn && password !== cnfPassword) {
        alert("Passwords do not match!");
        return false;
      }
    }
    if (currentStep === 2 && otp.trim() === "") {
      alert("OTP cannot be empty!");
      return false;
    }
    if (currentStep === 3 && name.trim() === "") {
      alert("All details are required!");
      return false;
    }
    if (currentStep === 4 && partner_name.trim() === "") {
      alert("All details are required!");
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (isSignIn) {
      // Sign in flow
      await signIn();
    } else {
      // Sign up flow
      if (currentStep === 1) {
        const signupSuccess = await signUp();
        if (signupSuccess) {
          // No need to continue with steps, go to verification screen
          return;
        }
      } else if (currentStep < 4) {
        // Move to next step
        setCurrentStep(currentStep + 1);
      } else {
        // Final step - we should never get here since we redirect after signup
        alert("Registration complete!");
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleSignInMode = () => {
    setIsSignIn(!isSignIn);
    // Reset form when switching modes
    setEmail("");
    setPassword("");
    setcnfPassword("");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        next_btn = isSignIn ? "Sign In" : "Create Account";
        return (
          <View>
            <Text style={styles.label}>
              {isSignIn ? "Welcome Back !!" : "Let's Create Your Account"}
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Your Email"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputWithIcon}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={!showPassword}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Image
                  source={
                    showPassword
                      ? require("../assets/images/eye-off.png")
                      : require("../assets/images/eye-off.png")
                  }
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
            {!isSignIn && (
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.inputWithIcon}
                  value={cnfPassword}
                  onChangeText={setcnfPassword}
                  placeholder="Confirm Password"
                  secureTextEntry={!showCnfPassword}
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCnfPassword(!showCnfPassword)}
                >
                  <Image
                    source={
                      showCnfPassword
                        ? require("../assets/images/eye-off.png")
                        : require("../assets/images/eye-off.png")
                    }
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={toggleSignInMode}
              style={styles.toggleModeButton}
            >
              <Text style={styles.toggleModeText}>
                {isSignIn
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  const renderButtons = () => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[
          styles.nextButton,
          loading && { opacity: 0.7 }
        ]}
        onPress={handleNext}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>
            {isSignIn ? "Sign In" : currentStep === 1 ? "Create Account" : next_btn}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      {renderStep()}
      {renderButtons()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container2: {
    flexDirection: "row", // Arrange buttons in a row
    // justifyContent: "center", // Center the buttons
    alignItems: "center",
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: "rgba(255,255,255,0.3)", // Change background when selected
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  selectedText: {
    color: "rgba(255,255,255,0.3)", // Change text color when selected
  },
  imagepic: {
    resizeMode: "contain",
    borderRadius: 70,
    alignSelf: "center",
    marginVertical: 20,
  },
  img: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: "30%",
    marginLeft: 60,
  },
  image: {
    width: width * 0.25,
    height: height * 0.15,
    resizeMode: "contain",
    marginBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    padding: 20,
    alignItems: "center",
    height:height
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    justifyContent: "space-around",
    width: width,
    marginBottom: 30,
  },
  stepText: {
    color: "#FFAE35",
    fontSize: 15,
    marginBottom: 5,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 80,
    textAlign: "center",
  },
  box: {
    width: width * 0.8,
    height: height * 0.06,
    position: "relative",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 15,
    color: "#FFFFFF",
    marginBottom: 15,
    width: "100%",
  },
  passwordContainer: {
    position: "relative",
    width: width*0.85,
    marginBottom: 10,
    alignItems:'center'
  },
  inputWithIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 15,
    color: "#FFFFFF",
    marginBottom: 15,
    width: "100%",
    paddingRight: 40,
  },
  eyeButton: {
    position: "absolute",
    right: 15,
    top: "30%",
  },
  eyeIcon: {
    width: 24,
    height: 24,
    tintColor: "rgba(255, 255, 255, 0.5)",
  },
  content: {
    justifyContent: "center",
    flex: 0,
  },
  content2: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  navButton: {
    backgroundColor: "transparent",
    paddingVertical: "auto",
    paddingHorizontal: "auto",
    borderRadius: 5,
    // marginLeft: -10,
    // marginRight: 20,
  },
  navButtonIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  disabledButton: {
    backgroundColor: "transparent",
    opacity: 0.7,
  },
  nextButton: {
    backgroundColor: "#FFAA2C",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    // alignItems: "center",
    justifyContent: "center",
    // bottom:15,
  },
  fixedButton: {
    width: width * 0.8, // Fixed width
    height: 50, // Fixed height
    backgroundColor: "#FFAE35",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  doneContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -100,
  },
  doneText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  btn_container: {
    position: "absolute",
    bottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    width: "100%",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 100,
  },
  buttonContainer: {
    position:'absolute',
    flexDirection: "row",
    justifyContent: "center",
    width: width * 0.85,
    bottom: 20,
    marginTop: 30,
  },
  prevButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleModeButton: {
    alignItems: "center",
    // backgroundColor: 'red',
    marginLeft:10,
    alignSelf:'flex-start',
  },
  toggleModeText: {
    color: "#FFAA2C",
    fontSize: 14,
    textAlign: "center",
  },
  logo: {
    width: width * 0.4,
    height: 100,
    marginBottom: 30,
  },
});
