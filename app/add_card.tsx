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
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Button } from "react-native-paper";
import { useAppStore } from "./store";

const { width, height } = Dimensions.get("window");

export default function AddCard() {
  const [date, setDate] = useState("");
  const [mood, setMood] = useState("");
  const [location, setLocation] = useState("");
  const [temperature, setTemperature] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Initialize animation value - important to start at 0 for first render
  const drawerAnimation = useRef(new Animated.Value(height)).current;

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
      location: location || "Jakarta",
      temperature: temperature || "79* F",
      photo: photo || "",
    };

    console.log("Submitting card:", cardData);
    addCard(cardData);
    setCurrentContent("page1");
    router.replace({ pathname: "/" });
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
    Animated.spring(drawerAnimation, {
      toValue: height,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start(({ finished }) => {
      if (finished) {
        setDrawerVisible(false);
        // Set a small timeout before allowing the drawer to be reopened
        requestAnimationFrame(() => {
          drawerReady.current = true;
        });
      }
    });
  };

  // For interactive drawer
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
          styles.bottomDrawerContent,
          {
            transform: [{ translateY: translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.drawerHandleContainer}>
          <View style={styles.drawerHandle} />
        </View>
        <ScrollView style={styles.drawerScrollContent}>
          <View>
            <Text style={styles.drawerTitle}>Additional Details</Text>
          </View>
          <View style={styles.container4_1}>
            <Text>How are you feeling Now?</Text>
          </View>

          {/* Add more drawer content here */}
        </ScrollView>
      </Animated.View>
    </Modal>
  );

  const renderMainContent = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner_container}>
          <View style={styles.container1}>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {photo && (
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.okButton}
                  labelStyle={styles.okButtonText}
                >
                  <Image
                    source={require("../assets/images/icons/star.png")}
                    style={{ tintColor: "white" }}
                  />
                </Button>
              )}
              {photo ? (
                <Image
                  source={{ uri: photo }}
                  style={[styles.previewImage, { opacity: 0.6 }]}
                  onError={(e) => {
                    Alert.alert(
                      "Image Error",
                      "Failed to load the selected image"
                    );
                    setPhoto(null);
                  }}
                />
              ) : (
                <Text style={styles.imagePickerText}>Import an Image</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.container2}>
            <View style={styles.selectedColumn}>
              <View style={styles.textcont}>
                <Text style={styles.text}>{date}</Text>
              </View>
              <View style={styles.moodcont}>
                <LinearGradient
                  colors={[
                    "rgba(255, 151, 86, 0.7)",
                    "rgba(255, 251, 180, 0.7)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.gradient, { opacity: 0.6 }]}
                >
                  <BlurView intensity={100} tint="dark" style={styles.blurView}>
                    <Text
                      style={[
                        styles.gradientText,
                        { fontWeight: "700", fontSize: 13 },
                      ]}
                    >
                      🤔 Curious
                    </Text>
                  </BlurView>
                </LinearGradient>
                <LinearGradient
                  colors={["#222222", "#222222"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.gradient]}
                >
                  <MaterialIcons name="location-on" size={20} color="grey" />
                  <Text style={styles.textm}> {location}</Text>
                </LinearGradient>
                <LinearGradient
                  colors={["#222222", "#222222"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradient}
                >
                  <MaterialIcons name="wb-sunny" size={20} color="grey" />
                  <Text style={styles.textm}> 75* F</Text>
                </LinearGradient>
              </View>
            </View>
          </View>
          <View style={[styles.container3, { paddingHorizontal: 13 }]}>
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
          <View style={styles.container4}>
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
                  source={require("../assets/images/icons/start_record.png")}
                  style={styles.record}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.drawerButton}
                onPress={openDrawer}
              >
                <Image
                  source={require("../assets/images/icons/info.png")}
                  style={styles.drawer}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      {renderDrawerContent()}
    </KeyboardAvoidingView>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {renderMainContent()}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#222222",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
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
  bottomDrawerContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.95, // 80% of screen height
    backgroundColor: "#222222",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden", // This prevents content from showing outside rounded corners
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  drawerHandleContainer: {
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#FFAA2C",
  },
  drawerHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "white",
  },
  drawerScrollContent: {
    backgroundColor: "pink",
    // flex: 1,
    maxHeight: height * 0.95,
    // flex: 1,
    padding: 20,
  },
  container4_1: {
    // flex: 1,
    backgroundColor: "red",
    height: "100%",
  },
  drawerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  drawerText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 15,
  },
  inner_container: {
    width: width,
    height: height,
    backgroundColor: "black",
    flexDirection: "column",
  },
  container1: {
    width: width,
    height: height * 0.45,
    backgroundColor: "black",
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
  selectedColumn: {
    flexDirection: "column",
    borderRadius: 50,
    width: "80%",
    marginLeft: 20,
  },
  moodcont: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },
  textcont: {
    marginTop: 10,
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
  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Satoshi",
  },
  container4: {
    flex: 1,
    width: width,
    backgroundColor: "black",
  },
  record: {},
  drawer: {
    backgroundColor: "#222222",
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  container: {
    backgroundColor: "black",
    height: height,
    width: width,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
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
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  imagePickerText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  input: {
    width: width * 0.8,
    height: 50,
    backgroundColor: "#222222",
    color: "#FFFFFF",
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignSelf: "center",
  },
  submitButton: {
    backgroundColor: "#FFAE35",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
