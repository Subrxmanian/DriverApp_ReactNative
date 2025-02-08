import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Dash from "../Dashboard";
 import History from "../History"; 
import UPcomings from "../UpComingTrips";
import LiveTrip from "../LiveTrip";
import InstantTrip from "../InstantTrip";

const Tab = createBottomTabNavigator();

export default function MyTabs() {
  return (
    <>
    
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color, size, focused }) => {
          let iconColor = focused ? 'black' : color;  // Set icon color based on focus
          switch (route.name) {
            case 'Home':
              return <FontAwesome5 name="home" color={iconColor} size={size} />;
            case 'Notify':
              return <EvilIcons name="location" color={iconColor} size={size} />;
            case 'Add':
              return <AntDesign name="plus" color="black" size={size} />; // Always black for add button
            case 'triplist':
              return <FontAwesome6 name="map-location" color={iconColor} size={size} />;
            case 'History':
              return <FontAwesome5 name="history" color={iconColor} size={size} />;
            default:
              return null;
          }
        },
        tabBarActiveTintColor: 'black',  // Set active tab label color to black
        tabBarInactiveTintColor: 'gray', // Set inactive tab label color to gray
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={Dash}
      />
      <Tab.Screen
        name="Notify"
        component={LiveTrip}
        options={{ tabBarLabel: "Live Trip" }}
      />
      <Tab.Screen
        name="Add"
        component={InstantTrip} 
        options={{
          tabBarLabel: "Book Now",  
        }}
      />
      <Tab.Screen
        name="triplist"
        component={UPcomings}
        options={{ tabBarLabel: "UpComings" }}
      />
      <Tab.Screen
        name="History"
        component={History}
        options={{ tabBarLabel: "History" }}
      />
    </Tab.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70, 
    paddingBottom: 10,  
  },
  tabBarLabel: {
    marginTop: 5,
    fontSize: 12, 
  },
});
