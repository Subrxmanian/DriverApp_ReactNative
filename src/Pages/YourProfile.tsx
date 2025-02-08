
import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { Switch } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

function DriverApprovalPage() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.headerBack}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="chevron-back" size={30} color="black" />
            <Text style={styles.text}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.premiumButton}
            onPress={() => navigation.navigate("Components/ContactSupport" as never)}
          >
            <Text style={styles.premiumText}>Contact Support</Text>
            
          </TouchableOpacity>
        </View>
        <View style={styles.avatar}>
          <Image
            source={require("./assets/images/Maskgroup.png")}
            style={styles.avatar1}
          />
          <Text style={styles.avatarText}>Prakash N</Text>
        </View>
        <TouchableOpacity style={styles.premiumButton}>
          <Text style={styles.premiumText}>PREMIUM</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Trip Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PREMIUM</Text>
          <Text style={{textAlign:'center'}}>Subscription Plan ends in 15 days</Text>
          <TouchableOpacity style={styles.cardButton}>
            <Text style={styles.premiumText}>Renew Plan</Text>
          </TouchableOpacity>

          <Text style={{color:'red',textAlign:'center'}}>View Available Subscriptions</Text>
        </View>

        <View style={styles.settingsSection}>
          
          <View style={styles.settingItem}>
            
            <Text style={styles.settingLabel}> <MaterialIcons name="category" size={20} color="#333" />  General</Text>
            <AntDesign name="right" size={20} color="#ccc" />
          </View>
          
          <View style={styles.settingItem}>
            
            <Text style={styles.settingLabel}> <Icon name="language" size={20} color="#333" />  Language</Text>
            <AntDesign name="right" size={20} color="#ccc" />
          </View>
          <View style={styles.settingItem}>
         
            <Text style={styles.settingLabel}> <Icon name="moon" size={20} color="#333" />  Dark Mode</Text>
         <Switch />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default DriverApprovalPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    backgroundColor: "#fff",
  },
  headerBack: {
    backgroundColor: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 15,
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
    flexDirection: "row",
    alignItems: "center",
  },
  helpText: {
    fontWeight: "bold",
    color: "black",
    fontSize: 16,
    marginRight: 8,
  },
  helpIcon: {
    marginLeft: 5,
  },
  avatar: {
    alignSelf: "center",
    marginBottom: 20,
    alignItems: "center",
  },
  avatar1: {
    height: 100,
    width: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: "bold",
  },
  premiumButton: {
    marginTop: 10,
    backgroundColor: "#FEC110",
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignSelf: "center",
  },
  premiumText: {
    fontWeight: "bold",
    color: "black",
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    width:'80%',
    marginTop:20,
    alignSelf:'center',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    // justifyContent:'center',
    borderColor: "#ddd",
  },
  cardTitle: {
    textAlign:'center',
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  cardButton: {
    backgroundColor: "#FEC110",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: "center",
  },
  cardButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  settingsSection: {
    marginTop: 20,

    padding:20,
    marginBottom: 30,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",   
     marginBottom: 20,
    borderBottomWidth:1,
    borderBottomColor:'#ccc'
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth:1,
    borderBottomColor:'#ccc'
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    marginBottom:10,
    },
});
