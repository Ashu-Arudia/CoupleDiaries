import { View, Text, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function GetStarted() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      <Image
        source={require('../../assets/images/image-1.jpg')}
        style={styles.mainImage}
        resizeMode="cover"
      />

    
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

  
      <Text style={styles.description1}>Your Love, </Text>
      <Text style={styles.description1}>Wrapped Together</Text>
      <Text style={styles.description2}>
        Wrapped Together lets couples capture daily moments, share heartfelt
        videos, and relive their journey with beautifully crafted highlights
        that celebrate their love
      </Text>

      <View style={styles.buttonContainer}>
      <Text style={styles.button} onPress={() => router.push('/login')}>
        Get Started
      </Text>
      </View>
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
    width: '100%',
    height: 300,
    marginBottom: 30,
    
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
    marginTop:20,
    width:322,
    height:88,
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
    color: '#fff',
    backgroundColor: '#FFAE35',
    paddingVertical: 20,
    paddingHorizontal: 150,
    borderRadius: 5,
  },
});