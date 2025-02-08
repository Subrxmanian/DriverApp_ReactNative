import React, {useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ToastAndroid,
  Modal,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from 'react-native-slide-to-unlock';
import AntDesign from 'react-native-vector-icons/AntDesign';
import api from './Api';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SkypeIndicator} from 'react-native-indicators';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';

function PaymentMethod() {
  const Navigation = useNavigation();
  const [tripDetails, setTripDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const {id} = route.params as {id: string};
  const [driverid, setdriverid] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
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
  const handleSubmit = async () => {
    try {
      setModalVisible(false)
      setLoading(true);
      const response = await api.put(`/trip/${id}/pending`, {
        driverId: driverid,
      });
      showToast('success', 'Success', `${response.data.message}`);
      Navigation.navigate('Components/Tabnavigation' as never); // Navigate after success
    } catch (error) {
      console.log('Error updating status:', error);
      showToast(
        'error',
        'Error!',
        'There was an error updating status. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const driver = async () => {
      const _id = (await AsyncStorage.getItem('Driver_id')) || '';
      setdriverid(_id);
      try {
        setLoading(true);
        const response = await api.get(`/trip/get/${id}`);
        setTripDetails(response.data.trip);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trip:', error);
        setLoading(false);
      }
    };
    driver();
  }, []);

  const openurl = async () => {
    const mobileNumber = tripDetails.tripCreatedBy.mobileNumber || 0; // Replace with the actual mobile number
    const amount = tripDetails.finalPrice.commissionPrice || 0; // Replace with the actual amount
    const upiLink = `upi://pay?pa=${mobileNumber}@upi&am=${amount}&cu=INR&tn=Payment for services`;

    try {
      Linking.openURL(upiLink);
    } catch (error) {
      console.log('error opening url', error);
    }
  };
  const {t} = useTranslation();
  return (
    <>
      {loading ? (
        <View style={styles.overlay}>
          <SkypeIndicator color="white" size={30} />
        </View>
      ) : null}

      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => Navigation.goBack()}
          style={styles.backButton}>
          <Icon name="chevron-back" size={30} color="black" />
          <Text style={styles.text}>{t('Back')}</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.infoText}>{t('ONLINE OR OFFLINE')}</Text>
          <Text style={styles.instructionText}>
            {t('If you have Google Pay, Phone Pay, or Paytm app open scanner.')}
          </Text>

          <View style={styles.content}>
            <View style={styles.imageCard}>
              <Text
                style={{
                  color: 'red',
                  fontSize: 25,
                  marginBottom: 10,
                  fontWeight: '600',
                }}>
                Commission Amount
              </Text>
              <Text style={{fontSize: 25, fontWeight: '700'}}>
                ₹{' '}
                {(tripDetails?.finalPrice?.commissionPrice / 1).toFixed(0) ||
                  '0'}
              </Text>
            </View>

            <View style={styles.earningsBreakdown}>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsText}>Trip Id</Text>
                <Text style={styles.earningsAmount}>{tripDetails?.tripId}</Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsText}>{t('Total Amount')}</Text>
                <Text style={styles.earningsAmount}>
                  ₹ {tripDetails?.finalPrice?.finalTotalPrice}
                </Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsText}>
                  {t('Commission Percentage')}
                </Text>
                <Text style={styles.earningsAmount}>
                  {tripDetails?.priceDetails?.commissionPercentage || '0'}%
                </Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>{t('Vendor Name')}</Text>
                <Text style={styles.earningsAmount}>
                  {tripDetails?.tripCreatedBy?.fullname}
                </Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>{t('Vendor MobileNo')}</Text>
                <Text style={styles.earningsAmount}>
                  {tripDetails?.tripCreatedBy?.mobileNumber}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.upiContainer} onPress={openurl}>
            <Image
              source={require('./assets/images/upi.png')}
              style={{height: 40, width: 40}}
            />

            <View>
              <Text>{('Pay through an UPI Apps')}</Text>
              <Text style={{color: '#777'}}>
                {('Gpay,PhonePe,Amazon Pay & more')}
              </Text>
            </View>
          </TouchableOpacity>

          <Slider
            onEndReached={() => setModalVisible(true)}
            containerStyle={styles.sliderContainer}
            sliderElement={
              <View style={styles.slider}>
                <AntDesign name="right" color={'white'} size={30} />
              </View>
            }>
            {/* Wrap the slider text inside <Text> */}
            <Text style={styles.sliderText}>{t('Pay Now')}</Text>
          </Slider>
        </ScrollView>
        <Modal
          visible={modalVisible}
          animationType="none"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={{textAlign: 'center'}}>
                {t('Are you sure did you Paid a Commission to Vendor')}?
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modelbutton, {backgroundColor: 'green'}]}
                  onPress={handleSubmit}>
                  <Text style={styles.modelbuttonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modelbutton, {backgroundColor: 'red'}]}
                  onPress={() => setModalVisible(false)}>
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
export default PaymentMethod;

const styles = StyleSheet.create({
  upiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    padding: 4,
    paddingVertical: 20,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
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
    margin: 10,
    padding: 10,
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
    // backgroundColor:
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 2,
  },
  text: {
    color: 'black',
    fontSize: 19,
    marginLeft: 8,
  },
  scrollContent: {
    paddingTop: 90,
    alignItems: 'center',
    width: '100%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  infoText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#FEC110',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: 200,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    padding: 20,
    width: '100%',

    marginBottom: 30,
    alignItems: 'center',
  },
  image: {
    height: 200,
    width: 200,
    resizeMode: 'cover',
  },
  earningsCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    elevation: 4,
    flexDirection: 'row',
    color: 'green',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
    justifyContent: 'space-between',
  },
  earningsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  earningsAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  earningsBreakdown: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    width: '100%',
    marginBottom: 20,
  },
  earningsRow: {
    flexDirection: 'row',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  earningsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sliderContainer: {
    margin: 8,
    backgroundColor: '#FFC10E',
    borderRadius: 10,
    padding: 5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
  },
  slider: {
    backgroundColor: '#2FC400',
    padding: 10,
    borderRadius: 10,
  },
  sliderText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#333',
  },
});
