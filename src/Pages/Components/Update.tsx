import React from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, Linking, Alert, Platform } from 'react-native';


function Update() {
 

  const handleUpdatePress = () => {
    // Open the appropriate store based on the platform
    const appStoreUrl =
      Platform.OS === 'ios'
        ? 'itms-apps://itunes.apple.com/app/your-app-id' // Replace with your iOS App Store URL
        : 'https://play.google.com/store/apps/details?id=com.yourapp.packageName'; // Replace with your Android Play Store URL

    Linking.openURL(appStoreUrl);
  };

  return (
    <View style={styles.container}>
      {/* Display an image */}
      <Image source={require('../assets/images/banner.png')} style={styles.image} />

      {/* Display Version Information */}
      <View style={styles.versionContainer}>
        <Text style={styles.title}>New Versions of App available please update the app. </Text>

        {/* Older Version
        <Text style={styles.versionText}>
          <Text style={styles.bold}>Old Version: </Text>
          {olderVersion} (Build {olderBuildNumber})
        </Text>

        {/* Current Version */}
       
      </View>

      {/* Update Button */}
      <TouchableOpacity style={styles.button} onPress={handleUpdatePress}>
        <Text style={styles.buttonText}>Update Now</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Update;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFC10E',
    borderRadius: 10,
    marginTop: 30, // Space above the button
    paddingVertical: 15, // Vertical padding for button
    paddingHorizontal: 40, // Horizontal padding for button
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18, // Adjust font size for button text
    color: 'black', // White color for button text
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, 
  },
  image: {
    height: 150, // Adjust height for the image
    width: '80%', // Adjust width for the image
    marginBottom: 30, // Space between the image and version text
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 30, // Space between version text and button
  },
  title: {
    fontSize: 20,
    textAlign:'center',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  versionText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
});
