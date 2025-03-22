import { View, Text, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useRef, useEffect } from 'react';

export default function GetStarted() {
  const router = useRouter();


  const fadeImage = useRef(new Animated.Value(0)).current; 
  const slideLogo = useRef(new Animated.Value(-50)).current; 
  const fadeText1 = useRef(new Animated.Value(0)).current; 
  const slideText1 = useRef(new Animated.Value(20)).current; 
  const fadeText2 = useRef(new Animated.Value(0)).current; 
  const slideText2 = useRef(new Animated.Value(20)).current; 
  const scaleButton = useRef(new Animated.Value(0.8)).current; 

  
  useEffect(() => {
    Animated.parallel([
      
      Animated.timing(fadeImage, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
   
      Animated.timing(slideLogo, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      
      Animated.sequence([
        Animated.delay(200), 
        Animated.parallel([
          Animated.timing(fadeText1, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(slideText1, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
      ]),
     
      Animated.sequence([
        Animated.delay(400), 
        Animated.parallel([
          Animated.timing(fadeText2, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(slideText2, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
      ]),
     
      Animated.sequence([
        Animated.delay(600), 
        Animated.spring(scaleButton, {
          toValue: 1,
          friction: 6, 
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeImage, slideLogo, fadeText1, slideText1, fadeText2, slideText2, scaleButton]);

  return (
    <View style={styles.container}>
      {/* Animated Main Image */}
      <Animated.Image
        source={require('../../assets/images/image-1.jpg')}
        style={[styles.mainImage, { opacity: fadeImage }]}
        resizeMode="cover"
      />

      {/* Animated Logo */}
      <Animated.Image
        source={require('../../assets/images/logo.png')}
        style={[styles.logo, { transform: [{ translateY: slideLogo }] }]}
        resizeMode="contain"
      />

      {/* Animated Description 1 */}
      <Animated.Text
        style={[
          styles.description1,
          { opacity: fadeText1, transform: [{ translateY: slideText1 }] },
        ]}
      >
        Your Love,
      </Animated.Text>
      <Animated.Text
        style={[
          styles.description1,
          { opacity: fadeText1, transform: [{ translateY: slideText1 }] },
        ]}
      >
        Wrapped Together
      </Animated.Text>

      {/* Animated Description 2 */}
      <Animated.Text
        style={[
          styles.description2,
          { opacity: fadeText2, transform: [{ translateY: slideText2 }] },
        ]}
      >
        Wrapped Together lets couples capture daily moments, share heartfelt
        videos, and relive their journey with beautifully crafted highlights
        that celebrate their love
      </Animated.Text>

      {/* Animated Button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          { transform: [{ scale: scaleButton }] },
        ]}
      >
        <Text style={styles.button} onPress={() => router.push('/login')}>
          Get Started
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000',
  },
  mainImage: {
    width: Dimensions.get('window').width,
    height: 300,
    marginBottom: 30,
    marginTop: 0,
  },
  logo: {
    width: 90,
    height: 100,
    marginBottom: 20,
  },
  description1: {
    fontFamily: 'Satoshi',
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.32,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  description2: {
    marginTop: 20,
    width: 322,
    height: 88,
    fontFamily: 'Satoshi',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.32,
    textAlign: 'center',
    color: '#C8C8C8',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  button: {
    fontSize: 18,
    color: '#321E00',
    backgroundColor: '#FFAE35',
    paddingVertical: 20,
    paddingHorizontal: 150,
    borderRadius: 5,
  },
});