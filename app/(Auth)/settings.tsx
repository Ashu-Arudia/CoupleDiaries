import { MaterialIcons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
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
import { useUser } from "../UserContext";
import { useAppStore } from "./store";

const { width, height } = Dimensions.get("window");

export default function SettingsScreen() {
  const router = useRouter();
  const { setCurrentContent } = useAppStore();
  const [visibility, setVisibility] = useState(true);
  const { userData } = useUser();
  const { username, age, partner_name } = userData;

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

  const handleBackToHome = () => {
    setCurrentContent("default");
    router.replace("/home");
  };

  const handleSignOut = async () => {
    try {
      await auth().signOut();
      router.replace("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../../assets/images/arr.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* User Profile Section */}
        {/* <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Your Profile</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>Name:</Text>
            <Text style={styles.profileValue}>{username || 'Not set'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>Age:</Text>
            <Text style={styles.profileValue}>{age || 'Not set'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>Partner:</Text>
            <Text style={styles.profileValue}>{partner_name || 'Not set'}</Text>
          </View>
        </View> */}

        {/* Anniversary Card */}
        <View style={styles.anniversaryCard}>
          <View style={styles.profileImages}>
            <Image
              source={require("../../assets/images/pp2.png")}
              style={styles.profileImage}
            />
            <Image
              source={require("../../assets/images/pp2.png")}
              style={[styles.profileImage, styles.secondProfileImage]}
            />
          </View>
          <Text style={styles.anniversaryTitle}>
            You and {partner_name || 'Partner'} 8th Anniversary
          </Text>

          <View style={styles.celebrationIcon}>
            <Image
              source={require("../../assets/images/Home_page_icons/glass.png")}
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

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 15,
    paddingBottom: 20,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  profileSection: {
    marginTop: 30,
    padding: 16,
    backgroundColor: "#222",
    borderRadius: 10,
  },
  sectionTitle: {
    color: "#FFAA2C",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: "row",
    marginBottom: 10,
  },
  profileLabel: {
    color: "#FFFFFF",
    width: 80,
    fontSize: 16,
  },
  profileValue: {
    color: "#FFFFFF",
    fontSize: 16,
    flex: 1,
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
  signOutButton: {
    backgroundColor: "#FFAA2C",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 40,
  },
  signOutText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
