import { useNavigation } from "@react-navigation/native";
import React from "react"; 
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
// import { generateSignedUrl } from "./assets/aws";/

async function Home () {
  const Navigation = useNavigation();
  // console.log(await generateSignedUrl("videos/user-uploads/cb0d4ddb-c49a-4d8f-aff6-20230e1620ae.mp4"))
  return (
    <ImageBackground
      source={require("./assets/images/getstarted.png")}
      style={styles.background}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <View style={styles.content}>
          <Image
            source={require("./assets/images/icon.png")}
            style={styles.icon}
          />
          <Text style={styles.textContainer}>
            FLEXIBLE TIMING AND SERVICES, JOIN OUR
            <Text style={{ color: "#FEC110" }}> DRIVER APP</Text> TODAY
          </Text>
          <TouchableOpacity
            onPress={() => Navigation.navigate("Pages/MobileVerify" as never)} 
          >
            <View style={styles.button}>
              <Text style={styles.buttonText}>GET STARTED</Text>
            </View>
          </TouchableOpacity>
            {/* <Text style={styles.loginText}>
              Already Having an account?{" "}
              <Text style={{ color: "#FEC110" }}>Log in</Text>
            </Text> */}
        </View>
      </View>
    </ImageBackground>
  );
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    padding: 50,
    alignItems: "center",
  },
  icon: {
    height: 180,
    width: 172,
  },
  textContainer: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    marginVertical: 10,
  },
  button: {
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 15,
    padding: 15,
    width: 200,
    alignItems: "center",
    marginVertical: 30,
  },
  buttonText: {
    color: "white",
  },
  loginText: {
    color: "white",
    textAlign: "center",
  },
});
