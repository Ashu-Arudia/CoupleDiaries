import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, BackHandler } from 'react-native';

const ANNIVERSARY_DATE = new Date('2023-06-15');

export default function HomeScreen() {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [years, setYears] = useState(0);
  const [currentContent, setCurrentContent] = useState('default'); // State to track content layer

  // Anniversary calculation
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
        const daysRemaining = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hoursRemaining = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesRemaining = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

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
        (today.getMonth() === ANNIVERSARY_DATE.getMonth() && today.getDate() < ANNIVERSARY_DATE.getDate())
      ) {
        yearsSince -= 1;
      }
      setYears(yearsSince);
    };

    calculateTimeRemaining();
    const intervalId = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentContent !== 'default') {
        setCurrentContent('default'); // Reset to default content
        return true; // Prevent app exit
      }
      return false; // Allow app exit if already on default
    });

    return () => backHandler.remove(); // Cleanup on unmount
  }, [currentContent]);

  // Render content based on currentContent state
  const renderContent = () => {
    switch (currentContent) {
      case 'default':
        return (
          <ScrollView contentContainerStyle={styles.cardsContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>You and Prudence's 8th Anniversary</Text>
              <Text style={styles.cardText}>
                Celebrating {years} year{years !== 1 ? 's' : ''} together!
              </Text>
              <Text style={styles.cardSubText}>
                Next Anniversary in {days} days, {hours} hours, {minutes} mins
              </Text>
              <Text style={styles.cardSubText}>Date: {ANNIVERSARY_DATE.toLocaleDateString()}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Card 2</Text>
              <Text style={styles.cardText}>More content coming soon...</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Card 3</Text>
              <Text style={styles.cardText}>More content coming soon...</Text>
            </View>
          </ScrollView>
        );
      case 'page1':
        return (
          <ScrollView contentContainerStyle={styles.cardsContainer}>
          <View style={styles.contentContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Card 2</Text>
              <Text style={styles.cardText}>More content coming soon...</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Card 3</Text>
              <Text style={styles.cardText}>More content coming soon...</Text>
            </View>
          </View>
          </ScrollView>
        );
      case 'page2':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>Welcome to Page 2 Content!</Text>
          </View>
        );
      case 'page3':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>Welcome to Page 3 Content!</Text>
          </View>
        );
      case 'page4':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>Welcome to Page 4 Content!</Text>
          </View>
        );
      case 'page5':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>Welcome to Page 5 Content!</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profilePicContainer}>
          <Image source={require('../assets/images/pp2.png')} style={styles.profilePic} />
        </TouchableOpacity>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <TouchableOpacity style={styles.notificationButton}>
          <Image source={require('../assets/images/notification.png')} style={styles.notificationIcon} />
        </TouchableOpacity>
      </View>

      {/* Dynamic Content Section */}
      {renderContent()}

      {/* Bottom Navigation Buttons */}
      
      <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navButton} onPress={() => setCurrentContent('default')}>
          <Image source={require('../assets/images/Home_page_icons/home.png')} style={[styles.Icon, currentContent == 'default' && { tintColor: '#FFAA2C' }]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentContent('page1')}>
          <Image source={require('../assets/images/Home_page_icons/play.png')} style={[styles.Icon, currentContent == 'page1' && {tintColor: '#FFAA2C'}]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentContent('page2')}>
          <Image source={require('../assets/images/Home_page_icons/diary.png')} style={[styles.Icon2, currentContent == 'page2' && {height: 60}]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentContent('page3')}>
          <Image source={require('../assets/images/Home_page_icons/user.png')} style={[styles.Icon, currentContent == 'page3' && {tintColor: '#FFAA2C'}]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentContent('page4')}>
          <Image source={require('../assets/images/Home_page_icons/settings.png')} style={[styles.Icon, currentContent == 'page4' && {tintColor: '#FFAA2C'}]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: '#000',
  },
  profilePicContainer: {
    width: 45,
    height: 45,
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  Icon: {
    resizeMode:'contain',
    width:100,
    height:30,
  },
  Icon2: {
    resizeMode:'contain',
    height:50,
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    width: 55,
    height: 55,
  },
  cardsContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    color: '#FFAE35',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
  },
  cardSubText: {
    color: '#C8C8C8',
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  contentText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 15,
    backgroundColor: '#111',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  navButtonText: {
    color: '#FFAE35',
    fontSize: 16,
    fontWeight: '600',
  },
});