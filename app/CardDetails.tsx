// app/CardDetails.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Map for initial cards' require results (update with actual numbers)
const assetMap: Record<string, any> = {
  "123": require("../assets/images/Home_page_icons/photo1.png"), // Replace with actual require numbers
  "124": require("../assets/images/Home_page_icons/photo2.png"),
};

export default function CardDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [cardDetails, setCardDetails] = useState({
    date: "",
    mood: "",
    location: "",
    temperature: "",
    photo: null as any,
  });

  useEffect(() => {
    const date = (params.date as string) || "N/A";
    const mood = (params.mood as string) || "N/A";
    const location = (params.location as string) || "N/A";
    const temperature = (params.temperature as string) || "N/A";
    let photoSource;

    const photoParam = params.photo as string;
    if (photoParam) {
      if (photoParam.startsWith("file://")) {
        photoSource = { uri: photoParam }; // URI from AddCard
      } else if (assetMap[photoParam]) {
        photoSource = assetMap[photoParam]; // Mapped require result
      } else {
        console.log("Invalid photo param:", photoParam);
        photoSource = require("../assets/images/Home_page_icons/photo1.png"); // Fallback
      }
    } else {
      photoSource = require("../assets/images/Home_page_icons/photo1.png");
    }

    if (
      date !== cardDetails.date ||
      mood !== cardDetails.mood ||
      location !== cardDetails.location ||
      temperature !== cardDetails.temperature ||
      photoSource !== cardDetails.photo
    ) {
      setCardDetails({
        date,
        mood,
        location,
        temperature,
        photo: photoSource,
      });
    }
  }, [
    params.date,
    params.mood,
    params.location,
    params.temperature,
    params.photo,
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={
            cardDetails.photo ||
            require("../assets/images/Home_page_icons/photo1.png")
          }
          style={styles.photo}
          defaultSource={require("../assets/images/Home_page_icons/photo1.png")}
          onError={(e) => console.log("Image load error:", e.nativeEvent)}
        />
        <View style={styles.detailsContainer}>
          <Text style={styles.dateText}>{cardDetails.date}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>Mood: {cardDetails.mood}</Text>
            <Text style={styles.infoText}>
              Location: {cardDetails.location}
            </Text>
            <Text style={styles.infoText}>
              Temperature: {cardDetails.temperature}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#222222",
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  photo: {
    width: width * 0.9,
    height: height * 0.4,
    resizeMode: "cover",
  },
  detailsContainer: {
    padding: 20,
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "column",
    gap: 5,
  },
  infoText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  backButton: {
    backgroundColor: "#FFAE35",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 20,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
