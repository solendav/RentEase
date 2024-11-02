import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import CheckBox from "expo-checkbox";
import { Picker } from "@react-native-picker/picker";

import DateTimePicker from "@react-native-community/datetimepicker";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import Header from "./../components/Header";
import withAuth from "./../components/withAuth";
import axios from "axios";
import withRoleAccess from "../components/withRoleAccess";
import withProfileVerification from "../components/withProfileVerification";
import { Colors } from "../constants/Colors";
import { ThemeContext } from "./../app/contexts/ThemeContext";
import RotatingDotsLoader from "./../components/RotatingDotsLoader";
const SendRequest = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const propertyId = route.params?._id;

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [message, setMessage] = useState("");
  const [tenantId, setTenantId] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [pricePerDay, setPricePerDay] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { theme } = useContext(ThemeContext);
  const [quantity, setQuantity] = useState(0);
  const [SelectedQuantity, setSelectedQuantity] = useState(1);
  const calculateIncreasedPrice = (totalPrice) => {
    return totalPrice * 1.04; // Increase price by 4%
  };
  const updatedPrice = calculateIncreasedPrice(totalPrice);
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        console.log("Fetching property with ID:", propertyId);
        const response = await fetch(
          `https://renteasebackend-orna.onrender.com/properties/${propertyId}`
        );
        const property = await response.json();
        setQuantity(property.quantity);
        console.log("Property Data:", property);

        if (property && property.user_id && property.price) {
          console.log("Property owner ID:", property.user_id);
          setOwnerId(property.user_id); // Use user_id as owner_id
          setPricePerDay(property.price); // Set price per day from property details
        } else {
          Alert.alert("Error", "Property owner or price not found.");
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
        Alert.alert("Error", "Failed to fetch property details.");
      }
    };

    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  useEffect(() => {
    const fetchTenantId = async () => {
      try {
        const userId = await SecureStore.getItemAsync("user_id");
        console.log("Fetched tenant ID:", userId);
        setTenantId(userId);
      } catch (error) {
        console.error("Error fetching tenant ID:", error);
        Alert.alert("Error", "Failed to fetch tenant ID.");
      }
    };

    fetchTenantId();
  }, []);

  useEffect(() => {
    // Calculate total price when startDate, endDate, or pricePerDay changes
    if (startDate && endDate && pricePerDay) {
      const timeDiff = Math.abs(endDate - startDate);
      const numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert time difference to days
      const calculatedPrice = numberOfDays * pricePerDay * SelectedQuantity;
      setTotalPrice(calculatedPrice);
    }
  }, [startDate, endDate, pricePerDay]);

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    setStartDate(selectedDate || startDate);
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    setEndDate(selectedDate || endDate);
  };

  //insufficent ballance display
  const InsufficientDepositModal = ({
    visible,
    deposit,
    updatedPrice,
    onCancel,
    onDeposit,
  }) => {
    return (
      <Modal
        transparent={true}
        animationType="slide"
        visible={visible}
        onRequestClose={onCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Insufficient Deposit</Text>
            <Text style={styles.modalMessage}>
              Your deposit of ETB {deposit} Birr is insufficient to cover the
              total price of ETB {updatedPrice.toFixed(2)} Birr.
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.depositButton}
                onPress={onDeposit}
              >
                <Text style={styles.buttonText}>Go to Deposit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  const handleSubmit = async () => {
    if (!tenantId) {
      Alert.alert("Error", "Tenant ID is missing.");
      return;
    }

    if (!ownerId) {
      Alert.alert("Error", "Owner ID is missing.");
      return;
    }

    try {
      const acc = await axios.get(
        `https://renteasebackend-orna.onrender.com/api/account/${tenantId}`
      );
      const accountData = acc.data;

      if (!accountData) {
        Alert.alert("Error", "Failed to fetch account data.");
        return;
      }

      const deposit = accountData.deposit; // Assume 'deposit' is the field name in the account data

      // Compare the deposit with the total price
      if (deposit < totalPrice) {
        Alert.alert(
          "Insufficient Deposit",
          `Your deposit of ETB ${deposit} Birr is insufficient to cover the total price of ETB ${totalPrice.toFixed(
            2
          )} Birr.`,
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "Deposit",
              onPress: () => navigation.navigate("Wallet"), // Replace 'DepositPage' with your actual deposit page route
            },
          ]
        );
        return;
      }

      const response = await fetch(`https://renteasebackend-orna.onrender.com/addBooking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await SecureStore.getItemAsync("token")}`,
        },
        body: JSON.stringify({
          property_id: propertyId,
          tenant_id: tenantId,
          owner_id: ownerId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          message,
          quantity: SelectedQuantity,
          total_price: totalPrice, // Ensure key matches with backend
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Request sent successfully!");
        navigation.goBack();
      } else {
        console.error("Booking request failed:", result);
        Alert.alert("Error", result.message || "Failed to send request.");
      }
    } catch (error) {
      console.error("Error sending request:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
    }
  };
  const handleTermsPress = () => {
    // Navigate to the Terms and Conditions page
    navigation.navigate("TermsAndConditions"); // Replace 'TermsAndConditions' with your actual route name
  };

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: theme === "dark" ? Colors.BLACK : "f9f9f9",
      padding: 16,
    },
    inputContainer: {
      marginBottom: 15,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 5,
      color:Colors.PRIMARY,
    },
    input: {
      borderWidth: 1,
      borderColor: theme === "dark" ? Colors.GRAY : "#e0e0e0",
      borderRadius: 5,
      padding: 10,
      fontSize: 16,
      backgroundColor: theme === "dark" ? "#303030" : "f9f9f9",
    },
    datePicker: {
      backgroundColor: theme === "dark" ? Colors.GRAY : "#e0e0e0",
      borderRadius: 5,
      padding: 10,
      alignItems: "center",
      marginBottom: 15,
    },
    datePickerText: {
      color: theme === "dark" ? Colors.GRAY : "#000",
    },
    dateText: {
      textAlign: "center",
      marginBottom: 15,
      color: theme === "dark" ? Colors.GRAY : "#000",
    },
    priceContainer: {
      marginVertical: 15,
    },
    priceText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme === "dark" ? Colors.WHITE : Colors.BLACK,
      textAlign: "center",
    },
    submitButton: {
      backgroundColor: Colors.PRIMARY,
      borderRadius: 5,
      padding: 15,
      alignItems: "center",
    },
    submitButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: 300,
      backgroundColor: theme === "dark" ? "#303030" : "f9f9f9",
      borderRadius: 10,
      padding: 20,
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
    },
    modalMessage: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 20,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    cancelButton: {
      backgroundColor: "#aaa",
      padding: 10,
      borderRadius: 5,
      marginRight: 10,
      flex: 1,
      alignItems: "center",
    },
    depositButton: {
      backgroundColor: Colors.PRIMARY,
      padding: 10,
      borderRadius: 5,
      flex: 1,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
    },
    termsContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      paddingLeft: 20,
    },
    termsTextContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    termsText: {
      fontSize: 16,
      marginLeft: 8,
    },
    termsLink: {
      fontSize: 16,
      color: "blue", // Change color to indicate a link
      textDecorationLine: "underline", // Underline the text to make it look like a link
    },
    pickerContainer: {
      margin: 10,
     
    
     
     
    },
   
    picker: {
      borderWidth:1,
      borderColor:Colors.GRAY,
      height: 30,
      width: "100%",
      color: "#333",
      backgroundColor: "#f2f2f2",
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Rental Request" />
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Start Date</Text>
        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text style={styles.datePickerText}>Select Start Date</Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}
        <Text style={styles.dateText}>{startDate.toDateString()}</Text>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>End Date</Text>
        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text style={styles.datePickerText}>Select End Date</Text>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}
        <Text style={styles.dateText}>{endDate.toDateString()}</Text>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Message (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your message"
          multiline
          value={message}
          onChangeText={setMessage}
        />
      </View>
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Quantity:</Text>
        <Picker
          selectedValue={SelectedQuantity}
          onValueChange={(itemValue) => setSelectedQuantity(itemValue)}
          style={styles.picker}
        >
          {/* Create Picker items based on the property's available quantity */}
          {[...Array(quantity).keys()].map((x) => (
            <Picker.Item key={x + 1} label={`${x + 1}`} value={x + 1} />
          ))}
        </Picker>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.label}>Total Price</Text>
        <Text style={styles.priceText}>
          ETB :{updatedPrice.toFixed(2)} Birr
        </Text>
      </View>
      <View style={styles.termsContainer}>
        <CheckBox
          value={termsAccepted}
          onValueChange={setTermsAccepted}
          color={termsAccepted ? Colors.PRIMARY : "#e0e0e0"}
        />
        <View style={styles.termsTextContainer}>
          <Text style={styles.termsText}>
            By checking this you accept the term that the Owner describe in
            discription
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: termsAccepted ? Colors.PRIMARY : "#9E9E9E" },
        ]} // Change button color based on terms acceptance
        onPress={handleSubmit}
        disabled={!termsAccepted} // Disable button if terms are not accepted
      >
        <Text style={styles.buttonText}>Submit Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default withAuth(
  withRoleAccess(withProfileVerification(SendRequest), ["1", "3"])
);
