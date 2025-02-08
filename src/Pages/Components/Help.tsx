import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import api from "../Api";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

function Help() {
  const Navigation = useNavigation();
  const [data,setData]=useState();
  useFocusEffect(
    React.useCallback(() => {
      const fetchTrips = async () => {
        try {
          // setLoading(true);
          const response = await api.get("/terms");
          // const response = await api.get("/trip/getAll");
          setData(response.data.condition);
          // setFilteredTrips(response.data.trips);
          // setLoading(false);
        } catch (error) {
          console.error("Error fetching trips:", error);
          
          // setLoading(false);
        }
      };

      fetchTrips();
    }, [])
  ); 
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => Navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={30} color="black" />
          <Text style={styles.text}>Back</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.helpButton}
          onPress={() => Navigation.navigate("Components/ContactSupport" as never)}
        >
          <Text style={styles.helpText}>Contact Support</Text>
        </TouchableOpacity> */}
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>
          1. “Introduction to Your Services”
        </Text>
        <Text style={styles.sectionContent}>
          <Text style={styles.boldText}>About Us: </Text> Share your story, mission,
          and what makes your ride vendor unique.{"\n"}
          <Text style={styles.boldText}>Types of Rides Offered: </Text> Detail the
          different types of rides (e.g., Car, Scooters, Electric vehicles, Taxi).
        </Text>

        <Text style={styles.sectionTitle}>
          2. “Benefits of Using Your Service”
        </Text>
        <Text style={styles.sectionContent}>
          <Text style={styles.boldText}>Convenience: </Text> Highlight ease of
          access and flexibility.{"\n"}
          <Text style={styles.boldText}>Eco-Friendly Options: </Text> Discuss
          sustainability and environmental impact.{"\n"}
          <Text style={styles.boldText}>Affordability: </Text> Compare costs with
          traditional transportation methods.
        </Text>

        <Text style={styles.sectionTitle}>3. “User Guides”</Text>
        <Text style={styles.sectionContent}>
          <Text style={styles.boldText}>How to Rent a Ride: </Text> Step-by-step
          instructions for customers.{"\n"}
          <Text style={styles.boldText}>Safety Tips: </Text> Important safety
          measures to follow while using your rides.
        </Text>

        <Text style={styles.sectionTitle}>4. “Customer Testimonials”</Text>
        <Text style={styles.sectionContent}>
          <Text style={styles.boldText}>Real Stories: </Text> Share positive
          experiences from past customers to build trust.
        </Text>

        <Text style={styles.sectionTitle}>5. “Promotions and Discounts”</Text>
        <Text style={styles.sectionContent}>
          <Text style={styles.boldText}>Special Offers: </Text> Announce any
          ongoing promotions or discounts.{"\n"}
          <Text style={styles.boldText}>Loyalty Programs: </Text> Explain rewards
          for frequent users.
        </Text>

        <Text style={styles.sectionTitle}>6. “Local Travel Tips”</Text>
        <Text style={styles.sectionContent}>
          <Text style={styles.boldText}>Local Travel Tips: </Text> Suggest
          popular routes or hidden gems in your area.{"\n"}
          <Text style={styles.boldText}>Sustainable Transportation Trends: </Text>
          Discuss the growing demand for eco-friendly transport options.
        </Text>

        <Text style={styles.sectionTitle}>7. “Social Media Content”</Text>
        <Text style={styles.sectionContent}>
          <Text style={styles.boldText}>Engaging Posts: </Text> Use photos,
          videos, and polls to engage your audience.{"\n"}
          <Text style={styles.boldText}>Contests: </Text> Run photo contests for
          users sharing their rides.
        </Text>
          
    
        <View style={styles.buttonContainer}>
        {/* Right Tick Icon */}
        <Text style={styles.questionText}>Was this article helpful?</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="checkmark-circle" size={23} color="white" />
        </TouchableOpacity>

        {/* Wrong Icon */}
        <TouchableOpacity style={styles.iconButtonRed}>
          <Icon name="close-circle" size={23} color="white" />
        </TouchableOpacity>
      </View>
          
      </ScrollView>
    </View>
  );
}

export default Help;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    backgroundColor: "#fff",  
    marginBottom:50, 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
 marginTop:10,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 18,
    color: 'black',
    marginLeft:10,
    // marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',   
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:25,
    height:50,
    borderWidth:2,
    borderBlockColor:'black',
    // marginTop: 20,
    bottom:10,
  },
  iconButtonRed: {
    backgroundColor: 'red',  
    borderRadius: 50,  
    padding: 5,
    marginHorizontal: 15,   
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: 'green',  
    borderRadius: 50,   
    padding: 5,
    marginHorizontal: 15, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: "black",
    fontSize: 19,
    marginLeft: 8,
  },
  helpButton: {
    backgroundColor: "#FEC110",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  helpText: {
    fontWeight: "bold",
    color: "black",
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 10,
    color: "#333",   
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 15,
    color: "#555",  
  },
  boldText: {
    fontWeight: "bold",
    color: "#333",  
  },
});

