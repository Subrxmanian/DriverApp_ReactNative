/* eslint-disable quotes */

import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Platform,
  ToastAndroid,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {updateDriverData, updateUserData} from './redux/Actions';
import api from './Api';
import {SkypeIndicator} from 'react-native-indicators';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {generateSignedUrl} from './assets/aws';
import { useTranslation } from 'react-i18next';

export default function UploadDocuments() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
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
  const {t}=useTranslation()
  const {preferedlanguage, state} =
    (route.params as {preferedlanguage: any; state: any}) || {};
  const userData = useSelector(state => state.userData);

  const store = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/driver/create`, userData);
      showToast('success', 'Driver Registered!', `${response.data.message}`);
      console.log(response.data);
      await AsyncStorage.setItem('Driver_id', response.data.data._id);
      await AsyncStorage.setItem('Driver_name', response.data.data.fullName);
      const url =
        (await generateSignedUrl(response.data.data.profile.profilePicture)) ||
        '';
      if (url) await AsyncStorage.setItem('Profile_pic', url);
      // console.log("Driver id ",response.data.data._id ,"driver name",response.data.data.fullname)
      navigation.navigate('Pages/Notification' as never);
    } catch (error) {
      console.log(error);
      showToast(
        'error',
        'Error!',
        'There was an error registering . Please try again.',
      );
    } finally {
      setLoading(false);
    }
    // navigation.navigate("Pages/Notification" as never);
  };
  const handleSubmit = () => {
    const newUserData = {
      preferredLanguage: preferedlanguage,
      preferredState: state,
    };
    dispatch(updateUserData(newUserData));
    store();
    console.log(userData);
  };
  const waiting =
    userData.componnet1 &&
    userData.componnet2 &&
    userData.componnet3 &&
    userData.componnet4;

  useEffect(() => {
    const fetchDrivers = async () => {
      console.log(userData.componnet1);
      setLoading(true);
      try {
        const response = await api.get('/driver/getAll?fetchAll=true');
        // console.log(response.data.data)
        const data = response.data.data;
        dispatch(updateDriverData(data));
        // console.log("redux updated",driverData)
      } catch (error) {
        console.log('error fetching Drivers', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  return (
    <>
      {loading ? (
        <View style={styles.overlay}>
          <SkypeIndicator color="white" size={30} />
        </View>
      ) : null}

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="chevron-back" size={30} color="black" />
            <Text style={styles.text}>{t("Back")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => navigation.navigate('Components/Help' as never)}>
            <Text style={{fontWeight: 'bold'}}>? {t("Help")}</Text>
          </TouchableOpacity>
        </View>

        <View style={{flexDirection: 'row', marginBottom: 10}}>
          <Image
            source={require('./assets/images/Maskgroup2.png')}
            style={styles.highlightedImage}
          />
          <View style={styles.textContainer}>
            <Text style={{fontWeight: 'bold', padding: 10}}>
              {t("Which type of vehicle do you use")}?
            </Text>
          </View>
        </View>
        <ScrollView>

        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 20,
            padding: 10,
          }}>
          {t("Upload your documents")}:
        </Text>

        <View style={styles.container1}>
          <TouchableOpacity
            style={[
              styles.profileContainer,
              {
                backgroundColor: userData.componnet1 ? '#20dfaf' : '#ffff',
                borderColor: userData.componnet1 ? 'green' : '#FFC10E',
              },
            ]}
            onPress={() => {
              navigation.navigate('ProfileInfo', {
                preferedlanguage: preferedlanguage,
                state: state,
              });
            }}>
            <Entypo name="user" size={30} style={styles.icon} />
            <View style={styles.textContainer2}>
              <Text style={styles.headerText}>{t("Profile Info")}</Text>
              <Text style={styles.subHeaderText}>{t("Upload your details")}</Text>
            </View>
            <AntDesign name="right" size={30} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.profileContainer,
              {
                backgroundColor: userData.componnet2 ? '#20dfaf' : '#ffff',
                borderColor: userData.componnet2 ? 'green' : '#FFC10E',
              },
            ]}
            onPress={() => navigation.navigate('Aadhar')}>
            <FontAwesome name="credit-card-alt" size={30} style={styles.icon} />
            <View style={styles.textContainer2}>
              <Text style={styles.headerText}>{t("Aadhaar Card Info")}</Text>
              <Text style={styles.subHeaderText}>
                {t("Upload your details")}
              </Text>
            </View>
            <AntDesign name="right" size={30} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.profileContainer,
              {
                backgroundColor: userData.componnet3 ? '#20dfaf' : '#ffff',
                borderColor: userData.componnet3 ? 'green' : '#FFC10E',
              },
            ]}
            onPress={() => navigation.navigate('VehicleRc')}>
            <FontAwesome5 name="car-alt" size={30} style={styles.icon} />
            <View style={styles.textContainer2}>
              <Text style={styles.headerText}>{t("Vehicle RC & Vehicle")}</Text>
              <Text style={styles.subHeaderText}>{t("Upload your details")}</Text>
            </View>
            <AntDesign name="right" size={30} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.profileContainer,
              {
                backgroundColor: userData.componnet4 ? '#20dfaf' : '#ffff',
                borderColor: userData.componnet4 ? 'green' : '#FFC10E',
              },
            ]}
            onPress={() => navigation.navigate('DrivingLicence')}>
            <FontAwesome name="drivers-license" size={30} style={styles.icon} />
            <View style={styles.textContainer2}>
              <Text style={styles.headerText}>{t("Driving License")}</Text>
              <Text style={styles.subHeaderText}>{t("Upload your details")}</Text>
            </View>
            <AntDesign name="right" size={30} color="gray" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            {backgroundColor: waiting ? '#FFC10E' : '#FFEFC2'},
          ]}
          onPress={handleSubmit}>
          <Text
            style={[styles.buttonText, {color: waiting ? 'black' : 'gray'}]}>
            {waiting ? t('Submit') :t('Waiting')}
          </Text>
        </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

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
  container: {
    flex: 1,
    padding: 20,
  },
  container1: {
    padding: 0,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFC10E',
    padding: 8,
    borderRadius: 20,
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  icon: {
    marginRight: 15,
  },
  textContainer2: {
    flex: 1,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  subHeaderText: {
    fontSize: 14,
    color: 'gray',
  },
  avatar: {
    borderRadius: 35,
    height: 60,
    width: 60,
  },
  textContainer: {
    alignSelf: 'center',
    height: 60,
    borderTopRightRadius: 20,
    width: 180,
    backgroundColor: '#F4BD46',
  },
  helpButton: {
    backgroundColor: '#FEC110',
    borderRadius: 15,
    padding: 10,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  translate: {
    height: 25,
    width: 25,
    marginLeft: 65,
  },
  verifyButton: {
    borderRadius: 15,
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginBottom: 10,
  },
  highlightedImage: {
    borderWidth: 2,
    borderColor: '#FFC10E',
    borderTopRightRadius: 40,
    shadowColor: '#FFD700',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  text: {
    fontSize: 19,
    marginLeft: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
