import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect, useNavigation } from "expo-router";
import api from "../Api";
import { useRoute } from "@react-navigation/native";
import { SkypeIndicator } from "react-native-indicators";

function AcceptPage() {
  const [seconds, setSeconds] = useState(15);
  const navigation = useNavigation();
  const route = useRoute(); // Access route params
  const [tripDetails, setTripDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract the `id` from route params
  const { id } = route.params as { id: string };

  useFocusEffect(
    React.useCallback(() => {
      const fetchTripDetails = async () => {
        try {
          setLoading(true);  
          const response = await api.get(`/trip/get/${id}`);
          setTripDetails(response.data.trip);  
          setLoading(false);  
        } catch (error) {
          console.error("Error fetching trip:", error);
          setError("Failed to load trip details");
          setLoading(false);
        }
      };

      if (id) fetchTripDetails();
    }, [id])
  );

  useEffect(() => {
    if (seconds > 0) {
      const timer = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      navigation.goBack();
    }
  }, [seconds, navigation]);

  if (loading) {
    return <SkypeIndicator color="black" size={30} />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  if (!tripDetails) {
    return (
      <Text style={{ justifyContent: "center", alignItems: "center" }}>
        No trip details found.
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#D9D9D900", "#4A4A4AA8"]}
        style={styles.gradientContainer}
      >
        <View style={styles.innerContainer}>
          <View style={styles.circle}>
            <Text style={styles.countdownText}>{seconds}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.bottomContainer}>
        <View style={styles.bottomInner}>
          <Image
            source={require("@/assets/images/tripuser.png")}
            style={styles.image}
          />
          <Text style={styles.bottomTextHeader}>ID: {tripDetails.tripId}</Text>
          <Text style={styles.bottomText}>
            Nearby 3 Km. Do you want to accept the trip?
          </Text>
        </View>

        <View style={styles.additionalInfoContainer}>
          

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={24} />
            <Text style={styles.infoLabel}>From:</Text>
            <Text style={styles.infoValue}>{tripDetails.journey?.from}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-sharp" size={24} />
            <Text style={styles.infoLabel}>To:</Text>
            <Text style={styles.infoValue}>{tripDetails.journey?.to}</Text>
          </View>
          {/* <View style={styles.infoRow}>
            <Ionicons name="speedometer-sharp" size={24} />
            <Text style={styles.infoLabel}>Price Per Km:</Text>
            <Text style={styles.infoValue}>
              Rs. {tripDetails.priceDetails?.pricePerKm}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={24} />
            <Text style={styles.infoLabel}>Base Price:</Text>
            <Text style={styles.infoValue}>
              Rs. {tripDetails.priceDetails?.basePrice}
            </Text>
          </View> */}

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={24} />
            <Text style={styles.infoLabel}>Pickup Time:</Text>
            <Text style={styles.infoValue}>{tripDetails.pickupTime}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.pass}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.Accept}
              onPress={() => navigation.navigate("Pages/LiveVideo", { id: id })}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pass: {
    backgroundColor: "#E40001",
    padding: 10,
    width: 180,
    borderRadius: 20,
  },
  Accept: {
    borderRadius: 20,
    width: 180,
    backgroundColor: "#00C500",
    padding: 10,
  },
  gradientContainer: {
    height: "60%",
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: 135,
    height: 135,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFC10E",
    marginBottom: 20,
  },
  countdownText: {
    fontSize: 48,
    color: "#000000",
    fontWeight: "bold",
  },

  bottomContainer: {
    height: "100%",
    marginTop: -60,
    backgroundColor: "white",
    borderTopLeftRadius: 70,
    borderTopRightRadius: 75,
  },
  bottomInner: {
    alignSelf: "center",
    alignItems: "center",
    marginTop: -40,
  },
  image: {
    width: 100,
    height: 100,
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
    paddingHorizontal: 20,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
});

export default AcceptPage;
