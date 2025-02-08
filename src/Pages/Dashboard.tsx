import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  ImageBackground,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {Switch} from 'react-native-paper';
import {FAB} from 'react-native-paper';
import {SkypeIndicator} from 'react-native-indicators';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFocusEffect,
  useNavigation,
  } from '@react-navigation/native';
import api from './Api';
import {CommonActions} from '@react-navigation/native';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
// import { generateSignedUrl } from './assets/aws';

async function Dashboard() {
  const [isSwitchOn, setIsSwitchOn] = React.useState(false);
  const {t}=useTranslation()
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerAnimation] = useState(new Animated.Value(250));
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useNavigation();
  const [loweralert, setloweralert] = useState(false);
  const [lasttrip, setLastTrip] = useState({});
  const [profile, setprofile] = useState('');
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
    Animated.spring(drawerAnimation, {
      toValue: drawerVisible ? 250 : 0,
      useNativeDriver: true,
    }).start();
  };
  const onToggleSwitch = async () => {
    setIsSwitchOn(!isSwitchOn);
    setLoading(true);
    try {
      const id = await AsyncStorage.getItem('Driver_id');
      // console.log(id)
      const response = await api.put(`/driver/update/${id}`, {
        onDuty: !isSwitchOn,
      });
      //  console.log(response.data)
      // console.log('Message', response.data);
    } catch (error) {
      console.error('Error turning in to onduty:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchTrips = async () => {
    const id = await AsyncStorage.getItem('Driver_id');
    const url = (await AsyncStorage.getItem('Profile_pic')) || '';
    setprofile(url);
    setLoading(true);
    try {
      const response = await api.get(`driver/get/${id}`);
      const response1 = await api.get(`trip/driver/${id}`);
      const createdTrips = response1.data.trips.filter(
        trip => trip.tripStatus === 'Commission Paid',
      );
      setLastTrip(createdTrips[createdTrips.length - 1]);
      setTrips(response.data.data);
      if (response.data.data.onDuty) setIsSwitchOn(true);
      else setIsSwitchOn(false);
    } catch (error) {
      console.error('Error fetching driver:', error);
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchTrips();
    }, []),
  );
  const Handlelogout = async () => {
    await AsyncStorage.removeItem('Driver_id');
    await AsyncStorage.removeItem('Driver_name');
    await AsyncStorage.removeItem('Profile_pic');
    router.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Pages/Home'}],
      }),
    );
  };
  const handleloweralert = () => {
    setloweralert(!loweralert);
    if (!loweralert) {
      router.navigate('Pages/UpComingTrip', {lowertrip: !loweralert});
    }
  };
  // console.log(await generateSignedUrl("videos/user-uploads/21af8d4a-223f-433f-b312-8b838fe8519b.mov"))

  return (
    <>
      {loading ? (
        <View style={styles.overlay}>
          <SkypeIndicator color="white" size={30} />
        </View>
      ) : null}
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header1}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
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
            <TouchableOpacity style={styles.home} onPress={onToggleSwitch}>
              <Text style={styles.onDutyText}>
                {isSwitchOn ? 'Online' : 'Offline'}
              </Text>

              <Switch
                value={isSwitchOn}
                onValueChange={onToggleSwitch}
                style={{
                  alignSelf: 'center',
                }}
                trackColor={{
                  true: 'green', // Color when ON
                  false: 'red', // Color when OFF
                }}
                thumbColor={isSwitchOn ? 'white' : 'white'}
              />
            </TouchableOpacity>

            <View style={styles.rightContainer}>
              <TouchableOpacity
                onPress={() =>
                  router.navigate('Pages/ScreenNotification' as never)
                }>
                <Icon name="bell" size={35} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <ScrollView>
          <View style={{padding: 10}}>
            <View style={styles.leftContainer}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.welcomeText}>
                  {t("Hello")}, <Text style={{color: 'black'}}>{trips.fullName}</Text>
                </Text>
                <TouchableOpacity style={styles.home1}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      textAlign: 'center',
                      fontSize: 16,
                    }}>
                    Go Home
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.welcomeMessage}>My Tasks</Text>
            </View>
            <View style={{flexDirection: 'row', alignSelf: 'flex-end',marginBottom:10}}>
              <Text>{t("Lower Trip")}</Text>
              <Switch
                value={loweralert}
                style={{
                  alignSelf: 'center',
                }}
                trackColor={{
                  true: 'green', // Color when ON
                  false: 'red', // Color when OFF
                }}
                onChange={handleloweralert}
                thumbColor={'white'}
              />
            </View>
            <View style={styles.imageContainer}>
              <View style={styles.imagerow}>
                <TouchableOpacity
                  onPress={() => router.navigate('Pages/Profits' as never)}>
                  <Image
                    source={require('./assets/images/dash2.png')}
                    style={styles.imageItem1}
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image
                    source={require('./assets/images/dash1.png')}
                    style={styles.imageItem}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
              onPress={() => router.navigate("Pages/UpComingTrip" as never)}
              >
                <Image
                  source={require('./assets/images/dash3.jpg')}
                  style={styles.mapimage}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.te}
              onPress={() => router.navigate('Pages/Profits')}>
              <Text style={{fontWeight: 'bold', fontSize: 20}}>
                {t("Today’s Earning")}
              </Text>
              <Text style={{fontWeight: 'bold', fontSize: 20}}>
                ₹ {lasttrip?.todayEarnings || '0'}
              </Text>
              <AntDesign name="down" color={'black'} size={25} />
            </TouchableOpacity>
          </View>

          <View style={styles.bottom}>
            <MaterialCommunityIcons name="check-circle" size={40} />
            <View>
              <Text style={{fontWeight: 'bold', fontSize: 20}}>
                {t("Last Order Earning")}
              </Text>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <Text style={{fontWeight: 'bold', fontSize: 18}}>
                  ₹{' '}
                  {isNaN(lasttrip?.finalPrice?.driverEarnings / 1)
                    ? 0
                    : (lasttrip?.finalPrice?.driverEarnings / 1).toFixed(0)}
                </Text>

                <Text style={{fontSize: 16}}>
                  {moment(lasttrip?.statusHistory?.CommissionPaid).fromNow()}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={{padding: 10}}>
            <Image
              source={require('./assets/images/dash10.jpg')}
              style={styles.dash10}
            />
          </TouchableOpacity>
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
                <Text style={styles.profileName}>{trips.fullName}</Text>
                <TouchableOpacity
                  onPress={() => router.navigate('edit' as never)}>
                  <Text style={styles.editProfile}>{t("Edit Profile")}</Text>
                </TouchableOpacity>
              </View>
              <Text
                style={styles.drawerItem}
                onPress={() => router.navigate('DigitalID' as never)}>
                {t("Digital ID")}
              </Text>
              <Text
                style={styles.drawerItem}
                onPress={() => router.navigate('Pages/UpComingTrips' as never)}>
                {t("UpComingTrips List")}
              </Text>
              <Text
                style={styles.drawerItem}
                onPress={() =>
                  router.navigate('Pages/ScreenNotification' as never)
                }>
                {t("Notifications")}
              </Text>
              <Text
                style={styles.drawerItem}
                onPress={() => router.navigate('Pages/History' as never)}>
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

