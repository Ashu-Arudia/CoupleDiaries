import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppStore } from "./store";

const { width, height } = Dimensions.get("window");

export default function SettingsScreen() {
  const router = useRouter();
  const { setCurrentContent } = useAppStore();
  const [visibility, setVisibility] = useState(true);

  // Anniversary countdown calculation
  const ANNIVERSARY_DATE = new Date("2023-06-15");
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const today = new Date();
      let nextAnniversary = new Date(ANNIVERSARY_DATE);
      nextAnniversary.setFullYear(today.getFullYear());

      if (today > nextAnniversary) {
        nextAnniversary.setFullYear(today.getFullYear() + 1);
      }

      const timeDifference = nextAnniversary.getTime() - today.getTime();

      if (timeDifference > 0) {
        const daysRemaining = Math.floor(
          timeDifference / (1000 * 60 * 60 * 24)
        );
        const hoursRemaining = Math.floor(
          (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutesRemaining = Math.floor(
          (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
        );

        setDays(daysRemaining);
        setHours(hoursRemaining);
        setMinutes(minutesRemaining);
      } else {
        setDays(0);
        setHours(0);
        setMinutes(0);
      }
    };

    calculateTimeRemaining();
    const intervalId = setInterval(calculateTimeRemaining, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    router.replace("/login");
  };

  const handleBackToHome = () => {
    setCurrentContent("default");
    router.replace("/home");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButtonMinimal}
        onPress={handleBackToHome}
      >
        <Image
          source={require("../assets/images/arr.png")}
          style={styles.backIconMinimal}
        />
      </TouchableOpacity>

      <ScrollView style={styles.scrollContainer}>
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.profilePicContainer} onPress={handleBackToHome}>
            <Image
              source={require("../assets/images/pp2.png")}
              style={styles.profilePic}
            />
          </TouchableOpacity>
          <Text style={styles.userName}>Alif Mahmud</Text>
          <Text style={styles.userHandle}>@alifmahmud</Text>
          <TouchableOpacity style={styles.editButton}>
            <MaterialIcons name="edit" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Anniversary Card */}
        <View style={styles.anniversaryCard}>
          <View style={styles.profileImages}>
            <Image
              source={require("../assets/images/pp2.png")}
              style={styles.profileImage}
            />
            <Image
              source={require("../assets/images/pp2.png")}
              style={[styles.profileImage, styles.secondProfileImage]}
            />
          </View>
          <Text style={styles.anniversaryTitle}>
            You and Prudence's 8th Anniversary
          </Text>

          <View style={styles.celebrationIcon}>
            <Image
              source={require("../assets/images/Home_page_icons/glass.png")}
              style={styles.champagneIcon}
            />
          </View>

          <View style={styles.countdownContainer}>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownValue}>{days}</Text>
              <Text style={styles.countdownLabel}>Days</Text>
            </View>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownValue}>{hours}</Text>
              <Text style={styles.countdownLabel}>Hours</Text>
            </View>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownValue}>{minutes}</Text>
              <Text style={styles.countdownLabel}>Mins</Text>
            </View>
          </View>
        </View>

        {/* Partner Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PARTNER</Text>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="person-add" size={24} color="#888" />
            <Text style={styles.settingText}>Add Partner</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="notifications" size={24} color="#888" />
            <Text style={styles.settingText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="music-note" size={24} color="#888" />
            <Text style={styles.settingText}>Themes & Music</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY</Text>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="enhanced-encryption" size={24} color="#888" />
            <Text style={styles.settingText}>End to end Encryption</Text>
          </TouchableOpacity>
          <View style={styles.settingItem}>
            <MaterialIcons name="visibility" size={24} color="#888" />
            <Text style={styles.settingText}>Visibility</Text>
            <View style={styles.switchContainer}>
              <Switch
                value={visibility}
                onValueChange={setVisibility}
                trackColor={{ false: "#444", true: "#FFAA2C" }}
                thumbColor={"#fff"}
              />
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#ffffff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  profilePicContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    marginBottom: 10,
  },
  profilePic: {
    width: "100%",
    height: "100%",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
    color: "#888888",
    marginBottom: 10,
  },
  editButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#333333",
  },
  anniversaryCard: {
    backgroundColor: "#222222",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  profileImages: {
    flexDirection: "row",
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#000000",
  },
  secondProfileImage: {
    marginLeft: -15,
  },
  anniversaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 15,
    textAlign: "center",
  },
  celebrationIcon: {
    marginBottom: 10,
  },
  champagneIcon: {
    width: 40,
    height: 40,
  },
  countdownContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  countdownItem: {
    alignItems: "center",
  },
  countdownValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  countdownLabel: {
    fontSize: 12,
    color: "#888888",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 10,
    fontWeight: "600",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222222",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingText: {
    fontSize: 16,
    color: "#ffffff",
    marginLeft: 10,
    flex: 1,
  },
  switchContainer: {
    marginLeft: "auto",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222222",
    padding: 16,
    borderRadius: 10,
    marginVertical: 20,
  },
  logoutText: {
    fontSize: 16,
    color: "#ffffff",
    marginLeft: 10,
    fontWeight: "500",
  },
  backButtonMinimal: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 999,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  backIconMinimal: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
});