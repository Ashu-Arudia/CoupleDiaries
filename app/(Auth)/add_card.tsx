import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Button } from "react-native-paper";
import { useAppStore } from "./store";

// Get initial dimensions, but we'll use the hook for updates
const initialDimensions = Dimensions.get("window");

export default function AddCard() {
  // Use dimensions hook for responsive layout
  const { width, height } = useWindowDimensions();

  const [date, setDate] = useState("");
  const [mood, setMood] = useState("Curious");
  const [location, setLocation] = useState("");
  const [temperature, setTemperature] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [useTemperature, setUseTemperature] = useState(true);
  const [useLocation, setUseLocation] = useState(false);
  const [useSteps, setUseSteps] = useState(false);

  // Initialize animation value - important to start at 0 for first render
  const drawerAnimation = useRef(
    new Animated.Value(initialDimensions.height)
  ).current;

  const router = useRouter();
  const { addCard, setCurrentContent } = useAppStore();

  // Keep track of whether this is the first render
  const isFirstRender = useRef(true);

  // Create a ref to track the drawer's ready state
  const drawerReady = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Only animate downward movement (closing drawer)
          drawerAnimation.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > height * 0.2) {
          // If dragged down more than 20% of height, close the drawer
          closeDrawer();
        } else {
          // Otherwise, snap back to open position
          Animated.spring(drawerAnimation, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  // This useEffect handles the animation when drawerVisible changes
  useEffect(() => {
    // Skip animation on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (drawerVisible) {
      // Reset animation to starting position
      drawerAnimation.setValue(height);

      // Mark drawer as ready in the next frame to ensure modal is mounted
      requestAnimationFrame(() => {
        drawerReady.current = true;

        // Start animation after a brief delay
        setTimeout(() => {
          if (drawerReady.current) {
            Animated.spring(drawerAnimation, {
              toValue: 0,
              useNativeDriver: true,
              tension: 65,
              friction: 10,
            }).start();
          }
        }, 0);
      });
    }
    // Don't set drawerReady to false here anymore
  }, [drawerVisible]);

  // Update animation when dimensions change (device rotation)
  useEffect(() => {
    if (drawerVisible) {
      // If drawer is visible, update its position
      Animated.spring(drawerAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    }
  }, [width, height, drawerVisible]);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access gallery is required!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fixed: Use proper enum value
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const tempUri = result.assets[0].uri;
        const fileName = `image-${Date.now()}.jpeg`;
        const persistentUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.moveAsync({
          from: tempUri,
          to: persistentUri,
        });
        setPhoto(persistentUri);
      }
    } catch (error) {
      console.error("Error picking or moving image:", error);
      Alert.alert("Error", "Failed to pick or save image. Please try again.");
    }
  };

  const handleSubmit = () => {
    const cardData = {
      date: date || "29 January 2025",
      mood: mood || "Curious",
      location: useLocation ? location || "Jakarta" : "",
      temperature: useTemperature ? temperature || "79* F" : "",
      photo: photo || "",
      steps: useSteps ? "5,243" : "",
    };

    console.log("Submitting card:", cardData);
    addCard(cardData);
    setCurrentContent("page1");
    router.replace("/home");
  };

  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    const formattedDate = now.toLocaleDateString("en-US", options);
    setDate(formattedDate);
  };

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required!");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        setLocation(reverseGeocode[0].city || "Unknown Location");
      }

      fetchTemperature(latitude, longitude);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  const fetchTemperature = async (lat: number, lon: number) => {
    try {
      const API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"; // Replace with your API key
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();
      if (data.main && data.main.temp) {
        setTemperature(`${Math.round(data.main.temp)}°C`);
      }
    } catch (error) {
      console.error("Error fetching temperature:", error);
    }
  };

  useEffect(() => {
    getCurrentDate();
    getLocation();
  }, []);

  // Simple function to toggle drawer visibility
  const openDrawer = () => {
    setDrawerVisible(true);
  };

  // Modified close drawer function with proper animation completion callback
  const closeDrawer = () => {
    // Mark drawer as not ready to prevent reopening during animation
    drawerReady.current = false;

    Animated.spring(drawerAnimation, {
      toValue: height,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start(({ finished }) => {
      if (finished) {
        setDrawerVisible(false);
        // Set a small timeout before allowing the drawer to be reopened
        setTimeout(() => {
          drawerReady.current = true;
        }, 300);
      }
    });
  };

  // For interactive drawer with dynamic height
  const translateY = drawerAnimation.interpolate({
    inputRange: [0, height],
    outputRange: [0, height],
    extrapolate: "clamp",
  });

  // Calculate opacity for the backdrop based on drawer position
  const backdropOpacity = drawerAnimation.interpolate({
    inputRange: [0, height],
    outputRange: [0.5, 0],
    extrapolate: "clamp",
  });

  // Create dynamic styles based on current dimensions
  const dynamicStyles = React.useMemo(() => {
    return StyleSheet.create({
      bottomDrawerContent: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: height > 800 ? height * 0.95 : height * 0.9,
        maxHeight: height - 50,
        backgroundColor: "#1C1C1E",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
      },
      drawerScrollContent: {
        backgroundColor: "#1C1C1E",
        maxHeight: height > 800 ? height * 0.9 : height * 0.9,
        padding: width > 400 ? 20 : 15,
      },
      moodGridContainer: {
        marginBottom: height > 800 ? 25 : 15,
      },
      moodRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: height > 800 ? 10 : 8,
      },
      moodBubble: {
        width: width * 0.28,
        height: undefined,
        aspectRatio: 2,
        backgroundColor: "#2C2C2E",
        borderRadius: 30,
        padding: width > 400 ? 10 : 8,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 2,
      },
      moodEmoji: {
        fontSize: width > 400 ? 24 : 20,
        marginBottom: 5,
      },
      moodText: {
        color: "#FFFFFF",
        fontSize: width > 400 ? 12 : 10,
        textAlign: "center",
      },
      toggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: height > 800 ? 12 : 10,
        borderBottomWidth: 1,
        borderBottomColor: "#2C2C2E",
      },
      toggleLabel: {
        color: "#FFFFFF",
        fontSize: width > 400 ? 16 : 14,
        marginLeft: 10,
      },
      addImageButton: {
        width: width * 0.25,
        height: undefined,
        aspectRatio: 1,
        backgroundColor: "#2C2C2E",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
      },
      container1: {
        width: width,
        height: height * 0.45,
        backgroundColor: "black",
      },
      container2: {
        height: height * 0.1,
        backgroundColor: "black",
      },
      container3: {
        flexDirection: "column",
        width: width,
        height: height * 0.36,
        backgroundColor: "black",
      },
      container4: {
        flex: 1,
        width: width,
        backgroundColor: "black",
      },
      container: {
        backgroundColor: "black",
        height: height,
        width: width,
      },
      inner_container: {
        width: width,
        height: height,
        backgroundColor: "black",
        flexDirection: "column",
      },
      imagePicker: {
        width: width,
        height: "100%",
        backgroundColor: "#222222",
        justifyContent: "center",
        alignItems: "center",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: "hidden",
      },
      okButton: {
        position: "absolute",
        top: 5,
        right: 5,
        zIndex: 10,
        backgroundColor: "#00000026",
        height: 60,
        width: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
      },
      okButtonText: {
        fontSize: 20,
        fontWeight: "bold",
        tintColor: "white",
      },
      previewImage: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
      },
      selectedColumn: {
        flexDirection: "column",
        borderRadius: 50,
        width: "80%",
        marginLeft: 20,
      },
      textcont: {
        marginTop: 10,
      },
      text: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "Satoshi",
      },
      moodcont: {
        flexDirection: "row",
        marginTop: 10,
        gap: 8,
      },
      gradient: {
        flexGrow: 1,
        flexDirection: "row",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 50,
        padding: 8,
        overflow: "hidden",
      },
      blurView: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
      },
      gradientText: {
        color: "#FFAA2C",
        fontSize: 12,
        fontWeight: "500",
        fontFamily: "Satoshi",
      },
      textm: {
        color: "#fff",
        fontFamily: "Satoshi",
      },
      record: {},
      drawer: {
        backgroundColor: "#222222",
        width: 30,
        height: 30,
        resizeMode: "contain",
      },
      drawerButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#222222",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 20,
      },
      imagePickerText: {
        color: "#FFFFFF",
        fontSize: 16,
      },
    });
  }, [width, height]);

  // Function to get emoji for a mood
  const getMoodEmoji = (currentMood: string) => {
    const emojis: Record<string, string> = {
      Happy: "😊",
      Loved: "😍",
      Gratitude: "🙏",
      Confidence: "😎",
      Excitement: "😃",
      Angry: "😠",
      Fear: "😨",
      Sad: "😢",
      Hurt: "💔",
      Curious: "🤔",
    };
    return emojis[currentMood] || "🤔";
  };

  const renderDrawerContent = () => (
    <Modal
      visible={drawerVisible}
      transparent={true}
      animationType="none"
      onRequestClose={closeDrawer}
      statusBarTranslucent={true}
    >
      <Animated.View
        style={[styles.modalBackdrop, { opacity: backdropOpacity }]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={closeDrawer}
        />
      </Animated.View>

      <Animated.View
        style={[
          dynamicStyles.bottomDrawerContent,
          {
            transform: [{ translateY: translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.drawerHandleContainer}>
          <View style={styles.drawerHandle} />
        </View>

        <ScrollView
          style={dynamicStyles.drawerScrollContent}
          contentContainerStyle={styles.drawerScrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Additional Details</Text>
            <TouchableOpacity onPress={closeDrawer}>
              <MaterialIcons name="close" size={24} color="#888" />
            </TouchableOpacity>
          </View>

          <Text style={styles.drawerSectionTitle}>
            How are you feeling Now?
          </Text>

          <View style={dynamicStyles.moodGridContainer}>
            <View style={dynamicStyles.moodRow}>
              {[
                { emoji: "😊", label: "Happy" },
                { emoji: "😍", label: "Loved" },
                { emoji: "🙏", label: "Gratitude" },
              ].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    dynamicStyles.moodBubble,
                    mood === item.label && styles.selectedMoodBubble,
                  ]}
                  onPress={() => setMood(item.label)}
                >
                  <Text style={dynamicStyles.moodEmoji}>{item.emoji}</Text>
                  <Text style={dynamicStyles.moodText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={dynamicStyles.moodRow}>
              {[
                { emoji: "😎", label: "Confidence" },
                { emoji: "😃", label: "Excitement" },
                { emoji: "😠", label: "Angry" },
              ].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    dynamicStyles.moodBubble,
                    mood === item.label && styles.selectedMoodBubble,
                  ]}
                  onPress={() => setMood(item.label)}
                >
                  <Text style={dynamicStyles.moodEmoji}>{item.emoji}</Text>
                  <Text style={dynamicStyles.moodText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={dynamicStyles.moodRow}>
              {[
                { emoji: "😨", label: "Fear" },
                { emoji: "😢", label: "Sad" },
                { emoji: "💔", label: "Hurt" },
              ].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    dynamicStyles.moodBubble,
                    mood === item.label && styles.selectedMoodBubble,
                  ]}
                  onPress={() => setMood(item.label)}
                >
                  <Text style={dynamicStyles.moodEmoji}>{item.emoji}</Text>
                  <Text style={dynamicStyles.moodText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.toggleContainer}>
            <View style={dynamicStyles.toggleRow}>
              <View style={styles.toggleLabelContainer}>
                <MaterialIcons name="thermostat" size={24} color="#888" />
                <Text style={dynamicStyles.toggleLabel}>Use Temperature</Text>
              </View>
              <Switch
                value={useTemperature}
                onValueChange={setUseTemperature}
                trackColor={{ false: "#444", true: "#FFAA2C" }}
                thumbColor={"#fff"}
              />
            </View>

            <View style={dynamicStyles.toggleRow}>
              <View style={styles.toggleLabelContainer}>
                <MaterialIcons name="location-on" size={24} color="#888" />
                <Text style={dynamicStyles.toggleLabel}>Location</Text>
              </View>
              <Switch
                value={useLocation}
                onValueChange={setUseLocation}
                trackColor={{ false: "#444", true: "#FFAA2C" }}
                thumbColor={"#fff"}
              />
            </View>

            <View style={dynamicStyles.toggleRow}>
              <View style={styles.toggleLabelContainer}>
                <MaterialIcons name="directions-walk" size={24} color="#888" />
                <Text style={dynamicStyles.toggleLabel}>Steps</Text>
              </View>
              <Switch
                value={useSteps}
                onValueChange={setUseSteps}
                trackColor={{ false: "#444", true: "#FFAA2C" }}
                thumbColor={"#fff"}
              />
            </View>
          </View>

          <View style={styles.addImageSection}>
            <Text style={styles.addImageLabel}>Add Image</Text>
            <TouchableOpacity
              style={dynamicStyles.addImageButton}
              onPress={pickImage}
            >
              <MaterialIcons
                name="add-photo-alternate"
                size={36}
                color="#888"
              />
              <Text style={styles.addImageButtonText}>Add Images</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );

  const renderMainContent = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={dynamicStyles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButtonMinimal}
          onPress={handleGoBack}
        >
          <Image
            source={require("../../assets/images/arr.png")}
            style={styles.backIconMinimal}
          />
        </TouchableOpacity>

        <View style={dynamicStyles.inner_container}>
          <View style={dynamicStyles.container1}>
            <TouchableOpacity
              style={dynamicStyles.imagePicker}
              onPress={pickImage}
            >
              {photo && (
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={dynamicStyles.okButton}
                  labelStyle={dynamicStyles.okButtonText}
                >
                  <Image
                    source={require("../../assets/images/icons/star.png")}
                    style={{ tintColor: "white" }}
                  />
                </Button>
              )}
              {photo ? (
                <Image
                  source={{ uri: photo }}
                  style={[dynamicStyles.previewImage, { opacity: 0.6 }]}
                  onError={(e) => {
                    Alert.alert(
                      "Image Error",
                      "Failed to load the selected image"
                    );
                    setPhoto(null);
                  }}
                />
              ) : (
                <Text style={dynamicStyles.imagePickerText}>
                  Import an Image
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={dynamicStyles.container2}>
            <View style={dynamicStyles.selectedColumn}>
              <View style={dynamicStyles.textcont}>
                <Text style={dynamicStyles.text}>{date}</Text>
              </View>
              <View style={dynamicStyles.moodcont}>
                <LinearGradient
                  colors={[
                    "rgba(255, 151, 86, 0.7)",
                    "rgba(255, 251, 180, 0.7)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[dynamicStyles.gradient, { opacity: 0.6 }]}
                >
                  <BlurView
                    intensity={100}
                    tint="dark"
                    style={dynamicStyles.blurView}
                  >
                    <Text
                      style={[
                        dynamicStyles.gradientText,
                        { fontWeight: "700", fontSize: 13 },
                      ]}
                    >
                      {getMoodEmoji(mood)} {mood}
                    </Text>
                  </BlurView>
                </LinearGradient>
                <LinearGradient
                  colors={["#222222", "#222222"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[dynamicStyles.gradient]}
                >
                  <MaterialIcons name="location-on" size={20} color="grey" />
                  <Text style={dynamicStyles.textm}> {location}</Text>
                </LinearGradient>
                <LinearGradient
                  colors={["#222222", "#222222"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={dynamicStyles.gradient}
                >
                  <MaterialIcons name="wb-sunny" size={20} color="grey" />
                  <Text style={dynamicStyles.textm}>
                    {" "}
                    {temperature || "75* F"}
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </View>
          <View style={[dynamicStyles.container3, { paddingHorizontal: 13 }]}>
            <Text style={{ color: "#AAAAAA", fontWeight: "700", fontSize: 13 }}>
              3:49 AM
            </Text>
            <Text
              style={{
                color: "#DFDFDF",
                fontWeight: "700",
                fontSize: 18,
                paddingVertical: 7,
              }}
            >
              Say what your heart desires...
            </Text>
          </View>
          <View style={dynamicStyles.container4}>
            <View
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "row",
                height: "100%",
                width: "100%",
              }}
            >
              <View style={{ flexDirection: "column" }}>
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 15,
                    marginLeft: 20,
                  }}
                >
                  New Entry
                </Text>
                <Text
                  style={{
                    color: "#AAAAAA",
                    fontWeight: "700",
                    fontSize: 13,
                    marginLeft: 20,
                  }}
                >
                  0 Words
                </Text>
              </View>
              <TouchableOpacity>
                <Image
                  source={require("../../assets/images/icons/start_record.png")}
                  style={dynamicStyles.record}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={dynamicStyles.drawerButton}
                onPress={openDrawer}
              >
                <Image
                  source={require("../../assets/images/icons/info.png")}
                  style={dynamicStyles.drawer}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      {renderDrawerContent()}
    </KeyboardAvoidingView>
  );

  const handleGoBack = () => {
    setCurrentContent("default");
    router.replace("/home");
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {renderMainContent()}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropTouchable: {
    flex: 1,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
  },
  drawerHandleContainer: {
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#1C1C1E",
  },
  drawerHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#888",
  },
  drawerScrollContentContainer: {
    paddingBottom: 30, // Add some bottom padding for scrolling
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  drawerSectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  drawerTitle: {
    color: "#C9C9C9",
    fontSize: 16,
    marginBottom: 15,
  },
  toggleContainer: {
    marginBottom: 25,
  },
  toggleLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addImageSection: {
    marginBottom: 20,
  },
  addImageLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 15,
  },
  addImageButtonText: {
    color: "#888",
    fontSize: 12,
    marginTop: 5,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  selectedMoodBubble: {
    backgroundColor: "#FFAA2C50",
    borderWidth: 1,
    borderColor: "#FFAA2C",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  backButton: {
    padding: 5,
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  spacer: {
    width: 24,
  },
  backButtonMinimal: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 999,
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
  },
  backIconMinimal: {
    width: 24,
    height: 24,
    tintColor: "white",
  },
});
