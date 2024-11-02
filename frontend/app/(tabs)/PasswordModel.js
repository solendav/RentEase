import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import withAuth from "./../../components/withAuth";
import { Colors } from "../../constants/Colors";
const PasswordModal = ({ visible, onClose, onPasswordVerified }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation(); // For navigation

  const handleVerifyPassword = async () => {
    try {
      const userId = await SecureStore.getItemAsync("user_id");
      const response = await axios.post(
        `https://renteasebackend-orna.onrender.com/api/verify-account-password/${userId}`,
        { password }
      );
      if (response.data.verified) {
        onPasswordVerified();
        setPassword("");
        onClose();
      } else {
        setError("Incorrect password");
      }
    } catch (err) {
      console.error("Password verification error:", err);
      setError("Error verifying password");
    }
  };

  const handleCancel = () => {
    navigation.navigate("Home"); // Adjust the screen name as needed
    onClose(); // Close the modal if you want
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Enter Your Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="********"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#007bff"
              />
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={styles.button}
            onPress={handleVerifyPassword}
          >
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,

    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    width: "85%",
    top: 135,
    padding: 25,
    backgroundColor: "white",
    borderRadius: 15,
    alignItems: "center",
    elevation: 5, // For shadow effect
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  errorText: {
    color: "#ff0000",
    marginBottom: 15,
  },
  button: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.PRIMARY,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#f44336", // Red color for cancel
  },
  cancelButtonText: {
    color: "white",
  },
});

export default withAuth(PasswordModal);
