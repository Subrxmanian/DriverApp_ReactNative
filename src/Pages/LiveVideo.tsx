import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Alert,
  Platform,
  Linking,
  BackHandler,
  ScrollView,
  ScrollViewBase,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useNavigation, useRoute} from '@react-navigation/native';
import api from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SkypeIndicator} from 'react-native-indicators';
import {ToastAndroid} from 'react-native';
import {useCameraDevices, Camera} from 'react-native-vision-camera';
import {S3} from '@aws-sdk/client-s3';
import {useTranslation} from 'react-i18next';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import uuid from 'react-native-uuid';
import Config from '../../Config';
import RNFetchBlob from 'rn-fetch-blob';
import Video, {VideoRef} from 'react-native-video';
import {Buffer} from 'buffer';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {GetObjectCommand} from '@aws-sdk/client-s3';
import { URL } from 'react-native-url-polyfill';
import { ReadableStream } from 'web-streams-polyfill';
global.URL = URL;
global.ReadableStream = ReadableStream;
const LiveVideo = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri1, setVideoUri1] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tripDetails, setTripDetails] = useState<any>();
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const cameraRef = useRef<Camera | null>(null);
  const videoRef = useRef<VideoRef>(null);
  const [fullpath, setfullpath] = useState({});
  const devices = useCameraDevices();
  const navigation = useNavigation();
  const route = useRoute();
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null); // To store the interval timer reference
  const {id} = (route.params as {id: string}) || {};
  const [driverId, setDriverId] = useState('');
  const {t} = useTranslation();

  const backCamera = devices.find(device => device.position === 'back');

  useEffect(() => {
    if (isRecording) {
      // Start the timer when recording starts
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1); // Increment time by 1 second
      }, 1000);
    } else {
      // Clear the timer when recording stops
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      // Clean up the timer when the component is unmounted
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes < 10 ? '0' + minutes : minutes}:${
      seconds < 10 ? '0' + seconds : seconds
    }`;
  };
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Request camera permission
        const cameraStatus = await request(PERMISSIONS.IOS.CAMERA); // Adjust based on platform (Android or iOS)
        const micStatus = await request(PERMISSIONS.IOS.MICROPHONE);

        // Check if both permissions are granted
        if (cameraStatus === RESULTS.GRANTED && micStatus === RESULTS.GRANTED) {
          setHasPermission(true);
        } else {
          Alert.alert(
            'Permission Denied',
            'Please grant camera and microphone permissions to use this feature.',
            [{text: 'OK'}],
          );
          setHasPermission(false);
        }
      } catch (error) {
        console.log('Error requesting permissions:', error);
      }
    };

    requestPermissions();
  }, []);
  const fetchTripDetails = async () => {
    const id1 = (await AsyncStorage.getItem('Driver_id')) || '';
    // console.log(await generateSignedUrl("video/user-uploads/c6cfcafa-06b9-406e-80ac-504bb4b86d70.mp4"))
    setDriverId(id1);
    try {
      setLoading(true);
      const response = await api.get(`/trip/get/${id}`);
      setTripDetails(response.data.trip);
      setLoading(false);
    } catch (error) {
      // console.error('Error fetching trip:', error);
      setLoading(false);
    }
  };
  useEffect(() => {
    const intervalId = setInterval(fetchTripDetails, 20000);
    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    if (recordingTime > 15) {
      showToast(
        'success',
        'record',
        'You have only 15 seconds to record a video',
      );

      handleStopRecording();
      setRecordingTime(0);
    }
  }, [recordingTime]);
  useEffect(() => {
    fetchTripDetails();
  }, [id]);
  useEffect(() => {
    const backAction = () => {
      if (tripDetails?.tripStatus === 'Accepted') {
        ToastAndroid.show('You cannot navigate away until the trip is accepted.',ToastAndroid.show)
      
        return true; // Block the back action
      }
      if (tripDetails.tripStatus === 'Verified') {
        navigation.navigate('Pages/DriverArrivedscreen', {id: tripDetails._id});
      }
      return false; // Allow the back action if trip is not pending
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [tripDetails]);
  useEffect(() => {
    const navigate = () => {
      if (tripDetails?.tripStatus == 'Verified') {
        navigation.navigate('Pages/DriverArrivedscreen', {id: tripDetails._id});
      }
    };
    navigate();
  }, [tripDetails]);

  if (!backCamera) {
    return (
      <View style={styles.modalOverlay}>
        <SkypeIndicator color="white" size={30} />
      </View>
    );
  }
  const dialNumber = (number: any) => {
    const url = `tel:${number}`;
    Linking.openURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          showToast('error', 'Error', 'Unable to open the dialer.');
          Alert.alert('Cannot dial this number');
        }
      })
      .catch(err => {
        console.error('Error opening URL', err);
        Alert.alert('An error occurred');
      });
  };
  const handleStartRecording = async () => {
    setVideoUri1(null);
    setIsCameraVisible(true);
    // showToast(
    //   'success',
    //   'record',
    //   'You have only 15 seconds to record a video',
    // );
    if (cameraRef.current) {
      const video = await cameraRef.current.startRecording({
        quality: 'low',
        maxDuration: 60,
        maxFileSize: 100 * 1024 * 1024,
        videoCodec: 'h264',
        videoBitrate: 1000000, // 1 Mbps
        audioQuality: 'low',
        audioBitrate: 64000, // 64 kbps

        onRecordingFinished: async path => {
          console.log('Video saved at:', path);

          try {
            setfullpath(path);
            const videoPath =
              Platform.OS === 'android' ? `file://${path.path}` : path.path;
            setVideoUri1(videoPath);
          } catch (error) {
            console.error('Error getting file size:', error);
          }
          setIsRecording(false);
        },

        onRecordingError: error => {
          console.error('Recording error:', error);
          setIsRecording(false);
        },
      });
      setIsRecording(true);
    }
  };
  const handleStopRecording = async () => {
    setIsCameraVisible(false);
    if (cameraRef.current) {
      console.log('Stopping recording');

      await cameraRef.current.stopRecording();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };
  let key = '';

  const uploadVideo = async () => {
    console.log('Full Path:', fullpath, 'Video Key:', videoKey, 'Video URI1:', videoUri1);

    // Check if fullpath, videoKey, or videoUri1 is missing or empty
    if (!fullpath || (typeof fullpath === 'object' && Object.keys(fullpath).length === 0)  ) {
        ToastAndroid.show('Record a video for 15 seconds', ToastAndroid.SHORT);
        return;
    }

    try {
        setLoading(true);

        // If `fullpath` is provided, upload to S3
        let uploadedKey = uploadVideoToS3(fullpath); // Initialize `uploadedKey` with `videoKey`

        if (!uploadedKey) {
            
                ToastAndroid.show('Failed to upload video', ToastAndroid.SHORT);
                setLoading(false);
                return;
            
            
        }
        console.log({
          driverId: driverId,
          videoKey: videoKey || key, // Use uploaded video key or fallback to a default key
      },id)

        // Once video is uploaded or key is available, make the API call
        const response = await api.put(`/trip/${id}/accept`, {
            driverId: driverId,
            videoKey: videoKey || key, // Use uploaded video key or fallback to a default key
        });

        // Hide loading spinner and show success toast
        setLoading(false);
        showToast('success', 'Video Uploaded!', `${response.data.message}`);

        // Update trip status in state
        setTripDetails(prevDetails => ({
            ...prevDetails,
            tripStatus: 'Accepted',
        }));
    } catch (error: any) {
        // Handle errors during upload or API call
        setLoading(false);
        console.error('Error uploading video:', error);

        const errorMessage =
            error?.response?.data?.error || 'Unknown error occurred';

        if (error?.response?.data?.error === 'Already in trip') {
            showToast('error', 'Trip Error', `${errorMessage}`);
        } else {
            showToast('error', 'Trip Error', `${errorMessage}`);
        }
    }
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

  const s3 = new S3({
    region: Config.AWS_REGION,
    credentials: {
      accessKeyId: Config.AWS_ACCESSKEYID,
      secretAccessKey: Config.AWS_SECRETACCESSKEY,
    }
  });

  const createSignedUrl = async (expiresIn = 3600) => {
    const uniqueId = uuid.v4();
    const k = `videos/user-uploads/${uniqueId}.mp4`;
    key = k;
    console.log('Upload key: ', k);
    setVideoKey(k);
    const command = new GetObjectCommand({
      Bucket: Config.AWS_BUCKET,
      Key: key,
    });
    try {
      const uploadUrl = getSignedUrl(s3, command, {expiresIn});

      return uploadUrl;
    } catch (error) {
      console.log('Error occured while fetching upload url...');
      return error;
    }
  };
  const uploadVideoToS3 = async file => {
    if (!file) {
      console.log('no file found');
      return null;
    }
    setLoading(true);

    try {
      const preSignedUrl: any = await createSignedUrl();
      const videoPath =
        Platform.OS === 'android' ? `file://${file?.path}` : file?.path;

      const fileData = await RNFetchBlob.fs.readFile(videoPath, 'base64');

      const buffer = Buffer.from(fileData, 'base64');

      const uploadFile = await fetch(preSignedUrl, {
        headers: {
          'Content-Type': 'video/mov',
        },
        method: 'PUT',
        body: buffer,
      });
      console.log('upload file successfully : ', uploadFile);
      return uploadFile;
    } catch (error) {
      console.log('Error occurred while uploading file to s3', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <View style={styles.modalOverlay}>
          <SkypeIndicator color="white" size={30} />
        </View>
      ) : null}

      {/* Camera view outside of ScrollView */}
      {isCameraVisible ? (
        <View style={styles.RecordContainer}>
          <Camera
            ref={cameraRef}
            device={backCamera}
            isActive={true}
            video={true}
            style={styles.video}
            audio={false}
            resizeMode="cover"
          />
          <View style={styles.controls}>
            <Text style={styles.timer}>{formatTime(recordingTime)}</Text>
            <TouchableOpacity
              onPress={
                isRecording ? handleStopRecording : handleStartRecording
              }>
              {isRecording ? (
                <View style={styles.stop}>
                  <FontAwesome name={'stop'} color={'red'} size={30} />
                </View>
              ) : (
                <View style={styles.startRecord} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                tripDetails.tripStatus === 'Created'
                  ? navigation.goBack()
                  : null;
              }}
              style={styles.backButton}>
              <Icon name="chevron-back" size={30} color="black" />
              <Text style={styles.text}>{t('Back')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => navigation.navigate('help' as never)}>
              <Text style={{fontWeight: 'bold'}}>{t('Help')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Image
              source={require('./assets/images/icon.png')}
              style={styles.highlightedImage}
            />
            <View style={styles.textContainer1}>
              <Text style={{fontWeight: 'bold', padding: 10}}>
                {t('RECORD A LIVE VIDEO')}
              </Text>
              <Text>{t('Record a video to verify the booking trip')}</Text>
            </View>
            {videoUri1 ? (
              <View style={styles.videoPreviewContainer}>
                <Text style={styles.videoPreviewTitle}>
                  {t('Video Preview:')}
                </Text>
                <Video
                  source={{uri: videoUri1}}
                  style={styles.Viewvideo}
                  resizeMode="cover"
                  controls={true}
                  ref={videoRef}
                />
              </View>
            ) : null}

            {/* Conditional Rendering for Capture or Call Vendor */}
            {tripDetails?.tripStatus !== 'Accepted' ? (
              <View style={styles.container1}>
                <TouchableOpacity
                  style={styles.uploadContainer}
                  onPress={() => setIsCameraVisible(true)}>
                  <MaterialIcons name="videocam" color={'gray'} size={30} />
                  <View style={styles.textContainer}>
                    <Text style={styles.text}>
                      {videoUri1 ? 'Capture a Video' : 'Capture a Video'}
                    </Text>
                    <Text style={styles.uploadText}>Upload</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              // Show the "Call Vendor" button if trip is accepted
              <View style={styles.container1}>
                <TouchableOpacity
                  style={styles.uploadContainer}
                  onPress={() =>
                    dialNumber(tripDetails.tripCreatedBy.mobileNumber)
                  }>
                  <MaterialIcons name="call" color={'gray'} size={30} />
                  <View style={styles.textContainer}>
                    <Text style={styles.text}>{'Call Vendor'}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={
                tripDetails?.tripStatus !== 'Accepted'
                  ? uploadVideo
                  : fetchTripDetails
              }>
              <Text style={styles.buttonText}>
                {tripDetails?.tripStatus === 'Accepted' ? 'Pending' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};
export default LiveVideo;
const styles = StyleSheet.create({
  Viewvideo: {
    height: 200,
    width: '100%',
  },
  timer: {
    color: 'white',
    marginBottom: 10,
    marginTop: 10,
    fontSize: 16,
  },
  startRecord: {
    borderRadius: 50,
    borderWidth: 5,
    borderColor: 'white',
    alignSelf: 'center',
    width: 70,
    height: 70,
  },
  stop: {
    borderRadius: 50,
    borderWidth: 5,
    borderColor: 'white',
    alignSelf: 'center',
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    alignSelf: 'center',
    alignItems: 'center',
    height: '20%',
    width: '100%',
    backgroundColor: 'black',
  },
  RecordContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    position: 'absolute',
    top: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'gray',
    marginLeft: 8,
  },
  helpButton: {
    backgroundColor: '#FEC110',
    borderRadius: 15,
    padding: 10,
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightedImage: {
    width: 150,
    height: 120,
    // marginTop:30,
    alignSelf: 'center',
    shadowRadius: 10,
    elevation: 10,
  },
  textContainer1: {
    alignItems: 'center',
    marginBottom: 20,
  },
  container1: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    width: '45%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  uploadText: {
    fontSize: 14,
    backgroundColor: '#F4BD46',
    width: 100,
    padding: 5,
    fontWeight: 'bold',
    borderRadius: 10,
    textAlign: 'center',
    color: 'black',
    marginTop: 5,
  },
  videoPreviewContainer: {
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',

    paddingHorizontal: 20,
  },
  videoPreviewTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  video: {
    height: '80%',
    width: '100%',
    borderRadius: 10,
  },
  verifyButton: {
    backgroundColor: '#FEC110',
    borderRadius: 15,
    padding: 14,
    width: '90%',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 30,
    marginBottom: 10,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalOverlay: {
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
});
