import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store"; // Import SecureStore

const TermsAndConditions = () => {
  const [terms, setTerms] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch the latest terms and conditions from the server
    axios
      .get("https://renteasebackend-orna.onrender.com/api/terms-and-conditionsview")
      .then((response) => {
        setTerms(response.data);
      })
      .catch((error) => {
        console.error("Error fetching terms:", error);
        Alert.alert("Error", "Unable to fetch terms and conditions.");
      });
  }, []);

  const handleAgree = async () => {
   
        navigation.navigate("SignUp", { agree: true });
    
  };

  const handleDisagree = () => {
    // Optionally handle the disagreement action
    Alert.alert(
      "Notice",
      "You must agree to the terms and conditions to continue."
    );
  };

  if (!terms) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{terms.title}</Text>
        <Text style={styles.updatedAt}>
          Updated on: {new Date(terms.updatedAt).toLocaleDateString()}
        </Text>
        <Text style={styles.content}>{terms.content}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.agreeButton]}
            onPress={handleAgree}
          >
            <Text style={styles.buttonText}>Agree</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.disagreeButton]}
            onPress={handleDisagree}
          >
            <Text style={styles.buttonText}>Disagree</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    margin: 20,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  updatedAt: {
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  agreeButton: {
    backgroundColor: "#28a745", // Green color
  },
  disagreeButton: {
    backgroundColor: "#dc3545", // Red color
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  loadingText: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    fontSize: 18,
    color: "#333",
  },
});

export default TermsAndConditions;
