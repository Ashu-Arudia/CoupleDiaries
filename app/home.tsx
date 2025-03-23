import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';


const ANNIVERSARY_DATE = new Date('2023-06-15');

export default function HomeScreen() {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [years, setYears] = useState(0);

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

      // Calculate years since anniversary
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

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profilePicContainer}>
          <Image
            source={require('../assets/images/pp2.png')}
            style={styles.profilePic}
          />
        </TouchableOpacity>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
        />
        <TouchableOpacity style={styles.notificationButton}>
          <Image
            source={require('../assets/images/notification.png')}
            style={styles.notificationIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Cards Section */}
      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {/* Anniversary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>You and Prudence's
            8th Anniversary
          </Text>
          <Text style={styles.cardText}>
            Celebrating {years} year{years !== 1 ? 's' : ''} together!
          </Text>
          <Text style={styles.cardSubText}>
            Next Anniversary in {days} days, {hours} hours, {minutes} mins
          </Text>
          <Text style={styles.cardSubText}>
            Date: {ANNIVERSARY_DATE.toLocaleDateString()}
          </Text>
        </View>

        {/* Placeholder for Other Cards */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Card 2</Text>
          <Text style={styles.cardText}>More content coming soon...</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Card 3</Text>
          <Text style={styles.cardText}>More content coming soon...</Text>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
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
});