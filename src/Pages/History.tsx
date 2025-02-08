/* eslint-disable quotes */

import React, {useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {Searchbar} from 'react-native-paper';
import {SkypeIndicator} from 'react-native-indicators';
import api from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

export default function History() {
  const Navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('All History');
  const {t}=useTranslation()
  const [trips, setTrips] = useState<any[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerAnimation] = useState(new Animated.Value(250));
  const logout = useRoute();
  const[profile,setprofile]=useState('')
  const [name, setanme] = useState('');
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
    Animated.spring(drawerAnimation, {
      toValue: drawerVisible ? 250 : 0,
      useNativeDriver: true,
    }).start();
  };
  useFocusEffect(
    React.useCallback(() => {
      const fetchTrips = async () => {
        const id = (await AsyncStorage.getItem('Driver_id')) || '';
        const name = (await AsyncStorage.getItem('Driver_name')) || '';
        const url = (await AsyncStorage.getItem('Profile_pic')) || '';
        setprofile(url)
        setanme(name);
        try {
          setLoading(true);
          const response = await api.get(`/trip/driver/${id}?fetchAll=true`);

          const completedTrips = response.data.trips.filter(trip => {
            return (
              trip.tripStatus === 'Commission Pending' ||
              trip.tripStatus == 'Commission Paid' ||
              trip.tripStatus == 'Commission Rejected' ||
              trip.tripStatus == 'Customer Paid'
            );
          });

          setTrips(completedTrips);
          setFilteredTrips(completedTrips);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching trips:', error);
          setError('No trips found');
          setLoading(false);
        }
      };

      fetchTrips();
    }, []),
  );
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

  const handleTabPress = (tabName: any) => {
    setSelectedTab(tabName);
    filterTrips(tabName);
  };

  const filterTrips = (tabName: string) => {
    const currentDate = new Date();
    let filteredData = [];

    switch (tabName) {
      case 'All History':
        filteredData = trips;
        break;
      case 'Today':
        filteredData = trips.filter(trip => {
          const tripDate = new Date(trip.createdAt);
          return tripDate.toDateString() === currentDate.toDateString();
        });
        break;
      case 'Last Week':
        filteredData = trips.filter(trip => {
          const tripDate = new Date(trip.createdAt);
          const lastWeekDate = new Date();
          lastWeekDate.setDate(currentDate.getDate() - 7);
          return tripDate >= lastWeekDate && tripDate <= currentDate;
        });
        break;
      default:
        filteredData = trips;
        break;
    }

    if (searchQuery) {
      filteredData = filteredData.filter(trip => {
        const customerName = trip.customer?.name.toLowerCase();
        const tripId = trip.tripId.toLowerCase();
        return (
          customerName.includes(searchQuery.toLowerCase()) ||
          tripId.includes(searchQuery.toLowerCase())
        );
      });
    }

    setFilteredTrips(filteredData);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    filterTrips(selectedTab);
  };

  const toggleTripDetails = (tripId: string) => {
    setExpandedTripId(expandedTripId === tripId ? null : tripId);
  };

  const renderItem = ({item}: any) => {
    const isExpanded = expandedTripId === item._id; // Check if this trip is expanded

    return (
      <>
        <View
          style={[
            styles.tripContainer,
            {borderBottomWidth: isExpanded ? 0 : 1, borderBottomColor: '#ccc'},
          ]}>
          {/* Avatar */}
          <Image
            source={require('./assets/images/image1.png')}
            style={styles.avatar}
          />

          <View style={styles.tripInfo}>
            {/* Customer's Name */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginRight: 10,
              }}>
              <Text style={styles.customerName}>
                Id: {item.tripId || 'N/A'}
              </Text>
              <TouchableOpacity onPress={() => toggleTripDetails(item._id)}>
                <AntDesign
                  name={isExpanded ? 'upcircle' : 'downcircle'}
                  size={25}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              {/* Trip Duration */}
              <Text
                style={[
                  styles.messageText,
                  {
                    color:
                      item.tripStatus === 'Cancelled'
                        ? 'red'
                        : item.tripStatus === 'Commission Pending' ||
                          item.tripStatus === 'Customer Paid'
                        ? 'orange'
                        : item.tripStatus === 'Commission Rejected'
                        ? 'red'
                        : item.tripStatus === 'Commission Paid'
                        ? 'green'
                        : 'red', // Default color if no condition matches
                  },
                ]}>
                {item.tripStatus == 'Commission Rejected'
                  ? 'Vendor Rejected'
                  : item.tripStatus || 'N/A'}
              </Text>
            </View>

            {item.tripStatus == 'Cancelled' ? (
              <Text style={{color: 'red'}}>
                Reason: {item.cancellationDetails.cancellationReason}
              </Text>
            ) : null}
            {item.tripStatus == 'Commission Paid' ||
            item.tripStatus == 'Customer Paid' ||
            item.tripStatus == 'Commission Rejected' ||
            item.tripStatus == 'Commission Pending' ? (
              <Text>
                Commission Amount: ₹
                {(item?.finalPrice?.commissionPrice / 1).toFixed(0) || 0}
              </Text>
            ) : null}

            {/* Timestamp */}
            <Text style={styles.timestamp}>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleString()
                : 'N/A'}
            </Text>
          </View>
        </View>

        {isExpanded && (
          <View
            style={[
              styles.detailsContainer,
              {
                borderBottomWidth: isExpanded ? 1 : 0,
                borderBottomColor: '#ccc',
              },
            ]}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>{t("Customer Name")}:</Text>
              <Text style={styles.detailsValue}>
                {item.customer?.name || 'N/A'}
              </Text>
            </View>
            <View style={{marginBottom: 10}}>
              <Text style={styles.detailsLabel}>From:</Text>
              <Text style={styles.detailsValue}>
                {item.journey?.fromAddress || 'N/A'}
              </Text>
            </View>
            <View style={{marginBottom: 10}}>
              <Text style={styles.detailsLabel}>To:</Text>
              <Text style={styles.detailsValue}>
                {item.journey?.toAddress || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>
                {t("Comission Percentage of")}{' '}
                {item.priceDetails?.commissionPercentage || '0'}% :
              </Text>
              <Text style={styles.detailsValue}>
                ₹ {(item?.finalPrice?.commissionPrice / 1 || 0).toFixed(0)}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>{t("Trip Type")}:</Text>
              <Text style={styles.detailsValue}>
                {item.pickupType || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>{t("Base Price for 3km")}:</Text>
              <Text style={styles.detailsValue}>
                ₹ {item.priceDetails?.basePrice || '0'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>{t("Per Km")}:</Text>
              <Text style={styles.detailsValue}>
                ₹ {item.priceDetails?.pricePerKm || '0'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>
                Driver Allowance for {item?.finalPrice?.tripDays || '0'}{' '}
                {item?.finalPrice?.tripDays > 1 ? 'days' : 'day'}:
              </Text>
              <Text style={styles.detailsValue}>
                ₹ {(item?.finalPrice?.driverAllowance / 1).toFixed(0) || '0'}
              </Text>
            </View>
            {item?.priceDetails?.hillCharges ? (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>{t("Hill Charges for a trip")}:</Text>
                <Text style={styles.detailsValue}>
                  ₹ {item?.priceDetails?.hillCharges || '0'}
                </Text>
              </View>
            ) : null}
            {item?.finalPrice?.gstPrice > 0 ? (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Gst of 5%:</Text>
                <Text style={styles.detailsValue}>
                  ₹ {(item?.finalPrice?.gstPrice / 1).toFixed(0) || '0'}
                </Text>
              </View>
            ) : null}

            {item?.finalPrice?.finalWaitingTime > 0 && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>
                  waitingCharges for{' '}
                  {(item?.finalPrice?.finalWaitingTime / 60).toFixed(0)}{' '}
                  minutes:
                </Text>
                <Text style={styles.detailsValue}>
                  ₹ {(item?.finalPrice?.waitingCharges / 1).toFixed(0) || '0'}
                </Text>
              </View>
            )}

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>{t("Total Distance")}:</Text>
              <Text style={styles.detailsValue}>
                {item?.finalPrice.finalDistance
                  ? (item?.finalPrice.finalDistance).toFixed(0)
                  : '0'}{' '}
                KM
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>{t("Total Amount")}:</Text>
              <Text style={styles.detailsValue}>
                ₹ {(item?.finalPrice?.finalTotalPrice / 1 || 0).toFixed(0)}
              </Text>
            </View>
            {item.tripStatus == 'Customer Paid' ||
            item.tripStatus == 'Commission Rejected' ? (
              <TouchableOpacity
                onPress={() =>
                  Navigation.navigate('Pages/PaymentMethod', {id: item._id})
                }
                style={[
                  styles.selectedTab,
                  {
                    alignItems: 'center',
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    borderRadius: 10,
                  },
                ]}>
                <Text>{t("Pay Commission")}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </>
    );
  };

  return (
    <>
      {loading ? (
        <View style={styles.loadingIndicator}>
          <SkypeIndicator color="white" size={30} />
        </View>
      ) : null}
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => Navigation.goBack()}
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

        {/* Search Bar */}
        <Searchbar
          placeholder="Search by Name or Trip ID"
          value={searchQuery}
          onChangeText={handleSearchChange}
          style={styles.searchBar}
        />

        {/* Tab Section */}
        <View style={styles.tabContainer}>
          {['All History', 'Today', 'Last Week'].map(tab => (
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

        {/* Trip List Section */}

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredTrips.length === 0 ? (
          <Text style={styles.noTripsText}>{t("No trips available")}</Text>
        ) : (
          <FlatList
            data={filteredTrips}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            // contentContainerStyle={styles.chatContainer}
          />
        )}
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
  },
  detailsValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#777',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  avatar: {
    borderRadius: 35,
    height: 60,
    width: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 19,
    marginLeft: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    height: 50,
    marginBottom: 15,
  },
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
    backgroundColor: '#FAB400',
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
  tripContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  tripInfo: {
    marginLeft: 15,
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 14,
    color: 'green',
  },
  tripStatus: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  loadingIndicator: {
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  noTripsText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});
