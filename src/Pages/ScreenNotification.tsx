import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image, FlatList, ActivityIndicator, Animated, ScrollView } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import api from './Api';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useTranslation } from 'react-i18next';

function Notification() {
  const {t}=useTranslation()
  const Navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);  // Store notifications array
  const [loading, setLoading] = useState(false);  // Loading state
  const [error, setError] = useState(null);  // Error state
const [profile,setprofile]=useState('')
const [name,setname]=useState('')
const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerAnimation] = useState(new Animated.Value(250));
    const toggleDrawer = () => {
      setDrawerVisible(!drawerVisible);
      Animated.spring(drawerAnimation, {
        toValue: drawerVisible ? 250 : 0,
        useNativeDriver: true,
      }).start();
    };
  useEffect(() => {
    setLoading(true);
    const fetchNotifications = async () => {
      const url = await AsyncStorage.getItem("Profile_pic")||''
      const name = await AsyncStorage.getItem("Driver_name")||''
      setname(name)
      setprofile(url)
      try {
        const response = await api.get('notification/getAll?fetchAll=true');
        const filteredNotifications = response.data.results.filter(
          (notif) => notif.category === 'Driver'
        );

        setNotifications(filteredNotifications);
      } catch (error) {
        console.log("Error fetching notifications", error);
        setError('Error fetching notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const renderNotification = ({ item }) => {
    const formattedTime = moment(item.createdAt).fromNow();
   return ( <View style={styles.notificationItem}>
      <Image source={require('./assets/images/tripuser.png')} style={styles.notificationImage} />
      <View style={styles.notificationDetails}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.notificationTitle}>{item.title || 'No Title'}</Text>
          <Text style={styles.timestamp}>{formattedTime || 'now'}</Text>
        </View>
        <Text style={styles.notificationDescription}>{item.body || 'No Description'}</Text>
      </View>
    </View>)
    }
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
        <TouchableOpacity onPress={() => Navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={30} color="black" />
          <Text style={styles.text}>{t("Back")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleDrawer}>
          <Image
          source={profile?{uri:profile}:require('./assets/images/Maskgroup.png')}
           style={styles.avatar} />
        </TouchableOpacity>
      </View>

      {/* Display Loading Spinner */}
      {loading ? (
        <ActivityIndicator size="large" color="#FEC10E" style={styles.loadingIndicator} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        // Render notifications list
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}  // Assuming id is unique
          renderItem={renderNotification}
        />
      )}
    </View>
    </>
  );
}

export default Notification;

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
  buttonText: {
    fontWeight: 'bold',
    color: 'black',
  },
  button: {
    backgroundColor: "#FEC10E",
    margin: 5,
    borderRadius: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f7f7f7',
  },
  avatar: {
    borderRadius: 35,
    height: 57,
    width: 57,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
    marginBottom: 15,
    borderRadius: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  notificationImage: {
    height: 57,
    width: 57,
    borderRadius: 25,
    marginRight: 5,
  },
  notificationDetails: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#888',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateText: {
    color: 'red',
    fontWeight: 'bold',
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
  },
});
