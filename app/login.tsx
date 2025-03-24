import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity,Dimensions, StyleSheet, Image } from 'react-native';
import * as Progress from 'react-native-progress';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
const { width,height } = Dimensions.get('window');

export default function App() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cnfPassword, setcnfPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [partner_name, set_p_name] = useState('');
  const [partner_email, set_p_email] = useState('');
  const [date, setDate] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCnfPassword, setShowCnfPassword] = useState(false);
  let next_btn = ""; 
  let prop = "";

  const progress = currentStep / 4;

  const validateStep = () => {
    if (currentStep === 1 && email.trim() === '') {
      alert('Credentials cannot be empty!');
      return false;
    }
    if (currentStep === 2 && otp.trim() === '') { 
      alert('OTP cannot be empty!');
      return false;
    }
    if (currentStep === 3 && name.trim() === '') {
      alert('All details are required!');
      return false;
    }
    if (currentStep === 4 && partner_name.trim() === '') {
      alert('All details are required!');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 5) {
      alert('Login Complete! Data: ' + JSON.stringify({ email, password, otp, bio }));
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        next_btn = "Send Confirmation OTP"; 
        return (
          <View>
            <Text style={styles.label}>Let's Create Your Account</Text>
            <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Your Email"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputWithIcon}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={!showPassword}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Image
                  source={
                    showPassword
                      ? require('../assets/images/eye-off.png') 
                      : require('../assets/images/eye-off.png')
                  }
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputWithIcon}
                value={cnfPassword}
                onChangeText={setcnfPassword}
                placeholder="Confirm Password"
                secureTextEntry={!showCnfPassword}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCnfPassword(!showCnfPassword)}
              >
                <Image
                  source={
                    showCnfPassword
                      ? require('../assets/images/eye-off.png') 
                      : require('../assets/images/eye-off.png')
                  }
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      case 2:
        next_btn = "Verify"; 
        return (
          <View>
            <Text style={styles.label}>
              We’ve sent you a 6-Digit OTP on {email}. Use it to verify
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputWithIcon}
                value={otp} 
                onChangeText={setOtp}
                placeholder="OTP"
                keyboardType="numeric" 
                secureTextEntry={!showPassword}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Image
                  source={
                    showPassword
                      ? require('../assets/images/eye-off.png') 
                      : require('../assets/images/eye-off.png')
                  }
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      case 3:
        next_btn="Get Started";
        return (
          <View>
            <Text style={styles.label}>Let’s Get to Know You!</Text>
            <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            </View>
            <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={age}
              keyboardType="numeric"
              onChangeText={setAge}
              placeholder="Your Age"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            </View>
          </View>
        );
      case 4:
        return (
            next_btn="Send Invitation Link",
          <View>
            <Text style={styles.label}>Tell us About Your Partner</Text>
            <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={partner_name}
              onChangeText={set_p_name}
              placeholder="Partner's Name"
              multiline
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            </View>
            <View style={styles.passwordContainer}>x
            <TextInput
              style={styles.input}
              value={partner_email}
              onChangeText={set_p_email}
              placeholder="Partner's Email"
              multiline
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            </View>
            <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="When did you guys started Dating?"
              multiline
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            </View>
          </View>
        );
      case 5: 
        next_btn = "Continue"; 
        return (
          <View>
         <View style={styles.img}>
          <Image
          source={require('../assets/images/tick.png')} 
          // style={styles.image}
        />
         </View>
              <View style={styles.doneContainer}>
            <Text style={[styles.doneText,{justifyContent:'center'}]}>You’re All Set Up</Text>
          </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      { currentStep < 5 && (
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.navButton, currentStep === 1 && styles.disabledButton]}
          onPress={handlePrevious}
          // disabled={currentStep === 1}
        >
          <Image
            source={require('../assets/images/arr.png')}
            style={styles.navButtonIcon}
          />
        </TouchableOpacity>
        <Progress.Bar
          progress={progress}
          width={250}
          color="#FFAE35"
          style={styles.progressBar}
        />
        <Text style={styles.stepText}>{currentStep}/4</Text>
      </View>
      )}
      <View style={styles.content}>{renderStep()}</View>

      <View style={styles.content2}>
     
    </View>
    {currentStep===5 ? (
    <View style={styles.btn_container}>
        <TouchableOpacity style={styles.fixedButton} onPress={() => router.push('/home')}>
          <Text style={styles.nextButton}>{next_btn}</Text>
        </TouchableOpacity>
        </View>
    ):(
    <View style={styles.btn_container}>
        <TouchableOpacity style={styles.fixedButton} onPress={handleNext} >
          <Text style={styles.nextButton}>{next_btn}</Text>
        </TouchableOpacity>
        </View>
    )
}
      </View>
  );
}

const styles = StyleSheet.create({
  img: {
    justifyContent: 'center',
    alignItems: 'center',
    position:'absolute',
    top:'30%',
    marginLeft:60,
  },
  image :{
    width: width * 0.25,
    height: height * 0.15,
    resizeMode: 'contain', 
    marginBottom: 20, 
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  progressBar: {
    marginLeft: 10,
    marginRight: 10,
  },
  stepText: {
    color: '#FFAE35',
    fontSize: 15,
    marginBottom: 5,
  },
  label: {
    lineHeight: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 18,
    width: width*0.8,
    marginLeft:20,
    padding:30,
    paddingLeft:-30,
  },
  box : {
    width: width * 0.8,
    height: height * 0.06,
    position:'relative',
  },
  input: {
    color: '#C8C8C8',
    width: width * 0.8,
    height: height * 0.06,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  passwordContainer: {
    width: width * 0.8,
    height: height * 0.06,
    position: 'relative',
    marginLeft:10,
    marginVertical:8,
  },
  inputWithIcon: {
    color: '#C8C8C8',
    width: width*0.8,
    height: height*0.06,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 20,
    // paddingRight: 50,
    borderRadius: 5,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: '#C8C8C8',
  },
  content: {
    justifyContent: 'center',
    flex:0,
  },
  content2: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  navButton: {
    backgroundColor: 'transparent',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    // marginLeft: -10,
    // marginRight: 20,
  },
  navButtonIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: 'transparent',
    opacity: 0.7,
  },
  nextButton: {
    fontFamily: 'Satoshi',
    fontSize: 18,
    color: '#321E00',
    backgroundColor: '#FFAE35',
    // paddingVertical: 15, 
    // paddingHorizontal: 100, 
    // margin:10,
    borderRadius: 10,
    textAlign: 'center', 
    lineHeight: 40, 
  },
  fixedButton: {
    width: width * 0.8, // Fixed width
    height: 50, // Fixed height
    backgroundColor: '#FFAE35',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:-100,
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  btn_container: {
    position:'absolute',
    bottom:10,
    paddingLeft:10,
    paddingRight:10,
    width: '100%',
    alignItems: 'center',
     paddingVertical: 15, 
    paddingHorizontal: 100,
  }
});