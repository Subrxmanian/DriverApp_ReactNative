
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View, Text, Image, TextInput, Platform, ScrollView, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import  MaterialIcons  from "react-native-vector-icons/MaterialIcons";
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import { useDispatch, useSelector } from "react-redux";
import { updateUserData } from "../redux/Actions"; 
import { SkypeIndicator } from "react-native-indicators";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

function DrivingLicence() {
  const Navigation = useNavigation();
  const [date, setDate] = useState(new Date());
  const [textFieldValue, setTextFieldValue] = useState("");
  const dispatch = useDispatch();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [frontImageUri1, setFrontImageUri1] = useState<string | null>(null);
  const [backImageUri1, setBackImageUri1] = useState<string | null>(null);
  const [frontImageUri, setFrontImageUri] = useState<string | null>(null);
  const [backImageUri, setBackImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {t}=useTranslation()
  const [errors, setErrors] = useState({
    frontImage: "",
    backImage: "",
    licenseNumber: "",
    expiryDate: ""
  });

  const driverData = useSelector((state: any) => state.drivers);

  const handleSubmit = () => {
    
    let valid = true;
    let newErrors = { ...errors };
 
    if (!frontImageUri) {
      newErrors.frontImage = "Front side image is required";
      valid = false;
    } else {
      newErrors.frontImage = "";
    } 
 
    if (!backImageUri) {
      newErrors.backImage = "Back side image is required";
      valid = false;
    } else {
      newErrors.backImage = "";
    }
  
    if (!textFieldValue.trim()) {
      newErrors.licenseNumber = "Driving license number is required";
      valid = false;
    } else {
      const driverArray = Object.values(driverData);
      const isAadharPresent = driverArray.some((vendor: any) => {
        return vendor?.drivingLicense?.drivingLicenseNumber == textFieldValue;
      });

    
      if (isAadharPresent) {
        newErrors.licenseNumber = "Driving license already registered";
        
        valid =false;  // Validation fails
      } else {
        newErrors.licenseNumber = "";
        valid= true;  // Validation passes
      }
   
    }
 
    if (date <= new Date()) {
      newErrors.expiryDate = "Expiry date is must be in future";
      valid = false;
    } else {
      newErrors.expiryDate = "";
      
    }
    console.log(newErrors)

    setErrors(newErrors);

    if (valid) {
      const dateNew = date.toISOString();  
      const newUserData = {
        drivingLicense: {
          frontImgUrl: frontImageUri1,
          backImgUrl: backImageUri1,
          drivingLicenseNumber: textFieldValue,
          expiryDate: dateNew,
        },
        componnet4:true
      };
      dispatch(updateUserData(newUserData)); 
      Navigation.goBack();
    }
  };

  const pickImage = async (side: "front" | "back") => {
    try {
      // Define camera options
      const options = {
        mediaType: 'photo', // You can also set 'mixed' for both video and photo
        quality: 0.8, // Quality of the image
        saveToPhotos: true, // Optionally save the photo to the gallery
      };
  
      // Launch the camera
      const result = await launchCamera(options);
  
      // Handle cancellation
      if (result.didCancel) {
       Alert.alert("No image selected or the image pick was canceled.");
        return;
      }
  
      // Handle errors
      if (result.errorCode) {
        console.error("Error picking image: ", result.errorMessage);
        Alert.alert("An error occurred while picking the image. Please try again.");
        return;
      }
  
      // If image is selected, handle the URI and other details
      if (result.assets && result.assets[0].uri) {
        const fileUri = result.assets[0].uri;
        const file = {
          uri: fileUri,
          name: `DrivingLicense_${side}.png`, // Customize based on your naming convention
          type: "image/png",
        };
  
        // Set the URI for front or back image
        if (side === "front") {
          setFrontImageUri(fileUri); // Update your state or logic for front image
          handleFileChange(file, "frontImgUrl", "drivingLicense"); // Update the necessary handler for file change
        } else if (side === "back") {
          setBackImageUri(fileUri); // Update your state or logic for back image
          handleFileChange(file, "backImgUrl", "drivingLicense"); // Update the necessary handler for file change
        }
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("An error occurred while picking the image. Please try again.");
    }
  };

  const handleFileChange = async (file:any,section:any,field:any)=>{
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
        console.log("File uploaded successfully", data); 
        if(section === "frontImgUrl")
          setFrontImageUri1(data.data)
        else if(section === "backImgUrl")
        setBackImageUri1(data.data)
  
      } else { 
        console.error("Error: ",data.message);
      }
    } catch (error) { 
      console.error("Uploading error", error);
    }finally{
      setLoading(false)

    }
  }

  const showDatepicker = () => setShowDatePicker(true);
  

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <>
      {loading ? (
      <View style={styles.overlay}>
        <SkypeIndicator color="white" size={30} />
      </View>
    ) : null}
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => Navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={30} color="black" />
          <Text style={styles.text}>{t("Back")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpButton} onPress={() => Navigation.navigate("Components/Help" as never)}>
          <Text style={{ fontWeight: "bold" }}>? {t("Help")}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row' }}>
        <Image source={require('../assets/images/upload.png')} style={styles.highlightedImage} />
        <View style={styles.textContainer1}>
          <Text style={{ fontWeight: 'bold', padding: 10 }}>{t("Driving License Document")}</Text>
        </View>
      </View>

      <Text style={{ fontWeight: 'bold', fontSize: 16, padding: 10 }}>
        {t("Upload your Driving License documents")}:
      </Text> 
      <ScrollView>
        <View style={styles.container1}>
          <TouchableOpacity 
            style={styles.uploadContainer} 
            onPress={() => pickImage("front")}
          >
            <MaterialIcons name="add-photo-alternate" color={'gray'} size={30} />
            <View style={styles.textContainer}>
              <Text style={styles.text}>Front Side DL</Text>
              <Text style={styles.uploadText}>Upload</Text>
            </View>
          </TouchableOpacity>
       

          <TouchableOpacity 
            style={styles.uploadContainer} 
            onPress={() => pickImage("back")}
          >
            <MaterialIcons name="add-photo-alternate" color={'gray'} size={30} />
            <View style={styles.textContainer}>
              <Text style={styles.text}>Back Side DL</Text>
              <Text style={styles.uploadText}>Upload</Text>
            </View>
          </TouchableOpacity>
         
        </View>
        {errors.backImage && <Text style={styles.errorText}>{errors.backImage}</Text>}
        {errors.frontImage && <Text style={styles.errorText}>{errors.frontImage}</Text>}
        {/* Image Preview for Front Side */}
        {frontImageUri && (
          <View style={styles.imagePreview}>
            <Text style={{ fontWeight: "bold", padding: 10 }}>
              {t("Front Image Preview")}:
            </Text>
            <Image source={{ uri: frontImageUri }} style={styles.image} />
          </View>
        )}

        {/* Image Preview for Back Side */}
        {backImageUri && (
          <View style={styles.imagePreview}>
            <Text style={{ fontWeight: "bold", padding: 10 }}>
              {t("Back Image Preview")}:
            </Text>
            <Image source={{ uri: backImageUri }} style={styles.image} />
          </View>
        )}

        <Text style={{ fontWeight: 'bold', padding: 10 }}>{t("Enter Driving License Number")} :</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Eg: KA1236432464252"
          placeholderTextColor={"gray"}
          value={textFieldValue}
          onChangeText={setTextFieldValue}
        />
        {errors.licenseNumber && <Text style={styles.errorText}>{errors.licenseNumber}</Text>}

        <Text style={{ fontWeight: 'bold', padding: 5 }}>{t("Expiry Date")} :</Text>
        <TouchableOpacity style={styles.dateButton} onPress={showDatepicker}>
          <Text style={styles.dateText}>
            {date.toLocaleDateString()}           
          </Text>
        </TouchableOpacity>
        {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}

        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <TouchableOpacity style={styles.verifyButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{t("Submit")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
    </>
  );
}

export default DrivingLicence;

const styles = StyleSheet.create({
  uploadText: {
    fontSize: 14,
    backgroundColor: '#F4BD46',
    width: 100,
    padding: 5,
    fontWeight: 'bold',
    borderRadius: 10,
    textAlign: 'center',
    color: "black",  
    marginTop: 5,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    paddingLeft: 10,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    padding: 20,
  },
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
  container1: {
    flexDirection: "row", 
    justifyContent: "space-between",
    padding: 10,
    alignItems: "center", 
  },
  uploadContainer: {
    alignItems: "center", 
    justifyContent: "center",
    backgroundColor: "#f9f9f9", 
    padding: 20,
    borderRadius: 10, 
    width: "45%", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, 
  },
  textContainer: {
    alignItems: "center",
    marginTop: 10, 
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
    color: "gray",
  }, backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer1: {
    alignSelf: "center",
    height: 60,
    borderTopRightRadius: 20,
    width: 180,
    backgroundColor: "#F4BD46",
  },
  helpButton: {
    backgroundColor: "#FEC110",
    borderRadius: 15,
    padding: 10,
    width: 100,
    alignItems: "center",
    justifyContent: 'center',
  },
  verifyButton: {
    backgroundColor: "#FEC110",
    borderRadius: 15,
    padding: 14,
    width: '100%',
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
 
    marginBottom: 10,
  },
  highlightedImage: {
    borderWidth: 2,
    borderColor: '#F4BD46',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    borderTopRightRadius: 40,
    shadowRadius: 10,
    elevation: 10,
  },
  imagePreview: {
    marginVertical: 15,
  },
  image: {
    width: "100%",
    height: 150,
    marginVertical: 10,
    borderRadius: 10,
  },
  textInput: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 15,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 15,
    padding: 10,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    color: "black",
  },
}); 
