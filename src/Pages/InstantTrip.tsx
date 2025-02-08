/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ToastAndroid,
  Linking,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Checkbox} from 'react-native-paper';
import {Dropdown} from 'react-native-element-dropdown';
import {SkypeIndicator} from 'react-native-indicators';
import api from './Api';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MAP_API_KEY, REQUEST_ID } from '../../Config';
import { useTranslation } from 'react-i18next';


const CustomToast = ({message, visible}: {message: any; visible: any}) => {
  if (!visible) return null;

  return (
    <View style={styles.toastContainer}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

export default function InstantTrip() {
  const Navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
  });
  const {t}=useTranslation()
  const route = useRoute();
  const {id} = (route.params as {id: string}) || '';
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [estprice, setESTprice] = useState(0);
  const [profile, setprofile] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [wheels, setWheels] = useState<string[]>([]);
  const [customerData, setCustomerData] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedWheels, setSelectedWheel] = useState<string>('4-wheeler');
  const [vendorid, setvendorid] = useState('');
  const [name,setname]=useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('null');
  const [showcalculateButton,setshowcalculateButton]=useState(true)
  const [drawerVisible, setDrawerVisible] = useState(false);
    const [drawerAnimation] = useState(new Animated.Value(250));
      const toggleDrawer = () => {
        setDrawerVisible(!drawerVisible);
        Animated.spring(drawerAnimation, {
          toValue: drawerVisible ? 250 : 0,
          useNativeDriver: true,
        }).start();
      };
  const [formData, setFormData] = useState({
    customer: {
      name: '',
      mobileNumber: '',
      language: '',
    },
    vehicle: {
      category: '',
      wheels: '',
    },
    distance: '0',
    tripStatus: 'Created',
    tripCreatedBy: '',

    pickupType: '',
    journeyType: '',
    journey: {
      fromAddress: '',
      toAddress: '',
    },
    schedule: {
      days: '1', 
      pickupDate: new Date(),
      endDate: new Date(),
      locations: [],
    }, 
    pickupTime: new Date(),
    priceDetails: {
      basePrice: '',
      pricePerKm: '',
      waitingCharges: '',
      hillCharges: '',
      driverAllowance: '',
      gstPercentage: '5',
      commissionPercentage: '',
    },
  });
  const [errors, setErrors] = useState<any>({
    name: '',
    customer_mobile_no: '',
    customer_language: '',
    customer_members: '',
    vehicle: '',
    pickup_location: '',
    drop_location: '',
    pickupdate: '',
    endate: '',
    pickup_time: '',
    journey_types: '',
    days: '',
    base_price: '',
    price_per_km: '',
    waiting_charges: '',
    pickupTypes: '',
    hill_charges: '',
    driver_allowance: '',
    gst_percent: '',
    commision_percent: '',
  });
  const handleAddValue = () => {
    if (inputValue.trim()) {
      setFormData(prevState => ({
        ...prevState,
        schedule: {
          ...prevState.schedule,
          locations: [...prevState.schedule.locations, inputValue],
        },
      }));

      // Clear the input field
      console.log(formData);
      setInputValue('');
    }
  };
  const handleRemoveValue = (location: any) => {
    setFormData(prevState => ({
      ...prevState,
      schedule: {
        ...prevState.schedule,
        locations: prevState.schedule.locations.filter(
          item => item !== location,
        ),
      },
    }));
  };
  const [selectedField, setSelectedField] = useState<string | null>(null); // "from" or "to"
  const validateFromDate = (date: Date) => {
    const today = new Date().setHours(0, 0, 0, 0); // Normalize to the beginning of today
  
    if (date < today) {
      setErrors({
        ...errors,
        ['pickupdate']: 'The from date cannot be in the past.',
      });
      return false; // Invalid date
    }
  
    const todate = new Date(formData.schedule.endDate)
    console.log(date.setHours(0, 0, 0, 0),todate.setHours(0, 0, 0, 0))
    if (date.setHours(0, 0, 0, 0) > todate.setHours(0, 0, 0, 0)) {
      setErrors({
        ...errors,
        ['pickupdate']: 'The from date cannot be in the future for to date.',
      });
      return false; // Invalid date
    }
    setErrors({
      ...errors,
      ['pickupdate']: '', // Clear any previous error
    });
    return true; // Valid date
  };
  
  const validateToDate = (date: Date) => {
    const today = new Date().setHours(0, 0, 0, 0); // Normalize to the beginning of today
    const fromDate = formData.schedule.pickupDate; // Reference to the from date
  
    if (date < today) {
      setErrors({
        ...errors,
        ['endDate']: 'The to date cannot be in the past.',
      });
      return false; // Invalid date
    }
  
    if (date < fromDate) {
      setErrors({
        ...errors,
        ['endDate']: 'The to date cannot be earlier than the from date.',
      });
      return false; // Invalid date
    }
  
    setErrors({
      ...errors,
      ['endDate']: '', // Clear any previous error
    });
    return true; // Valid date
  };
  
  const onChangeDate = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || formData.date;
    setShowDatePicker(false);
  
    if (selectedField === 'from') {
      if (validateFromDate(currentDate)) {
        setFormData((prevData: any) => {
          const newData = {
            ...prevData,
            ['schedule']: {
              ...prevData['schedule'],
              ['pickupDate']: currentDate,
            },
          };
  
          // If both pickupDate and endDate exist, calculate the number of days
          if (newData['schedule']['pickupDate'] && newData['schedule']['endDate']) {
            const daysDiff = calculateDaysDifference(newData['schedule']['pickupDate'], newData['schedule']['endDate']);
            newData['schedule']['daysDiff'] = daysDiff; // Store the days difference
          }
  
          return newData;
        });
      }
    } else if (selectedField === 'to') {
      if (validateToDate(currentDate)) {
        setFormData((prevData: any) => {
          const newData = {
            ...prevData,
            ['schedule']: {
              ...prevData['schedule'],
              ['endDate']: currentDate,
            },
          };
  
          // If both pickupDate and endDate exist, calculate the number of days
          if (validateFromDate(formData.schedule.pickupDate) && validateToDate(formData.schedule.endDate)) {

            const daysDiff = calculateDaysDifference(newData['schedule']['pickupDate'], newData['schedule']['endDate']);
            newData['schedule']['days'] = daysDiff;
          }
  
          return newData;
        });
      }
    }
  };
  
  const calculateDaysDifference = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    // Calculate the difference in milliseconds
    const diffInTime = end.getTime() - start.getTime();
  
    // Convert milliseconds to days
    const diffInDays = diffInTime / (1000 * 3600 * 24);
  
    return Math.round(diffInDays); // Round to the nearest whole number
  };
  
  
  const handleSelectDateField = (field: 'from' | 'to') => {
    setSelectedField(field);
    setShowDatePicker(true);
  };w
  
  const handleInputChange = (name: any, value: any) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: '',
    });
  };
  const validateForm = () => {
    setErrors({
      name: '',
      customer_mobile_no: '',
      customer_language: '',
      customer_members: '',
      vehicle: '',
      pickup_location: '',
      drop_location: '',
      date: '',
      pickup_time: '',
      journey_types: '',
      days: '',
      base_price: '',
      price_per_km: '',
      waiting_charges: '',
      pickupTypes: '',
      hill_charges: '',
      driver_allowance: '',
      gst_percent: '',
      commision_percent: '',
    });

    let valid = true;
    const newErrors = {...errors};

    if (!formData.customer.name) {
      newErrors.name = 'Customer name is required';
      valid = false;
    }
    if (!formData.customer.mobileNumber) {
      newErrors.customer_mobile_no = 'Customer mobile number is required';
      valid = false;
    }
    if (!formData.customer.language) {
      newErrors.customer_language = 'Customer language is required';
      valid = false;
    }

    if (!formData.vehicle.wheels) {
      newErrors.vehicle = 'Vehicle selection is required';
      valid = false;
    }
    if (!formData.journey.fromAddress) {
      newErrors.pickup_location = 'Pickup location is required';
      valid = false;
    }
    if (!formData.journey.toAddress) {
      newErrors.drop_location = 'Drop location is required';
      valid = false;
    }
    if (formData.pickupType === 'Round') {
      if (!formData.schedule.days) {
        newErrors.days = 'Days are required for scheduled journey';
        valid = false;
      }
      if (!formData.schedule.locations) {
        newErrors.scheduled_locations = 'Scheduled locations are required';
        valid = false;
      }
      if (!formData.schedule.pickupDate) {
        newErrors.date = 'Date is required';
        valid = false;
      }
      if (!formData.schedule.endDate) {
        newErrors.date = 'end Date is required';
        valid = false;
      }
      if (!formData.pickupTime) {
        newErrors.pickup_time = 'Pickup time is required';
        valid = false;
      }
    }
    // if (!formData.priceDetails.basePrice) {
    //   newErrors.base_price = 'Base price is required';
    //   valid = false;
    // }
    // if (!formData.priceDetails.pricePerKm) {
    //   newErrors.price_per_km = 'Price per kilometer is required';
    //   valid = false;
    // }
    // if (!formData.priceDetails.waitingCharges) {
    //   newErrors.waiting_charges = 'Waiting charges are required';
    //   valid = false;
    // }
  
    // if (!formData.priceDetails.driverAllowance) {
    //   newErrors.driver_allowance = 'Driver allowance is required';
    //   valid = false;
    // }
    
    setErrors(newErrors);
    console.log(errors)
    return valid;
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

    setErrors((prevErrors: any) => {
      const newErrors = {...prevErrors};
      if (section === 'customer') {
        if (name === 'mobileNumber' && formattedValue.length >= 10) {
          newErrors.customer_mobile_no = '';
        }

        if (name === 'language') {
          newErrors.customer_language = ''; // Clear error for language
        }

        if (name === 'name') {
          newErrors.name = '';
        }
      }
      if (section === 'priceDetails') {
       setshowcalculateButton(true)
      }

      return newErrors;
    });
  };
  const handleSubmit = async () => {
    handleNestedChange('vehicle', 'wheels', selectedWheels?.toString());
    handleNestedChange('vehicle', 'category', selectedCategory?.toString());
    setFormData({
      ...formData,
      ['tripCreatedBy']: vendorid,
    });
    setLoading(true);
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    try {
        const response = await api.post('trip/createdByDriver', formData);

        ToastAndroid.show("Trip has been successfully Created",ToastAndroid.SHORT)
      
      Navigation.navigate("Pages/UpComingTrip" as never)
      setErrors({
        name: '',
        customer_mobile_no: '',
        customer_language: '',
        customer_members: '',
        vehicle: '',
        pickup_location: '',
        drop_location: '',
        date: '',
        pickup_time: '',
        journey_types: '',
        days: '',
        base_price: '',
        price_per_km: '',
        waiting_charges: '',
        pickupTypes: '',
        hill_charges: '',
        driver_allowance: '',
        gst_percent: '',
        commision_percent: '',
      });
    } catch (error) {
      console.error('API Error:', error);
      setToast({
        visible: true,
        message: 'Something went wrong. Please try again.',
      });
      setTimeout(() => {
        setToast({visible: false, message: ''});
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const onTimeChange = (event: any, selectedDate: any) => {
    setShowTimePicker(false);
    if (event.type === 'set') {
      const currentDate = selectedDate || new Date();
      setFormData({
        ...formData,
        pickupTime: currentDate,
      });
    }
  };
  const incrementDecrementPriceDetails = (
    field: string,
    operation: 'increment' | 'decrement',
    currentValue: number,
  ) => {
    // Parse the current value to ensure it's treated as a number
    const parsedValue = isNaN(currentValue) ? 0 : currentValue; // Default to 0 if the value is NaN

    let updatedValue = parsedValue;
    if (operation === 'increment') {
      updatedValue = parsedValue + 1;
    } else if (operation === 'decrement') {
      updatedValue = parsedValue - 1;
    }

    // Ensure the value is not negative
    updatedValue = Math.max(updatedValue, 0);

    setFormData((prevData: any) => ({
      ...prevData,
      priceDetails: {
        ...prevData.priceDetails,
        [field]: updatedValue.toString(), // Save as string to match TextInput value type
      },
    }));

    setshowcalculateButton(true)
  }
  const getVehicleTypeByWheels = (wheels: any) => {
    switch (wheels) {
      case '2-Wheeler':
        return 'Bike';
      case '3-Wheeler':
        return 'Auto';
      case '4-Wheeler':
        return 'Car';
      case '6-Wheeler':
        return 'Truck';
      default:
        return 'Unknown';
    }
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api(`/trip/get/${id}`);
      const data = response.data.trip;

      setFormData({
        customer: {
          name: data.customer.name,
          mobileNumber: data.customer.mobileNumber,
          language: data.customer.language,
        },
        vehicle: {
          category: data.vehicle.category || '', // Default to empty string if missing
          wheels: data.vehicle.wheels || '',
        },
        
        tripStatus: data.tripStatus || 'Created', // Default to "Created" if missing
        tripCreatedBy: data.tripCreatedBy || '',
        pickupTime: new Date(data.pickupTime),
        pickupType: data.pickupType || '',
        journeyType: data.journeyType || '',
        journey: {
          fromAddress: data.journey.fromAddress || '',
          toAddress: data.journey.toAddress || '',
        },
        distance:data.distance,
        schedule: {
          days: data.schedule.days || '1',
          locations: data.schedule.locations || [],
          pickupDate:new Date(data.schedule.pickupDate),
          endDate:new Date(data.schedule.endDate)
        },
        pickupTime:new Date(data.schedule.pickupTime),
        priceDetails: {
          basePrice: data.priceDetails.basePrice || '',
          pricePerKm: data.priceDetails.pricePerKm || '',
          waitingCharges: data.priceDetails.waitingCharges || '',
          hillCharges: data.priceDetails.hillCharges || '',
          driverAllowance: data.priceDetails.driverAllowance || '',
          gstPercentage: data.priceDetails.gstPercentage || '5', // Default to "5"
          commissionPercentage: data.priceDetails.commissionPercentage || '',
        },
      });
      setSelectedCategory(data.vehicle.category)
      setSelectedWheel(data.vehicle.wheel)
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  const calculateTotalPrice = () => {

    const distance = formData.distance/1000 // Calculate distance from start to end
    const days = formData.schedule.days || 1; 
    const baseDistance = 3; // Base distance in kilometers
    const {
        basePrice,       // 3 km
        pricePerKm,
        hillCharges,      
        driverAllowance,  // per day
        gstPercentage,
        commissionPercentage,  
    } = formData.priceDetails || {}; // Ensure trip.priceDetails is defined

    const estimatedDistance = Number(distance) || 1; // Convert distance to a number (fallback to 1 if not provided)
    const baseCharges = Number(basePrice);

    // Calculate distance charges (only for distance beyond base distance)
    const distanceCharges =
        estimatedDistance > baseDistance
            ? (estimatedDistance - baseDistance) * Number(pricePerKm)
            : 0;

    // Calculate waiting charges
    const finalWaitingCharges = 0;

    // Calculate subtotal before commission
    const subtotal =
        baseCharges +
        distanceCharges +
        finalWaitingCharges +
        Number(hillCharges) +
        Number(driverAllowance * days);

    // Add commission to subtotal
    const commissionPrice = (subtotal * Number(commissionPercentage)) / 100;
    const totalPriceWithCommission = subtotal;

    // Calculate GST on the total price (including commission)
    const gstPrice = (totalPriceWithCommission * Number(gstPercentage)) / 100;

    // Final total price including GST
    const finalTotalPrice = totalPriceWithCommission + gstPrice;

    // Return results as an object
  
    console.log( {
        
        waitingCharges: isNaN(finalWaitingCharges) ? "0.00" : finalWaitingCharges.toFixed(2),
        tripDays: days,
        driverAllowance: isNaN(driverAllowance) ? "0.00" : (driverAllowance * days).toFixed(2),
        finalDistance:distance,
        finalTotalPrice: isNaN(finalTotalPrice) ? "0.00" : finalTotalPrice.toFixed(2),
        totalPriceWithCommission: isNaN(totalPriceWithCommission) ? "0.00" : totalPriceWithCommission.toFixed(2),
        commissionPrice: isNaN(commissionPrice) ? "0.00" : commissionPrice.toFixed(2),
        gstPrice: isNaN(gstPrice) ? "0.00" : gstPrice.toFixed(2),
    })
    setESTprice(finalTotalPrice)
    setshowcalculateButton(false)
};
  const apiKey = MAP_API_KEY;

  const fetchCoordinates = async (address) => {
    const url = `https://api.olamaps.io/places/v1/geocode?address=${address}&language=hi&api_key=${apiKey}`;
  
    try {
      const response = await axios.get(url, {
        headers: {
          'X-Request-Id': REQUEST_ID
        }
      });
  
      if (response.data?.geocodingResults?.[0]) {
        const location = response.data.geocodingResults[0].geometry.location;
        const formattedCoordinates = `${location.lat},${location.lng}`;
        console.log(formattedCoordinates);  // Logging the formatted coordinates
        return formattedCoordinates;  // Returning the coordinates
      } else {
        console.log('No coordinates found for the provided address.');
        return null;  // Return null if no coordinates found
      }
    } catch (err) {
      console.log('Error fetching coordinates: ', err);
      return null;  // Return null if there's an error
    }
  };
  
  // Function to validate if coordinates are in the correct format (lat,lng)
const validateCoordinates = (coordinates) => {
    if (typeof coordinates === 'string' && coordinates.split(',').length === 2) {
      const [lat, lon] = coordinates.split(',').map(val => val.trim());
  
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);
  
      if (!isNaN(latNum) && !isNaN(lonNum)) {
        if (latNum >= -90 && latNum <= 90 && lonNum >= -180 && lonNum <= 180) {
          return true;  // Coordinates are valid
        }
      }
    }
    return false;  // Coordinates are invalid
  };
  
  // Function to parse the coordinates string into an array [lat, lng]
const parseCoordinates = (coordinates) => {
    if (typeof coordinates === 'string' && coordinates.split(',').length === 2) {
      const [lng, lat] = coordinates.split(',').map(coord => coord.trim());
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
  
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        if (latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180) {
          return [latNum, lngNum];  // Return as [latitude, longitude]
        } else {
          console.error('Invalid latitude or longitude range');
          return null;  // Invalid coordinates range
        }
      } else {
        console.error('Latitude and Longitude must be valid numbers');
        return null;  // Invalid number format
      }
    } else {
      console.error('Invalid coordinate format. Expected format: "longitude,latitude"');
      return null;  // Invalid format
    }
  };
  
  // Function to fetch directions
  const fetchDirections = async (fromCoordinates, toCoordinates) => {
    if (!validateCoordinates(fromCoordinates) || !validateCoordinates(toCoordinates)) {
      console.log("Invalid coordinates");
      return;
    }
  
    const originCoords = parseCoordinates(fromCoordinates);
    const destinationCoords = parseCoordinates(toCoordinates);
    console.log("directions", originCoords, destinationCoords);
  
    const origins = `${originCoords[1]},${originCoords[0]}`;  // [lng, lat] format for API
    const destinations = `${destinationCoords[1]},${destinationCoords[0]}`;  // [lng, lat] format for API
  
    const url = `https://api.olamaps.io/routing/v1/distanceMatrix?origins=${origins}&destinations=${destinations}&api_key=${apiKey}`;
  
    try {
      const response = await axios.get(url, {
        headers: {
          'X-Request-Id': REQUEST_ID,
        },
      });
  
      if (response.data && response.data.rows && response.data.rows[0] && response.data.rows[0].elements && response.data.rows[0].elements.length > 0) {
        const element = response.data.rows[0].elements[0];
       
        return element.distance;
        } else {
        console.log('No directions found in the response');
      }
    } catch (err) {
      console.log('Error fetching directions: ' + err.message);
    }
  };
  
  // Main function to get coordinates and fetch directions
  const getCoordinates = async () => {
    // Wait for the coordinates to be fetched
    const from = await fetchCoordinates(formData.journey.fromAddress);
    const to = await fetchCoordinates(formData.journey.toAddress);
  
    // Check if both coordinates are valid before proceeding
    if (from && to) {
      // Fetch the directions once we have both coordinates
    handleDistance()
    } else {
      console.log('Invalid addresses or coordinates not found.');
    }
  };
  
  
  const handleDistance = async () => {
    // Check if journeyType is Schedule or pickupType is Round
    // if (formData.pickupType === "Round") {
        let totalDistance = 0;
        let directions = 0;

        // Include tripData.journey.from as the first location
        const extraLocations = [formData.journey.fromAddress, ...formData.schedule.locations, formData.journey.toAddress];

        // Loop through locations and fetch directions step by step
        console.log(extraLocations)
        for (let i = 0; i < extraLocations.length - 1; i++) {
            const fromAddress = extraLocations[i];
            const toAddress = extraLocations[i + 1];

            const from = await fetchCoordinates(fromAddress);
            const to = await fetchCoordinates(toAddress);
            console.log("after getting coordinates")

            // Fetch directions from the current location to the next
            directions = await fetchDirections(from, to);
            console.log("after getting directions",directions)
            // console.log(fromAddress,toAddress,directions.distance,"this cww");

            // Accumulate total distance and duration
            totalDistance += directions;
        }
        setFormData({
          ...formData,
          ["distance"]: (totalDistance).toString(),
        });

};

  useFocusEffect(
    React.useCallback(() => {
      const fetchTrips = async () => {
        const id = (await AsyncStorage.getItem('Driver_id')) || '';
        const name= (await AsyncStorage.getItem('Driver_name')) || '';
        setname(name)
        const url = (await AsyncStorage.getItem('Profile_pic')) || '';
        setprofile(url)

        setvendorid(id);
        try {
          const response = await api.get('/vehicle/getAll?fetchAll=true');
          setData(response.data.data);
        } catch (error) {
          console.error('Error fetching trips:', error);
        }
      };
      fetchData();
      fetchTrips();
    }, []),
  );
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get('/customer/getAll?fetchAll=true');

        // // Ensure response.data.data is an array
        // console.log(response.data)
        const fetchedData = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        setCustomerData(fetchedData);
        // console.log(customerData)
      } catch (error) {
        console.error('Error fetching customer:', error);
        // Optionally handle the error state here, such as setting an error message
      }
    };

    fetchCustomer();
  }, []);
  useEffect(() => {
    if (data.length > 0) {
      const uniqueWheels = Array.from(new Set(data.map(item => item.wheels)));
      setWheels(uniqueWheels);
      if (!selectedWheels && uniqueWheels.length > 0) {
        setSelectedWheel(uniqueWheels[0]);
      }
    }
  }, [data]);
  useEffect(() => {
    if (selectedWheels) {
      const filteredCategories = Array.from(
        new Set(
          data
            .filter(item => item.wheels === selectedWheels)
            .map(item => item.category),
        ),
      );
      setCategories(filteredCategories);
      setSelectedCategory(null);
    }
  }, [selectedWheels, data]);
  const picktype = [
    {label: 'Round', value: 'Round'},
    {label: 'Drop', value: 'Drop'},
  ];
  const languages = [
    { label: "English", value: "English" },
    { label: "தமிழ்", value: "Tamil" },
    { label: "മലയളം", value: "Malayalam" },
    { label: "ಕನ್ನಡಾ", value: "Kannada" },
    { label: "हिंदी", value: "Hindi" },
    { label: "తెలుగు", value: "Telugu" }
  ];
  
  const handleCustomerInputChange = (name, value) => {
    const keys = name.split('.');

    // Update the state by traversing the nested structure
    setFormData(prevTrip => {
      const updatedTrip = {...prevTrip};
      let temp = updatedTrip;

      // Traverse through the keys to reach the correct field
      for (let i = 0; i < keys.length - 1; i++) {
        if (!temp[keys[i]]) temp[keys[i]] = {};
        temp = temp[keys[i]];
      }

      // Store the previous customer data to revert if necessary
      const prevCustomer = updatedTrip.customer || {};

      // Update the value for the specific key
      temp[keys[keys.length - 1]] = value;

      // If the input field is customer.mobileNumber, auto-fill customer details
      if (name == 'customer.mobileNumber') {
        const matchingCustomer = customerData.find(customer => {
          return customer.mobileNumber === value; // Return true if mobile number matches
        });
        // console.log(matchingCustomer)
        if (matchingCustomer) {
          // Auto-fill customer details if a match is found
          updatedTrip.customer = {
            ...updatedTrip.customer,
            name: matchingCustomer.name,
            language: matchingCustomer.language,
          };
        }
      } else {
        // If mobile number is cleared (backspaced), revert to previous customer details
        updatedTrip.customer = {...prevCustomer};
      }

      return updatedTrip;
    });
  };
  const Handlelogout = async () => {
    await AsyncStorage.removeItem('Driver_id');
    await AsyncStorage.removeItem('Driver_name');
    await AsyncStorage.removeItem('Profile_pic');
    Navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Pages/Home'}],
      }),
    );
  };
  return (
    <>
      {loading ? (
        <View style={styles.overlay}>
          <SkypeIndicator color="white" size={30} />
        </View>
      ) : null}
         <Animated.View
          style={[styles.drawer, {transform: [{translateX: drawerAnimation}]}]}>
          <ScrollView>
            <View style={styles.drawerContent}>
              <View style={styles.profileContainer}>
                <View style={styles.profileHeader}>
                  <Image
                    source={profile?{uri:profile}:require('./assets/images/Maskgroup.png')}
                    style={styles.avatar}
                  />

                  <TouchableOpacity
                    onPress={toggleDrawer}
                    style={styles.closeButton}>
                    <AntDesign name="right" size={30} color="gray" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.profileName}>{name}</Text>
                <TouchableOpacity onPress={()=>Navigation.navigate("edit")}>
                  <Text style={styles.editProfile}>{t("Edit Profile")}</Text>
                </TouchableOpacity>
              </View>

              {/* <Text
              style={styles.drawerItem}
              onPress={() => Navigation.navigate("Pages/YourProfile" as never)}
            >
              Your Profile
            </Text> */}
              <Text
                style={styles.drawerItem}
                onPress={() =>
                  Navigation.navigate('Pages/UpComingTrips' as never)
                }>
                {t("UpComingTrips List")}
              </Text>
              <Text
                style={styles.drawerItem}
                onPress={() =>
                  Navigation.navigate('Pages/ScreenNotification' as never)
                }>
                {t("Notifications")}
              </Text>
              <Text
                style={styles.drawerItem}
                onPress={() => Navigation.navigate('Pages/History' as never)}>
                {t("History")}
              </Text>
            </View>
            <TouchableOpacity onPress={Handlelogout}>
              <Text style={styles.Logout}>
                {t("Log Out")} <AntDesign name="logout" size={30} color={'black'} />
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => Navigation.goBack()}
            style={styles.backButton}>
            <Ionicons name="chevron-back" size={30} color="black" />
            <Text style={styles.text}>{t("Back")}</Text>
          </TouchableOpacity>
          <View style={styles.rightContainer}>
            <TouchableOpacity onPress={()=>Navigation.navigate("Pages/ScreenNotification")}>
            <Icon name="bell" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDrawer}>
            <Image
              source={profile?{uri:profile}:require('./assets/images/Maskgroup.png')}
              style={styles.avatar}
            />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView>
          <Text style={styles.title}>{t("Customer Details")}</Text>
          <TextInput
            style={styles.input}
            placeholder="Customer Mobile No"
            keyboardType="phone-pad"
            placeholderTextColor={'gray'}
            value={formData.customer.mobileNumber}
            // onChangeText={value =>
            //   handleNestedChange('customer', 'mobileNumber', value)
            // }
            onChangeText={value =>
              handleCustomerInputChange('customer.mobileNumber', value)
            }
          />
          {errors.customer_mobile_no && (
            <Text style={styles.errorText}>{errors.customer_mobile_no}</Text>
          )}
          <TextInput
            style={styles.input}
            placeholder="Customer Name"
            placeholderTextColor={'gray'}
            value={formData.customer.name}
            onChangeText={value =>
              handleNestedChange('customer', 'name', value)
            }
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          <Dropdown
            style={styles.textInput1}
            data={languages}
            labelField="label"
            valueField="value"
            value={formData.customer.language}
            onChange={(value: any) =>
              handleNestedChange('customer', 'language', value.value)
            }
            placeholder="Customer Language"
          />
          {errors.customer_language && (
            <Text style={styles.errorText}>{errors.customer_language}</Text>
          )}

          <Text style={styles.title}>{t("Choose a Vehicle Details")}</Text>

          <Dropdown
            style={styles.textInput1}
            data={wheels.map(wheel => ({
              label: `${getVehicleTypeByWheels(wheel)}`,
              value: wheel,
            }))}
            labelField="label"
            valueField="value"
            value={selectedWheels}
            onChange={item => {
              setSelectedWheel(item.value);
              handleNestedChange('vehicle', 'wheels', item.value);
              console.log(formData.vehicle.wheels);
            }}
            placeholder="Vehicle Wheel Type"
          />
          <Dropdown
            style={styles.textInput1}
            data={categories.map(category => ({
              label: category,
              value: category,
            }))}
            labelField="label"
            valueField="value"
            value={selectedCategory}
            onChange={item => {
              setSelectedCategory(item.value);
              handleNestedChange('vehicle', 'category', item.value);
            }}
            placeholder="Vehicle Category"
          />

          <Text style={styles.title}>{t("Journey Details")}</Text>
          <Dropdown
            style={styles.textInput1}
            data={picktype}
            labelField="label"
            valueField="value"
            value={formData.pickupType}
            onChange={item => {
              handleInputChange('pickupType', item.value);
            }}
            placeholder="PickUp Types"
          />

          {errors.pickupTypes && (
            <Text style={styles.errorText}>{errors.pickupTypes}</Text>
          )}
          {/* </View> */}
          <Text>Pick Up location</Text>

          <TextInput
            style={styles.input}
            placeholder="Select Pickup Location"
            placeholderTextColor={'gray'}
            value={formData.journey.fromAddress}
            onChangeText={(value)=>handleNestedChange("journey","fromAddress",value)}
            
          />
