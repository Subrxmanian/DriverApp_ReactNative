import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ToastAndroid,
  Platform,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera } from 'react-native-image-picker'; 
import Icon from 'react-native-vector-icons/Ionicons'; 
import { SkypeIndicator } from "react-native-indicators";
import { useTranslation } from 'react-i18next';

export default function TripVerify() {
  const Navigation = useNavigation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit OTP
  const [speed, setspeed] = useState(['', '', '', '']); 
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const {t}=useTranslation()
  const speedRefs = useRef([]);
  const route = useRoute();
  const [driverid, setDriverId] = useState('');
  const { id ,flag} = route.params as { id: string,flag:any };
  const [imageuri, setimageuri] = useState('');
  const [imagekey,setimagekey]=useState('')
  const [errors,seterrors]=useState({speedometer:"",
    otp:'',
    speed:'',
    image:"",
  })
  const showToast = (type, title, message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(title, message);
    }
  };
  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text.replace(/[^0-9]/g, ''); // Allow only numbers
    setOtp(newOtp);

    // Move to the next field if text is entered
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Move to the previous field on backspace
    if (!text && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleChangespeed = (text, index) => {
    const newSpeed = [...speed];
    newSpeed[index] = text.replace(/[^0-9]/g, ''); // Allow only numbers
    setspeed(newSpeed);

    // Move to the next field if text is entered
    if (text && index < 3) {
      speedRefs.current[index + 1].focus();
    }

    // Move to the previous field on backspace
    if (!text && index > 0) {
      speedRefs.current[index - 1].focus();
    }
  };

  const validateOtp = () => {
    let valid = true;
  
    let updatedErrors = { ...errors };
  
    if (speed.some(value => value === '')) {
      updatedErrors.otp = "OTP fields are required";
      valid = false;
    } else {
      updatedErrors.otp = '';  }
  
    if (otp.some(value => value === '')) {
      updatedErrors.speed = "Start Km fields are required";
      valid = false;
    } else {
      updatedErrors.speed = ''; // Clear speed error if valid
    }
  
    // Check if imageuri is empty
    if (!imageuri) {
      updatedErrors.image = "Image is required";
      valid = false;
    } else {
      updatedErrors.image = ''; // Clear image error if valid
    }
  
    // Optionally, check for speedometer error (if relevant)
    if (!speed) {  // Assuming speedometer is a variable
      updatedErrors.speedometer = "Speedometer is required";
      valid = false;
    } else {
      updatedErrors.speedometer = ''; // Clear speedometer error if valid
    }
  
    // Update the errors state
    seterrors(updatedErrors);
  
    console.log(updatedErrors); // To check the final error object
    return valid;
  };
  const handleVerify = async () => {
    if (validateOtp()) {
      
      try {
        setLoading(true);
        const OTP = otp.join('');
        if(imagekey){

        const response = await api.put(`/trip/${id}/live`, {
          tripStatus: 'Live',
          driverId: driverid,
          otp: speed.join(''),
          startKm: OTP, //6 digits
          startKmImg: imagekey,
        })

        setLoading(false);
        await AsyncStorage.setItem('tripID', id);
        showToast('success', 'OTP Verified!', `${response.data.message}`);
        Navigation.navigate('Components/Tabnavigation' as never);
      }
        
      } catch (error) {
        console.log('Error updating to Live:', error);
        
        setLoading(false);
      }
    } 
  };
  const pickImage = async () => {
      try {
        // Define camera options
        const options = {
          mediaType: 'photo', // Ensures only photos can be taken
          quality: 0.8, // Adjust image quality (0 to 1)
          saveToPhotos: true, // Optional: Saves the image to the photo gallery
        };
    
        // Launch the camera
        const result = await launchCamera(options);
    
        // If the user canceled the image picking
        if (result.didCancel) {
          ToastAndroid.show("No image selected or the image pick was canceled.",ToastAndroid.SHORT);
          return;
        }
    
        if (result.errorCode) {
          console.error("Error picking image: ", result.errorMessage);
          // alert("An error occurred while picking the image. Please try again.");
          return;
        }
    
        // Handle the selected image
        if (result.assets && result.assets[0].uri) {
          const fileUri = result.assets[0].uri;
          const file = {
            uri: fileUri,
            name: 'Speedometer.png', // You can modify the name as needed
            type: 'image/png', // Ensure correct MIME type
          };
          setimageuri(fileUri)
          handleFileChange(file); // Handle file upload or processing
        }
      } catch (error) {
        console.error("Error picking image: ", error);
        ToastAndroid.show("An error occurred while picking the image. Please try again.",ToastAndroid.SHORT);
      }
    };
    
    const handleFileChange = async (file:any)=>{
      setLoading(true)
      try {
        const formData = new FormData(); 
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: file.type,
          size: file.size,
        }); 
  
        const response = await fetch(
          "https://u-turn-be-dev.vercel.app/api/file/upload",
          {
            method: "POST",
            body: formData,
          }
        ); 
        const data = await response.json();
        if (response.ok) {  
          setimagekey(data.data)  
          
         
        } else { 
          console.error("Error: ",data.message);
        }
      } catch (error) { 
        console.error("Uploading error", error);
      }finally{
        setLoading(false)
      }
    } 

  useEffect(() => {
    const fetch = async () => {
      const id1 = (await AsyncStorage.getItem('Driver_id')) || '';
      setDriverId(id1);
    };
    fetch();
  }, []);

  return (
    <>
    {loading ? (
          <View style={styles.overlay}>
            <SkypeIndicator color="white" size={30} />
          </View>
        ) : null}
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', padding: 20 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>{ if(!flag){
              Navigation.goBack()}}}
            style={styles.backButton}
          >
            <Icon name="chevron-back" size={30} color="black" />
            <Text style={styles.text}>{t("Back")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => Navigation.navigate('Components/Help')}
          >
            <Text style={{ fontWeight: 'bold' }}>? {t("Help")}</Text>
          </TouchableOpacity>
        </View>

        <Image source={require('./assets/images/icon.png')} style={styles.logo} />

        <View style={styles.content}>
          <Text style={styles.infoText}>{t("ENTER THE CODE")}</Text>
          <Text style={styles.instructionsText}>
            {t("ENTER THE CODE THAT WE HAVE TO VERIFYING THE CUSTOMER AND TRIP")}
          </Text>

          <Text style={styles.head}>{t("Enter the Start KM")} :</Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                style={styles.otpInput}
                placeholder="0"
                placeholderTextColor="gray"
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onFocus={() => setOtp([...otp])}
              />
            ))}
          </View>

          {errors.speed ? <Text style={styles.errorText}>{errors.speed}</Text> : null}

          <Text style={styles.head}>{t("Enter the OTP")} :</Text>
          <View style={styles.otpContainer}>
            {speed.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => (speedRefs.current[index] = el)}
                style={styles.otpInput}
                placeholder="0"
                placeholderTextColor="gray"
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChangespeed(text, index)}
                onFocus={() => setspeed([...speed])}
              />
            ))}
          </View>
          {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}
          <Text style={styles.head}>{t("Take a Photo ")}: </Text>
          {imageuri ? (
            <Image
              source={{ uri: imageuri }}
              style={{ height: 100, width: '80%', alignSelf: 'center', marginBottom: 10 }}
            />
          ) : null}
          <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
            <Icon name="camera" size={20} />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}
          <TouchableOpacity
            style={[styles.verifyButton]}
            onPress={handleVerify}
            
          >
            <Text style={styles.buttonText}>{t("Submit")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  head: {
    color: 'red',
    fontSize: 18,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  helpButton: {
    backgroundColor: '#FEC110',
    borderRadius: 15,
    padding: 10,
    width: 100,
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: 'black',
    fontSize: 19,
    marginLeft: 8,
  },
  logo: {
    alignSelf: 'center',
    width: 150,
    height: 150,
  },
  content: {
    alignItems: 'center',
  },
  infoText: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#FEC110',
    borderRadius: 15,
    padding: 10,
    width: '50%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cameraButton: {
    backgroundColor: '#ccc',
    borderRadius: 10,
    flexDirection: 'row',
    padding: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
});
