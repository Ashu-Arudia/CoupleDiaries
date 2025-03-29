// app/AddCard.tsx
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppStore } from "./store";

const { width, height } = Dimensions.get("window");

export default function AddCard() {
  const [date, setDate] = useState("");
  const [mood, setMood] = useState("");
  const [location, setLocation] = useState("");
  const [temperature, setTemperature] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const router = useRouter();
  const { addCard, setCurrentContent } = useAppStore();

  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access gallery is required!"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Correct enum usage
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const tempUri = result.assets[0].uri;
        // console.log("Image selected (temp):", tempUri);

        // Move to persistent storage
        const fileName = `image-${Date.now()}.jpeg`;
        const persistentUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.moveAsync({
          from: tempUri,
          to: persistentUri,
        });

        // console.log("Image moved to persistent URI:", persistentUri);
        setPhoto(persistentUri);
      }
    } catch (error) {
      console.error("Error picking or moving image:", error);
      Alert.alert("Error", "Failed to pick or save image. Please try again.");
    }
  };

  const handleSubmit = () => {
    if (!date || !mood) {
      Alert.alert(
        "Missing Information",
        "Please enter at least a date and mood!"
      );
      return;
    }

    const cardData = {
      date,
      mood,
      location: location || "Unknown",
      temperature: temperature || "N/A",
      photo: photo || "",
    };

    console.log("Submitting card:", cardData);
    addCard(cardData);
    setCurrentContent("page1");
    router.replace({ pathname: "/" });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* <Text style={styles.title}>Add New Card</Text> */}
        <View style={styles.inner_container}>
          <View style={styles.pick_image}>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {photo ? (
                <Image
                  source={{ uri: photo }}
                  style={styles.previewImage}
                  onError={(e) => {
                    // console.log("Preview image error:", e.nativeEvent);
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
          <TextInput
            style={styles.input}
            placeholder="Date (e.g., January 7, 2025 | Saturday)"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={date}
            onChangeText={setDate}
            editable={true}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Mood (e.g., Happy)"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={mood}
            onChangeText={setMood}
            editable={true}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Location (e.g., Munich)"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={location}
            onChangeText={setLocation}
            editable={true}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Temperature (e.g., 79° F)"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={temperature}
            onChangeText={setTemperature}
            editable={true}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inner_container: {
    width: width,
    height: height,
    backgroundColor: "red",
    flexDirection: "column",
  },
  pick_image: {
    width: width,
    // backgroundColor: "#222222",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
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
    height: height * 0.45,
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
