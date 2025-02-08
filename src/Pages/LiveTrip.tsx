import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  ToastAndroid,
  Alert,
  ScrollView,
  Pressable,
  Animated,
  Linking,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import api from './Api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Slider from 'react-native-slide-to-unlock';
import {SkypeIndicator} from 'react-native-indicators';
import {Platform} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import { getData, setData } from './assets/formatter';
import notifee, { AndroidColor } from '@notifee/react-native';
import { useTranslation } from 'react-i18next';

export default  function LiveTrip() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const {t}=useTranslation()
  const [isRunning, setIsRunning] = useState(false);
  const [profile, setprofile] = useState<any>(null);
  const [tripDetails, setTripDetails] = useState<any | null>([]);
  const [id, setId] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerAnimation] = useState(new Animated.Value(250));
  const [name, setname] = useState('');
  const [time, setTime] = useState(0);  // Time in seconds...
  const [currentAppState, setCurrentAppState] = useState("active");
  const intervalRef = useRef(null);
  const currentTimerStateKey = "isTimerStarted"
  const key = "Timer"

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
    Animated.spring(drawerAnimation, {
      toValue: drawerVisible ? 250 : 0,
      useNativeDriver: true,
    }).start();
  };
  const dialNumber = (number: any) => {
    const url = `tel:${number}`;
    Linking.openURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          showToast(
            'error',
            'Erro',
            'Unable to open the dial the phone Number :( ',
          );
          Alert.alert('Cannot dial this number'); // Handle the error if the device cannot handle the URL
        }
      })
      .catch(err => {
        console.error('Error opening URL', err);
        Alert.alert('An error occurred');
      });
  };
  const handleSubmit = async () => {
    const id=tripDetails[0]._id
    await AsyncStorage.removeItem('tripID');
    if(isRunning)
    {
      ToastAndroid.show("Timer is running stop the timer to complete",ToastAndroid.SHORT)
      return
    }

    setData(0)
    setTime(0)
    navigation.navigate('Speedometer', {id: id,waitingtime:time});
  };
  const showToast = (
    type: 'success' | 'error',
    title: string,
    message: string,
  ) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(title, message);
    }
  };
  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      stopForegroundService()
      setData(currentTimerStateKey, false);
    } else {
      setData(currentTimerStateKey, true);
      startForegroundService()
      // const id = setInterval(() => {
      //   setSeconds(prev => prev + 1); // Increase the seconds
      // }, 1000); // Update every second (1000 ms)
      // setIntervalId(id);
      setIsRunning(true);
    }
  };
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600); // Get hours
    const minutes = Math.floor((totalSeconds % 3600) / 60); // Get minutes
    const seconds = totalSeconds % 60; // Get remaining seconds
    return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };
  const Handlelogout = async () => {
    await AsyncStorage.removeItem('Driver_id');
    await AsyncStorage.removeItem('Driver_name');
    await AsyncStorage.removeItem('Profile_pic');
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Pages/Home'}],
      }),
    );
  };
  useEffect(() => {
    const appState = AppState.addEventListener('change', (presentAppState) => {
      
      if (presentAppState === 'background') {
        intervalRef.current && clearInterval(intervalRef.current)
      } else if (presentAppState === 'active') {
        setCurrentAppState(presentAppState);
        getTimeFromAsyncStorage();
        getTimerRunningState();
      }
    });

    return () => {
      appState.remove();
    }
  }, [])
  useEffect(() => {
    getTimeFromAsyncStorage();
    getTimerRunningState();
  }, [])

  const getTimeFromAsyncStorage = async() => {
    const time = await getData(key);

    if (time) {
      setTime(parseInt(time))
    }

  } 
  const getTimerRunningState = async() => {
    const timerState = await getData(currentTimerStateKey);
    console.log("timer state",timerState)
    if (timerState == "true") {
      displayNotification();
      setIsRunning(true)
      // await startForegroundService()
    }
  }
  const displayNotification = () => {
      intervalRef.current = setInterval(() => {
        if (currentAppState === "active") {
          setTime((prevTime) => {
            const newTime = prevTime + 1;
            setData(key, newTime);
            // Update the notification with the new time
            if (Platform.OS === 'android') {
              notifee.displayNotification({
                id: '1',
                title: 'Foreground service',
                body: `Timer: ${formatTime(newTime)}`,
                android: {
                  channelId: "default",
                  asForegroundService: true,
                  color: AndroidColor.LIGHTGRAY,
                  colorized: true,
                  onlyAlertOnce: true,
                  ongoing: true   // use this property to restrict the user from dismissing the notification.
                },
              });
            }
            return newTime
          });
        }
    }, 1000)
  }
  const startForegroundService = async() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (Platform.OS === "android") {
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });
      displayNotification();
    }
  }
  const stopForegroundService = async() => {
    setData(currentTimerStateKey, false);
    intervalRef.current && clearInterval(intervalRef.current);
    if (Platform.OS === "android") {
      await notifee.stopForegroundService();
    }
  }   

  useFocusEffect(
    React.useCallback(() => {
      const fetchTrips = async () => {
        const id = (await AsyncStorage.getItem('Driver_id')) || '';
        const name = (await AsyncStorage.getItem('Driver_name')) || '';
        const url = (await AsyncStorage.getItem('Profile_pic')) || '';
        setprofile(url)
        setname(name);
        setLoading(true);
        try {
          const response = await api.get(`/trip/driver/${id}`);
          const filteredTrips = response.data.trips.filter((trip: any) =>
            ['Live'].includes(trip.tripStatus),
          );
          setTripDetails(filteredTrips);
          const ID = await AsyncStorage.getItem('tripID')||'';
          setLoading(false);
        } catch (error) {
          console.error('Error fetching trips:', error);
          //   setError("Failed to load trips");
          setLoading(false);
        }
      };
      fetchTrips();
    }, []),
  );



  return (
    <>
      {loading ? (
        <View style={styles.overlay}>
          <SkypeIndicator color="white" size={30} />
        </View>
      ) : null}
      <View style={styles.container}>
        {/* Map View */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="chevron-back" size={30} color="black" />
            <Text style={styles.text}>{t("Back")}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleDrawer}>
            <Image
              source={profile?{uri:profile}:require('./assets/images/Maskgroup.png')}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.statusTitle}>{t("Waiting Timer")}</Text>

          <Text style={styles.time}>
            {formatTime(time)}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              margin: 10,
            }}>
            <View style={{flexDirection: 'row', gap: 10}}>
              <TouchableOpacity
                onPress={toggleTimer}
                style={[
                  styles.button,
                  {backgroundColor: isRunning ? 'red' : 'green'},
                ]}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    color: 'white',
                  }}>
                  {isRunning ? 'Stop' : 'Start'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.bottomContent}>
          {tripDetails && tripDetails.length > 0 ? (
            <>
              {/* <Text style={styles.liveTripText}>Live Trips</Text> */}

              <View style={styles.tripDetails}>
                <View style={styles.tripRow}>
                  <Text style={styles.tripIdText}>
                    # ID: {tripDetails[0].tripId || ''}
                  </Text>

                  <View style={styles.iconContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        dialNumber(tripDetails[0]?.tripCreatedBy?.mobileNumber)
                      }>
                      <MaterialIcons
                        name="local-phone"
                        size={30}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    // justifyContent: "space-evenly",
                    marginBottom: 10,
                  }}>
                  <Pressable>
                    <Text style={styles.status}>Picked</Text>
                  </Pressable>

                  <Pressable style={styles.sos} onPress={() => dialNumber(100)}>
                    <Text style={styles.sostext}>SOS</Text>
                  </Pressable>
                  <View></View>
                </View>

                <Text style={styles.statusTitle}>{t("Status Details")}</Text>

                <View style={styles.tripInfoContainer}>
                  <View style={styles.tripInfoRow}>
                    <Ionicons name="location" size={30} />
                    <Text style={styles.tripLocationText}>
                      {tripDetails[0]?.journey?.fromAddress || ''}
                    </Text>
                  </View>

                  <View style={styles.tripInfoRow}>
                    <Ionicons name="location-outline" size={30} />
                    <Text style={styles.tripLocationText}>
                      {tripDetails[0]?.journey?.toAddress || ''}
                    </Text>
                  </View>
                </View>
              </View>
              <Slider
                onEndReached={handleSubmit}
                containerStyle={{
                  // margin: 8,
                  backgroundColor: '#FFC10E',
                  borderRadius: 10,
                  padding: 5,
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '98%',
                }}
                sliderElement={
                  <View style={styles.slider}>
                    <AntDesign name="right" color={'white'} size={30} />
                  </View>
                }>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>
                  {t('Complete')}
                </Text>
              </Slider>
            </>
          ) : (
            <Text
              style={{
                fontWeight: 'bold',
                color: 'gray',
                fontSize: 20,
                marginTop: 100,
                textAlign: 'center',
              }}>
              {t("No Live Trips")}
            </Text>
          )}
        </ScrollView>

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
                <TouchableOpacity onPress={()=>navigation.navigate("edit" as never)}>
                  <Text style={styles.editProfile}>{t("Edit Profile")}</Text>
                </TouchableOpacity>
              </View>

             
              <Text
                style={styles.drawerItem}
                onPress={() =>
                  navigation.navigate('Pages/UpComingTrips' as never)
                }>
                {t("UpComingTrips List")}
              </Text>
              <Text
                style={styles.drawerItem}
                onPress={() =>
                  navigation.navigate('Pages/ScreenNotification' as never)
                }>
                {t("Notifications")}
              </Text>
              <Text
                style={styles.drawerItem}
                onPress={() => navigation.navigate('Pages/History' as never)}>
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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
  picked: {
    backgroundColor: '#FFC10E',
    borderRadius: 20,
    padding: 8,
    height: 40,
  },
  sos: {
    // borderWidth: 1,
    // borderColor: "red",
    backgroundColor: '#EBEBEB',
    borderRadius: 20,
    padding: 8,
    marginLeft: 10,
    // height: 40,
    paddingVertical:4,alignItems:'center',
    justifyContent:'center',
    paddingHorizontal:20,
  },
  sostext: {
    fontWeight: 'bold',
    // color: "red",
  },
  pickedtext: {
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    width: '100%',
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowOffset: {width: 2, height: 2},
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 50,
    marginBottom: 10,
  },
  text: {
    fontSize: 19,
    color: '#333',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    borderRadius: 35,
    height: 60,
    width: 60,
  },
  bottomContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  liveTripText: {
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    color: '#333',
  },
  tripDetails: {
    marginBottom: 20,
  },
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    alignItems: 'center',
  },
  tripIdText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  iconContainer: {
    backgroundColor: '#01DD00',
    padding: 10,
    borderRadius: 50,
  },
  statusTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },
  tripInfoContainer: {
    // marginTop: 20,
  },
  tripInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  tripLocationText: {
    fontSize: 16,
    width: '90%',
    color: '#333',
  },
  tripDetailsText: {
    fontSize: 16,
    color: '#666',
  },
  status: {
    color: 'black',
    fontWeight: 'bold',
    width: 90,
    textAlign: 'center',
    backgroundColor: '#FFC10E',
    borderRadius: 50,
    paddingVertical: 5,
    marginVertical: 5,
  },
  slider: {
    backgroundColor: '#2FC400',
    padding: 10,
    borderRadius: 10,
  },
  time: {
    fontSize: 55,
    fontWeight: 'bold',
    color: 'red',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    textAlign: 'right',
    // marginHorizontal: 2,
    // padding: 8,
    // marginRight:10,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    // marginTop:-5,\'
    height: 40,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  tripItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tripDetailsContainer: {
    flexDirection: 'column',
    marginLeft: 15,
    width: '70%',
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tripStatus: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#FAB400',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  tripStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#FAB400',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
});
