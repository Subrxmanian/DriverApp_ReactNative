import React, { useState} from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  ToastAndroid,
  Platform,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Slider from "react-native-slide-to-unlock";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import api from "./Api";
import { SkypeIndicator } from "react-native-indicators";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from "react-i18next";


function DriverArrivedscreen() {
  const navigation = useNavigation();
  const {t}=useTranslation()
  const route = useRoute();
  const [tripDetails, setTripDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { id ,flag} = route.params as { id: string,flag:any };
  const [driverid, setdriverid] = useState('');
const [profile,setprofile]=useState("")

  useFocusEffect(
    React.useCallback(() => {
      const fetchTripDetails = async () => {
        const id1 = await AsyncStorage.getItem("Driver_id") || "";
        const url = await AsyncStorage.getItem("Profile_pic") || "";
        setprofile(url)
        setdriverid(id1);
        try {
          setLoading(true);
          const response = await api.get(`/trip/get/${id}`);
          setTripDetails(response.data.trip); // Extract the trip details from response
          setLoading(false); // Set loading to false when the data is fetched
        } catch (error) {
          console.error("Error fetching trip:", error);
          setLoading(false);
        }
      };

      if (id) fetchTripDetails();
    }, [id])
  );



  const showToast = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await api.put(`/trip/${id}/arrived`, {
        tripStatus: "Arrived",
        driverId: driverid,
      });
      navigation.navigate("Pages/TripVerify", { id: id });
    } catch (error) {
      console.log("Error updating Status:", error);
      showToast(
        "error",
        "Error!",
        "There was an error Updating Status. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
            onPress={() => {if(!flag)
            {
              navigation.goBack()
            }
            }}
            style={styles.backButton}
          >
            <MaterialIcons name="chevron-left" size={30} color="black" />
            <Text style={styles.headerText}>{t("Back")}</Text>
          </TouchableOpacity>
          <TouchableOpacity >
            <Image
              source={profile?{uri:profile}:require("./assets/images/Maskgroup.png")}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/*  map image */}

        <View style={styles.bottomContainer}>
          <View style={styles.bottomInner}>
            <Image
              source={require("./assets/images/tripuser.png")}
              style={styles.image}
            />
            <Text style={styles.bottomTextHeader}>ID: {tripDetails?.tripId || ''}</Text>
            <Text style={styles.bottomText}>
              {t("Nearby 3 Km. Do you want to accept the trip")}?
            </Text>
          </View>

          <View style={styles.additionalInfoContainer}>
            <View style={styles.infoRow}>
              <AntDesign name="user" size={24} />
              <Text style={styles.infoLabel}>{t("Customer Name")}:</Text>
              <Text style={styles.infoValue}>{tripDetails?.customer?.name || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call-sharp" size={24} />
              <Text style={styles.infoLabel}>{t("Customer Number")}:</Text>
              <Text style={styles.infoValue}>{tripDetails?.customer?.mobileNumber || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="language" size={24} />
              <Text style={styles.infoLabel}>{t("Language")}:</Text>
              <Text style={styles.infoValue}>{tripDetails?.customer?.language || 'N/A'}</Text>
            </View>
          </View>
          <Slider
            onEndReached={handleSubmit}
            containerStyle={{
              margin: 8,
              backgroundColor: "#FFC10E",
              borderRadius: 10,
              padding: 5,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
              width: "95%",
            }}
            sliderElement={
              <View style={styles.slider}>
                <AntDesign name="right" color={"white"} size={30} />
              </View>
            }
          >
            <Text style={{ fontWeight: "bold", fontSize: 20 }}>{"Arrived"}</Text>
          </Slider>
        </View>
      </View>
    </>
  );
}

export default DriverArrivedscreen;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  slider: {
    backgroundColor: "#2FC400",
    padding: 10,
    borderRadius: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    position: "relative",
  },
  mapContainer: {
    flex: 1,  // Ensures map takes the remaining space
    width: "100%",
    height: "100%",
    position: "absolute", // Makes map fill container and avoids unnecessary gaps
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  mapImage: {
    width: "100%",
    height: "100%",  // Ensure the map takes the full available space
  },
  avatar: {
    borderRadius: 35,
    height: 60,
    width: 60,
    borderWidth: 2,
    borderColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    paddingHorizontal: 10,
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    position: "absolute", // Keeps the header fixed on top
    zIndex: 1,  // Ensures it stays above the map
    top: 0,  // Fixed position at the top of the screen
    left: 0,
    right: 0,
  },
  headerText: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 65,
    paddingHorizontal: 20,
    paddingBottom: 30,
    shadowColor: "black",
    shadowOpacity: 5,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  bottomInner: {
    alignSelf: "center",
    alignItems: "center",
    marginTop: -40,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  bottomText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  bottomTextHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  additionalInfoContainer: {
    marginTop: 20,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 18,
    marginLeft: 10,
    marginRight: 10,
    fontWeight: "bold",
    color: "#333",
  },
  infoValue: {
    fontSize: 18,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },
});
