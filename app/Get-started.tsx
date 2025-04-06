import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from "react-native-progress";
import { auth, setDetails, uploadProfileImage } from "./firebase";
import { useUser } from "./UserContext";
const { width, height } = Dimensions.get("window");

export default function App() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [partner_name, set_p_name] = useState("");
  const [partner_email, set_p_email] = useState("");
  const [date, setDate] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const genders = ["Male", "Female", "Other"];
  const [loading, setLoading] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);

  // Get refreshUserData function from user context
  const { refreshUserData } = useUser();

  let next_btn = "";
  const progress = currentStep / 4;

  // Month names array for our custom date picker
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate years for date picker (100 years in the past)
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  // Get days in a month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Date picker handlers
  const onDateChange = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);

    // Create the formatted date display for UI (Month Day, Year format)
    const displayDate = `${monthNames[month]} ${day}, ${year}`;

    // Create a consistent YYYY-MM-DD format for storage and calculations
    // Add 1 to month because JavaScript months are 0-indexed (January is 0)
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const standardDateFormat = `${year}-${formattedMonth}-${formattedDay}`;

    console.log('Setting date:', standardDateFormat);

    // Store the standardized format
    setDate(standardDateFormat);
  };

  // For the custom date picker modal
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerDay, setPickerDay] = useState(1);

  const confirmDate = () => {
    // When confirming from the picker, use the consistent approach
    // Add 1 to month because JavaScript months are 0-indexed (January is 0)
    const formattedMonth = String(pickerMonth + 1).padStart(2, '0');
    const formattedDay = String(pickerDay).padStart(2, '0');
    const standardDateFormat = `${pickerYear}-${formattedMonth}-${formattedDay}`;

    console.log('Confirming date:', standardDateFormat);

    // Set the selected date object
    setSelectedDate(new Date(pickerYear, pickerMonth, pickerDay));
    // Store the standardized format
    setDate(standardDateFormat);
    setShowDatePicker(false);
  };

  // Request permission and pick an image
  const pickImage = async () => {
    // Request permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

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

    if (currentStep === 2) {
      setLoading(true);
      try {
        const user = auth().currentUser;
        if (user) {
          let profileImageURL;

          // Upload profile image if one was selected
          if (profileImage) {
            setUploadingImage(true);
            profileImageURL = await uploadProfileImage(user.uid, profileImage);
            setUploadingImage(false);
          }

          const success = await setDetails(
            user.uid,
            name,
            parseInt(age) || 0,
            partner_name,
            partner_email,
            date,
            selectedGender,
            profileImageURL || undefined
          );

          if (success) {
            console.log("User data saved successfully");
            // Refresh the user data in the context
            await refreshUserData();
            setCurrentStep(currentStep + 1);
          } else {
            alert("Failed to save your data. Please try again.");
          }
        } else {
          console.error("No user logged in");
          alert("You need to be logged in to save your data");
        }
      } catch (error) {
        console.error("Error saving user data:", error);
        alert("Failed to save your data. Please try again.");
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      // Final step - direct navigation to home
      console.log("Setup completed, navigating to home");

      // First, set a flag to prevent flickering and multiple navigations
      setLoading(true);

      try {
        // Use a direct hard navigation to the home screen
        console.log("Attempting to navigate to /(Auth)/home");

        // Ensure the user data is correctly set in Firestore before navigation
        const user = auth().currentUser;
        if (user) {
          const firestore = require('@react-native-firebase/firestore').default();
          await firestore.collection('users').doc(user.uid).update({
            setupCompleted: true,
            setupCompletedAt: new Date().toISOString()
          });
          console.log("Updated user setup completion status");

          // Refresh user data one more time to ensure it's current
          await refreshUserData();
        }

        // Try navigation with a small delay to ensure state updates
        setTimeout(() => {
          console.log("Executing delayed navigation to home");
          router.replace("/(Auth)/home");
        }, 300);
      } catch (error) {
        console.error("Navigation error:", error);
        // If any error occurs, use another approach with a longer delay
        alert("Completing setup. You'll be redirected to the home screen shortly.");
        setTimeout(() => {
          router.replace("/(Auth)/home");
        }, 1000);
      }
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
            <View style={styles.imagePickerContainer}>
              {profileImage ? (
                <View style={styles.placeholderContainer}>
                  <Image source={{ uri: profileImage }} style={styles.imagepic} />
                  <TouchableOpacity onPress={pickImage} style={styles.cameraIconContainer}>
                    <MaterialIcons name="add-a-photo" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.placeholderContainer}>
            <Image
              source={require("../assets/images/ppic2.jpg")}
              style={styles.imagepic}
            />
                  <TouchableOpacity onPress={pickImage} style={styles.cameraIconContainer}>
                    <MaterialIcons name="add-a-photo" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
              {uploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#FFAA2C" />
                </View>
              )}
            </View>
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
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={partner_email}
                  onChangeText={set_p_email}
                  placeholder="Partner's Email"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
              </View>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text
                    style={[
                      styles.datePickerButtonText,
                      date ? styles.datePickerButtonTextSelected : {}
                    ]}
                  >
                    {date || "When did you guys start dating?"}
                  </Text>
                  <MaterialIcons name="event" size={24} color="#FFAA2C" />
                </TouchableOpacity>

                {showDatePicker && (
                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showDatePicker}
                    onRequestClose={() => setShowDatePicker(false)}
                  >
                    <View style={styles.modalView}>
                      <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Anniversary Date</Text>

                        <View style={styles.customPickerContainer}>
                          {/* Month Selector */}
                          <View style={styles.pickerSection}>
                            <Text style={styles.pickerLabel}>Month</Text>
                            <ScrollView
                              style={styles.pickerScrollView}
                              showsVerticalScrollIndicator={false}
                            >
                              {monthNames.map((month, index) => (
                                <TouchableOpacity
                                  key={`month-${index}`}
                                  style={[
                                    styles.pickerItem,
                                    pickerMonth === index && styles.pickerItemSelected
                                  ]}
                                  onPress={() => setPickerMonth(index)}
                                >
                                  <Text
                                    style={[
                                      styles.pickerItemText,
                                      pickerMonth === index && styles.pickerItemTextSelected
                                    ]}
                                  >
                                    {month}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>

                          {/* Day Selector */}
                          <View style={styles.pickerSection}>
                            <Text style={styles.pickerLabel}>Day</Text>
                            <ScrollView
                              style={styles.pickerScrollView}
                              showsVerticalScrollIndicator={false}
                            >
                              {Array.from(
                                { length: getDaysInMonth(pickerYear, pickerMonth) },
                                (_, i) => i + 1
                              ).map(day => (
                                <TouchableOpacity
                                  key={`day-${day}`}
                                  style={[
                                    styles.pickerItem,
                                    pickerDay === day && styles.pickerItemSelected
                                  ]}
                                  onPress={() => setPickerDay(day)}
                                >
                                  <Text
                                    style={[
                                      styles.pickerItemText,
                                      pickerDay === day && styles.pickerItemTextSelected
                                    ]}
                                  >
                                    {day}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>

                          {/* Year Selector */}
                          <View style={styles.pickerSection}>
                            <Text style={styles.pickerLabel}>Year</Text>
                            <ScrollView
                              style={styles.pickerScrollView}
                              showsVerticalScrollIndicator={false}
                            >
                              {years.map(year => (
                                <TouchableOpacity
                                  key={`year-${year}`}
                                  style={[
                                    styles.pickerItem,
                                    pickerYear === year && styles.pickerItemSelected
                                  ]}
                                  onPress={() => setPickerYear(year)}
                                >
                                  <Text
                                    style={[
                                      styles.pickerItemText,
                                      pickerYear === year && styles.pickerItemTextSelected
                                    ]}
                                  >
                                    {year}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        </View>

                        <View style={styles.modalButtons}>
                          <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setShowDatePicker(false)}
                          >
                            <Text style={styles.modalButtonText}>Cancel</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.modalButton, styles.confirmButton]}
                            onPress={confirmDate}
                          >
                            <Text style={styles.modalButtonText}>Confirm</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                )}
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
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: "center",
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
  imagePickerContainer: {
    alignSelf: 'center',
    marginVertical: 20,
    position: 'relative',
    width: 150,
    height: 150,
  },
  placeholderContainer: {
    position: 'relative',
    width: 150,
    height: 150,
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#FFAA2C',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#000',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 75,
  },
  datePickerButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  datePickerButtonText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 16,
  },
  datePickerButtonTextSelected: {
    color: "#FFFFFF",
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 20,
    width: width * 0.9,
    alignItems: "center",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  customPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 200,
  },
  pickerSection: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  pickerScrollView: {
    maxHeight: 150,
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    borderRadius: 8,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(255, 170, 44, 0.3)',
  },
  pickerItemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  pickerItemTextSelected: {
    color: '#FFAA2C',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#444",
  },
  confirmButton: {
    backgroundColor: "#FFAA2C",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
