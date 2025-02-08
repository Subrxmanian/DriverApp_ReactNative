import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  Modal,
  Button,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Avatar } from "react-native-paper";
import api from "../Api";
import { SkypeIndicator } from "react-native-indicators";
import { useNavigation } from "expo-router";
import moment from "moment"; 
function UpComingTrip() {
  const [trips, setTrips] = useState<any[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterId, setFilterId] = useState<string>("");
  const [filterWheels, setFilterWheels] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();   
  useFocusEffect(
    React.useCallback(() => {
      const fetchTrips = async () => {
        try {
          setLoading(true);
          const response = await api.get(
            "/trip/driver/672f8aecaeb2846189632700"
          );
          console.log(response.data.trips); 
          setTrips(response.data.trips);
          setFilteredTrips(response.data.trips);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching trips:", error);
          setError("Failed to load trips");
          setLoading(false);
        }
      };

      fetchTrips();
    }, [])
  ); 
  useEffect(() => {
    if (filterId.trim() === "") { 
      setFilteredTrips(trips);
    } else { 
      const filtered = trips.filter((trip) =>
        trip.tripId.toLowerCase().includes(filterId.toLowerCase())
      ); 
      setFilteredTrips(filtered);
    }
  }, [filterId, trips]);  

  const handleFilter = () => {
    let filtered = trips; 
    if (filterWheels.trim() !== "") {
      filtered = filtered.filter(
        (trip) => trip.vehicle.wheels === filterWheels
      );
    } 
    if (filterStatus.trim() !== "") {
      filtered = filtered.filter((trip) => trip.tripStatus === filterStatus);
    }
 
    filtered = filtered.filter(
      (trip) => trip.tripStatus === "Verified" || trip.tripStatus === "Accepted"
    );

    setFilteredTrips(filtered);
    setModalVisible(false); 
  }; 
  const handleClearFilters = () => { 
    setFilterId("");
    setFilterWheels("");
    setFilterStatus("");
    setFilteredTrips(trips);  
    setModalVisible(false);  
  }; 
  const renderTripItem = ({ item }: { item: any }) => {
    const statusStyles = {
      Accepted: { backgroundColor: "green", color: "white" },
      Completed: { backgroundColor: "black", color: "white" },
      Cancelled: { backgroundColor: "red", color: "white" },
      Created: { backgroundColor: "blue", color: "white" },
      Live: { backgroundColor: "violet", color: "white" },
      default: { backgroundColor: "gray", color: "white" },
    }; 
    const vehicleIcons = {
      "4-Wheeler": "car",
      "2-Wheeler": "bicycle-sharp",
      "3-Wheeler": "car-sport",
    };
    const vehicleIcon = vehicleIcons[item.vehicle.wheels] || "car";
  
    const relativeTime = moment(item.createdAt).fromNow(); 
  
    return (
      <View style={styles.tripContainer}>
        <View style={{ flexDirection: "row", marginBottom: 15 }}>
          <Avatar.Image size={65} source={require("@/assets/images/tripuser.png")} />
          <View style={{ marginLeft: 10}}>
            {/* Trip Info Row with ID and Pickup Type */}
            <View style={styles.tripInfoRow}>
              <Text style={styles.tripTitle}>ID: {item.tripId}</Text>
              <Text
                style={{
                  backgroundColor: "blue",
                  padding: 10,
                  borderRadius: 50,
                  marginLeft: 20,
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {item.pickupType || 'N/A'}
              </Text>
            </View>
  
            {/* Vehicle and Time Information */}
            <View style={{ flexDirection: "row" }}>
              <Ionicons name={vehicleIcon} size={20} color="red" style={styles.vehicleIcon} />
              <Text style={styles.vehicleText}>{item.vehicle.wheels}</Text>
              <Ionicons name="timer" size={20} color="green" style={styles.timerIcon} />
              <Text style={styles.timerText}>{relativeTime}</Text>
            </View>
  
            {/* From/To Information */}
            <View style={{ marginTop: 10, width: "90%" }}>
              <Text style={styles.fromToText}>From: {item.journey.from}</Text>
              <Text style={styles.fromToText}>To: {item.journey.to}</Text>
            </View>
          </View>
          <Text>{item.tripStatus}</Text>
        </View>
  
        {/* Accept Button for Verified Trips */}
        {item.tripStatus === "Verified" ? (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() =>
              navigation.navigate("Pages/DriverArrivedscreen", { id: item._id })
            }
          >
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>Accept</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };
  
  return (
    <>
      {loading ? (
        <View style={styles.overlay}>
          <SkypeIndicator color="white" size={30} />
        </View>
      ) : null}
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={30} color="black" />
            <Text style={styles.text}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("clicked")}>
            <Image
              source={require("@/assets/images/Maskgroup.png")}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* Search Section */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search by Trip ID"
            value={filterId}
            onChangeText={(text) => setFilterId(text)}  
            style={styles.searchBar}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="filter-sharp" size={20} />
            <Text> Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Trip List */}
        {loading ? null : error ? (
          <Text style={{ textAlign: "center", color: "red" }}>{error}</Text>
        ) : filteredTrips.length === 0 ? (
          <Text style={{ textAlign: "center", color: "#333", fontSize: 18 }}>
            No trips available
          </Text>
        ) : (
          <FlatList
            data={filteredTrips}
            renderItem={renderTripItem}
            keyExtractor={(item) => item.tripId.toString()}
          />
        )} 
        {/* Modal for Filters */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TextInput
                placeholder="Filter by ID"
                value={filterId}
                onChangeText={setFilterId}
                style={styles.modalInput}
              />
              <TextInput
                placeholder="Filter by Wheels"
                value={filterWheels}
                onChangeText={setFilterWheels}
                style={styles.modalInput}
              />
              <TextInput
                placeholder="Filter by Status"
                value={filterStatus}
                onChangeText={setFilterStatus}
                style={styles.modalInput}
              />
              <View style={styles.modalButtons}>
                <Button title="Apply Filter" onPress={handleFilter} />
                <Button title="Clear Filter" onPress={handleClearFilters} />
                <Button title="Cancel" onPress={() => setModalVisible(false)} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
} 
export default UpComingTrip;

const styles = StyleSheet.create({
  filterButton: { 
    flexDirection: "row", 
    borderColor:'#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalInput: {
    width: "100%",
    height: 40,
    marginBottom: 15,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  acceptButton: {
    backgroundColor: "#FFC10E",
    borderRadius: 20,
    width: "30%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f4f4f4",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 20,
  },
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
  text: {
    fontSize: 19,
    marginLeft: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    borderRadius: 35,
    height: 60,
    width: 60,
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "center",
  },
  searchBar: {
    height: 50,
    width: "70%",
    marginBottom: 15,
    borderColor: "#ddd",
    borderWidth: 1,
    padding: 10,
    borderRadius: 30,
    paddingLeft: 10,
  },
  tripContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  tripInfoRow: {
    flexDirection: "row",
    // justifyContent: "space-between", // Makes the items evenly spaced
    alignItems: "center",
    marginBottom: 10,
  },
  tripTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#333",
    // flex: 1, // This ensures the tripId takes up all available space
  },
  vehicleText: {
    fontSize: 16,
    color: "red",
    marginLeft: 5,
  },
  timerText: {
    fontSize: 16,
    color: "green",
    marginLeft: 5,
  },
  timerIcon: {
    marginLeft: 10,
  },
  vehicleIcon: {
    marginRight: 5,
  },
  statusButton: {
    paddingVertical: 5,
    paddingHorizontal: 20, // Add more horizontal padding to prevent overflow
    borderRadius: 20,
    marginLeft: 20,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 1, // Ensure it doesn't overflow
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    flexShrink: 1, // Allow text to wrap if necessary
  },
  fromToText: {
    fontSize: 16,
    marginRight: 20,
    // width:'40%',
    marginBottom: 10,
    color: "#555",
    // flexShrink: 2,
  },
  // tripInfoRow: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  //   marginBottom: 10,
  // },
  infoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  infoBoxText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  infoBoxValue: {
    color: "red",
    textAlign: "center",
    fontSize: 14,
  },
  infoBoxWrapper: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    alignItems: "center",
  },
});
