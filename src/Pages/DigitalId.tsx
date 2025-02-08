import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image, Alert, Platform, PermissionsAndroid, ToastAndroid } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import ViewShot from "react-native-view-shot";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import api from './Api';

export default function DigitalId() {
  const Navigation = useNavigation();
  const [driver, setDriver] = useState([]);
  const viewShotRef = useRef();
  const [profile,setprofile]=useState("")

  const fetchDriverData = async () => {
    const id = await AsyncStorage.getItem("Driver_id") || '';
    const url = await AsyncStorage.getItem("Profile_pic") || '';
    setprofile(url)
    try {
      const response = await api.get(`driver/get/${id}`);
      setDriver(response.data.data);
    } catch (error) {
      console.log("Error fetching driver data", error);
      Alert.alert("Error", "Failed to fetch driver data");
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  const requestSavePermission = async () => {
    if (Platform.OS !== 'android') return true;
    
    try {
      const permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
      const hasPermission = await PermissionsAndroid.check(permission);
      
      if (hasPermission) return true;

      const status = await PermissionsAndroid.request(permission, {
        title: "Storage Permission",
        message: "App needs access to storage to save photos",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      });
      
      return status === 'granted';
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const captureAndSaveImage = async () => {
    try {
      // First check/request permissions
      const hasPermission = await requestSavePermission();
      if (!hasPermission) {
        Alert.alert(
          "Permission Denied", 
          "Please grant storage permission to save the ID card."
        );
        return;
      }
  
      // Capture the view
      const uri = await viewShotRef.current.capture();
      console.log("Captured image URI:", uri);
  
      // Save to camera roll using the correct method
      const result = await CameraRoll.save(uri, {
        type: 'photo',
        album: 'U-Turn Digital IDs'
      });
  
      ToastAndroid.show(
        "ID card saved to gallery successfully!",
        ToastAndroid.SHORT
      );
  
    } catch (error) {
      console.log("Error capturing the screen:", error);
    
    }
  };
  
  // Rest of your component remains the same...
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => Navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={30} color="black" />
          <Text style={styles.text}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
             
             Navigation.navigate('Components/Help' as never)
           }}
           style={styles.help}>
         <Text style={styles.helpText}>? Help</Text>
        </TouchableOpacity>
      </View>

      <ViewShot ref={viewShotRef} style={styles.idCardContainer} options={{ format: 'jpg', quality: 0.9 }}>
        {/* ID Card Design */}
        <View style={styles.idCard}>
          <View style={{flexDirection:'row',gap:10,marginBottom:10}}>
            <Image source={require('./assets/images/icon.png')} style={styles.idCardImage} />
            <View>
              <Text style={styles.idCardTitle}>U-TURN Driver</Text>
              <Text style={styles.idCardSubtitle}>Digital ID of {driver?.fullName}</Text>
            </View>
          </View>
          <Image
            source={profile?{uri:profile}:require('./assets/images/dash3.jpg')}
            style={{height:100,width:100,borderRadius:50,marginBottom:10}}
          />
          <View style={styles.idDetails}>
            <View style={styles.idDetailRow}>
              <Text style={styles.idDetailTitle}>Driver ID:</Text>
              <Text style={styles.idDetailValue}>{driver?.driverId || "N/A"}</Text>
            </View>
            <View style={styles.idDetailRow}>
              <Text style={styles.idDetailTitle}>Driver Name:</Text>
              <Text style={styles.idDetailValue}>{driver?.fullName || "N/A"}</Text>
            </View>
            <View style={styles.idDetailRow}>
              <Text style={styles.idDetailTitle}>Driver Mobile:</Text>
              <Text style={styles.idDetailValue}>{driver?.mobileNumber || "N/A"}</Text>
            </View>
            <View style={styles.idDetailRow}>
              <Text style={styles.idDetailTitle}>Driver State:</Text>
              <Text style={styles.idDetailValue}>{driver?.preferredState || "N/A"}</Text>
            </View>
            <View style={styles.idDetailRow}>
              <Text style={styles.idDetailTitle}>Driver Language:</Text>
              <Text style={styles.idDetailValue}>{driver?.preferredLanguage || "N/A"}</Text>
            </View>
            <View style={styles.idDetailRow}>
              <Text style={styles.idDetailTitle}>Vehicle No:</Text>
              <Text style={styles.idDetailValue}>{driver?.vehicleDetails?.vehicleNumber || "N/A"}</Text>
            </View>
          </View>
        </View>
      </ViewShot>

      <TouchableOpacity onPress={captureAndSaveImage} style={styles.captureButton}>
        <Text style={styles.captureButtonText}>Capture & Save to Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  help: {
    backgroundColor: '#FFC10E',
    borderRadius: 10,
    paddingVertical:7,
    padding: 4,
    paddingHorizontal:10,
    // height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    fontWeight: 'bold',
    color: 'black',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  avatar: {
    borderRadius: 35,
    height: 57,
    width: 57,
  },
  idCardContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    backgroundColor:'white',
    alignItems: 'center',
  },
  idCard: {
    width: '100%',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
  },
  idCardImage: {
    height: 66,
    width: 66,
    marginBottom: 10,
  },
  idCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  idCardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign:'center'
  },
  idDetails: {
    width: '100%',
  },
  idDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    width: '100%',
  },
  idDetailTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  idDetailValue: {
    fontSize: 16,
    color: '#555',
  },
  captureButton: {
    backgroundColor: '#f05252',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
