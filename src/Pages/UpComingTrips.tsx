/* eslint-disable no-catch-shadow */
import React, {useState, useEffect} from 'react';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  TextInput,
  Modal,
  Animated,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './Api';
import {SkypeIndicator} from 'react-native-indicators';
import moment from 'moment';
import {Dropdown} from 'react-native-element-dropdown';
import {CommonActions} from '@react-navigation/native';
import Slider from 'react-native-slide-to-unlock';
import Geolocation from 'react-native-geolocation-service';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {useTranslation} from 'react-i18next';

function UpComingTrip() {
  const [trips, setTrips] = useState<any[]>([]);
  const [Createdtrips, setCreatedTrips] = useState<any[]>([]);
  const [filteredCreaetdTrips, setFilteredCreatedTrips] = useState<any[]>([]);
  const {t} = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterId, setFilterId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [msg, setmsg] = useState('');
  const [title, settitle] = useState('');
  const [AlertmodalVisible, setAlertModalVisible] = useState(false);
  const Navigation = useNavigation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerAnimation] = useState(new Animated.Value(250));
  const [name, setname] = useState('');
  const [iscommissionpaid, setiscommissionpaid] = useState(false);
  const [Onduty, setOnduty] = useState(false);
  const [isRiding, setisRiding] = useState(false);
  const [profile, setprofile] = useState('');
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
    Animated.spring(drawerAnimation, {
      toValue: drawerVisible ? 250 : 0,
      useNativeDriver: true,
    }).start();
  };
  const route = useRoute();
  const lowertrip = (route.params as {lowertrip: any}) || {};
  useFocusEffect(
    React.useCallback(() => {
      const fetchTrips = async () => {
        try {
          setLoading(true);
          const id = (await AsyncStorage.getItem('Driver_id')) || '';
          const name = (await AsyncStorage.getItem('Driver_name')) || '';
          const url = (await AsyncStorage.getItem('Profile_pic')) || '';
          setprofile(url);
          setname(name);

          const response = await api.get(`trip/driver/${id}`);
          const data = await api.get(`/driver/get/${id}`);
          setiscommissionpaid(data.data.data.isCommissionPaid);
          setOnduty(data.data.data.onDuty);
          setisRiding(data.data.data.isRiding);
          const completedTrips = response.data.trips.filter(trip => {
            return (
              trip.tripStatus === 'Accepted' ||
              trip.tripStatus === 'Verified' ||
              trip.tripStatus === 'Live'
            );
          });
          // console.log(completedTrips,"tro")
          setTrips(completedTrips);
          const response1 = await api.get(
            `trip/driver-preference/${id}?level=false`,
          );
          setCreatedTrips(response1.data.trips);
          setFilteredCreatedTrips(response1.data.trips);

          setLoading(false);
        } catch (error) {
          console.error('Error fetching trips:', error);
          setError('Failed to load trips');
          setLoading(false);
        }
      };
      if (lowertrip.lowertrip) {
        handlelowertrip();
      } else {
        fetchTrips();
      }
    }, []),
  );
  useEffect(() => {
    if (filterId.trim() === '') {
      setFilteredCreatedTrips(Createdtrips);
    } else {
      const filtered = filteredCreaetdTrips.filter(
        trip =>
          trip.journey.fromAddress
            .toLowerCase()
            .includes(filterId.toLowerCase()) ||
          trip.journey.toAddress.toLowerCase().includes(filterId.toLowerCase()),
      );
      setFilteredCreatedTrips(filtered);
    }
  }, [filterId]);
  const handleFilter = async () => {
    setLoading(true);
    try {
      const id = (await AsyncStorage.getItem('Driver_id')) || '';
      console.log(filterStatus);
      const response = await api.get(
        `trip/driver-preference/${id}?level=true`,
        {radius: filterStatus, liveCoordinates: location},
      );
      setFilteredCreatedTrips(response.data.trips);
    } catch (error) {
      console.log('error filtering', error);
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };
  const handleClearFilters = () => {
    setFilterId('');
    setFilterStatus('');
    setFilteredCreatedTrips(Createdtrips);
    setModalVisible(false);
  };
  const renderTripItem = ({item}: {item: any}) => {
    const statusStyles = {
      default: {backgroundColor: 'blue', color: 'white'},
    };
    const handleNavigate = () => {
      if (Onduty == false) {
        settitle(t('You are in Offline Mode'));

        setmsg(
          t(
            'Currently, you are in offline mode. Please turn it on to get a trip.',
          ),
        );
        setAlertModalVisible(true);
      } else if (iscommissionpaid == false) {
        settitle(t('You havea an Commission pending Amount'));
        setmsg(
          t(
            'You have a pending order. In order to place a new order, you must pay the commission to the respective vendors.',
          ),
        );
        setAlertModalVisible(true);
      } else if (isRiding) {
        settitle('You are in Riding');
        setmsg(
          'You are already on the trip. If you need to take a ride, complete the ride.',
        );
        setAlertModalVisible(true);
      } else {
        if (item.tripStatus == 'Verified')
          Navigation.navigate('Pages/DriverArrivedscreen', {id: item._id});
        else Navigation.navigate('Pages/LiveVideo', {id: item._id});
      }
    };
    const {backgroundColor, color} =
      statusStyles[item.tripStatus] || statusStyles.default;

    const vehicleIcons = {
      '4-Wheeler': 'car',
      '2-Wheeler': 'bicycle-sharp',
      '3-Wheeler': 'car-sport',
    };
    const vehicleIcon = vehicleIcons[item.vehicle.wheels] || 'car';

    const relativeTime = moment(item.createdAt).fromNow();
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
    function formatDate(dateString) {
      const date = new Date(dateString);

      // Check if the date is valid
      if (isNaN(date)) {
        return dateString; // Return the original date string if invalid
      }

      const day = String(date.getDate()).padStart(2, '0'); // Day with leading zero
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Month with leading zero
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    }
    function formatTime(dateString) {
      const date = new Date(dateString);

      // Check if the time is valid
      if (isNaN(date)) {
        return dateString; // Return the original date string if invalid
      }

      const hours = String(date.getHours()).padStart(2, '0'); // Hours with leading zero
      const minutes = String(date.getMinutes()).padStart(2, '0'); // Minutes with leading zero

      return `${hours}:${minutes}`;
    }

    return (
      <View style={styles.tripContainer}>
        <View style={{flexDirection: 'row', marginBottom: 1}}>
          <View style={{marginLeft: 5}}>
            <View style={styles.tripInfoRow}>
              <Text style={styles.tripTitle}>ID: {item.tripId}</Text>
              <TouchableOpacity
                style={[styles.statusButton, {backgroundColor}]}>
                <Text style={[styles.statusButtonText, {color}]}>
                  <FontAwesome name="refresh" color="white" size={20} />{' '}
                  {item.pickupType}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{flexDirection: 'row',gap:20}}>
              <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',
    width:'40%',}}>
              <Ionicons
                name={vehicleIcon}
                size={20}
                color="red"
                style={styles.vehicleIcon}
              />
              <Text style={styles.vehicleText}>
                {getVehicleTypeByWheels(item.vehicle.wheels)}-
                {item.vehicle.category}
              </Text>
              </View>
              <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',
    width:'40%',}}>
              <Ionicons
                name="timer"
                size={20}
                color="green"
                style={styles.timerIcon}
              />
              <Text style={styles.timerText}>CreatedAt {relativeTime}</Text>
              </View>
            </View>
            <View style={{marginTop: 10, width: '100%'}}>
              <Text style={styles.fromToText}>
                From: {item.journey.fromAddress}
              </Text>
              <Text style={styles.fromToText}>
                To: {item.journey.toAddress}
              </Text>
              {
              item.schedule.locations &&
              item.schedule.locations.length > 0 ? (
                <>
                  <Text style={styles.detailsValue}>
                    Via: {item.schedule.locations.join(', ')}
                  </Text>
                </>
              ) : null}
            </View>
          </View>
        </View>

        <View style={[styles.detailsContainer, {padding: 10}]}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>{t('Pickup Time')}:</Text>
            <Text style={styles.detailsValue}>
              {formatTime(item.pickupTime)}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>{t('Pickup Date')}:</Text>
            <Text style={styles.detailsValue}>
              {formatDate(item.schedule.pickupDate)}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>{t('Drop Date')}:</Text>
            <Text style={styles.detailsValue}>
              {formatDate(item.schedule.endDate)}
            </Text>
          </View>
        </View>
        <View style={styles.infoBox}>
          <View style={styles.infoBoxWrapper}>
            <Text style={styles.infoBoxText}> CAB TYPE </Text>
            <Text style={styles.infoBoxValue}>
              {getVehicleTypeByWheels(item.vehicle.wheels)}
            </Text>
          </View>

          <View style={styles.infoBoxWrapper}>
            <Text style={styles.infoBoxText}> TOTAL KM </Text>
            <Text style={styles.infoBoxValue}>{(item.estimatedPriceDetails.estimatedDistance).toFixed(0)}</Text>
          </View>

          <View style={styles.infoBoxWrapper}>
            <Text style={styles.infoBoxText}> PER KM </Text>
            <Text style={styles.infoBoxValue}>
              ₹{item.priceDetails.pricePerKm}
            </Text>
          </View>
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>
              {t('Total Estimated Price')}:
            </Text>
            <Text style={styles.detailsValue}>
              {' '}
              ₹{(item.estimatedPriceDetails.finalEstimatedPrice / 1).toFixed(0)}
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>{t('Commission Percent')}: </Text>
            <Text style={styles.detailsValue}>
              {item.priceDetails.commissionPercentage}%
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>{t('Base Price for 3km')}:</Text>
            <Text style={styles.detailsValue}>
              ₹ {item.priceDetails.basePrice}
            </Text>
          </View>
          {item.priceDetails.hillCharges>0 ? (
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>
                {t('Hill Charges for a trip')}:
              </Text>
              <Text style={styles.detailsValue}>
                ₹{item.priceDetails.hillCharges}
              </Text>
            </View>
          ) : null}
            {item.estimatedPriceDetails.gstPrice>0 ? (
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>
                {t('Gst of 5%')}:
              </Text>
              <Text style={styles.detailsValue}>
                ₹{(item.estimatedPriceDetails.gstPrice/1).toFixed(0)}
              </Text>
            </View>
          ) : null}
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>
              {t('Driver Allowance for 1 day')}:
            </Text>
            <Text style={styles.detailsValue}>
              ₹{item.priceDetails.driverAllowance}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>
              {t('Waiting Charges for a minute:')}
            </Text>
            <Text style={styles.detailsValue}>
              ₹{item.priceDetails.waitingCharges}
            </Text>
          </View>
        </View>
        {item.tripStatus == 'Created' ? (
          <Slider
            onEndReached={handleNavigate}
            containerStyle={{
              margin: 8,
              backgroundColor: '#FFC10E',
              borderRadius: 10,
              padding: 5,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              width: '95%',
            }}
            sliderElement={
              <View style={styles.slider}>
                <AntDesign name="right" color={'white'} size={30} />
              </View>
            }>
            <Text style={{fontWeight: 'bold', fontSize: 20}}>
              {item.tripStatus == 'Created' ? 'Accept Trip' : ''}
            </Text>
          </Slider>
        ) : null}
      </View>
    );
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
  const handlelowertrip = async () => {
    setLoading(true);
    try {
      const id = (await AsyncStorage.getItem('Driver_id')) || '';
      const response = await api.get(`trip/driver-preference/${id}?level=true`);
      setFilteredCreatedTrips(response.data.trips);
    } catch (error) {
      console.log('error fetching lower trip', error);
    } finally {
      setLoading(false);
    }
  };
  const km = [
    {label: '10KM', value: '10000'},
    {label: '15KM', value: '15000'},
    {label: '20KM', value: '20000'},
    {label: '30KM', value: '30000'},
    {label: '50KM', value: '50000'},
  ];
  const [selectedTab, setSelectedTab] = useState('UpComingTrips');
  const [location, setLocation] = useState(null);
  const handleTabPress = (tabName: any) => {
    setSelectedTab(tabName);
  };
  const requestLocationPermission = async () => {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      });

      const result = await request(permission);

      switch (result) {
        case RESULTS.GRANTED:
          console.log('Location permission granted');
          return true;
        case RESULTS.DENIED:
          console.log('Location permission denied');
          return false;
        case RESULTS.BLOCKED:
          console.log('Location permission blocked');
          return false;
        default:
          console.log('Location permission unknown');
          return false;
      }
    } catch (err) {
      console.warn('Error requesting location permission:', err);
      return false;
    }
  };

  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      setError('Location permission required');
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocation({latitude, longitude});
        console.log('Current location:', {latitude, longitude});
        setError(null);
      },
      err => {
        console.error('Error getting location:', err);
        setError('Failed to get location');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: true,
      },
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <>
      {loading ? (
        <View style={styles.overlay}>
          <SkypeIndicator color="white" size={30} />
        </View>
      ) : null}
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => Navigation.goBack()}
            style={styles.backButton}>
            <Ionicons name="chevron-back" size={30} color="black" />
            <Text style={styles.text}>{t('Back')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleDrawer}>
            <Image
              source={
                profile
                  ? {uri: profile}
                  : require('./assets/images/Maskgroup.png')
              }
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* Search Section */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search by (from/to) locations"
            placeholderTextColor={'black'}
            value={filterId}
            onChangeText={text => setFilterId(text)}
            style={styles.searchBar}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setModalVisible(true)}>
            <Ionicons name="filter-sharp" size={15} />
            <Text> Filter</Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[styles.drawer, {transform: [{translateX: drawerAnimation}]}]}>
          <ScrollView>
            <View style={styles.drawerContent}>
              <View style={styles.profileContainer}>
                <View style={styles.profileHeader}>
                  <Image
                    source={
                      profile
                        ? {uri: profile}
                        : require('./assets/images/Maskgroup.png')
                    }
                    style={styles.avatar}
                  />

                  <TouchableOpacity
                    onPress={toggleDrawer}
                    style={styles.closeButton}>
                    <AntDesign name="right" size={30} color="gray" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.profileName}>{name}</Text>
                <TouchableOpacity onPress={() => Navigation.navigate('edit')}>
                  <Text style={styles.editProfile}>{t('Edit Profile')}</Text>
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
                {t('UpComingTrips List')}
              </Text>
              <Text
                style={styles.drawerItem}
                onPress={() =>
                  Navigation.navigate('Pages/ScreenNotification' as never)
                }>
                {t('Notifications')}
              </Text>
              <Text
                style={styles.drawerItem}
                onPress={() => Navigation.navigate('Pages/History' as never)}>
                {t('History')}
              </Text>
            </View>
            <TouchableOpacity onPress={Handlelogout}>
              <Text style={styles.Logout}>
                {t('Log Out')}{' '}
                <AntDesign name="logout" size={30} color={'black'} />
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
        <View style={styles.tabContainer}>
          {['UpComingTrips', 'OnGoing Trips'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.selectedTab]}
              onPress={() => handleTabPress(tab)}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.selectedTabText,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView>
          {loading ? null : error ? (
            <Text style={{textAlign: 'center', color: 'red'}}>{error}</Text>
          ) : trips || Createdtrips ? (
            <>
              {selectedTab === 'UpComingTrips'
                ? filteredCreaetdTrips
                  ? filteredCreaetdTrips.map(trip => (
                      <View key={trip.tripId}>
                        {renderTripItem({item: trip})}
                      </View>
                    ))
                  : null
                : selectedTab == 'OnGoing Trips'
                ? trips
                  ? trips.map(trip => (
                      <View key={trip.tripId}>
                        {renderTripItem({item: trip})}
                      </View>
                    ))
                  : null
                : null}
            </>
          ) : (
            <Text style={{textAlign: 'center', color: '#333', fontSize: 18}}>
              {t('No trips available')}
            </Text>
          )}
        </ScrollView>

        <Modal
          visible={modalVisible}
          animationType="none"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Dropdown
                data={km}
                labelField={'label'}
                valueField={'value'}
                placeholder="Select an KM"
                value={filterStatus}
                onChange={item => setFilterStatus(item.value)}
                style={styles.textInput}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={handleFilter}
                  style={[styles.modelbutton, {backgroundColor: 'green'}]}>
                  <Text style={styles.modelbuttonText}>Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modelbutton, {backgroundColor: 'red'}]}
                  onPress={handleClearFilters}>
                  <Text style={styles.modelbuttonText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={AlertmodalVisible}
          animationType="none"
          transparent={true}
          onRequestClose={() => setAlertModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text
                  style={{fontSize: 16, textAlign: 'center', marginBottom: 10}}>
                  {title}
                </Text>
                <Text style={{textAlign: 'center'}}>{msg}</Text>
              </View>
              <View
                style={[
                  styles.modalButtons,
                  {flexDirection: 'row', justifyContent: 'space-evenly'},
                ]}>
                <TouchableOpacity
                  onPress={() => setAlertModalVisible(false)}
                  style={[styles.modelbutton, {backgroundColor: 'green'}]}>
                  <Text style={styles.modelbuttonText}>Ok</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modelbutton, {backgroundColor: 'red'}]}
                  onPress={() => setAlertModalVisible(false)}>
                  <Text style={styles.modelbuttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    marginTop: 2,
    borderRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  selectedTab: {
    // backgroundColor: '#FAB400',
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    color: 'black',
  },
  selectedTabText: {
    color: 'black',
  },
  chatContainer: {
    flex: 1,
  },
  textInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    paddingLeft: 15,
    marginVertical: 10,
  },
  slider: {
    backgroundColor: '#2FC400',
    padding: 10,
    borderRadius: 10,
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
  modelbuttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
  },
  modelbutton: {
    backgroundColor: '#ccc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  detailsContainer: {
    justifyContent: 'space-between',
    // marginTop:10,
    padding: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailsLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    // width:"80%"
  },
  detailsValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#777',
  },
  viewmore: {
    backgroundColor: '#FFC10E',
    alignSelf: 'center',
    padding: 10,
    margin: 10,
    borderRadius: 50,
  },
  viewmoretext: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalInput: {
    width: '100%',
    height: 40,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalButtons: {
    // flexDirection: "row",

    width: '100%',
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  searchBar: {
    height: 40,
    width: '75%',
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 10,
    borderRadius: 30,
    paddingLeft: 10,
  },
  filterButton: {
    flexDirection: 'row',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 6,
    borderRadius: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#FFC10E',
    borderRadius: 20,
    width: 100,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  text: {
    fontSize: 19,
    marginLeft: 8,
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
  tripContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  tripTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },
  vehicleText: {
    fontSize: 16,
    color: 'red',
    marginLeft: 5,
  },
  timerText: {
    fontSize: 16,
    color: 'green',
    width:'100%',
    marginLeft: 5,
  },
  timerIcon: {
    marginLeft: 10,
  },
  vehicleIcon: {
    marginRight: 5,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    marginLeft: 50,

    // alignSelf: "center",
    borderRadius: 20,
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 1, // Allow text to wrap if necessary
  },
  fromToText: {
    fontSize: 16,
    // marginRight: 20,
    // width:'40%',
    marginBottom: 10,
    color: '#555',
    // flexShrink: 2,
  },
  tripInfoRow: {
    flexDirection: 'row',
    // justifyContent: "space-around",
    alignItems: 'center',
    marginBottom: 10,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  infoBoxText: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  infoBoxValue: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  infoBoxWrapper: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    width: '60%',
    borderColor: '#ddd',
    marginRight: 10,
    alignItems: 'center',
  },
});
export default UpComingTrip;
