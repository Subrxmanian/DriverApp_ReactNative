import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Button, RadioButton } from "react-native-paper";
import { SkypeIndicator } from "react-native-indicators";
import api from "../Api";
import { useNavigation } from "@react-navigation/native";

function Support() {
  const Navigation = useNavigation();
  const [language, setLanguage] = useState("English");
  const [cancellationReasons, setCancellationReasons] = useState([]);  
  const [loading, setLoading] = useState(true); 
 const handleCancel = async()=>{
  setLoading(true)
  const id =100;
  try { 
    const response = await api.put(`cancelled/reasons/${id}`,{cancellationReasons});   
    // const activeReasons = response.data.filter(item => item.status === "Active");
    // setCancellationReasons(activeReasons);  
  } catch (error) {
    console.error("Error canceling Trip:", error);
  } finally {
    setLoading(false); 
  }
 }
  useEffect(() => {
    const fetchCancellationReasons = async () => {
      try { 
        const response = await api.get("cancelled/reasons");   
        const activeReasons = response.data.filter((item:any) => item.status === "Active"
        && item.category==='Driver'
      );
        setCancellationReasons(activeReasons);  
      } catch (error) {
        console.error("Error fetching cancellation reasons:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchCancellationReasons();  
  }, []);  

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

       
      </View>

      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 3 }}>
          Why do you want to cancel?
        </Text>
        <Text style={{ color: "gray", marginLeft: 3 }}>
          Please select the reason for cancellation
        </Text>
      </View>

      <View style={styles.radioGroup}>
        {loading ? (
        <SkypeIndicator color="black" size={30} />
        ) : (
          cancellationReasons.map((reason:any) => (
            <TouchableOpacity key={reason._id} onPress={() => setLanguage(reason.reason)}>
              <View style={styles.radioButtonContainer}>
                <Text style={styles.languageOption}>{reason.reason}</Text>

                <RadioButton
                  value={reason.reason}
                  status={language === reason.reason ? "checked" : "unchecked"}
                  color={language === reason.reason ? "#FFC10E" : "gray"}
                  uncheckedColor="gray"
                  style={styles.radiocircle}
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <Button
        mode="outlined"
        onPress={handleCancel}
        textColor="black"
        style={styles.share}
      >
        Cancel
      </Button>
    </View>
  );
}

export default Support;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
  },
  share: {
    borderBlockColor: "black",
    width: "90%",
    alignSelf: "center",
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
    padding: 10,
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
    padding: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
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
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  spacer: {
    flex: 1,
  },
  content: {
    textAlign: "left",
    padding: 50,
    marginBottom: 90,
  },
  infoText: {
    color: "white",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
}); 