<Text>Drop location</Text>
          <TextInput
            style={styles.input}
            placeholder="Select Drop Location"
            placeholderTextColor={'gray'}
            value={formData.journey.toAddress}
          onChangeText={(value)=>handleNestedChange("journey","toAddress",value)}
          />
           {formData.journeyType === 'Schedule' ||
          formData.pickupType == 'Round' ? (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginVertical: 10,
                }}>
                {/* Display all items from the 'locations' array */}
                {formData.schedule.locations.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 10,
                      backgroundColor: '#f0f0f0',
                      borderRadius: 8,
                      padding: 8,
                      marginRight: 10,
                      borderWidth: 1,
                      borderColor: '#ddd',
                    }}>
                    <TouchableOpacity
                      onPress={() => handleRemoveValue(item)}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          marginLeft: 10,
                          marginRight: 10,
                          fontSize: 16,
                          color: '#333',
                        }}>
                        {item}
                      </Text>
                      <FontAwesome name="remove" size={15} color="#888" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <TextInput
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder="Locations"
                  placeholderTextColor={'gray'}
                  style={{
                    height: 50,
                    width: '80%',
                    borderColor: '#ccc',
                    borderWidth: 1,
                    borderRadius: 5,
                    paddingLeft: 10,
                    marginBottom: 10,
                  }}
                />

                {/* Add Button */}
                <TouchableOpacity
                  onPress={handleAddValue}
                  style={{
                    backgroundColor: '#4CAF50',
                    paddingVertical: 10,
                    paddingHorizontal: 15,
                    borderRadius: 5,
                    height: 50,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
          <TouchableOpacity style={styles.fetchbutton} onPress={getCoordinates}>
            <Text style={styles.fetchbuttontext}>Fetch Distance</Text>
          </TouchableOpacity>
         
          {/* </View> */}
         
          <Text>Total Estimated Distance</Text>
          <TextInput
            value={formData.distance?(formData.distance/1000).toFixed(0).toString():"0"}
            placeholderTextColor={'black'}
            placeholder="Distance"
            style={styles.input}
            editable={false}
          />

          { 
          formData.pickupType == 'Round' ? (
            <>
              <Text>Pickup Time</Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={[
                  styles.input,
                  {alignItems: 'center', justifyContent: 'center'},
                ]}>
                <Text>{formData.pickupTime.toLocaleTimeString()}</Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  is24Hour={true}
                  onChange={onTimeChange}
                />
              )}
              {errors.pickup_time && (
                <Text style={styles.errorText}>{errors.pickup_time}</Text>
              )}
              <Text>From Date</Text>
              <TouchableOpacity
                onPress={() => handleSelectDateField('from')}
                style={[
                  styles.input,
                  {alignItems: 'center', justifyContent: 'center'},
                ]}>
                <Text>{formData.schedule.pickupDate.toLocaleDateString()}</Text>
              </TouchableOpacity>

              {errors.pickupdate && (
                <Text style={styles.errorText}>{errors.pickupdate}</Text>
              )}
              <Text>To Date</Text>
              <TouchableOpacity
                onPress={() => handleSelectDateField('to')}
                style={[
                  styles.input,
                  {alignItems: 'center', justifyContent: 'center'},
                ]}>
                <Text>{formData.schedule.endDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
              {errors.endDate && (
                <Text style={styles.errorText}>{errors.endDate}</Text>
              )}

              {showDatePicker && (
                <DateTimePicker
                  value={formData.schedule.endDate}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
              {errors.date && (
                <Text style={styles.errorText}>{errors.date}</Text>
              )}
              <Text>Trip Days</Text>
              <TextInput
                style={styles.input}
                placeholder="Days"
                placeholderTextColor={'gray'}
                value={formData.schedule.days.toString()}
                onChangeText={value =>
                  handleNestedChange('schedule', 'days', value)
                }
                editable = {false}
            
              />
              {errors.days && (
                <Text style={styles.errorText}>{errors.days}</Text>
              )}
            </>
          ) : null}

          <Text style={styles.title}>{t("Price Details")}</Text>
          <View style={styles.inputContainer}>
            <Text>Base Price For 3Km</Text>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <TouchableOpacity
                onPress={() =>
                  incrementDecrementPriceDetails(
                    'basePrice',
                    'decrement',
                    parseInt(formData.priceDetails.basePrice),
                  )
                }
                style={styles.incredecreButton}>
                <MaterialIcons
                  name="minus"
                  size={25}
                  color="white"
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                placeholderTextColor={'black'}
                keyboardType="numeric"
                value={formData.priceDetails.basePrice.toString()}
                onChangeText={value =>
                  handleNestedChange('priceDetails', 'basePrice', value)
                }
              />
               <TouchableOpacity
                onPress={() =>
                  incrementDecrementPriceDetails(
                    'basePrice',
                    'increment',
                    parseInt(formData.priceDetails.basePrice || '0'),
                  )
                }
                style={styles.incredecreButton}>
                <MaterialIcons
                  name="plus"
                  size={25}
                  color="white"
                  style={styles.icon}
                />
              </TouchableOpacity>
             
            </View>
          </View>

          {errors.base_price && (
            <Text style={styles.errorText}>{errors.base_price}</Text>
          )}

          <View style={styles.inputContainer}>
            <Text>{'Price per Km'}</Text>
            <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={styles.incredecreButton}>
                <MaterialIcons
                  name="minus"
                  size={25}
                  color="white"
                  style={styles.icon}
                  onPress={() =>
                    incrementDecrementPriceDetails(
                      'pricePerKm',
                      'decrement',
                      parseInt(formData.priceDetails.pricePerKm),
                    )
                  }
                />
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                placeholderTextColor={'black'}
                keyboardType="phone-pad"
                value={formData.priceDetails.pricePerKm.toString()}
                onChangeText={value =>
                  handleNestedChange('priceDetails', 'pricePerKm', value)
                }
              />
               <TouchableOpacity
                onPress={() =>
                  incrementDecrementPriceDetails(
                    'pricePerKm',
                    'increment',
                    parseInt(formData.priceDetails.pricePerKm || '0'),
                  )
                }
                style={styles.incredecreButton}>
                <MaterialIcons
                  name="plus"
                  size={25}
                  color="white"
                  style={styles.icon}
                />
              </TouchableOpacity>
            
            </View>
          </View>

          {errors.price_per_km && (
            <Text style={styles.errorText}>{errors.price_per_km}</Text>
          )}

          <View style={styles.inputContainer}>
            <Text>Waiting Charge for 1 minute</Text>
            <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
                onPress={() =>
                  incrementDecrementPriceDetails(
                    'waitingCharges',
                    'decrement',
                    parseInt(formData.priceDetails.waitingCharges),
                  )
                }
                style={styles.incredecreButton}>
                <MaterialIcons
                  name="minus"
                  size={25}
                  color="white"
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                keyboardType="phone-pad"
                placeholderTextColor={'black'}
                value={formData.priceDetails.waitingCharges.toString()}
                onChangeText={value =>
                  handleNestedChange('priceDetails', 'waitingCharges', value)
                }
              />
              <TouchableOpacity
                onPress={() =>
                  incrementDecrementPriceDetails(
                    'waitingCharges',
                    'increment',
                    parseInt(formData.priceDetails.waitingCharges || '0'),
                  )
                }
                style={styles.incredecreButton}>
                <MaterialIcons
                  name="plus"
                  size={25}
                  color="white"
                  style={styles.icon}
                />
              </TouchableOpacity>
            
            </View>
          </View>

          {errors.waiting_charges && (
            <Text style={styles.errorText}>{errors.waiting_charges}</Text>
          )}
          <View style={styles.inputContainer}>
            <Text>Hill Charges for a Trip</Text>
            <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
                onPress={() =>
                  incrementDecrementPriceDetails(
                    'hillCharges',
                    'decrement',
                    parseInt(formData.priceDetails.hillCharges || '0'),
                  )
                }
                style={styles.incredecreButton}>
                <MaterialIcons
                  name="minus"
                  size={25}
                  color="white"
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                placeholderTextColor={'black'}
                keyboardType="phone-pad"
                value={formData.priceDetails.hillCharges.toString()}
                onChangeText={value =>
                  handleNestedChange('priceDetails', 'hillCharges', value)
                }
              />
               <TouchableOpacity
                onPress={() =>
                  incrementDecrementPriceDetails(
                    'hillCharges',
                    'increment',
                    parseInt(formData.priceDetails.hillCharges || '0'),
                  )
                }
                style={styles.incredecreButton}>
                <MaterialIcons
                  name="plus"
                  size={25}
                  color="white"
                  style={styles.icon}
                />
              </TouchableOpacity>
            
            </View>
          </View>

          {errors.hill_charges && (
            <Text style={styles.errorText}>{errors.hill_charges}</Text>
          )}

          <View style={styles.inputContainer}>
            <Text>Driver Allowance for a Day</Text>
            <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
                style={styles.incredecreButton}
                onPress={() =>
                  incrementDecrementPriceDetails(
                    'driverAllowance',
                    'decrement',
                    parseInt(formData.priceDetails.driverAllowance),
                  )
                }>
                <MaterialIcons
                  name="minus"
                  size={25}
                  color="white"
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                placeholderTextColor={'black'}
                keyboardType="phone-pad"
                value={formData.priceDetails.driverAllowance.toString()}
                onChangeText={value =>
                  handleNestedChange('priceDetails', 'driverAllowance', value)
                }
              />
             
              <TouchableOpacity
                style={styles.incredecreButton}
                onPress={() =>
                  incrementDecrementPriceDetails(
                    'driverAllowance',
                    'increment',
                    parseInt(formData.priceDetails.driverAllowance || '0'),
                  )
                }>
                <MaterialIcons
                  name="plus"
                  size={25}
                  color="white"
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {errors.driver_allowance && (
            <Text style={styles.errorText}>{errors.driver_allowance}</Text>
          )}
         

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginRight: 14,
            }}>
           
            {showcalculateButton?
            <TouchableOpacity style={styles.calcButton} onPress={calculateTotalPrice}>
              <Text>Calculate Price</Text>
            </TouchableOpacity>
            : <Text style={{fontSize: 16, fontWeight: 'bold'}}>
              Estimate Price : ₹{estprice.toFixed(0)}
            </Text>}
           
            {/* <Text style={{ fontSize: 16 }}></Text> */}
          </View>

          <View>
            <View style={styles.checkboxContainer}>
              <Checkbox status="checked" onPress={() => {}} color="green" />
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    'https://landing-pg-u-turn.vercel.app/privacy.html',
                  )
                }
                style={styles.resendTextContainer}>
                <Text style={styles.resendText}>
                  By continuing, you agree that you have read and accept our{' '}
                  <Text style={styles.resendLink}>T&Cs and Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

      
       
            <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>{t("BOOK RIDE")}</Text>
            </TouchableOpacity>

    
         
        </ScrollView>
      </View>
      <CustomToast message={toast.message} visible={toast.visible} />
    </>
  );
}
const styles = StyleSheet.create({
  calcButton:{
    backgroundColor:'#FEC110',
    paddingHorizontal:10,
    alignSelf:'flex-end',
    paddingVertical:10,
    borderRadius:10,
    alignItems:'center'
  },
  incredecreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRadius: 3,
    backgroundColor: '#FEC110',
  },
  fetchbutton: {
    backgroundColor: 'green',
    width: '100%',
    paddingVertical: 15,
    marginBottom: 10,
    alignItems: 'center',

    borderRadius: 10,
  },
  fetchbuttontext: {
    color: 'white',
    fontWeight: 'bold',
  },
  savedrafttext: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  savedraft: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#ccc',
    padding: 6,
  },
  icon: {},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
    paddingRight: 10,
    height: 50,
  },
  textInput1: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    height: 50,
    padding: 10,
    borderRadius: 10,
  },
  textInput: {
    width: 60,
    height: 40,
    textAlign: 'center',
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  Buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    bottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 10,
    bottom: 5,
  },
  resendTextContainer: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  nextButton: {
    backgroundColor: '#FEC110',
    borderRadius: 15,
    padding: 10,
    marginBottom:10,
    width: '40%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  resendText: {
    color: 'black',
    textAlign: 'center',
    marginBottom: 10,
  },
  resendLink: {
    color: '#EE0101',
    textDecorationLine: 'underline',
  },
  share: {
    borderBlockColor: 'black',
    width: '40%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginLeft: 5,
    fontSize: 16,
  },
  avatar: {
    width: 57,
    height: 57,
    borderRadius: 50,
    marginLeft: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f4f4f4',
    borderRadius: 5,
  },
  selectedTab: {
    backgroundColor: '#FFC10E',
  },
  selectedTabText: {
    color: '#fff',
  },
  tabText: {
    fontSize: 14,
    color: '#333',
  },
  map: {
    height: '100%',
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 10,
    borderColor: '#ccc',
  },
  picker: {
    height: 50,
    // marginVertical: 10,
    borderRadius: 5,
  },
  submitButton: {
    marginTop: 20,
  },
  
  drawer: {
    position: 'absolute',
    right: 0,
    height: '110%',
    width: 250,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderColor: '#ddd',
    zIndex: 1000,
  },
  drawerContent: {
    justifyContent: 'center',
    padding: 25,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  profileContainer: {
    alignItems: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  profileName: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  editProfile: {
    color: 'red',
    marginTop: 5,
    marginBottom: 20,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  Logout: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    color: '#333',
  },
  drawerItem: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 10,
    color: '#333',
  },
});