export default Dashboard;

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
  switch: {
    color: 'green',
  },
  imageItem: {
    marginRight: 10,
    width: 120,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  imageItem1: {
    marginRight: 10,
    width: 188,
    resizeMode: 'contain',
    borderRadius: 10,
    // marginBottom: 10,
  },
  imagerow: {
    flexDirection: 'row',
    alignItems:'center',
    justifyContent:'center'
  },
  mapimage: {
    borderRadius: 30,
    alignSelf: 'center',
    width: 325,
    resizeMode: 'contain',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // padding: 10,
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
  dashboardRow: {flexDirection: 'row', justifyContent: 'space-between'},
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    // gap:10,
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'lightgray',
    // height: 90,
    width: '90%',
    // marginBottom: 10,
    alignSelf: 'center',
  },
  fab: {
    position: 'absolute',
    color: 'green',
    backgroundColor: 'black',
    margin: 15,
    right: 0,
    borderRadius: 15,
    alignSelf: 'center',
    bottom: 0,
  },
  home: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  home1: {
    backgroundColor: '#FEC10E',
    borderRadius: 50,

    height: 40,
    padding: 10,
    marginBottom: -10,
    // alignSelf: "center",
    width: '30%',
    // justifyContent: "center",
    alignItems: 'center',
  },
  onDutyBox: {
    borderWidth: 4,
    borderColor: '#FFFFFF',
    // paddingHorizontal: 10,
    backgroundColor: '#FEC10E',
    // paddingVertical: 5,
    borderRadius: 40,
    alignSelf: 'center',
    height: 50,

    width: 60,
    // marginRight: 10,
    marginTop: -30,
  },
  onDutyText: {
    // color: '#FFFFFF',
    marginTop: 5,
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 18,
  },
  te: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFC10E',
    padding: 15,
    marginTop:10,
    alignSelf: 'center',
    height: 60,
    width: '95%',
    borderRadius: 50,
  },

  dash10: {
    height: 130,
    width: '95%',
    marginBottom: 30,
    // marginTop: 10,
    alignSelf: 'center',
  },
  dash3title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 20,

    textAlign: 'right',
  },
  container: {
    flex: 1,
    // padding:20,
    backgroundColor: 'white',
  },
  header1: {
    // justifyContent:'center',

    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 2},
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingHorizontal: 10,
    marginTop: 10,
    // padding:10paddingri
    paddingRight: 10,
    // paddingVertical: 15,
  },
  leftContainer: {
    padding: 10,
  },
  rightContainer: {
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: '700',
    color: '#DF0001',
  },
  welcomeMessage: {
    fontSize: 16,
    color: '#333',
  },
  avatar: {
    borderRadius: 35,
    height: 60,
    width: 60,
    marginLeft: 10,
    marginBottom: 10,
  },
  avatarContainer: {
    marginLeft: 10,
    // marginTop: 30,
  },
});
