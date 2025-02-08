import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Image, BackHandler } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

function VendorVerify() {
  const Navigation = useNavigation();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const inputRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeIndex > 0) {
        handleBackspace();
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    });

    return () => backHandler.remove();
  }, [activeIndex]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.replace(/[^0-9]/g, ''); 
    setOtp(newOtp);

    // Move to next input if a digit is entered
    if (text && index < 3) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1].focus();
    }
  };

  const handleBackspace = () => {
    // If current input is empty, move to previous input
    if (activeIndex > 0) {
      const newOtp = [...otp];
      // Clear current input if it has a value, otherwise move back
      if (newOtp[activeIndex]) {
        newOtp[activeIndex] = '';
      } else {
        newOtp[activeIndex - 1] = '';
        setActiveIndex(activeIndex - 1);
        inputRefs.current[activeIndex - 1].focus();
      }
      setOtp(newOtp);
    }
  };

  const handleKeyPress = ({ nativeEvent: { key } }) => {
    if (key === 'Backspace') {
      handleBackspace();
    }
  };
  const handleVerify = () => {
    const otpString = otp.join('');
    const staticOtp = '1234'; // Static OTP to validate against

    if (otpString === staticOtp) {
      // OTP is correct, navigate to the next page
      Navigation.navigate('Pages/Language' as never);
    } else {
      // OTP is incorrect, show error message
      setErrorMessage('Invalid OTP. Please try again.');
    }
  };

  const handleResendCode = () => {
    console.log("Resending OTP code...");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => Navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={30} color="black" />
          <Text style={styles.text}>Verify OTP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpButton} onPress={() => Navigation.navigate('Components/Help' as never)}>
          <Text style={{ fontWeight: 'bold' }}>? Help</Text>
        </TouchableOpacity>
      </View>

      <Image source={require('./assets/images/icon.png')} style={styles.logo} />

      <View style={styles.content}>
        <Text style={styles.infoText}>ENTER YOUR CODE</Text>
        <Text style={styles.instructionsText}>
          ENTER THE CODE THAT WE HAVE SENT TO YOUR MOBILE NUMBER
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            style={[styles.otpInput]}
            placeholder="0"
            placeholderTextColor={'gray' }
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={handleKeyPress}
            onFocus={() => setActiveIndex(index)}
          />
          ))}
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResendCode}>
          <Text style={styles.resendText}>
            Didn’t receive the OTP yet?{' '}
            <Text style={styles.resendLink}>Resend code</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default VendorVerify;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  
    marginBottom: 10,
  },
  helpButton: {
    backgroundColor: "#FEC110",
    borderRadius: 15,
    padding: 5,
    // width: 100,
    paddingHorizontal:10,
    alignItems: "center",
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: "black",
    fontSize: 19,
    marginLeft: 8,
  },
  resendText: {
    color: "black",
    textAlign: "center",
    marginBottom: 20,
  },
  resendLink: {
    color: '#EE0101',
    textDecorationLine: 'underline',
  },
  logo: {
    alignSelf: 'center',
    marginVertical: 20,
    width: 150,
    height: 150,
  },
  content: {
    alignItems: 'center',
    marginBottom: 90,
  },
  infoText: {
    fontWeight: 'bold',
    color: "black",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 12,
    color: '#000000',
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: 45,
    textAlign: 'center',
    fontSize: 24,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  verifyButton: {
    backgroundColor: "#FEC110",
    borderRadius: 15,
    padding: 8,
    // width: '50%',
    paddingHorizontal:35,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "black",
    fontWeight:'bold',
    fontSize: 18,
  },
  errorText: {
    color: 'red', // Red text color for error
    fontSize: 14,
    margin:10
  },
});
