// app/diary.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function DiaryPage() {
  const [currentTime, setCurrentTime] = useState(
    new Date()
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      .toUpperCase()
  );
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date()
          .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          .toUpperCase()
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.page2Container}>
      <View style={styles.container}>
        <Image
          source={require("../assets/images/Home_page_icons/pht1.jpg")}
          style={styles.photo_page2}
        />

        <View style={styles.box}>
          <View>
            <Text style={styles.text}>January 7, 2025 | Saturday</Text>
          </View>
          <View style={styles.row2}>
            <View style={styles.selectedColumn}>
              <LinearGradient
                colors={["rgba(255, 151, 86, 0.3)", "rgba(255, 251, 180, 0.3)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <Text style={styles.gradientText}>Happy</Text>
              </LinearGradient>
            </View>
            <View style={styles.column2}>
              <Text style={styles.text1}>Munich</Text>
            </View>
            <View style={styles.column2}>
              <Text style={styles.text1}>79* F</Text>
            </View>
          </View>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.time}>
            <Text style={styles.timeText}>{currentTime}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page2Container: {
    flexGrow: 1, // Ensures ScrollView content takes full height if needed
  },
  container: {
    backgroundColor: "black",
    width: width,
    minHeight: height, // Changed to minHeight to allow scrolling
  },
  photo_page2: {
    width: "100%",
    height: height * 0.45,
    resizeMode: "cover",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  box: {
    width: "80%",
    marginTop: 10,
    paddingLeft: 15,
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
    paddingBottom: 12,
  },
  row2: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 10,
    width: width * 0.55,
  },
  selectedColumn: {
    flex: 1,
    alignItems: "center",
    borderRadius: 50,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    padding: 8,
    width: "100%",
  },
  gradientText: {
    color: "#FFAA2C", // White text for contrast
    fontSize: 12,
    fontWeight: "500",
  },
  column2: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#323232",
    borderRadius: 50,
    padding: 8,
  },
  text1: {
    color: "#C3C3C3",
    fontSize: 12,
    fontWeight: "500",
  },
  contentContainer: {
    // padding: 15,
    // alignItems: "center",
    backgroundColor: "red", // For testing, change as needed
    marginTop: 30,
  },
  time: {},
  timeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
