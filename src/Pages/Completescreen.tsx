import React, {useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  ToastAndroid,
  Platform,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import {SkypeIndicator} from 'react-native-indicators';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Slider from 'react-native-slide-to-unlock';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import api from './Api';
import { useTranslation } from 'react-i18next';

function Completescreen() {
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation();
  const route = useRoute();
  const {t}=useTranslation()
  const {id,flag} = (route.params as {id: string,flag:any}) || '';
  const [tripDetails, setTripDetails] = useState<any | null>(null);
  const [driverid, setdriverid] = useState('');
  useFocusEffect(
    React.useCallback(() => {
      const fetchTripDetails = async () => {
        const id1 = (await AsyncStorage.getItem('Driver_id')) || '';
        setdriverid(id1);
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

      if (id) fetchTripDetails();
    }, [id]),
  );

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await api.put(`/trip/${id}/customer-paid`, {
        tripStatus: 'Customer Paid',
        driverId: driverid,
      });

      showToast('success', 'Thank You!', `${response.data.message}`);
      navigation.navigate('Pages/PaymentMethod', {id: id});
    } catch (error) {
      console.log('Error updating Status:', error);
      showToast(
        'error',
        'Error!',
        'There was an error updating the status. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const [imageUri, setImageUri] = useState(null);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.error('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        setImageUri(source.uri); // Set the image URI
      }
    });
  };


  // Show success or error toast based on platform
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
const [modalVisible, setModalVisible] = useState(false);
  return (
    <>
      {loading && (
        <View style={styles.loadingContainer}>
          <SkypeIndicator size={30} color="white" />
        </View>
      )}

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if(!flag){
              navigation.goBack()}}}
            style={styles.backButton}>
            <MaterialIcons name="chevron-left" size={30} color="black" />
            <Text style={styles.headerText}>{t("Back")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
             
              navigation.navigate('Components/Help' as never)
            }}
            style={styles.help}>
            <Text style={styles.helpText}>? {t("Help")}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={styles.contentWrapper}>
            <Text style={styles.headerText}>{t("Trip Bill Details")}</Text>

            <View style={styles.content}>
              {/* Info Text */}
              <Text style={styles.infoText}>{t("ONLINE OR OFFLINE")}</Text>
              <Text style={styles.instructionText}>
                {t("If you have Google Pay, Phone Pay, or Paytm app open scanner.")}
              </Text>

              {/* <View style={styles.imageCard}> */}
                <Image
                  source={imageUri?{uri:imageUri}:require('./assets/images/qr-code.png')}
                  style={styles.image}
                />
              {/* </View> */}
              <TouchableOpacity style={[styles.help,{width:'40%',alignSelf:'center',marginTop:10}]} onPress={pickImage}>
                <Text style={styles.helpText}>Upload</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.content]}>
              <Text style={styles.contentTitle}>{t("Total Amount")}</Text>
              <Text style={styles.amountText}>
                ₹
                {(tripDetails?.finalPrice?.finalTotalPrice / 1).toFixed(0) || 0}
              </Text>
            </View>

            <View style={styles.content}>
              <View style={styles.detailsRow}>
                <Text style={styles.detailsTitle}>{t("Customer Name")}</Text>
                <Text style={styles.detailsValue}>
                  {tripDetails?.customer?.name || ''}
                </Text>
              </View>
              <View style={styles.detailsRow1}>
                <Text style={styles.detailsTitle}>From</Text>
                <Text style={styles.detailsValue}>
                  {tripDetails?.journey?.fromAddress || ''}
                </Text>
              </View>
              <View style={styles.detailsRow1}>
                <Text style={styles.detailsTitle}>To</Text>
                <Text style={styles.detailsValue}>
                  {tripDetails?.journey?.toAddress || ''}
                </Text>
              </View>
              <View style={styles.detailsRow}>
              <Text style={styles.detailsTitle}>{t("Total Distance")} : </Text>
              <Text style={styles.detailsValue}>{tripDetails?.finalPrice?.finalDistance} KM</Text>
            </View>
              <View style={styles.detailsRow}>
              <Text style={styles.detailsTitle}>{t("Base Price for 3Km")}</Text>
              <Text style={styles.detailsValue}>₹ {tripDetails?.priceDetails?.basePrice|| 0}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsTitle}>{t("Kilometer Charges")}</Text>
              <Text style={styles.detailsValue}>₹ {tripDetails?.finalPrice?.distanceCharges|| 0}</Text>
            </View>

              {tripDetails?.priceDetails?.gstPercentage>0 ? (
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsTitle}>GST of 5%</Text>
                  <Text style={styles.detailsValue}>
                    {tripDetails?.finalPrice?.gstPrice || '0'}
                  </Text>
                </View>
              ) : null}

              <View style={styles.detailsRow}>
                <Text style={styles.detailsTitle}>
                  waitingCharges for{' '}
                  {(tripDetails?.finalPrice?.finalWaitingTime / 60).toFixed(0)}{' '}
                  minutes:
                </Text>
                <Text style={styles.detailsValue}>
                  ₹{' '}
                  {(tripDetails?.finalPrice?.waitingCharges / 1).toFixed(0) ||
                    '0'}
                </Text>
              </View>

              {tripDetails?.priceDetails?.hillCharges>0 ? (
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsTitle}>
                    {t("Hill charges for a Trip")} :
                  </Text>
                  <Text style={styles.detailsValue}>
                    ₹ {tripDetails?.priceDetails?.hillCharges || '0'}
                  </Text>
                </View>
              ) : null}
              <View style={styles.detailsRow}>
                <Text style={styles.detailsTitle}>
                  Driver Allowance for{' '}
                  {tripDetails?.finalPrice?.tripDays || '0'}{' '}
                  {tripDetails?.finalPrice?.tripDays > 1 ? 'days' : 'day'}:
                </Text>
                <Text style={styles.detailsValue}>
                  ₹{' '}
                  {(tripDetails?.finalPrice?.driverAllowance / 1).toFixed(0) ||
                    '0'}
                </Text>
              </View>
            </View>

            <Slider
              onEndReached={() => setModalVisible(true)}
              containerStyle={styles.sliderContainer}
              sliderElement={
                <View style={styles.sliderElement}>
                  <AntDesign name="right" color="white" size={30} />
                </View>
              }>
              <Text style={styles.sliderText}>{t("Payment Received")}</Text>
            </Slider>
          </View>
        </ScrollView>
        <Modal
          visible={modalVisible}
          animationType="none"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.alerttitle}>{t("Are you sure want to make this trip Customer Paid")}?</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modelbutton, {backgroundColor: 'green'}]}
                  onPress={handleSubmit}
                  >
                  <Text style={styles.modelbuttonText}>{t("Yes")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modelbutton, {backgroundColor: 'red'}]}
                  onPress={() => setModalVisible(false)}
                  >
                  <Text style={styles.modelbuttonText}>{t("Cancel")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
  
    </>
  );
}

export default Completescreen;

const styles = StyleSheet.create({
  alerttitle:{
    textAlign:'center',

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
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  loadingContainer: {
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
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius:50,
    paddingHorizontal: 20,
    width: '100%',
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
    // height: 100,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#333',
  },
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
  contentWrapper: {
    padding: 20,
  },
  content: {
    width: '100%',
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 10,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contentTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  amountText: {
    fontWeight: 'bold',
    fontSize: 50,
    color: 'red',
    textAlign: 'center',
  },
  detailsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#555',
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
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  image: {
    height: 150,
    width: 150,
    resizeMode: 'cover',
    alignSelf:'center',
  },
  detailsValue: {
    fontSize: 16,
    color: '#333',
  },
  sliderContainer: {
    marginTop: 20,
    backgroundColor: '#FFC10E',
    borderRadius: 10,
    padding: 5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
  },
  sliderElement: {
    backgroundColor: '#2FC400',
    padding: 10,
    borderRadius: 10,
  },
  sliderText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: 'black',
  },
});
