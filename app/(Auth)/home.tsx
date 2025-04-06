import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Dimensions,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUser } from "../UserContext";
import { Card, useAppStore } from "./store";

const { width, height } = Dimensions.get("window");
const ANNIVERSARY_DATE = new Date("2023-06-15");

export default function HomeScreen() {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [years, setYears] = useState(0);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ id: string; text: string }[]>([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Use the user context hook instead of local state
  const { userData } = useUser();
  const { username, age, date, partner_name, partner_email, isLoading, error } = userData;

  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const { cards, currentContent, setCurrentContent } = useAppStore();

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

      let yearsSince = today.getFullYear() - ANNIVERSARY_DATE.getFullYear();
      if (
        today.getMonth() < ANNIVERSARY_DATE.getMonth() ||
        (today.getMonth() === ANNIVERSARY_DATE.getMonth() &&
          today.getDate() < ANNIVERSARY_DATE.getDate())
      ) {
        yearsSince -= 1;
      }
      setYears(yearsSince);
    };

    calculateTimeRemaining();
    const intervalId = setInterval(calculateTimeRemaining, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (currentContent !== "default") {
          setCurrentContent("default");
          return true;
        }
        return false;
      }
    );
    return () => backHandler.remove();
  }, [currentContent, setCurrentContent]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = { id: Date.now().toString(), text: message };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      console.log("Message Sent to Partner:", message);
      setMessage("");
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleCardPress = (card: Card) => {
    router.push({
      pathname: "/CardDetails",
      params: {
        date: card.date,
        mood: card.mood,
        location: card.location,
        temperature: card.temperature,
        photo: card.photo,
      },
    });
  };

  const handleNavigation = (route: string) => {
    if (route) {
      router.push(route);
    }
  };

  const renderContent = () => {
    if (showNotifications) {
      // Render the notifications page
      return (
        <View style={styles.notificationsContainer}>
          <View style={styles.notificationHeader}>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.notificationHeaderTitle}>Notifications</Text>
            <View style={{width: 24}} />
          </View>
          <ScrollView contentContainerStyle={styles.notificationsContent}>
            {/* Sample notifications - you can replace with real data */}
            <View style={styles.notificationItem}>
              <View style={styles.notificationIcon}>
                <MaterialIcons name="favorite" size={24} color="#FF4081" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>Anniversary Coming Up!</Text>
                <Text style={styles.notificationText}>Your anniversary is in {days} days</Text>
                <Text style={styles.notificationTime}>2 hours ago</Text>
              </View>
            </View>

            <View style={styles.notificationItem}>
              <View style={styles.notificationIcon}>
                <MaterialIcons name="chat" size={24} color="#2196F3" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>New Message</Text>
                <Text style={styles.notificationText}>{partner_name || 'Your partner'} sent you a message</Text>
                <Text style={styles.notificationTime}>Yesterday</Text>
              </View>
            </View>

            <View style={styles.notificationItem}>
              <View style={styles.notificationIcon}>
                <MaterialIcons name="event-note" size={24} color="#4CAF50" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>New Memory Added</Text>
                <Text style={styles.notificationText}>{partner_name || 'Your partner'} added a new memory</Text>
                <Text style={styles.notificationTime}>2 days ago</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      );
    }

    switch (currentContent) {
      case "default":
        return (
          <ScrollView contentContainerStyle={styles.cardsContainer}>
            {/* {renderUserProfile()} */}
            <View style={[styles.card]}>
              <View style={[styles.container2, styles.box]}>
                <Image
                  source={require("../../assets/images/pp2.png")}
                  style={[styles.image, styles.frontImage]}
                />
                <Image
                  source={require("../../assets/images/pp3.png")}
                  style={[styles.image, styles.backImage]}
                />
              </View>
              <View style={[styles.box, { paddingTop: 20, paddingBottom: 20, position: 'relative' }]}>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      fontSize: 20,
                      flexWrap: 'wrap',
                      // textAlign: 'center',
                      width: '90%',
                    },
                  ]}
                  numberOfLines={undefined}
                >
                  You and {partner_name || 'Partner'}'s 8th Anniversary
                </Text>
                <View style={styles.boxImg}>
                  <Image
                    source={require("../../assets/images/Home_page_icons/glass.png")}
                    style={[styles.image2]}
                  />
                </View>
              </View>
              <View style={styles.box}>
                <View style={styles.row}>
                  <View
                    style={[
                      styles.column,
                      {
                        borderTopLeftRadius: 7,
                        borderBottomLeftRadius: 7,
                        marginTop: -60,
                      },
                    ]}
                  >
                    <Text style={styles.text1}>Days</Text>
                    <Text style={styles.text}>{days}</Text>
                  </View>
                  <View style={[styles.column, { marginTop: -60 }]}>
                    <Text style={styles.text1}>Hours</Text>
                    <Text style={styles.text}>{hours}</Text>
                  </View>
                  <View
                    style={[
                      styles.column,
                      {
                        borderTopRightRadius: 7,
                        borderBottomRightRadius: 7,
                        marginTop: -60,
                      },
                    ]}
                  >
                    <Text style={styles.text1}>Mins</Text>
                    <Text style={styles.text}>{minutes}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.card}>
              <View style={styles.card1}>
                <Image
                  source={require("../../assets/images/Home_page_icons/smiley.png")}
                  style={styles.smiley}
                />
                <Text style={styles.cardTitle}>What made you smile today?</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Write your answer"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Add your partner to share the Experience
              </Text>
              <View style={styles.partnerInviteContainer}>
                <Text style={styles.partnerInviteText}>
                  Send an invitation email to let your partner download the app and connect with you.
                </Text>
                <TouchableOpacity
                  style={styles.sendMailButton}
                  onPress={() => {
                    // Logic to send installation mail to partner email would go here
                    if (partner_email) {
                      console.log("Sending invitation to:", partner_email);
                      // Here you would implement the actual email sending functionality
                      alert(`Invitation email sent to ${partner_email}`);
                    } else {
                      alert("Please add your partner's email in settings first");
                      handleNavigation("/settings");
                    }
                  }}
                >
                  <MaterialIcons name="email" size={24} color="#FFFFFF" />
                  <Text style={styles.sendMailButtonText}>Send Invitation</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );
      case "page1":
        return (
          <ScrollView contentContainerStyle={[styles.cardsContainer]}>
            <Text style={styles.txt}>Our Entries</Text>
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.card2}
                onPress={() => handleCardPress(card)}
              >
                <View style={styles.play}>
                  <Image
                    source={require("../../assets/images/icons/play.png")}
                    style={[styles.playImg]}
                  />
                </View>
                <Image
                  source={
                    typeof card.photo === "string" &&
                    card.photo.startsWith("file://")
                      ? { uri: card.photo }
                      : (card.photo as number)
                  }
                  style={[styles.photo, { opacity: 0.6 }]}
                />
                <View style={styles.selectedColumn}>
                  <View style={styles.textcont}>
                    <Text style={styles.text}>{card.date}</Text>
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
                      <BlurView
                        intensity={50}
                        tint="dark"
                        style={styles.blurView}
                      >
                        <Text style={styles.gradientText}>{card.mood}</Text>
                      </BlurView>
                    </LinearGradient>
                    <LinearGradient
                      colors={[
                        "rgba(192, 192, 192, 0.5)",
                        "rgba(255, 255, 255, 0.5)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.gradient]}
                    >
                      <Text style={styles.textm}>{card.location}</Text>
                    </LinearGradient>
                    <LinearGradient
                      colors={[
                        "rgba(192, 192, 192, 0.5)",
                        "rgba(255, 255, 255, 0.5)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradient}
                    >
                      <Text style={styles.textm}>{card.temperature}</Text>
                    </LinearGradient>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );
      case "page2":
        handleNavigation("/add_card");
        return null;
      case "page3":
        return (
          <View style={styles.page3Container}>
            <ScrollView contentContainerStyle={styles.cardsContainer}>
              {messages.map((msg) => (
                <View key={msg.id} style={styles.messageBubble}>
                  <Text style={styles.messageText}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View
              style={[
                styles.messageInputContainer,
                { bottom: isKeyboardVisible ? 0 : 70 },
              ]}
            >
              <TextInput
                style={styles.messageInput}
                value={message}
                onChangeText={setMessage}
                placeholder="Type your message..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
              >
                <Image source={require("../../assets/images/icons/send.png")} />
              </TouchableOpacity>
            </View>
          </View>
        );
      case "page4":
        handleNavigation("/settings");
        return null;
      default:
        return null;
    }
  };

  // Add this where you want to display the user profile
  // const renderUserProfile = () => {
  //   if (isLoading) return <Text style={styles.loadingText}>Loading user information...</Text>;
  //   if (error) return <Text style={styles.errorText}>{error}</Text>;

  //   return (
  //     <View style={styles.profileContainer}>
  //       <Text style={styles.profileText}>Name: {username || 'Not set'}</Text>
  //       <Text style={styles.profileText}>Age: {age || 'Not set'}</Text>
  //       {date && <Text style={styles.profileText}>Date: {date}</Text>}
  //       <Text style={styles.profileText}>Partner: {partner_name || 'Not set'}</Text>
  //     </View>
  //   );
  // };
  return (
    <View style={styles.container}>
      {currentContent === "default" && !showNotifications ? (
        <View style={styles.header}>
          <TouchableOpacity style={styles.profilePicContainer}>
            <Image
              source={require("../../assets/images/pp2.png")}
              style={styles.profilePic}
            />
          </TouchableOpacity>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => setShowNotifications(true)}
          >
            <MaterialIcons name="notifications" size={28} color="#FFFFFF" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View></View>
      )}
      {renderContent()}
      {!isKeyboardVisible && !showNotifications && (
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentContent("default")}
          >
            <Image
              source={require("../../assets/images/Home_page_icons/home.png")}
              style={[
                styles.Icon,
                currentContent === "default" && { tintColor: "#FFAA2C" },
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentContent("page1")}
          >
            <Image
              source={require("../../assets/images/Home_page_icons/play.png")}
              style={[
                styles.Icon,
                currentContent === "page1" && { tintColor: "#FFAA2C" },
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => handleNavigation("/add_card")}
          >
            <Image
              source={require("../../assets/images/Home_page_icons/diary.png")}
              style={[
                styles.Icon2,
                currentContent === "page2" && { height: 60 },
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentContent("page3")}
          >
            <Image
              source={require("../../assets/images/Home_page_icons/user.png")}
              style={[
                styles.Icon,
                currentContent === "page3" && { tintColor: "#FFAA2C" },
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => handleNavigation("/settings")}
          >
            <Image
              source={require("../../assets/images/Home_page_icons/settings.png")}
              style={[
                styles.Icon,
                currentContent === "page4" && { tintColor: "#FFAA2C" },
              ]}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  playImg: {
    resizeMode: "contain",
    width: 50,
    height: 50,
  },
  play: {
    marginTop: 15,
    paddingLeft: 19,
  },
  selectedColumn: {
    flexDirection: "column",
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 50,
    width: width * 0.6,
    position: "absolute",
    bottom: 5,
  },
  moodcont: {
    flexDirection: "row",
    marginVertical: 17,
    gap: 8,
  },
  textcont: {},
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    padding: 8,
    width: "100%",
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
  },
  textm: {
    color: "#fff",
  },
  page3Container: {
    flex: 1,
    backgroundColor: "#000",
  },
  cardsContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 120,
  },
  messageBubble: {
    backgroundColor: "#323232",
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
    marginHorizontal: 15,
    maxWidth: "80%",
    alignSelf: "flex-end",
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  messageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
  },
  messageInput: {
    flex: 1,
    backgroundColor: "#222222",
    color: "#FFFFFF",
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#FFAE35",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: "#000",
  },
  profilePicContainer: {
    width: 45,
    height: 45,
  },
  profilePic: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  container2: {
    flexDirection: "row",
  },
  box: {
    width: "85%",
    minHeight: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginLeft: -10,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },
  backImage: {
    position: "absolute",
    left: 50,
    zIndex: 1,
  },
  frontImage: {
    position: "absolute",
    left: 10,
    zIndex: 2,
  },
  Icon: {
    resizeMode: "contain",
    width: 100,
    height: 30,
  },
  Icon2: {
    resizeMode: "contain",
    height: 50,
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: "contain",
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4081',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    gap: 10,
    backgroundColor: "#222222",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  card2: {
    flex: 1,
    marginBottom: 15,
    height: height * 0.3,
    width: width * 0.94,
  },
  photo: {
    borderRadius: 25,
    resizeMode: "cover",
    position: "absolute",
    height: height * 0.3,
    width: width * 0.94,
  },
  cardTitle: {
    position: "relative",
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 10,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  cardText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  contentText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 2,
    backgroundColor: "#111",
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  text1: {
    color: "#C3C3C3",
    fontSize: 12,
    fontWeight: "500",
  },
  txt: {
    textAlign: "center",
    padding: 15,
    color: "#FFFFFF",
    fontSize: 16,
  },
  input: {
    color: "#363636",
    width: width * 0.8,
    height: height * 0.05,
    borderColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 30,
    marginLeft: -15,
    marginRight: 15,
  },
  column: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#323232",
    padding: 8,
  },
  image2: {
    resizeMode: "contain",
    position: "absolute",
    width: 100,
  },
  boxImg: {
    position: "absolute",
    right: 10,
    top: -50,
  },
  smiley: {
    resizeMode: "contain",
    marginRight: 10,
  },
  card1: {
    flexDirection: "row",
  },
  profileContainer: {
    padding: 10,
  },
  profileText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  errorText: {
    color: "#FF0000",
    fontSize: 16,
  },
  notificationsContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  notificationHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationsContent: {
    paddingVertical: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  notificationText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 5,
  },
  notificationTime: {
    color: '#888888',
    fontSize: 12,
  },
  partnerInviteContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  partnerInviteText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  sendMailButton: {
    flexDirection: 'row',
    backgroundColor: '#FFAA2C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendMailButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
});
