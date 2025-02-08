import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState} from 'react';
import { LogBox, PermissionsAndroid, Platform, View} from 'react-native';
import api from './Pages/Api';
import {useNavigation} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import {SkypeIndicator} from 'react-native-indicators';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

export default function HomeScreen() {
  LogBox.ignoreLogs([
    'Warning: A props object containing a "key" prop is being spread into JSX',
    "Warning: A component was suspended by an uncached promise. Creating promises inside a Client Component or hook is not yet supported, except via a Suspense-compatible library or framework."
  ]);

  const [loading, setLoading] = useState(false);
  const [driver, setDriver] = useState({});
  const [trip, setTrip] = useState({});
  const Navigation = useNavigation();

  useEffect(() => {
    const fetch = async () => {
      const _id = (await AsyncStorage.getItem('Driver_id')) || '';
      if (!_id) {
        handlenavigate('');
      }
      setLoading(true);

      try {
        const response = await api.get(`trip/driver/${_id}`);
        const response1 = await api.get(`driver/get/${_id}`);
        setDriver(response1.data.data);

        const completedTrips = response.data.trips.filter(trip => {
          return (
            trip.tripStatus === 'Accepted' ||
            trip.tripStatus === 'Verified' ||
            trip.tripStatus === 'Live' ||
            trip.tripStatus === 'Arrived' ||
            trip.tripStatus === 'Completed' ||
            trip.tripStatus === 'Customer Paid'
          );
        });

        if (completedTrips.length > 0) {
          setTrip(completedTrips[0]);
        } else {
          Navigation.navigate('Components/Tabnavigation');
        }
      } catch (error) {
        Navigation.navigate('Pages/Home');
        console.log('Error fetching driver', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    requestPermissions();
  }, []);
  useEffect(() => {
    if (trip) {
      handlenavigate(trip);
    }
  }, [trip]);
  const requestPermissions = async () => {
    try {
      // Location Permission
      const locationPermission = await request(
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      );

      // Camera Permission
      const cameraPermission = await request(PERMISSIONS.ANDROID.CAMERA);
      // await request(PERMISSIONS.ANDROID.WRI);
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to storage to save images.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      const galleryPermission =
        Platform.OS === 'android' && Platform.Version >= 33
          ? await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES) // Android 13+ only
          : await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE); // For older versions of Android
      const gallerywritePermission =
        Platform.OS === 'android' && Platform.Version >= 33
          ? await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE) // Android 13+ only
          : await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE); // For older versions of Android
      console.log(gallerywritePermission);
      const notificationPermission = PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      const managepermission =await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      )
    console.log(managepermission);
      // Audio Recording Permission
      const audioPermission = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);

      // Video Permission (can be the same as camera permission)
      const videoPermission = await request(PERMISSIONS.ANDROID.CAMERA);

      // Handling permissions based on results
      if (
        locationPermission === RESULTS.GRANTED &&
        cameraPermission === RESULTS.GRANTED &&
        galleryPermission === RESULTS.GRANTED &&
        audioPermission === RESULTS.GRANTED &&
        videoPermission === RESULTS.GRANTED &&
        gallerywritePermission === RESULTS.GRANTED
      ) {
        console.log('All permissions granted');
        return true; // All permissions granted
      } else {
        console.log('Some permissions were denied');
        return false; // Some permissions were denied
      }
    } catch (error) {
      console.log('Error requesting permissions:', error);
      return false; // Error in requesting permissions
    }
  };
  const handlenavigate = async (trip) => {
    const _id = (await AsyncStorage.getItem('Driver_id')) || '';
    const version = await DeviceInfo.getVersion();
    const driverAppVersion = driver.driverAppVersion?.trim();
    const currentAppVersion = version?.trim();
    if (driverAppVersion && currentAppVersion) {
      if (driverAppVersion === currentAppVersion) {
        if (_id) {
          if (trip.tripStatus === 'Accepted') {
            Navigation.navigate('Pages/LiveVideo', {id: trip._id, flag: true});
          } else if (trip.tripStatus === 'Verified') {
            Navigation.navigate('Pages/DriverArrivedscreen', {
              id: trip._id,
              flag: true,
            });
          } else if (trip.tripStatus === 'Completed') {
            Navigation.navigate('Pages/Completescreen', {
              id: trip._id,
              flag: true,
            });
          } else if (trip.tripStatus === 'Arrived') {
            Navigation.navigate('Pages/TripVerify', {id: trip._id, flag: true});
          } else {
            Navigation.navigate('Components/Tabnavigation');
          }
        } else {
          Navigation.navigate('Pages/Home');
        }
      } else {
        // Navigate to update page if version mismatch
        Navigation.navigate('Update');
      }
    }
  };

  return loading ? (
    <View
      style={{
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
      }}>
      <SkypeIndicator color="white" size={30} />
    </View>
  ) : null; // Empty render for now
}
