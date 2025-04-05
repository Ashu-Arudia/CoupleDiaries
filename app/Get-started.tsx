import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

import * as Progress from "react-native-progress";
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

  const validateStep = () => {
    if (currentStep === 1 && name.trim() === "") {
      alert("All details are required!");
      return false;
    }
    if (currentStep === 2 && partner_name.trim() === "") {
      alert("All details are required!");
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (currentStep == 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep == 2) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace("/(Auth)/home");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        next_btn = "Get Started";
        return (
          <View>
            <Text style={styles.label}>Let's Get to Know You!</Text>
            <Image
              source={require("../assets/images/ppic2.jpg")}
              style={styles.imagepic}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your Name"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={age}
                keyboardType="numeric"
                onChangeText={setAge}
                placeholder="Your Age"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.container2}>
              {genders.map((gender, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    selectedGender === gender && styles.selectedButton, // Apply selected style
                  ]}
                  onPress={() => setSelectedGender(gender)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      selectedGender === gender && styles.selectedText, // Change text color when selected
                    ]}
                  >
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 2:
        return (
          (next_btn = "Send Invitation Link"),
          (
            <View>
              <Text style={styles.label}>Tell us About Your Partner</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={partner_name}
                  onChangeText={set_p_name}
                  placeholder="Partner's Name"
                  multiline
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={partner_email}
                  onChangeText={set_p_email}
                  placeholder="Partner's Email"
                  multiline
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="When did you guys started Dating?"
                  multiline
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
              </View>
            </View>
          )
        );
      case 3:
        next_btn = "Continue";
        return (
          <View>
            <View style={styles.img}>
              <Image
                source={require("../assets/images/tick.png")}
                // style={styles.image}
              />
            </View>
            <View style={styles.doneContainer}>
              <Text style={[styles.doneText, { justifyContent: "center" }]}>
                You're All Set Up
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const renderButtons = () => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.nextButton, loading && { opacity: 0.7 }]}
        onPress={handleNext}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{next_btn}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {currentStep !== 3 && (
        <Progress.Bar
          progress={progress}
          width={width * 0.8}
          color="#FFAA2C"
          unfilledColor="#333333"
          borderWidth={0}
          height={8}
          borderRadius={4}
          style={{ marginBottom: 30 }}
        />
      )}

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
    height: height,
    width: width,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    justifyContent: "space-around",
    width: width,
    marginBottom: 30,
  },
  progressBar: {
    marginLeft: 10,
    marginRight: 10,
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
    marginVertical: 15,
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
  inputContainer: {
    // position: "relative",
    width: width * 0.8,
    marginBottom: 10,
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
    alignItems: "center",
    justifyContent: "center",
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
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    width: "95%",
    bottom: 20,
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
    marginTop: 20,
    alignItems: "center",
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
