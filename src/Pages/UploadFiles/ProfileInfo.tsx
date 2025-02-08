
import React, { useState, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  TextInput,
  Platform,
  ScrollView,
  Modal,
  PermissionsAndroid,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDispatch } from "react-redux";
import { updateUserData } from "../redux/Actions";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SkypeIndicator } from "react-native-indicators";
import AntDesign from "react-native-vector-icons/AntDesign";
import {launchCamera} from 'react-native-image-picker';
import { useTranslation } from "react-i18next";

// import { uploadImageToS3 } from "@/app/utils/aws";
function ProfileInfo() {
  const Navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const {t}=useTranslation()
  const [image, setImage] = useState<string | null>(null);
  const { preferedlanguage, state } = route.params as {
    preferedlanguage: string;
    state: string;
  };
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    profilephoto: null,
    name: "",
    phoneNumber: "",
    state: "",
    dateOfBirth: new Date(),
    gender: "male",
    whatsappNumber: "",
    pincode: ["", "", "", "", "", ""],
  });
  const [profile,setProfile]=useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [pincodeError, setPincodeError] = useState(false);
  const [formErrors, setFormErrors] = useState({
    name: "",
    dateOfBirth:"",
    whatsappNumber: "",
    pincode: "",
  });
  const pincodeRef = useRef<(TextInput | null)[]>([]);
  const handleInputChange = (field: string, value: any) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
    setFormErrors((prevErrors) => ({ ...prevErrors, [field]: "" })); // Clear error for that field
  };
  const handlePincodeChange = (index: number, text: string) => {
    const newPincode = [...formData.pincode];
    newPincode[index] = text.replace(/[^0-9]/g, '');

    setFormData(prev => ({
      ...prev,
      pincode: newPincode
    }));

    // Move to next input if a digit is entered
    if (text && index < 5) {
      // setActiveIndex(index + 1);
      pincodeRef.current[index + 1]?.focus();
    }
  };
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!formData.pincode[index] && index > 0) {
        // setActiveIndex(index - 1);
        pincodeRef.current[index - 1]?.focus();
      }
    }
  };

  
  const showDatepicker = () => setShowDatePicker(true);
  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || formData.dateOfBirth;
    setShowDatePicker(Platform.OS === "ios");
    setFormData((prevData) => ({ ...prevData, dateOfBirth: currentDate }));
  };
  const handleSubmit = () => {
    let errors = { ...formErrors };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
      isValid = false;
    } else {
      // Parse the dateOfBirth to check age
      const today = new Date();
      const dob = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - dob.getFullYear();
      const month = today.getMonth() - dob.getMonth();
      
      // If the birthday hasn't occurred yet this year, subtract 1 year from the age
      if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 18) {
        errors.dateOfBirth = "You must be at least 18 years old.";
        isValid = false;
      }
    }
  

    if (!formData.gender) {
      errors.gender = "Please select your gender";
      isValid = false;
    }

    const whatsappRegex = /^[0-9]{10}$/;
    if (!whatsappRegex.test(formData.whatsappNumber)) {
      errors.whatsappNumber =
        "Please enter a valid Whatsapp number (10 digits)";
      isValid = false;
    }

    const pincode = formData.pincode.join("");
    if (!/^\d{6}$/.test(pincode)) {
      errors.pincode = "Please enter a valid 6-digit pincode";
      isValid = false;
    }

    setFormErrors(errors);

    if (!isValid) return;

    const dateOfBirthString = formData.dateOfBirth.toISOString();
    // console.log(formData);

    const fullPincode = formData.pincode.join("");
    const newUserData = {
      fullName: formData.name,
      phoneNumber: formData.phoneNumber,
      state: formData.state,
      dateOfBirth: dateOfBirthString,
      gender: formData.gender,
      whatsappNumber: formData.whatsappNumber,
      pincode: fullPincode,
      preferredLanguage: preferedlanguage,
      preferredState: state,
      profile: {
        profilePicture:profile
      },
      componnet1:true
    };

    dispatch(updateUserData(newUserData));
    Navigation.goBack();
  };
  const pickImage = async () => {
     const managepermission =await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          )
          console.log("Mangangin request ",managepermission)
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
        alert("No image selected or the image pick was canceled.");
        return;
      }
  
      // If there was an error in picking the image
      if (result.errorCode) {
        console.error("Error picking image: ", result.errorMessage);
        alert("An error occurred while picking the image. Please try again.");
        return;
      }
  
      // Handle the selected image
      if (result.assets && result.assets[0].uri) {
        const fileUri = result.assets[0].uri;
        const file = {
          uri: fileUri,
          name: 'Driver_Profile.png', // You can modify the name as needed
          type: 'image/png', // Ensure correct MIME type
        };
  
        // Set the image URI to state or handle accordingly
        setImage(fileUri); // Update state or handle the image URI
        handleFileChange(file, 'profilephoto', 'aadhaarCard'); // Handle file upload or processing
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      alert("An error occurred while picking the image. Please try again.");
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
        setProfile(data.data)  
        
       
      } else { 
        console.error("Error: ",data.message);
      }
    } catch (error) { 
      console.error("Uploading error", error);
    }finally{
      setLoading(false)
    }
  } 

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
        <View style={styles.highlightedImage}>
          <Image
            source={require("../assets/images/pfinfo1.png")}
            style={{ justifyContent: "center" }}
          />
        </View>

        <View style={styles.textContainer1}>
          <Text style={{ fontWeight: "bold", padding: 10 }}>
            {t("Profile Info Details")}
          </Text>
        </View>
      </View>

      <ScrollView>
        <View style={styles.image}>
          <Image
            source={
              image ? { uri: image } : require("../assets/images/tripuser.png")
            }
            style={{height:70,width:70}}
          />

          <View style={styles.uploadBtnContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.uploadBtn}>
              <AntDesign name="camera" size={20} color="black" />
              <Text>{image ? "Edit" : null} </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={{ fontWeight: "bold", padding: 10 }}>{t("Name")} :</Text>
        <TextInput
          style={styles.textInput}
          placeholderTextColor={"gray"}
          placeholder="Enter The Full Name"
          value={formData.name}
          onChangeText={(value) => handleInputChange("name", value)}
        />
        {formErrors.name && (
          <Text style={styles.errorText}>{formErrors.name}</Text>
        )}

       

        <Text style={{ fontWeight: "bold", padding: 5 }}>{t("Date Of Birth")} :</Text>
        <TouchableOpacity style={styles.dateButton} onPress={showDatepicker}>
          <Text style={styles.dateText}>
            {formData.dateOfBirth.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={formData.dateOfBirth}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        {formErrors.dateOfBirth && (
          <Text style={styles.errorText}>{formErrors.dateOfBirth}</Text>
        )}


        <Text style={{ fontWeight: "bold", padding: 10 }}>{t("Gender")}:</Text>
        <TouchableOpacity
          style={styles.genderButton}
          onPress={() => setShowGenderModal(true)}
        >
          <Text style={styles.genderText}>
            {formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)}
          </Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showGenderModal}
          onRequestClose={() => setShowGenderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              {["male", "female", "other"].map((genderOption) => (
                <TouchableOpacity
                  key={genderOption}
                  style={styles.modalButton}
                  onPress={() => {
                    handleInputChange("gender", genderOption);
                    setShowGenderModal(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>
                    {genderOption.charAt(0).toUpperCase() +
                      genderOption.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowGenderModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Text style={{ fontWeight: "bold", padding: 10 }}>
          {t("Whatsapp Number")} :
        </Text>
        <TextInput
          style={styles.textInput}
          placeholderTextColor={"gray"}
          keyboardType="numeric"
          placeholder="Enter the WhatsappNumber"
          value={formData.whatsappNumber}
          onChangeText={(value) => handleInputChange("whatsappNumber", value)}
        />
        {formErrors.whatsappNumber && (
          <Text style={styles.errorText}>{formErrors.whatsappNumber}</Text>
        )}

        <Text style={{ fontWeight: "bold", padding: 10 }}>{t("Pincode")}:</Text>
        <View style={styles.pincodeContainer}>
          {formData.pincode.map((pin, index) => (
            <TextInput
              key={index}
              style={[
                styles.pincodeInput,
                pincodeError && { borderColor: "red" },
              ]}
              value={pin}
              onChangeText={(value) => handlePincodeChange(index, value)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              ref={(el) => (pincodeRef.current[index] = el)}
            />
          ))}
        </View>

        {formErrors.pincode && (
          <Text style={styles.errorText}>{formErrors.pincode}</Text>
        )}

        <TouchableOpacity style={styles.verifyButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{t("Submit")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View></>
  );
}

export default ProfileInfo;

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
  image: {
    elevation: 2,
    height: 70,
    alignSelf: "center",
    width: 70,
    backgroundColor: "#efefef",
    position: "relative",
    borderRadius: 999,
    overflow: "hidden",
  },
  uploadBtnContainer: {
    opacity: 0.5,
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "gray",
    width: "100%",
    height: "35%",
  },
  uploadBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  
    marginBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
    color: "gray",
  },
  translate: {
    height: 25,
    width: 25,
    marginLeft: 65,
  },
  helpButton: {
    backgroundColor: "#FEC110",
    borderRadius: 15,
    padding: 10,
    // width: 100,
    paddingHorizontal:20,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyButton: {
    backgroundColor: "#FEC110",
    borderRadius: 15,
    padding: 14,
    width: "100%",
    marginTop: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
  textInput: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    paddingLeft: 15,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "gray",
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
  genderButton: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  genderText: {
    fontSize: 16,
    color: "black",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalButton: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  pincodeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  pincodeInput: {
    width: 40,
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 18,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  highlightedImage: {
    height: 150,
    borderWidth: 2,
    borderColor: "#F4BD46",
    borderTopRightRadius: 40,
  },
  textContainer1: {
    alignSelf: "center",
    height: 60,
    borderTopRightRadius: 20,
    width: 180,
    backgroundColor: "#F4BD46",
  },
});
