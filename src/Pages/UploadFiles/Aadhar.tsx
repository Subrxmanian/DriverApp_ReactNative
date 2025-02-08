
import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import  MaterialIcons  from "react-native-vector-icons/MaterialIcons"
import {launchCamera} from 'react-native-image-picker';
import { useDispatch, useSelector } from "react-redux";
import { updateUserData } from "../redux/Actions";
import { SkypeIndicator } from "react-native-indicators";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

function Aadhar() {
  const Navigation = useNavigation();
  const [textFieldValue, setTextFieldValue] = useState("");
  const [frontImageUri, setFrontImageUri] = useState<string | null>(null);
  const [backImageUri, setBackImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [frontImageUri1, setFrontImageUri1] = useState<string | null>(null);
  const [backImageUri1, setBackImageUri1] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dispatch = useDispatch();
  const {t}=useTranslation()
  const driverData = useSelector((state: any) => state.drivers);

  const pickImage = async (side: "front" | "back") => {
    try {
      // Request camera permission
      const options = {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true, // optional: saves the photo to the gallery
      };
  
      const result = await launchCamera(options);
  
      if (result.didCancel) {
        Alert.alert("No image selected or the image pick was canceled.");
        return;
      }
  
      if (result.errorCode) {
        console.error("Error picking image: ", result.errorMessage);
        Alert.alert("An error occurred while picking the image. Please try again.");
        return;
      }
  
      if (result.assets && result.assets[0].uri) {
        const fileUri = result.assets[0].uri;
        const file = {
          uri: fileUri,
          name: `aadhar_${side}.png`,
          type: 'image/png',
        };
  
        // Handle the file based on which side is being captured
        if (side === "front") {
          setFrontImageUri(fileUri); // Update your state or logic for front image
          handleFileChange(file, "frontImgUrl", "aadhaarCard");
        } else if (side === "back") {
          setBackImageUri(fileUri); // Update your state or logic for back image
          handleFileChange(file, "backImgUrl", "aadhaarCard");
        }
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("An error occurred while picking the image. Please try again.");
    }
  };

  const validateAadhaarNumber = (aadhaarNumber: string) => {
    const regex = /^\d{4}\s?\d{4}\s?\d{4}$/;
    return regex.test(aadhaarNumber);
  };
  const handleAadhaarValidation = (aadhaarNumber: string) => {
 
    // Convert driverData object to an array of values (drivers)
    const driverArray = Object.values(driverData);
  
    const isAadharPresent = driverArray.some((vendor: any) => {
      console.log( vendor.aadhaarCard)
      return vendor?.aadhaarCard?.aadhaarNumber === aadhaarNumber;
    });
  
   
  
    if (isAadharPresent) {
      setErrorMessage("Aadhaar number is already registered.");
      return false;  // Validation fails
    } else {
      setErrorMessage(null);  // Clear any previous error
      return true;  // Validation passes
    }
  };
  const uploadImage = async () => {
    // Reset error message
    setErrorMessage(null); 
    if (!frontImageUri || !backImageUri) {
      setErrorMessage(
        "Please capture both the front and back images of the Aadhaar card."
      );
      return;
    }
    if(!handleAadhaarValidation(textFieldValue))
      return

    if (!textFieldValue || !validateAadhaarNumber(textFieldValue)) {
      setErrorMessage(
        "Please enter a valid Aadhaar number. Format: 1234 5678 9012"
      );
      return;
    }

    try {
      const newUserData = {
        aadhaarCard: {
          frontImgUrl: frontImageUri1,
          backImgUrl: backImageUri1,
          aadhaarNumber: textFieldValue,
        },
        componnet2:true

      };
 
      dispatch(updateUserData(newUserData));
      Navigation.goBack();
    } catch (error) {
      setErrorMessage("Failed to upload images. Please try again.");
      console.error("Error uploading image to S3:", error);
    }
  };

  const handleFileUpload = async (section: any, field: any, file: File) => { 
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
        // console.log("File uploaded successfully", data); 
        if(section === "frontImgUrl")
          setFrontImageUri1(data.data)
        else if(section === "backImgUrl")
        setBackImageUri1(data.data)
  
      } else { 
        console.error("Error: ",data.message);
      }
    } catch (error) { 
      console.error("Uploading error", error);
    }
    finally{
      setLoading(false)
    }
  };

  const handleFileChange = (file: any, section: any, field: any) => { 
    if (file) {
      handleFileUpload(section, field, file);
    }
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
        <TouchableOpacity
          onPress={() => Navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={30} color="black" />
          <Text style={styles.text}>{t("Back")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => Navigation.navigate("Components/Help" as never)}
        >
          <Text style={{ fontWeight: "bold" }}>? {t("Help")}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row" }}>
        <Image
          source={require("../assets/images/upload.png")}
          style={styles.highlightedImage}
        />
        <View style={styles.textContainer1}>
          <Text style={{ fontWeight: "bold", padding: 10 }}>
            {t("Aadhaar Card Number")}
          </Text>
        </View>
      </View>
      <ScrollView>
        <Text style={{ fontWeight: "bold", fontSize: 16, padding: 10 }}>
          {t("Upload your Aadhaar Card documents")}:
        </Text>
        <View style={styles.container1}>
          <TouchableOpacity
            style={styles.uploadContainer}
            onPress={() => pickImage("front")}
          >
            <MaterialIcons
              name="add-photo-alternate"
              color={"gray"}
              size={30}
            />
            <View style={styles.textContainer}>
              <Text style={styles.text}>Front Side Aadhar</Text>
              <Text style={styles.uploadText}>Upload</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadContainer}
            onPress={() => pickImage("back")}
          >
            <MaterialIcons
              name="add-photo-alternate"
              color={"gray"}
              size={30}
            />
            <View style={styles.textContainer}>
              <Text style={styles.text}>Back Side Aadhar</Text>
              <Text style={styles.uploadText}>Upload</Text>
            </View>
          </TouchableOpacity>
        </View>

        {frontImageUri && (
          <View style={styles.imagePreview}>
            <Text style={{ fontWeight: "bold", padding: 10 }}>
              {t("Front Image Preview")}:
            </Text>
            <Image source={{ uri: frontImageUri }} style={styles.image} />
          </View>
        )}

        {backImageUri && (
          <View style={styles.imagePreview}>
            <Text style={{ fontWeight: "bold", padding: 10 }}>
        {t("Back Image Preview")}:
            </Text>
            <Image source={{ uri: backImageUri }} style={styles.image} />
          </View>
        )}

        <Text style={{ fontWeight: "bold", padding: 10 }}>
          {t("Enter Aadhaar Number")}:
        </Text>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Eg: 1236 4324 6425 2034"
            placeholderTextColor={"gray"}
             keyboardType="numeric"
            value={textFieldValue}
            onChangeText={setTextFieldValue}
          />
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        </View>

        <TouchableOpacity style={styles.verifyButton} onPress={uploadImage}>
          <Text style={styles.buttonText}>{t("Submit")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
    </>
  );
}

export default Aadhar;

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
  uploadText: {
    fontSize: 14,
    backgroundColor: "#F4BD46",
    width: 100,
    padding: 5,
    fontWeight: "bold",
    borderRadius: 10,
    textAlign: "center",
    color: "black",
    marginTop: 5,
  },
  imagePreview: {
    marginTop: 10,
  },
  container: {
    flex: 1,
    padding: 10,
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
    padding: 10,
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
  },
  iconText: {
    fontSize: 16,
    color: "#333",
  },
  avatar: {
    borderRadius: 35,
    height: 60,
    width: 60,
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
    justifyContent: "center",
  },
  translate: {
    height: 25,
    width: 25,
    marginLeft: 65,
  },
  verifyButton: {
    backgroundColor: "#FEC110",
    borderRadius: 15,
    padding: 14,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
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
    borderColor: "#F4BD46",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    borderTopRightRadius: 40,
    shadowRadius: 10,
    elevation: 10,
  },
  text1: {
    fontSize: 19,
    marginLeft: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
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
  textInputContainer: {
    position: "relative",
    marginTop: 10,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    fontWeight: "bold",
    marginTop:15,    
  },
});
