import { View, Text, Image, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useRef, useEffect } from 'react';

export default function GetStarted() {
  const router = useRouter();
  const { width, height } = Dimensions.get('window');

  // Animation refs
  const fadeImage = useRef(new Animated.Value(0)).current;
  const slideLogo = useRef(new Animated.Value(-50)).current;
  const fadeText1 = useRef(new Animated.Value(0)).current;
  const slideText1 = useRef(new Animated.Value(20)).current;
  const fadeText2 = useRef(new Animated.Value(0)).current;
  const slideText2 = useRef(new Animated.Value(20)).current;
  const scaleButton = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeImage, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideLogo, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(fadeText1, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideText1, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(fadeText2, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideText2, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.spring(scaleButton, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/images/image-1.jpg')}
        style={[styles.mainImage, { opacity: fadeImage }]}
        resizeMode="contain"
      />
      <Animated.Image
        source={require('../../assets/images/logo.png')}
        style={[styles.logo, { transform: [{ translateY: slideLogo }] }]}
        resizeMode="contain"
      />
      <Animated.Text style={[styles.description1, { opacity: fadeText1, transform: [{ translateY: slideText1 }] }]}>Your Love,</Animated.Text>
      <Animated.Text style={[styles.description1, { opacity: fadeText1, transform: [{ translateY: slideText1 }] }]}>Wrapped Together</Animated.Text>
      <Animated.Text style={[styles.description2, { opacity: fadeText2, transform: [{ translateY: slideText2 }] }]}>Wrapped Together lets couples capture daily moments, share heartfelt videos, and relive their journey with beautifully crafted highlights that celebrate their love.</Animated.Text>
      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleButton }] }]}>
        <Text style={styles.button} onPress={() => router.push('/home')}>Get Started</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000',
    // justifyContent: 'center',
    paddingHorizontal: 20,
  },
  mainImage: {
    width: '100%',
    height: Dimensions.get('window').height * 0.4,
    marginBottom: 20,
  },
  logo: {
    width: 90,
    height: 100,
    marginBottom: 15,
  },
  description1: {
    fontFamily: 'Satoshi',
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.32,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  description2: {
    marginTop: 10,
    width: '90%',
    fontFamily: 'Satoshi',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.32,
    textAlign: 'center',
    color: '#C8C8C8',
  },
  buttonContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  button: {
    fontSize: 18,
    color: '#321E00',
    backgroundColor: '#FFAE35',
    paddingVertical: 15,
    paddingHorizontal: '30%',
    borderRadius: 10,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
});
