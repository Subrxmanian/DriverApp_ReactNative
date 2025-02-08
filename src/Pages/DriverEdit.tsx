import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  ScrollView,
  Platform,
  StyleSheet,
  Image,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {SkypeIndicator} from 'react-native-indicators'; // Assuming you have this indicator component
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './Api'; // Assuming you have your API instance
import {Dropdown} from 'react-native-element-dropdown'; // Assuming this is the dropdown you're using
import {launchCamera} from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {generateSignedUrl} from './assets/aws';

export default function DriverEdit() {
  const Navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [loginedvendor, setloginnedvendor] = useState({});
  const [orginwheel, setoriginwheel] = useState<any[]>([]);
  const [orginmodel, setoriginmodel] = useState<any[]>([]);
  const [orginbrand, setoriginbrand] = useState<any[]>([]);
  const [orgincategory, setorigincategory] = useState<any[]>([]);
  const [dataduplicate, setDataduplicate] = useState<any[]>([]);
  const [wheels, setWheels] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedWheels, setSelectedWheel] = useState<string>('4-Wheeler');
  const [selectedBrand, setSelectedBrand] = useState<string>('null');
  const [selectedModel, setSelectedModel] = useState<string>('null');
  const [selectedCategory, setSelectedCategory] = useState<string>('null');
  const [imageUriFront, setImageUriFront] = useState<string | null>(null);
  const [imageUriBack, setImageUriBack] = useState<string | null>(null);
  const [showFcDatePicker, setShowFcDatePicker] = useState(false);
  const [frontImageUri1, setFrontImageUri1] = useState<string | null>(null);
  const [backImageUri1, setBackImageUri1] = useState<string | null>(null);
  const [showInsuranceDatePicker, setShowInsuranceDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    preferredLanguage: '',
    preferredState: '',
    messageFromDriver: '',
    whatsappNumber: '',
    vehicleDetails: {
      frontImgUrl: '',
      backImgUrl: '',
      vehicleNumber: '',
      brand: '',
      model: '',
      wheels: '',
      category: '',
      fcExpiryDate: new Date(),
      insuranceExpiryDate: new Date(),
    },
  });
  const [errors, setErrors] = useState({
    fullName: '',
    mobileNumber: '',
    preferredLanguage: '',
    preferredState: '',
    messageFromDriver: '',
    whatsappNumber: '',

    frontImgUrl: '',
    backImgUrl: '',
    vehicleNumber: '',
    brand: '',
    model: '',
    wheels: '',
    category: '',
    fcExpiryDate: '',
    insuranceExpiryDate: '',
  });
  const handleInputChange = (key, value) => {
    if (key === 'gstNumber') {
      const isGstNumberPresent = vendors.some(
        vendor => vendor.gstNumber === value,
      );
      if (isGstNumberPresent) {
        setErrors(prev => ({...prev, gstNumber: 'GST number already exists.'}));
      } else {
        setErrors(prev => ({...prev, gstNumber: ''}));
      }
    }
    setFormData(prev => ({...prev, [key]: value}));
  };

  const validateForm = () => {
    let isValid = true;
    let newErrors = {...errors}; // Copy the existing errors state to update

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your name.';
      isValid = false;
    } else {
      newErrors.fullName = ''; // Clear the error if valid
    }

    // Validate vehicle number
    if (!formData.vehicleDetails.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Please enter your vehicle number.';
      isValid = false;
    } else {
      newErrors.vehicleNumber = ''; // Clear the error if valid
    }

    // Validate preferred language
    if (!formData.preferredLanguage.trim()) {
      newErrors.preferredLanguage = 'Preferred language is required.';
      isValid = false;
    } else {
      newErrors.preferredLanguage = ''; // Clear the error if valid
    }
    if (!formData.messageFromDriver.trim()) {
      newErrors.messageFromDriver = 'Reason is required.';
      isValid = false;
    } else {
      newErrors.messageFromDriver = ''; // Clear the error if valid
    }

    // Validate mobile number
    // if (!formData.mobileNumber.trim()) {
    //   newErrors.mobileNumber = 'Mobile number is required.';
    //   isValid = false;
    // } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {  // Validating mobile number (10 digits)
    //   newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number.';
    //   isValid = false;
    // } else {
    //   newErrors.mobileNumber = ''; // Clear the error if valid
    // }

    // Validate WhatsApp number (if provided)
    if (
      formData.whatsappNumber &&
      !/^\d{10}$/.test(formData.whatsappNumber.trim())
    ) {
      // Validating 10 digits
      newErrors.whatsappNumber =
        'Please enter a valid 10-digit WhatsApp number.';
      isValid = false;
    } else {
      newErrors.whatsappNumber = ''; // Clear the error if valid
    }

    // Validate vehicle details
    if (!selectedBrand.trim()) {
      newErrors.brand = 'Please enter the vehicle brand.';
      isValid = false;
    } else {
      newErrors.brand = ''; // Clear the error if valid
    }

    if (!selectedModel.trim()) {
      newErrors.model = 'Please enter the vehicle model.';
      isValid = false;
    } else {
      newErrors.model = ''; // Clear the error if valid
    }

    if (!selectedCategory.trim()) {
      newErrors.category = 'Please select vehicle category.';
      isValid = false;
    } else {
      newErrors.category = ''; // Clear the error if valid
    }

    // Validate expiry dates
    if (formData.vehicleDetails.fcExpiryDate <= new Date()) {
      newErrors.fcExpiryDate = 'FC expiry date should be in the future.';
      isValid = false;
    } else {
      newErrors.fcExpiryDate = ''; // Clear the error if valid
    }

    if (formData.vehicleDetails.insuranceExpiryDate <= new Date()) {
      newErrors.insuranceExpiryDate =
        'Insurance expiry date should be in the future.';
      isValid = false;
    } else {
      newErrors.insuranceExpiryDate = ''; // Clear the error if valid
    }

    // Set the errors state
    setErrors(newErrors);
    console.log(errors);
    return isValid; // Return whether the form is valid
  };
  const handleSubmit = async () => {
    // console.log("inside")
    const formIsValid = validateForm();
    if (!formIsValid) {
      ToastAndroid.show(
        'Please fill in all the required fields correctly.',
        ToastAndroid.SHORT,
      );
      return;
    }
    setLoading(true);

    try {
      const id = await AsyncStorage.getItem('Driver_id');
      const updatedFormData = {
        ...formData,
        vehicleDetails: {
          frontImgUrl: imageUriFront,
          backImgUrl: imageUriBack,
          vehicleNumber: formData.vehicleDetails.vehicleNumber,
          fcExpiryDate: new Date(formData.vehicleDetails.fcExpiryDate),
          insuranceExpiryDate: new Date(
            formData.vehicleDetails.insuranceExpiryDate,
          ),
          brand: selectedBrand,
          model: selectedModel,
          category: selectedCategory,
        },
      };
      console.log(updatedFormData);

      const response = await api.put(`driver/update/${id}`, updatedFormData);
      ToastAndroid.show(
        'Driver Updated Request send successfully',
        ToastAndroid.SHORT,
      );
    } catch (error) {
      console.error('API Error:', error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        const errorResponse = error.response.data.message.errorResponse;
        if (errorResponse.code === 11000) {
          const field = Object.keys(errorResponse.keyValue)[0];
          setErrors(prev => ({
            ...prev,
            [field]: `This ${field} is already in use.`,
          }));
        }
      }
      ToastAndroid.show(
        'There was an error updating the vendor',
        ToastAndroid.SHORT,
      );
    } finally {
      setLoading(false);
    }
  };
  const handleNestedChange = (section: any, name: any, value: any) => {
    const formattedValue = value;
    setFormData((prevData: any) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [name]: formattedValue,
      },
    }));
  };
  const pickImage = async (side: 'front' | 'back') => {
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
        Alert.alert('No image selected or the image pick was canceled.');
        return;
      }

      // Handle errors in the image pick
      if (result.errorCode) {
        console.error('Error picking image: ', result.errorMessage);
        Alert.alert(
          'An error occurred while picking the image. Please try again.',
        );
        return;
      }

      // If the result has an asset URI (image is picked successfully)
      if (result.assets && result.assets[0].uri) {
        const fileUri = result.assets[0].uri;
        const file = {
          uri: fileUri,
          name: `VehicleRc_${side}.png`, // Customize the name based on the side
          type: 'image/png', // Specify the file type
        };

        // Set the image URI based on which side (front or back) is being captured
        if (side === 'front') {
          setFrontImageUri1(fileUri); // Set the front image URI (update your state or logic)
          handleFileChange(file, 'frontImgUrl', 'vehicleRegistration'); // Handle the file (upload or other processing)
        } else if (side === 'back') {
          setBackImageUri1(fileUri); // Set the back image URI (update your state or logic)
          handleFileChange(file, 'backImgUrl', 'vehicleRegistration'); // Handle the file (upload or other processing)
        }
      }
    } catch (error) {
      console.error('Error picking image: ', error);
    }
  };
  const handleFileChange = async (file: any, section: any, field: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const response = await fetch(
        'https://u-turn-be-dev.vercel.app/api/file/upload',
        {
          method: 'POST',
          body: formData,
        },
      );
      const data = await response.json();
      if (response.ok) {
        console.log('File uploaded successfully', data);
        if (section === 'frontImgUrl') {
          setImageUriFront(data.data);
          setFormData((prevData: any) => ({
            ...prevData,
            ['vehicleDetails']: {
              ...prevData['vehicleDetails'],
              ['fronImageUrl']: data.data,
            },
          }));
        } else if (section === 'backImgUrl') {
          setImageUriBack(data.data);
          setFormData((prevData: any) => ({
            ...prevData,
            ['vehicleDetails']: {
              ...prevData['vehicleDetails'],
              ['fronImageUrl']: data.data,
            },
          }));
        }
      } else {
        console.error('Error: ', data.message);
      }
    } catch (error) {
      console.error('Uploading error', error);
    } finally {
      setLoading(false);
    }
  };

  const onFcDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || formData.vehicleDetails.fcExpiryDate;
    setShowFcDatePicker(Platform.OS === 'ios');

    setFormData((prevData: any) => ({
      ...prevData,
      ['vehicleDetails']: {
        ...prevData['vehicleDetails'],
        ['fcExpiryDate']: currentDate,
      },
    }));
  };

  const onInsuranceDateChange = (
    event: any,
    selectedDate: Date | undefined,
  ) => {
    const currentDate =
      selectedDate || formData.vehicleDetails.insuranceExpiryDate;
    setShowInsuranceDatePicker(Platform.OS === 'ios');

    setFormData((prevData: any) => ({
      ...prevData,
      ['vehicleDetails']: {
        ...prevData['vehicleDetails'],
        ['insuranceExpiryDate']: currentDate,
      },
    }));
  };
  useFocusEffect(
    React.useCallback(() => {
      const fetchTrips = async () => {
        try {
          const response = await api.get('/vehicle/getAll?fetchAll=true');
          setDataduplicate(response.data.data);
        } catch (error) {
          console.error('Error fetching trips:', error);
        }
      };

      fetchTrips();
    }, []),
  );
  useEffect(() => {
    const data = dataduplicate;
    if (data.length > 0) {
      const uniqueWheels = Array.from(new Set(data.map(item => item.wheels)));
      setWheels(uniqueWheels);
      setoriginwheel(uniqueWheels);
    }
  }, [dataduplicate]);
  useEffect(() => {
    const data = dataduplicate;
    if (wheels.length > 0) {
      const filteredBrands = Array.from(
        new Set(
          data
            .filter(item => item.wheels === wheels[0])
            .map(item => item.brand),
        ),
      );
      setoriginbrand(filteredBrands);
      setBrands(filteredBrands);
      setSelectedBrand(null);
      setModels([]);
      setCategories([]);
    }
  }, [wheels, dataduplicate]);
  useEffect(() => {
    const data = dataduplicate;
    if (wheels.length > 0 && selectedBrand) {
      const filteredModels = data
        .filter(
          item => item.wheels === wheels[0] && item.brand === selectedBrand,
        )
        .map(item => item.model);
      setoriginmodel(filteredModels);
      setModels(filteredModels);
      setSelectedModel(null);
      setCategories([]);
    }
  }, [wheels, selectedBrand, dataduplicate]);
  useEffect(() => {
    const data = dataduplicate;
    if (wheels.length > 0 && selectedBrand && selectedModel) {
      const filteredCategories = data
        .filter(
          item =>
            item.wheels === wheels[0] &&
            item.brand === selectedBrand &&
            item.model === selectedModel,
        )
        .map(item => item.category);
      setorigincategory(filteredCategories);
      setCategories(filteredCategories);
      setSelectedCategory(null);
    }
  }, [wheels, selectedBrand, selectedModel, dataduplicate]);
  useEffect(() => {
    const fetchimage = async () => {
      if (
        formData.vehicleDetails.backImgUrl &&
        formData.vehicleDetails.frontImgUrl
      ) {
        if (!frontImageUri1 && !backImageUri1) {
          const fronturl =
            (await generateSignedUrl(formData.vehicleDetails.frontImgUrl)) ||
            '';
          const backurl =
            (await generateSignedUrl(formData.vehicleDetails.backImgUrl)) || '';
          setFrontImageUri1(fronturl);
          setBackImageUri1(backurl);
        }
      }
    };
    fetchimage();
  }, [formData.vehicleDetails.backImgUrl, formData.vehicleDetails.frontImgUrl]);

  useEffect(() => {
    const fetchVendor = async () => {
      setLoading(true);
      try {
        // Get the Driver_id from AsyncStorage
        const id = await AsyncStorage.getItem('Driver_id');

        // Fetch all drivers
        const response = await api.get('driver/getAll?fetchAll=true');

        // Filter the drivers to find the one that matches the 'id'
        const filteredDrivers = response.data.data.filter(
          driver => driver._id === id,
        );

        if (filteredDrivers.length > 0) {
          // Assuming there's at least one matching driver
          const driver = filteredDrivers[0];

          // Log the driver data for debugging
          // console.log("Driver data:", driver);

          // Set the logged-in vendor state
          setloginnedvendor(driver);

          // Check if vehicleDetails exists, otherwise set defaults
          const vehicleDetails = driver.vehicleDetails || {};

          setFormData({
            fullName: driver.fullName,
            preferredLanguage: driver.preferredLanguage,
            preferredState: driver.preferredState,
            whatsappNumber: driver.whatsappNumber,
            vehicleDetails: {
              frontImgUrl: vehicleDetails.frontImgUrl || '', // Default to empty if undefined
              backImgUrl: vehicleDetails.backImgUrl || '', // Default to empty if undefined
              vehicleNumber: vehicleDetails.vehicleNumber || '', // Default to empty if undefined
              fcExpiryDate: vehicleDetails.fcExpiryDate
                ? new Date(vehicleDetails.fcExpiryDate)
                : '', // Default if undefined
              insuranceExpiryDate: vehicleDetails.insuranceExpiryDate
                ? new Date(vehicleDetails.insuranceExpiryDate)
                : '', // Default if undefined
              brand: vehicleDetails.brand || '', // Default to empty if undefined
              model: vehicleDetails.model || '', // Default to empty if undefined
              wheels: vehicleDetails.wheels || '', // Default to empty if undefined
              category: vehicleDetails.category || '', // Default to empty if undefined
            },
          });

          // Set the selected vehicle details
          setSelectedBrand(vehicleDetails.brand || '');
          setSelectedModel(vehicleDetails.model || '');
          setSelectedWheel(vehicleDetails.wheels || '');
          setSelectedCategory(vehicleDetails.category || '');
        } else {
          console.log('No driver found with the provided ID');
        }
      } catch (error) {
        console.log('Error fetching vendor', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, []);

  const languages = [
    {label: 'English', value: 'English'},
    {label: 'தமிழ்', value: 'Tamil'},
    {label: 'മലയളം', value: 'Malayalam'},
    {label: 'ಕನ್ನಡಾ', value: 'Kannada'},
    {label: 'हिंदी', value: 'Hindi'},
    {label: 'తెలుగు', value: 'Telugu'},
  ];
  const states = [
    {label: 'Andhra Pradesh', value: 'andhra_pradesh'},
    {label: 'Tamil Nadu', value: 'tamil_nadu'},
    {label: 'Karnataka', value: 'karnataka'},
    {label: 'Maharashtra', value: 'maharashtra'},
    {label: 'Kerala', value: 'kerala'},
    {label: 'Telangana', value: 'telangana'},
    {label: 'Uttar Pradesh', value: 'uttar_pradesh'},
    {label: 'Bihar', value: 'bihar'},
    {label: 'Gujarat', value: 'gujarat'},
  ];
  const getStatusColor = status => {
    switch (status) {
      case 'Approved':
        return 'green';
      case 'Pending':
        return 'orange';
      default:
        return 'red'; // Default color for unknown statuses
    }
  };
  const getBackgroundColor = status => {
    switch (status) {
      case 'Approved':
        return '#05966954';
      case 'Pending':
        return '#fef3c7c2';
      default:
        return '#fbd5d5cf'; // Default color for unknown statuses
    }
  };
  return (
    <>
      {loading && (
        <View style={styles.overlay}>
          <SkypeIndicator color="white" size={30} />
        </View>
      )}
      <View
        style={[
          styles.container,
          {backgroundColor: getBackgroundColor(loginedvendor?.status)},
        ]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => Navigation.goBack()}
            style={styles.backButton}>
            <Icon name="chevron-back" size={30} color="black" />
            <Text style={styles.text}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => Navigation.navigate('Components/Help')}>
            <Text style={{fontWeight: 'bold'}}> ? Help</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <Image
            source={require('./assets/images/icon.png')}
            style={styles.icon}
          />
          <Text
            style={[
              styles.satatusButton,
              {backgroundColor: getStatusColor(loginedvendor.status)},
            ]}>
            {loginedvendor.status}
          </Text>
          <View style={styles.content}>
            <Text style={styles.inputName}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="ENTER YOUR NAME"
              placeholderTextColor="gray"
              onChangeText={text => handleInputChange('fullName', text)}
              value={formData.fullName}
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
            <Text style={styles.inputName}>Prefered Language</Text>
            <Dropdown
              data={languages}
              labelField={'label'}
              style={styles.textInput}
              valueField={'value'}
              value={formData.preferredLanguage}
              onChange={value =>
                handleInputChange('preferredLanguage', value.value)
              }
            />
            {errors.preferredLanguage && (
              <Text style={styles.errorText}>{errors.preferredLanguage}</Text>
            )}
            {/* <Text style={styles.inputName}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Your Mobile Number"
              placeholderTextColor="gray"
              onChangeText={text => handleInputChange('mobileNumber', text)}
              value={formData.mobileNumber}
            />
            {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>} */}
            <Text style={styles.inputName}>State</Text>
            <Dropdown
              data={states}
              labelField={'label'}
              style={styles.textInput}
              valueField={'value'}
              value={formData.preferredState}
              placeholder="Select your State"
              onChange={value =>
                handleInputChange('preferredState', value.value)
              }
            />

            {errors.preferredState && (
              <Text style={styles.errorText}>{errors.preferredState}</Text>
            )}
            <Text style={styles.inputName}>Whatsapp Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Your Whatsapp Number"
              placeholderTextColor="gray"
              onChangeText={text => handleInputChange('whatsappNumber', text)}
              value={formData.whatsappNumber}
            />
            {errors.whatsappNumber && (
              <Text style={styles.errorText}>{errors.whatsappNumber}</Text>
            )}

            <Text style={styles.inputName}>Vehicle Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter The Vehicle Number"
              placeholderTextColor="gray"
              onChangeText={text =>
                handleNestedChange('vehicleDetails', 'vehicleNumber', text)
              }
              value={formData.vehicleDetails.vehicleNumber}
            />
            {errors.vehicleNumber && (
              <Text style={styles.errorText}>{errors.vehicleNumber}</Text>
            )}
            <Text style={{fontWeight: 'bold', padding: 10}}>
              FC Expiry Date:
            </Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowFcDatePicker(true)}>
              <Text style={styles.dateText}>
                {new Date(
                  formData.vehicleDetails.fcExpiryDate,
                ).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showFcDatePicker && (
              <DateTimePicker
                value={new Date(formData.vehicleDetails.fcExpiryDate)}
                mode="date"
                display="default"
                onChange={onFcDateChange}
              />
            )}
            {errors.fcExpiryDate && (
              <Text style={styles.errorText}>{errors.fcExpiryDate}</Text>
            )}

            <Text style={{fontWeight: 'bold', padding: 10}}>
              Insurance Expiry Date:
            </Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowInsuranceDatePicker(true)}>
              <Text style={styles.dateText}>
                {new Date(
                  formData.vehicleDetails.insuranceExpiryDate,
                ).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showInsuranceDatePicker && (
              <DateTimePicker
                value={new Date(formData.vehicleDetails.insuranceExpiryDate)}
                mode="date"
                display="default"
                onChange={onInsuranceDateChange}
              />
            )}
            {errors.insuranceExpiryDate && (
              <Text style={styles.errorText}>{errors.insuranceExpiryDate}</Text>
            )}
            {frontImageUri1 && (
              <View style={styles.imagePreview}>
                <Text style={{fontWeight: 'bold', padding: 10}}>
                  Front Image Preview:
                </Text>
                <Image source={{uri: frontImageUri1}} style={styles.image1} />
              </View>
            )}
            <TouchableOpacity
              style={[styles.uploadButton]}
              onPress={() => pickImage('front')}>
              <Text>Upload</Text>
            </TouchableOpacity>
            {backImageUri1 && (
              <View style={styles.imagePreview}>
                <Text style={{fontWeight: 'bold', padding: 10}}>
                  Back Image Preview:
                </Text>
                <Image source={{uri: backImageUri1}} style={styles.image1} />
              </View>
            )}
            <TouchableOpacity
              style={[styles.uploadButton]}
              onPress={() => pickImage('back')}>
              <Text>Upload</Text>
            </TouchableOpacity>
            {/* Wheels Dropdown */}
            <Dropdown
              style={styles.textInput}
              data={orginwheel.map(wheel => ({label: wheel, value: wheel}))}
              labelField="label"
              valueField="value"
              value={wheels[0]}
              onChange={item => {
                setSelectedWheel(item.value);
                setWheels([item.value]);
              }}
              placeholder="Vehicle Wheel Type"
            />
            {errors.wheels && (
              <Text style={styles.errorText}>{errors.wheels}</Text>
            )}
            {/* Brand Dropdown */}
            <Dropdown
              style={styles.textInput}
              data={orginbrand.map(brand => ({label: brand, value: brand}))}
              labelField="label"
              valueField="value"
              value={selectedBrand}
              onChange={item => {
                setSelectedBrand(item.value);
              }}
              placeholder="Vehicle Brand"
            />
            {errors.brand && (
              <Text style={styles.errorText}>{errors.brand}</Text>
            )}
            {/* Model Dropdown */}
            <Dropdown
              style={styles.textInput}
              data={orginmodel.map(model => ({label: model, value: model}))}
              labelField="label"
              valueField="value"
              value={selectedModel}
              onChange={item => {
                setSelectedModel(item.value);
              }}
              placeholder="Vehicle Model"
            />
            {errors.model && (
              <Text style={styles.errorText}>{errors.model}</Text>
            )}

            {/* Category Dropdown */}
            <Dropdown
              style={styles.textInput}
              data={orgincategory.map(category => ({
                label: category,
                value: category,
              }))}
              labelField="label"
              valueField="value"
              value={selectedCategory}
              onChange={item => {
                setSelectedCategory(item.value);
              }}
              placeholder="Vehicle Category"
            />
            {errors.category && (
              <Text style={styles.errorText}>{errors.category}</Text>
            )}
            <Text style={styles.inputName}>Enter The Reason : </Text>
            <TextInput
              placeholderTextColor={'black'}
              placeholder="enter the reason to update"
              style={styles.input}
              value={formData.messageFromDriver}
              onChangeText={text =>
                handleInputChange('messageFromDriver', text)
              }
            />
            {errors.messageFromDriver && (
              <Text style={styles.errorText}>{errors.messageFromDriver}</Text>
            )}
            <View style={styles.reasonContainer}>
              <Text>
                Previous Reason : {loginedvendor.messageFromDriver || 'nill'}
              </Text>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  uploadButton: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#FFC10E',
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  reasonContainer: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 10,
    width: '100%',
    borderRadius: 10,
    elevation: 2,
    marginTop: 10,
    alignItems: 'center',
  },
  satatusButton: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: 'white',
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 15,
    marginVertical: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 15,
    padding: 10,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: 'black',
  },
  textInput1: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    width: '100%',
    height: 50,
    padding: 10,
    borderRadius: 10,
  },
  imagePreview: {
    marginVertical: 15,
  },
  image1: {
    width: '100%',
    height: 150,
    marginVertical: 10,
    borderRadius: 10,
  },
  image: {
    elevation: 2,
    height: 75,
    alignSelf: 'center',
    width: 75,
    backgroundColor: '#efefef',
    position: 'relative',
    borderRadius: 999,
    overflow: 'hidden',
  },
  uploadBtnContainer: {
    opacity: 0.5,
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'gray',
    width: '100%',
    height: '35%',
  },
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    // marginBottom: 20,
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
  toastContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 1000,
  },
  toastText: {
    color: 'white',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpButton: {
    backgroundColor: '#FFC10E',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: 'center',
  },
  text: {
    marginLeft: 10,
    fontSize: 18,
    color: '#000',
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 20,
    width: 100,
    height: 100,
  },
  content: {
    width: '100%',
    // alignItems: 'center',
  },
  inputName: {
    marginBottom: 5,
    fontSize: 16,
    textAlign: 'left',
  },
  input: {
    width: '100%',
    height: 45,
    color: 'balck',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
    marginBottom: 10,
  },
  pickerContainer: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    borderColor: '#ccc',
  },
  inputPicker: {
    width: '100%',
    height: 40,
    bottom: 8,
  },
  pincodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  pincodeInput: {
    width: 40,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#FFC10E',
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 16,
    marginBottom: 20,
  },
});
