import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View, Text, Image, Animated, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {CommonActions, useFocusEffect, useNavigation} from '@react-navigation/native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import api from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {SkypeIndicator} from 'react-native-indicators';
import { useTranslation } from 'react-i18next';

function Profits() {
  const Navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('Today');
  const [trips, setTrips] = useState<any[]>([]);
  const {t}=useTranslation()
  const [loading, setLoading] = useState<boolean>(true);
  const [todayincome, settodayincome] = useState('');
  const [lastweek, setlasweek] = useState('');
  const [lastmonth, setlastmonth] = useState('');
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [profile,setprofile]=useState('')
  const [name,setname]=useState('')
  const [totalTrips, setTotalTrips] = useState(0);
  const [lastTrip, setLastTrip] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
    const [drawerAnimation] = useState(new Animated.Value(250));
      const toggleDrawer = () => {
        setDrawerVisible(!drawerVisible);
        Animated.spring(drawerAnimation, {
          toValue: drawerVisible ? 250 : 0,
          useNativeDriver: true,
        }).start();
      };

  const handleTabPress = (tabName: any) => {
    setSelectedTab(tabName);
    filterTrips(tabName);
  };
  const filterTrips = (tabName: string) => {
    const currentDate = new Date();
    let filteredData = [];

    // Filter based on tab
    switch (tabName) {
      case 'Monthly':
        filteredData = trips.filter(trip => {
          
          const tripDate = new Date(trip.statusHistory.CommissionPaid);
          const lastWeekDate = new Date();
          lastWeekDate.setDate(currentDate.getMonth()); // Get the date 7 days ago
          return tripDate >= lastWeekDate && tripDate <= currentDate;
        })
        break;
      case 'Today':
        filteredData = trips.filter(trip => {
          const tripDate = new Date(trip.statusHistory.CommissionPaid);
          return tripDate.toDateString() === currentDate.toDateString();
        });
        break;
      case 'Last Week':
        filteredData = trips.filter(trip => {
          
          const tripDate = new Date(trip.statusHistory.CommissionPaid);
          const lastWeekDate = new Date();
          lastWeekDate.setDate(currentDate.getDate() - 7); // Get the date 7 days ago
          return tripDate >= lastWeekDate && tripDate <= currentDate;
        });
        break;
      default:
        filteredData = trips;
        break;
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      const fetchTrips = async () => {
        const id = await AsyncStorage.getItem('Driver_id');
        const name = await AsyncStorage.getItem('Driver_name')||''
        const url = (await AsyncStorage.getItem('Profile_pic')) || '';
        setname(name)
        setprofile(url)
        try {
          setLoading(true);
          const response = await api.get(`trip/driver/${id}`);
          const createdTrips = response.data.trips.filter(
            trip => trip.tripStatus === 'Commission Paid',
          );
          setTrips(createdTrips);

          const totalCommission = createdTrips.reduce(
            (acc, trip) => {
              const createdAt = new Date(trip.createdAt); // Convert createdAt to Date object
              const commissionPrice = Number(trip?.finalPrice?.driverEarnings); // Ensure commissionPrice is a number
              const today = new Date();
              const lastWeekStart = new Date(today);
              lastWeekStart.setDate(today.getDate() - 7); // 7 days ago
              const lastMonthStart = new Date(today);
              lastMonthStart.setMonth(today.getMonth() - 1); // 1 month ago

              // Check if the trip was created today
              if (createdAt.toDateString() === today.toDateString()) {
                acc.today += commissionPrice;
              }
              if (createdAt >= lastWeekStart && createdAt < today) {
                acc.lastWeek += commissionPrice;
              }

              // Check if the trip was created in the last month
              if (createdAt >= lastMonthStart && createdAt < today) {
                acc.lastMonth += commissionPrice;
              }

              return acc;
            },
            {today: 0, lastWeek: 0, lastMonth: 0},
          );

          // Calculate the total earnings, total trips, and set the last trip
          const totalEarningsAmount = trips.reduce((sum, trip) => {
            const commissionPrice = Number(trip?.finalPrice?.driverEarnings);

            return sum + (isNaN(commissionPrice) ? 0 : commissionPrice);
          }, 0);

          setTotalEarnings(totalEarningsAmount);
          setTotalTrips(createdTrips.length);
          setLastTrip(createdTrips[createdTrips.length - 1]);
          setlastmonth(totalCommission.lastMonth.toFixed(0));
          setlasweek(totalCommission.lastWeek.toFixed(0));
          settodayincome(totalCommission.today.toFixed(0));

          setLoading(false);
        } catch (error) {
          console.error('Error fetching trips:', error);
          setError('Failed to load trips');
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
            <Icon name="chevron-back" size={30} color="black" />
            <Text style={styles.text}>{t("Back")}</Text>
          </TouchableOpacity>
          <View style={styles.headerIcons}>
            <SimpleLineIcons name="bell" size={30} />
            <TouchableOpacity onPress={toggleDrawer}>
              <Image
                source={profile?{uri:profile}:require('./assets/images/Maskgroup.png')}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={50}
            color={'#FEC10E'}
          />
          <Text style={{fontSize: 18, margin: 10, fontWeight: 'bold'}}>
            {new Date().toDateString()} Today
          </Text>
        </View>
        {/* Tab Container */}
        <View style={styles.tabContainer}>
          {['Monthly', 'Today', 'Last Week'].map(tab => (
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
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>
            {selectedTab === 'Today'
              ? 'Today’s Earning'
              : selectedTab === 'Last Week'
              ? 'Last Week Earnings'
              : selectedTab === 'Monthly'
              ? 'Monthly Income'
              : null}
          </Text>
          <Text style={styles.buttonText}>
            {' '}
            ₹{' '}
            {(selectedTab === 'Today'
              ? todayincome
              : selectedTab === 'last Week'
              ? lastweek
              : selectedTab === 'Monthly'
              ? lastmonth
              : null) || 0}
          </Text>
          {/* Display eags based on selected tab */}
        </TouchableOpacity>

        <View style={styles.completed}>
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 25, fontWeight: 'bold'}}>{totalTrips}</Text>
            <Text style={{fontWeight: 'bold', fontSize: 20}}>{t("Total Trips")}</Text>
          </View>

          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 25, fontWeight: 'bold', color: '#01DD00'}}>
              ₹ {totalEarnings.toFixed(0)}
            </Text>
            <Text style={{fontSize: 18, color: '#01DD00', fontWeight: 'bold'}}>
              {t("Trip Earning")}
            </Text>
          </View>
        </View>

        <View
          style={{
            borderRightWidth: 1,
            borderRightColor: 'gray',
            borderStyle: 'dotted',
          }}
        />
        <View style={styles.bottom}>
          <MaterialCommunityIcons name="check-circle" size={40} />
          <View>
            <Text style={{fontWeight: 'bold', fontSize: 20}}>
              {t("Last Order Earning")}
            </Text>
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontWeight: 'bold', fontSize: 18}}>
                ₹ {isNaN(lastTrip?.finalPrice?.driverEarnings) ? "0" : (lastTrip.finalPrice.driverEarnings / 1).toFixed(0)}

              </Text>
            </View>
          </View>

          {/* <Text style={{fontSize:16}}>Oct<Text>10</Text> 2024</Text> */}
        </View>
      </View>
    </>
  );
}

export default Profits;

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
  container: {
    flex: 1,
    paddingHorizontal: 20,

    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginTop: 10,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  avatar: {
    borderRadius: 35,
    height: 60,
    width: 60,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  selectedTab: {
    backgroundColor: '#FAB400',
    elevation: 4,
  },
  tabText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  selectedTabText: {
    color: '#000',
    fontWeight: 'bold',
  },

  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFC10E',
    borderRadius: 30,
    padding: 15,
    marginVertical: 15,
    height: 60,
    elevation: 3,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'black',
  },
  completed: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 10,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
    backgroundColor: '#f8f8f8',
    padding: 15,
  },
  completedText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
  },
  completedSubText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  earningText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#01DD00',
  },
  tripEarningText: {
    fontSize: 18,
    color: '#01DD00',
    fontWeight: 'bold',
  },

  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'lightgray',
    height: 100,
    marginTop: 20,
  },
  bottomText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  bottomEarningText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'red',
  },
  lastOrderDateText: {
    fontSize: 16,
  },
  lastOrderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
  },
});
