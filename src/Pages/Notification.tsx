
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import messaging from '@react-native-firebase/messaging'
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./Api";
import { SkypeIndicator } from "react-native-indicators";
import { useTranslation } from "react-i18next";

function Notify() {
  const Navigation = useNavigation();
  const[loading,setLoading]=useState(false)
  const {t}=useTranslation()
  const getFCMToken = async () => {
    try {
      await messaging().requestPermission();
      const fcmToken = await messaging().getToken();
      handleupdate(fcmToken)
      return fcmToken;
    } catch (error) {
      console.log("Error getting FCM token:", error);
      return null;
    }
  };
  
  const handleupdate = async(fcmToken:any)=>{
    setLoading(true)
    try{
      const id = await AsyncStorage.getItem("Driver_id")||''
      const response = await api.put(`driver/update/${id}`,{driverToken:fcmToken});
      
      Navigation.navigate("Components/Tabnavigation" as never);

    }catch(error)
    {
      console.log("error updating the token",error)
    }finally{
      setLoading(false)
    }
  }

  return (
    <>
    {loading ? (
      <View style={styles.overlay}>
        <SkypeIndicator key="uniqueKey" color="white" size={30} />   
      </View>
    ) : null}
    <ImageBackground
      source={require("./assets/images/notify.png")}
      style={styles.background}
    >
      <View style={styles.overlay}></View>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => Navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="chevron-back" size={30} color="black" />
            <Text style={styles.text}>{t("Back")}</Text>
          </TouchableOpacity>
          {/* <Text style={styles.headerTitle}>ALLOW NOTIFICATIONS</Text> */}
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => Navigation.navigate("Components/Help" as never)}
          >
            <Text style={{ fontWeight: "bold" }}>? {t("Help")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.infoText}>{t("ALLOW NOTIFICATIONS AND ")}</Text>
          <Text style={{ color: "#FFC10E", fontSize: 30 }}>
            {t("ON - RIDE ALERTS")}
          </Text>
        </View>
        {/* <View style={{flex:1}}/> */}
        <View style={styles.centeredContainer}>
          <Text style={styles.title}>{t("REAL - TIME CAPTAIN")}</Text>
          <Text style={styles.subtitle}>
            {t("UPDATES, allocation, arrival & more")}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={getFCMToken} >
          <Text style={styles.buttonText}>Allow</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flexDirection: "row", alignSelf: "center" }}>
          <Text style={{ textAlign: "center", color: "white" }}>May be,</Text>
          <Text style={{ textAlign: "center", color: "#FFC10E" }}> later</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
    </>
  );
}

export default Notify;

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
  container: {
    flex: 1,
    padding:10
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", 
    marginBottom: 10,
  },
  centeredContainer: {
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
    // flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  title: {
    color: "#FECA1F",
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 20,
    color: "white",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  helpButton: {
    backgroundColor: "#FEC110",
    borderRadius: 15,
    padding: 10,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    position: "absolute",
    left: "50%",
    // transform: [{ translateX: -50% }],
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  text: {
    color: "black",
    fontSize: 19,
    marginLeft: 8,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  spacer: {
    // flex: 1,
    marginTop: 100,
  },
  content: {
    textAlign: "left",
    // padding: 50,
    // marginBottom: 90,
  },
  infoText: {
    color: "white",
    fontSize: 40,
    textAlign: "left",
    // marginBottom: 20,
  },
  nextButton: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
    padding: 14,
    width: 180,
    alignItems: "center",
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
