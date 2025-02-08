
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Text, Image, TextInput, Platform, ScrollView, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import MaterialIcons  from "react-native-vector-icons/MaterialIcons";
import { Dropdown } from 'react-native-element-dropdown';
import {launchCamera} from 'react-native-image-picker';
import { useDispatch, useSelector } from "react-redux";
import { updateUserData } from "../redux/Actions"; 
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import api from "../Api";
import { SkypeIndicator } from "react-native-indicators";
import { useTranslation } from "react-i18next";
function VehicleRc() {
  const Navigation = useNavigation();
  const dispatch = useDispatch(); 
  const {t}=useTranslation()
  const [data, setData] = useState<any[]>([]);
  const [wheels, setWheels] = useState<string[]>([]); 
  const [brands, setBrands] = useState<string[]>([]); 
  const [models, setModels] = useState<string[]>([]); 
    const [orginwheel, setoriginwheel] = useState<any[]>([]);
    const [orginmodel, setoriginmodel] = useState<any[]>([]);
    const [orginbrand, setoriginbrand] = useState<any[]>([]);
    const [orgincategory, setorigincategory] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]); 
  const [selectedWheels, setSelectedWheel] = useState<string >('4-Wheeler');
  const [selectedBrand, setSelectedBrand] = useState<string>('null');
  const [selectedModel, setSelectedModel] = useState<string>('null');
  const [selectedCategory, setSelectedCategory] = useState<string>('null');
  const [imageUriFront, setImageUriFront] = useState<string | null>(null); 
  const [imageUriBack, setImageUriBack] = useState<string | null>(null);
  const [showFcDatePicker, setShowFcDatePicker] = useState(false);
  const [frontImageUri1, setFrontImageUri1] = useState<string | null>(null);
  const [backImageUri1, setBackImageUri1] = useState<string | null>(null);
    const brand=selectedBrand?.toString();
    const model=selectedModel?.toString();
    const wheel=selectedWheels?.toString();
    const category=selectedCategory?.toString();
  const [showInsuranceDatePicker, setShowInsuranceDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    ownerNumber: '',
    vehicleBrand: '',
    vehicleModel: '',
    ownerName: '',
    fuelType: null,
    ownership: null,
    fcExpiryDate: new Date(),
    insuranceExpiryDate: new Date(),
  });

  const [formErrors, setFormErrors] = useState({
    vehicleNumber: '',
    fuelType: '',
    wheels:'',
    ownership: '',
    fcExpiryDate: '',
    insuranceExpiryDate: '',
    imageUriFront: '',
    imageUriBack: '',
  });
  const driverData = useSelector((state: any) => state.drivers);
  const data1 = [
    { label: 'CNG', value: 'CNG' },
    { label: 'EV', value: 'EV' },
    { label: 'Petrol', value: 'Petrol' },
    { label: 'Diesel', value: 'Diesel' },
  ];

  const owned = [
    { label: 'Owned', value: 'Owned' },
    { label: 'Rented', value: 'Rented' },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
    if(field=="vehicleNumber")
    {
      const driverArray = Object.values(driverData);
  
      const isAadharPresent = driverArray.some((vendor: any) => {
        console.log( vendor?.vehicleDetails?.vehicleNumber)
        return vendor?.vehicleDetails?.vehicleNumber === value;
      });
    
     
    
      if (isAadharPresent) {
        setFormErrors((prevData) => ({ ...prevData, [field]: "Vehicle Number is already Registered" }));

        return false;  // Validation fails
      } else {
        setFormErrors((prevData) => ({ ...prevData, [field]: "" }));
        return true;  // Validation passes
      }
    }

    
  };
  const pickImage = async (side: "front" | "back") => {
    try {
      // Define the options for camera usage
      const options = {
        mediaType: 'photo', // Ensures we are only taking photos
        quality: 0.8, // Set the image quality
        saveToPhotos: true, // Optional: saves the photo to the gallery
      };
  
      // Launch the camera
      const result = await launchCamera(options);
  
      // Handle the case when the user cancels the image pick
      if (result.didCancel) {
        Alert.alert("No image selected or the image pick was canceled.");
        return;
      }
  
      // Handle errors in the image pick
      if (result.errorCode) {
        console.error("Error picking image: ", result.errorMessage);
        Alert.alert("An error occurred while picking the image. Please try again.");
        return;
      }
  
      // If the result has an asset URI (image is picked successfully)
      if (result.assets && result.assets[0].uri) {
        const fileUri = result.assets[0].uri;
        const file = {
          uri: fileUri,
          name: `VehicleRc_${side}.png`, // Customize the name based on the side
          type: "image/png", // Specify the file type
        };
  
        // Set the image URI based on which side (front or back) is being captured
        if (side === "front") {
          setImageUriFront(fileUri); // Set the front image URI (update your state or logic)
          handleFileChange(file, "frontImgUrl", "vehicleRegistration"); // Handle the file (upload or other processing)
        } else if (side === "back") {
          setImageUriBack(fileUri); // Set the back image URI (update your state or logic)
          handleFileChange(file, "backImgUrl", "vehicleRegistration"); // Handle the file (upload or other processing)
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
    }
    finally{
      setLoading(false)
    }
  }

  const onFcDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || formData.fcExpiryDate;
    setShowFcDatePicker(Platform.OS === 'ios');
    setFormData((prevData) => ({ ...prevData, fcExpiryDate: currentDate }));
  };

  const onInsuranceDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || formData.insuranceExpiryDate;
    setShowInsuranceDatePicker(Platform.OS === 'ios');
    setFormData((prevData) => ({ ...prevData, insuranceExpiryDate: currentDate }));
  };

  const validateForm = () => {
    let errors: any = {};
    let isValid = true;

    if (!formData.vehicleNumber) {
      errors.vehicleNumber = 'Vehicle number is required.';
      isValid = false;
    }

    if (!formData.fuelType) {
      errors.fuelType = 'Fuel type is required.';
      isValid = false;
    }

    if (!formData.ownership) {
      errors.ownership = 'Ownership is required.';
      isValid = false;
    }

    if (!formData.fcExpiryDate) {
      errors.fcExpiryDate = 'FC Expiry Date is required.';
      isValid = false;
    }

    if (!formData.insuranceExpiryDate) {
      errors.insuranceExpiryDate = 'Insurance Expiry Date is required.';
      isValid = false;
    }

    if (!imageUriFront) {
      errors.imageUriFront = 'Front image is required.';
      isValid = false;
    }

    if (!imageUriBack) {
      errors.imageUriBack = 'Back image is required.';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }   
    const newUserData = {
      vehicleDetails: {
        frontImgUrl: frontImageUri1,
        backImgUrl: backImageUri1,
        vehicleNumber: formData.vehicleNumber,
        brand: brand,
        model: model,
        wheels: wheel,
        category: category,
        ownVehicle: formData.ownership,
        fuelType: formData.fuelType,
        fcExpiryDate: formData.fcExpiryDate.toISOString(),  
        insuranceExpiryDate: formData.insuranceExpiryDate.toISOString(),  
        vehicleOwnerName: formData.ownerName,
        ownerNumber: formData.ownerNumber,
      },
      componnet3:true
    }; 
    console.log(newUserData)
    dispatch(updateUserData(newUserData));
    // return
    Navigation.goBack();
  }; 

  useFocusEffect(
    React.useCallback(() => {
      const fetchTrips = async () => {
        try {
          const response = await api.get("/vehicle/getAll?fetchAll=true");
          setData(response.data.data);
        } catch (error) {
          console.error("Error fetching trips:", error);
        }
      };

      fetchTrips();
    }, [])
  );
 
  useEffect(() => {
    if (data.length > 0) {
      const uniqueWheels = Array.from(new Set(data.map(item => item.wheels)));
      setWheels(uniqueWheels);
      setoriginwheel(uniqueWheels)
    }
  }, [data]);

  // Get brands based on selected wheels
  useEffect(() => {
    if (wheels.length > 0) {
      const filteredBrands = Array.from(new Set(data.filter(item => item.wheels === wheels[0]).map(item => item.brand)));
      setBrands(filteredBrands);
      setoriginbrand(filteredBrands)
      setSelectedBrand(null);
      setModels([]);
      setCategories([]);
    }
  }, [wheels, data]);

  // Get models based on selected wheels and brand
  useEffect(() => {
    if (wheels.length > 0 && selectedBrand) {
      const filteredModels = data.filter(item => item.wheels === wheels[0] && item.brand === selectedBrand)
        .map(item => item.model);
        setoriginmodel(filteredModels)
      setModels(filteredModels);
      setSelectedModel(null);
      setCategories([]);
    }
  }, [wheels, selectedBrand, data]);

  // Get categories based on wheels, brand, and model
  useEffect(() => {
    if (wheels.length > 0 && selectedBrand && selectedModel) {
      const filteredCategories = data.filter(item => item.wheels === wheels[0] && item.brand === selectedBrand && item.model === selectedModel)
        .map(item => item.category);
      setCategories(filteredCategories);
      setSelectedCategory(null);
      setorigincategory(filteredCategories)
    }
  }, [wheels, selectedBrand, selectedModel, data]);

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
          <Text style={{ fontWeight: 'bold', padding: 10 }}>{t("Vehicle RC Documents")}</Text>
        </View>
      </View>

      <Text style={{ fontWeight: 'bold', fontSize: 16, padding: 10 }}>{t("Upload your Vehicle RC documents")}:</Text>

      <ScrollView>
        <View style={styles.container1}>
          <TouchableOpacity style={styles.uploadContainer} onPress={() => pickImage('front')}>
            <MaterialIcons name="add-photo-alternate" color={'gray'} size={30} />
            <View style={styles.textContainer}>
              <Text style={styles.text}>Front Side RC</Text>
              <Text style={styles.uploadText}>Upload</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadContainer} onPress={() => pickImage('back')}>
            <MaterialIcons name="add-photo-alternate" color={'gray'} size={30} />
            <View style={styles.textContainer}>
              <Text style={styles.text}>Back Side RC</Text>
              <Text style={styles.uploadText}>Upload</Text>
            </View>
          </TouchableOpacity>
        </View>

        {formErrors.imageUriFront && <Text style={styles.errorText}>{formErrors.imageUriFront}</Text>}
        {formErrors.imageUriBack && <Text style={styles.errorText}>{formErrors.imageUriBack}</Text>}

        {imageUriFront && (
          <View style={styles.imagePreview}>
            <Text style={{ fontWeight: "bold", padding: 10 }}>{t("Front Image Preview")}:</Text>
            <Image source={{ uri: imageUriFront }} style={styles.image} />
          </View>
        )}

        {imageUriBack && (
          <View style={styles.imagePreview}>
            <Text style={{ fontWeight: "bold", padding: 10 }}>{t("Back Image Preview")}:</Text>
            <Image source={{ uri: imageUriBack }} style={styles.image} />
          </View>
        )}

        <Text style={{ fontWeight: 'bold', padding: 10 }}>{t("Enter Vehicle Number")}:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Eg : TN30CY0969"
          placeholderTextColor={"gray"}
          value={formData.vehicleNumber}
          onChangeText={(value) => handleInputChange('vehicleNumber', value)}
        />
        {formErrors.vehicleNumber && <Text style={styles.errorText}>{formErrors.vehicleNumber}</Text>}

        <Text style={{ fontWeight: 'bold', padding: 10 }}>{t("Fuel Type")}:</Text>
        <Dropdown
          style={styles.textInput}
          data={data1}
          labelField="label"
          valueField="value"
          placeholder="Select a Type"
          value={formData.fuelType}
          onChange={(item: any) => handleInputChange('fuelType', item.value)}
        />
        {formErrors.fuelType && <Text style={styles.errorText}>{formErrors.fuelType}</Text>}

        <Text style={{ fontWeight: 'bold', padding: 10 }}>{t("Owned Vehicle")}:</Text>
        <Dropdown
          style={styles.textInput}
          data={owned}
          labelField="label"
          valueField="value"
          placeholder="Select a Type"
          value={formData.ownership}
          onChange={(item: any) => handleInputChange('ownership', item.value)}
        />
        {formErrors.ownership && <Text style={styles.errorText}>{formErrors.ownership}</Text>}

        <Text style={{ fontWeight: 'bold', padding: 10 }}>{t("FC Expiry Date")}:</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowFcDatePicker(true)}>
          <Text style={styles.dateText}>{formData.fcExpiryDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showFcDatePicker && (
          <DateTimePicker
            value={formData.fcExpiryDate}
            mode="date"
            display="default"
            onChange={onFcDateChange}
          />
        )}
        {formErrors.fcExpiryDate && <Text style={styles.errorText}>{formErrors.fcExpiryDate}</Text>}

        <Text style={{ fontWeight: 'bold', padding: 10 }}>{t("Insurance Expiry Date")}:</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowInsuranceDatePicker(true)}>
          <Text style={styles.dateText}>{formData.insuranceExpiryDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showInsuranceDatePicker && (
          <DateTimePicker
            value={formData.insuranceExpiryDate}
            mode="date"
            display="default"
            onChange={onInsuranceDateChange}
          />
        )}
        {formErrors.insuranceExpiryDate && <Text style={styles.errorText}>{formErrors.insuranceExpiryDate}</Text>}

          {/* Wheels Dropdown */}
      <Dropdown
        style={styles.textInput}
        data={orginwheel.map(wheel => ({ label: wheel, value: wheel }))}
        labelField="label"
        valueField="value"
        value={wheels[0]}
        onChange={(item) => {
          setSelectedWheel(item.value)
          setWheels([item.value]);
        }}
        placeholder="Vehicle Wheel Type"
      />
      {formErrors.wheels ? <Text style={styles.errorText}>{formErrors.wheels}</Text> : null}

      {/* Brand Dropdown */}
      <Dropdown
        style={styles.textInput}
        data={orginbrand.map(brand => ({ label: brand, value: brand }))}
        labelField="label"
        valueField="value"
        value={selectedBrand}
        onChange={(item) => {
          setSelectedBrand(item.value);
        }}
        placeholder="Vehicle Brand"
      />

      {/* Model Dropdown */}
      <Dropdown
        style={styles.textInput}
        data={orginmodel.map(model => ({ label: model, value: model }))}
        labelField="label"
        valueField="value"
        value={selectedModel}
        onChange={(item) => {
          setSelectedModel(item.value);
        }}
        placeholder="Vehicle Model"
      />

      {/* Category Dropdown */}
      <Dropdown
        style={styles.textInput}
        data={orgincategory.map(category => ({ label: category, value: category }))}
        labelField="label"
        valueField="value"
        value={selectedCategory}
        onChange={(item) => {
          setSelectedCategory(item.value);
        }}
        placeholder="Vehicle Category"
      />

        {/* <Text style={{ fontWeight: 'bold', padding: 10 }}>Vehicle Brand:</Text>
        <TextInput
          style={styles.textInput}
          value={formData.vehicleBrand}
          onChangeText={(value) => handleInputChange('vehicleBrand', value)}
        /> */}
{/* 
        <Text style={{ fontWeight: 'bold', padding: 10 }}>Vehicle Model Name:</Text>
        <TextInput
          style={styles.textInput}
          value={formData.vehicleModel}
          onChangeText={(value) => handleInputChange('vehicleModel', value)}
        /> */}
       
          

        <Text style={{ fontWeight: 'bold', padding: 10 }}>{t("Vehicle Owner Name")}:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Vehicle Owner Name"
          value={formData.ownerName}
          placeholderTextColor={"#ccc"}
          onChangeText={(value) => handleInputChange('ownerName', value)}
        />

        <Text style={{ fontWeight: 'bold', padding: 10 }}>{t("Owner Number")}:</Text>
        <TextInput
          style={styles.textInput}
          placeholderTextColor={"#ccc"}
          keyboardType="phone-pad"
          placeholder="Owner Number"
          value={formData.ownerNumber}
          onChangeText={(value) => handleInputChange('ownerNumber', value)}
        />

       

       
        <TouchableOpacity style={styles.verifyButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{t("Submit")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View></>
  );
}

export default VehicleRc;

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
  textContainer1: {
    alignSelf: "center",
    height: 60,
    borderTopRightRadius: 20,
    width: 180,
    backgroundColor: "#F4BD46",
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginLeft: 15,
  },
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
  textInput: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 15,
    marginVertical: 10,
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
  verifyButton: {
    backgroundColor: "#FEC110",
    borderRadius: 15,
    padding: 14,
    width: '100%',
    alignItems: "center",
    marginTop: 30,
    marginBottom: 10,
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
  container1: {
    flexDirection: "row", 
    justifyContent: "space-between",
    padding: 20,
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
  },
  helpButton: {
    backgroundColor: "#FEC110",
    borderRadius: 15,
    padding: 10,
    width: 100,
    alignItems: "center",
    justifyContent: 'center',
  },
});
