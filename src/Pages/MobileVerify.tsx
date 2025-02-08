import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation and useRoute from react-navigation
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Image, Linking, ToastAndroid } from "react-native";
import { Checkbox } from "react-native-paper";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';  
import api from "./Api";
import { SkypeIndicator } from "react-native-indicators";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from "react-redux";
import { updateUserData } from "./redux/Actions";
import messaging from '@react-native-firebase/messaging'
import { generateSignedUrl } from "./assets/aws";
import i18next from "i18next"; 
// import { generateSignedUrl } from "../Utils/aws";


export default function MobileVerify() {
  const Navigation = useNavigation();
  const dispatch = useDispatch();
  const [mobileNumber, setMobileNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const getFCMToken = async () => {
    try {
      await messaging().requestPermission();
      const fcmToken = await messaging().getToken();
      handleupdate(fcmToken)
      return fcmToken;
    } catch (error) {
      console.log("Error getting FCM token:", error);
      return null;
    }
  };
  

  const handleVerify = async () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
      setErrorMessage("Mobile number must be exactly 10 digits.");
      return;
    }
    setErrorMessage("");
    setLoading(true);
    try {
      const response = await api.get("/driver/getAll?fetchAll=true");
      if (!Array.isArray(response.data.data)) {
        console.error("Expected an array, but got:", response.data.data);
        setErrorMessage("Unexpected response format.");
        return;
      }
      const driver = response.data.data.find(
        (item) => String(item.mobileNumber) === String(mobileNumber)
      );

      if (driver) {
        // console.log("Driver found:", driver);
 
        const id = await AsyncStorage.getItem("Driver_id");
       
        if (!id) {  
          if(driver.profile.profilePicture){
          const url= await generateSignedUrl(driver.profile.profilePicture)||''
          await AsyncStorage.setItem("Profile_pic", url );
        }
          await AsyncStorage.setItem("Driver_id", driver._id);
          await AsyncStorage.setItem("Driver_name", driver.fullName );
          
          const language=driver.preferredLanguage
          if(language){
            let langCode = "en"; // Default to English
            if (language === "English") {
              langCode = "en";
            } else if (language === "Tamil") {
              langCode = "ta";
            } else if (language === "Malayalam") {
              langCode = "ma";
            } else if (language === "Hindi") {
              langCode = "hi";
            } else if (language === "Kannada") {
              langCode = "ka";
            } else if (language === "Telugu") {
              langCode = "te";
            }
          await AsyncStorage.setItem("language", langCode );
         i18next.changeLanguage(langCode)          
          }
          getFCMToken()
        }
       
      } else {
        console.log("No vendor found for this mobile number.");
        const newUserData = {
          mobileNumber: mobileNumber,
        };

        dispatch(updateUserData(newUserData));
        Navigation.navigate("Pages/Verify" as never);
        setErrorMessage("No Driver found with this mobile number.");
      }
    } catch (error) {
      console.log("Error during verification:", error);
      setErrorMessage("An error occurred while verifying the mobile number.");
    } finally {
      setLoading(false);
    }
  };
  const handleupdate = async(fcmToken:any)=>{
    setLoading(true)
    try{
      const id = await AsyncStorage.getItem("Driver_id")||''
      const response = await api.put(`driver/update/${id}`,{driverToken:fcmToken});
      
      ToastAndroid.show("Driver Logined Successfully",ToastAndroid.SHORT)
      Navigation.navigate("Components/Tabnavigation" as never);

    }catch(error)
    {
      console.log("error updating the token",error)
    }finally{
      setLoading(false)
    }
  }

  const handleResendCode = () => {
    console.log("Resending OTP code...");
  };


  const styles =  lightStyles 

  return (
    <>
{loading ? (
  <View style={styles.overlay}>
    <SkypeIndicator key="uniqueKey" color="white" size={30} />   
  </View>
) : null}

      <View style={styles.container}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollViewContent}
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Image source={require('./assets/images/icon.png')} style={styles.logo} />
            <Text style={styles.infoText}>WELCOME BACK</Text>
            <Text style={styles.instructionsText}>MOBILE NUMBER</Text>

            <TextInput
              keyboardType="numeric"
              placeholder="Enter your Mobile Number"
              value={mobileNumber}  
              onChangeText={setMobileNumber}  
              placeholderTextColor={"black"}
              style={styles.textInput}
            /> 
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <View style={{ padding: 20 }}>
              <View style={styles.checkboxContainer}>
                <Checkbox status="checked" onPress={() => {}} color="green" />
                <TouchableOpacity style={styles.resendTextContainer}
                  onPress={()=> Linking.openURL('https://landing-pg-u-turn.vercel.app/terms.html')}
                >
                  <Text style={styles.resendText}>
                    By continuing, you agree that you have read and accept our{" "}
                    <Text style={styles.resendLink}>T&Cs and Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
      
          <Image
            source={require('./assets/images/MobileVerify.jpg')}
            style={styles.bottomImage}
          />
        </KeyboardAwareScrollView> 
      </View>
    </>
  );
}



const lightStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  bottomImage: {
    position: 'absolute', // Fix it to the bottom
    width: '100%',
    height: '30%',
    resizeMode: 'cover',
    bottom: 0, // Keep the bottom image at the bottom of the screen
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    bottom: 5,
  },
  resendTextContainer: {
    justifyContent: "center",
    marginLeft: 10,
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    height: 50,
    marginTop: 20,
    width: '90%',
  },
  container: {
    flex: 1,
    backgroundColor: "white", // Light background color
  },
  content: {
    alignItems: 'center',
    flex: 1,
    paddingBottom: 50, // Add padding at the bottom to prevent overlap with the bottom image
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  infoText: {
    fontWeight: 'bold',
    color: "black", // Light text color
    fontSize: 24,
    textAlign: "center",
  },
  instructionsText: {
    fontSize: 12,
    color: '#000000',
    textAlign: "center",
    paddingHorizontal: 20,
  },
  verifyButton: {
    backgroundColor: "#FEC110",
    borderRadius: 15,
    padding: 10,
    width: '40%',
    alignItems: "center",
  },
  buttonText: {
    color: "black", // Light button text
    fontWeight: 'bold',
    fontSize: 18,
  },
  logo: {
    alignSelf: 'center',
    width: 150,
    height: 150,
    marginTop: 60,
  },
  resendText: {
    color: "black", // Light text color
    textAlign: "center",
  },
  resendLink: {
    color: '#EE0101',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
});

const darkStyles = StyleSheet.create({overlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
},
  bottomImage: {
    position: 'absolute', // Fix it to the bottom
    width: '100%',
    height: '40%',
    resizeMode: 'cover',
    bottom: 0, // Keep the bottom image at the bottom of the screen
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    bottom: 5,
  },
  resendTextContainer: {
    justifyContent: "center",
    marginLeft: 10,
  },
  textInput: {
    borderColor: '#444',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    height: 50,
    marginTop: 20,
    width: '90%',
    backgroundColor: '#333', // Dark background color
    color: 'white', // Dark text color
  },
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark background color
  },
  content: {
    alignItems: 'center',
    flex: 1,
    paddingBottom: 50, // Add padding at the bottom to prevent overlap with the bottom image
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  infoText: {
    fontWeight: 'bold',
    color: "white", // Dark theme text color
    fontSize: 24,
    textAlign: "center",
  },
  instructionsText: {
    fontSize: 12,
    color: 'white', // Dark theme text color
    textAlign: "center",
    paddingHorizontal: 20,
  },
  verifyButton: {
    backgroundColor: "#FEC110",
    borderRadius: 15,
    padding: 14,
    width: '40%',
    alignItems: "center",
  },
  buttonText: {
    color: "black", // Button text color for dark theme
    fontWeight: 'bold',
    fontSize: 18,
  },
  logo: {
    alignSelf: 'center',
    width: 150,
    height: 150,
    marginTop: 60,
  },
  resendText: {
    color: "white", 
    textAlign: "center",
  },
  resendLink: {
    color: '#EE0101',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
});
