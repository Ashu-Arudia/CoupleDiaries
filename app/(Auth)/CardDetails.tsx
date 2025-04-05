// app/CardDetails.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Map for initial cards' require results (update with actual numbers)
const assetMap: Record<string, any> = {
  "123": require("../../assets/images/Home_page_icons/photo1.png"),
  "124": require("../../assets/images/Home_page_icons/photo2.png"),
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

  const getMoodEmoji = (mood: string) => {
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
    return emojis[mood] || "🤔";
  };

  useEffect(() => {
    const date = (params.date as string) || "January 7, 2025";
    const mood = (params.mood as string) || "Happy";
    const location = (params.location as string) || "Munich";
    const temperature = (params.temperature as string) || "79° F";
    let photoSource;

    const photoParam = params.photo as string;
    if (photoParam) {
      if (photoParam.startsWith("file://")) {
        photoSource = { uri: photoParam }; // URI from AddCard
      } else if (assetMap[photoParam]) {
        photoSource = assetMap[photoParam]; // Mapped require result
      } else {
        console.log("Invalid photo param:", photoParam);
        photoSource = require("../../assets/images/Home_page_icons/photo1.png"); // Fallback
      }
    } else {
      photoSource = require("../../assets/images/Home_page_icons/photo1.png");
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

  const handleBackPress = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    // Extract day of week if it exists in the string
    const parts = dateString.split("|");
    if (parts.length > 1) {
      return parts[0].trim() + " | " + parts[1].trim();
    }

    // If no day of week in the string, add "Saturday" as default
    // This is just for demo purposes to match the image
    return dateString + " | Saturday";
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Back Button - Absolute positioned over everything */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Image
          source={require("../../assets/images/arr.png")}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Section */}
        <View style={styles.imageSection}>
          <Image
            source={
              cardDetails.photo ||
              require("../../assets/images/Home_page_icons/photo1.png")
            }
            style={styles.backgroundPhoto}
            defaultSource={require("../../assets/images/Home_page_icons/photo1.png")}
          />
        </View>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          {/* Date with Day */}
          <Text style={styles.dateText}>{formatDate(cardDetails.date)}</Text>

          {/* Mood, Location, Temperature Pills */}
          <View style={styles.pillsContainer}>
            {/* Mood Pill */}
            <LinearGradient
              colors={["#FF9856", "#FFFBB4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.pill, styles.moodPill]}
            >
              <Text style={styles.emoji}>{getMoodEmoji(cardDetails.mood)}</Text>
              <Text style={styles.pillText}>{cardDetails.mood}</Text>
            </LinearGradient>

            {/* Location Pill */}
            <View style={styles.pill}>
              <MaterialIcons name="location-on" size={18} color="#888" />
              <Text style={styles.pillText}>{cardDetails.location}</Text>
            </View>

            {/* Temperature Pill */}
            <View style={styles.pill}>
              <MaterialIcons name="wb-sunny" size={18} color="#888" />
              <Text style={styles.pillText}>{cardDetails.temperature}</Text>
            </View>
          </View>

          {/* Time Display */}
          <Text style={styles.timeText}>4:19 PM</Text>

          {/* Note Text Preview (just placeholder text to show the design) */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              So, today started out slow. I woke up around 7:30, and honestly, I
              felt kind of groggy. I think I need to start sleeping earlier.
              Coffee helped, though— always does.
            </Text>

            <Text style={styles.noteText}>
              Work was... fine. Actually, I had this moment where I felt super
              productive.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Play Button */}
      <View style={styles.playButtonContainer}>
        <TouchableOpacity style={styles.playButton}>
          <MaterialIcons name="play-arrow" size={40} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContainer: {
    flex: 1,
  },
  imageSection: {
    height: 400,
    width: width,
  },
  backgroundPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: "white",
  },
  contentContainer: {
    backgroundColor: "#000",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -25,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 100,
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "600",
    marginBottom: 10,
  },
  pillsContainer: {
    flexDirection: "row",
    marginVertical: 10,
    flexWrap: "wrap",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  moodPill: {
    backgroundColor: "#FF9856",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  emoji: {
    fontSize: 16,
    marginRight: 4,
  },
  pillText: {
    color: "#FFF",
    fontSize: 14,
  },
  timeText: {
    color: "#888",
    fontSize: 14,
    marginTop: 20,
    marginBottom: 10,
  },
  noteContainer: {
    marginBottom: 120,
  },
  noteText: {
    color: "#FFF",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
  playButtonContainer: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    zIndex: 10,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFAA2C",
    justifyContent: "center",
    alignItems: "center",
  },
});
