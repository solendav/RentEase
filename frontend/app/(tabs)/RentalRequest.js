import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  CheckBox,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import withAuth from "./../../components/withAuth";
import withRoleAccess from "../../components/withRoleAccess";

const SendRequest = ({ propertyId }) => {
  const router = useRouter();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [message, setMessage] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const handleEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  const handleSubmit = async () => {
    // ... (Get the authenticated renterId from SecureStore or your authentication logic)
    const renterId = "yourRenterId"; // Replace with actual renterId

    try {
      // Send the request to your backend (replace with your backend API endpoint)
      const response = await fetch(
        `http://10.139.179.206:8000/properties/${propertyId}/requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer yourToken`, // Replace with actual token
          },
          body: JSON.stringify({
            renterId,
            startDate,
            endDate,
            message,
            quantity, // Send the selected quantity
            totalPrice, // Send the calculated total price
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Request sent successfully!");
        // ... (Optionally, navigate back to the property details page or renter dashboard)
        router.push(`/property/${propertyId}`); // Assuming you have a Property Detail route
      } else {
        const data = await response.json(); // Assuming your backend sends a JSON error message
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      console.error("Error sending request:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
      <View style={styles.checkboxContainer}>
        <CheckBox value={termsAccepted} onValueChange={setTermsAccepted} />
        <Text style={styles.termsText}>
          I agree to the{" "}
          <Text
            style={styles.termsLink}
            onPress={() =>
              Alert.alert(
                "Terms and Conditions",
                "Terms and conditions content here."
              )
            }
          >
            Terms and Conditions
          </Text>
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: termsAccepted ? "#7f00ff" : "#dcdcdc" },
        ]}
        onPress={termsAccepted ? handleSubmit : null}
        disabled={!termsAccepted}
      >
        <Text style={styles.submitButtonText}>Submit Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  datePicker: {
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  datePickerText: {
    color: "#000",
  },
  dateText: {
    textAlign: "center",
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  termsText: {
    fontSize: 16,
    marginLeft: 10,
  },
  termsLink: {
    color: "#7f00ff",
    textDecorationLine: "underline",
  },
  submitButton: {
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default withAuth(withRoleAccess(SendRequest, ["1", "3"]));
