
import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View, Text, Image, FlatList } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Searchbar } from "react-native-paper"; // Importing Searchbar from React Native Paper
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function State() {
  const Navigation = useNavigation();
  const Route = useRoute();
  const [language, setLanguage] = useState<string | null>(null); // Initialize as null
const {t}=useTranslation()
  useEffect(() => {
    if (Route.params?.preferedlanguage) {
      setLanguage(Route.params.preferedlanguage);
    } else {
      setLanguage('en');
    }
  }, [Route.params]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("Tamil Nadu");

  const states = [
    "Andhra Pradesh",
    "Tamil Nadu",
    "Karnataka",
    "Maharashtra",
    "Kerala",
    "Telangana",
    "Uttar Pradesh",
    "Bihar",
    "West Bengal",
    "Gujarat",
  ]; 
  const onSearchQueryChange = (query: any) => setSearchQuery(query);
  const filteredStates = states.filter((state) =>
    state.toLowerCase().includes(searchQuery.toLowerCase())
  ); 
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => Navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={30} color="black" />
          <Text style={styles.text}>{t("Back")}</Text>
        </TouchableOpacity>
       

        {/* Help Button */}
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => Navigation.navigate("Components/Help" as never)}
        >
          <Text style={{ fontWeight: "bold" }}>? {t("Help")}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row" }}>
        <Image
          source={require("./assets/images/Maskgroup.png")}
          style={styles.highlightedImage}
        />
        <View style={styles.textContainer}>
          <Text style={{ fontWeight: "bold", padding: 10 }}>
            {t("Which state do you want to ride")}?
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontWeight: "bold",
          justifyContent: "center",
          alignContent: "center",
          fontSize: 16,
          padding: 10,
        }}
      >
        {t("Select your preferred State ")} :
      </Text>

      <Searchbar
        placeholder="Search State"
        onChangeText={onSearchQueryChange}
        value={searchQuery}
        style={styles.searchBar}
        theme={{ colors: { primary: '#FFD700', text: 'black', placeholder: 'gray' } }}
      />

      <FlatList
        data={filteredStates}
        keyExtractor={(item: any) => item}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity
            style={styles.stateItem}
            onPress={() => setSelectedState(item)}
          >
            <Text style={styles.stateText}>{item}</Text>
            {selectedState === item && (
              <Icon name="checkmark-circle" size={20} color="#FFD700" />
            )}
          </TouchableOpacity>
        )}
        style={styles.stateList}
      />

      {/* Confirm Button */}
      <TouchableOpacity
        style={styles.verifyButton}
        onPress={() => Navigation.navigate("Pages/UploadDocuments", { preferedlanguage: language, state: selectedState })}
        // onPress={() => Navigation.navigate("Pages/UploadDocuments")}
      >
        <Text style={styles.buttonText}>Confirm State</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchBar: {
    backgroundColor: '#FFEFC2',  // Set background color of the Searchbar
    marginVertical: 1,
  },
  stateList: {
    marginTop: 10,
  },
  stateItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  stateText: {
    fontSize: 16,
  },
  avatar: {
    borderRadius: 35,
    height: 60,
    width: 60,
  },
  textContainer: {
    alignSelf: "center",
    height: 60,
    borderTopRightRadius: 20,
    width: 180,
    backgroundColor: "#F4BD46",
  },
  helpButton: {
    backgroundColor: "#FEC110",
    borderRadius: 15,
    padding: 10,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  translate: {
    height: 25,
    width: 25,
    marginLeft: 65,
  },
  verifyButton: {
    backgroundColor: "#FEC110",
    borderRadius: 15,
    padding: 14,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", 
    marginBottom: 10,
  },
  highlightedImage: {
    borderWidth: 1,
    borderTopRightRadius:30,
    shadowColor: "#FFC10E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  text: {
    fontSize: 19,
    marginLeft: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
});
