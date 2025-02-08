
import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { RadioButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18next from "i18next"; // Import i18next
function Language() {
  const Navigation = useNavigation();

  const [language, setLanguage] = useState("English");

  const languageOptions = {
    English: "English",
    Tamil: "தமிழ்",
    Malayalam: "മലയളം",
    Kannada: "ಕನ್ನಡಾ",
    Hindi: "हिंदी",
    Telugu: "తెలుగు",
  };
  const handleSubmit = async () => {
    let langCode = "en"; // Default to English
  
    if (language === "English") {
      langCode = "en";
    } else if (language === "Tamil") {
      langCode = "ta";
    } else if (language === "Malayalam") {
      langCode = "ma";
    } else if (language === "Hindi") {
      langCode = "hi";
    } else if (language === "Kannada") {
      langCode = "ka";
    } else if (language === "Telugu") {
      langCode = "te";
    }
  
    // Corrected the key to "language" instead of "laguage"
    await AsyncStorage.setItem("language", langCode);
    i18next.changeLanguage(langCode);
    // Navigate to the next screen with the selected language
    Navigation.navigate("Pages/State", { preferedlanguage: language });
  };

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
        <TouchableOpacity>
          {/* Add any additional functionality for this button */}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => Navigation.navigate("Components/Help" as never)}
        >
          <Text style={{ fontWeight: "bold" }}>? Help</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Image
          source={require("./assets/images/language.png")}
          style={styles.image}
        />
        <Text style={styles.languageText}>Select your preferred language:</Text>
        <ScrollView>
          <View style={styles.radioGroup}>
            {Object.keys(languageOptions).map((lang) => (
              <TouchableOpacity
                key={lang} // Use key here to resolve the warning
                onPress={() => setLanguage(lang)} // Set internal language value
              >
                <View style={styles.radioButtonContainer}>
                  <Text style={styles.languageOption}>
                    {languageOptions[lang]}
                  </Text>

                  <RadioButton
                    value={lang}
                    status={language === lang ? "checked" : "unchecked"}
                    onPress={() => {
                      console.log(lang);
                      setLanguage(lang); // Update internal value
                    }}
                    color={language === lang ? "#FFC10E" : "gray"}
                    uncheckedColor="gray"
                    style={styles.radiocircle}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Proceed Button */}
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleSubmit } // Pass the internal language value
          >
            <Text style={styles.buttonText}>Proceed</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      {/* Bottom Line */}
      <View style={styles.bottomLine}></View>
    </View>
  );
}

export default Language;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  radiocircle: {
    height: 20,
    width: 20,
    borderRadius: 15,
    borderWidth: 2,
  },
  image: {
    width: "100%",
  },
  languageText: {
    fontWeight: "bold",
    fontSize: 16,
    padding: 10,
  },
  radioGroup: {
    marginVertical: 10,
  },
  radioButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "gray",
    marginBottom: 20,
  },
  languageOption: {
    fontSize: 16,
    marginRight: 10,
  },
  avatar: {
    borderRadius: 35,
    height: 60,
    width: 60,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  text: {
    fontSize: 19,
    marginLeft: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
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
  bottomLine: {
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 20,
  },
});
