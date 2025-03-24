import React, {useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, BackHandler } from 'react-native';
// import { DrawerLayout } from 'react-native-drawer-layout';
import { Stack, useRouter } from 'expo-router';

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
            <View style={[styles.card]}>


            <View style={[styles.container2, styles.box]}>
      {/* Back Profile Image */}
      <Image source={require('../assets/images/pp2.png')} style={[styles.image,styles.frontImage]}/>

      {/* Front Profile Image */}
      <Image source={require('../assets/images/pp3.png')} style={[styles.image,styles.backImage]}/>
      </View>   
          <View style={styles.box}>
          <Text style={[styles.cardTitle, {marginLeft: -35,marginTop:-30} ]}>You and Prudence's 8th Anniversary</Text>
          <Image source={require('../assets/images/Home_page_icons/glass.png')} style={[styles.image2]}/>
            </View>
          <View style={styles.box}>

              <View style={styles.row}>
        <View style={[styles.column , {borderTopLeftRadius:7,borderBottomLeftRadius:7,marginTop:-60 }]}>
          <Text style={styles.text1}>Days</Text>
          <Text style={styles.text}>{days}</Text>
        </View>
        <View style={[styles.column, {marginTop:-60} ]}>
          <Text style={styles.text1}>Hours</Text>
          <Text style={styles.text}>{hours}</Text>
        </View>
        <View style={[styles.column , {borderTopRightRadius:7,borderBottomRightRadius:7,marginTop:-60 }]}>
          <Text style={styles.text1}>Mins</Text>
          <Text style={styles.text}>{minutes}</Text>
        </View>
      </View>
            </View>
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
          <ScrollView contentContainerStyle={[styles.cardsContainer, styles.box]}>
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
  row: {
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    padding: 30,
    marginLeft:-15,
    marginRight:15,
  },
  column: {
    flex: 1, 
    alignItems: 'center', 
    backgroundColor: '#323232',
    padding: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight:500,
  },
  text1: {
    color: '#C3C3C3',
    fontSize: 12,
    fontWeight:500,
  },
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
  container2: {
    flexDirection: 'row',
    // alignItems: 'center',
  },
  box: {
    width: '80%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginLeft:-10,
  },
  image: {
    width: 60, 
    height: 60, 
    borderRadius: 40, 
    borderWidth: 3, 
    borderColor: '#fff',
  },
  backImage: {
    position: 'absolute',
    left: 50,
    zIndex: 1,
  },
  frontImage: {
    position: 'absolute',
    left: 10, 
    zIndex: 2,
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
    justifyContent:'flex-start',
    gap:10,
    backgroundColor: '#222222',
    borderRadius: 10,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    position:'relative',
    color: '#FFFFFF',
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
  image2:{
    resizeMode:'contain',
    position:'absolute',
    left:310,
    top:-50,
  
  },
});