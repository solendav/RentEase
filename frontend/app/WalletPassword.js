import React, { useState, useEffect, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import withAuth from './../components/withAuth'
import { ThemeContext } from "../app/contexts/ThemeContext";
import { Colors } from "../constants/Colors";
import RotatingDotsLoader from './../components/RotatingDotsLoader'; 
const WalletPassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Function to fetch user ID from Secure Store
    const fetchUserId = async () => {
      try {
        const id = await SecureStore.getItemAsync("user_id");
        if (id) {
          setUserId(id);
        } else {
          Alert.alert("Error", "User ID not found.");
        }
      } catch (error) {
        console.error("Error fetching user ID", error);
        Alert.alert("Error", "Failed to retrieve user ID.");
      }
    };

    fetchUserId();
  }, []);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User ID is missing.");
      return;
    }

    try {
      const response = await axios.put(
        `https://renteasebackend-orna.onrender.com/change-password/${userId}`,
        {
          oldPassword,
          newPassword,
          confirmPassword,
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Password changed successfully.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert("Error", response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error changing password", error);
      Alert.alert("Error", "Failed to change password.");
    }
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
      backgroundColor: theme === 'dark' ? Colors.BLACK : "f9f9f9",
    },
    welcomeText: {
      fontSize: 24,
      textAlign: "center",
      marginBottom: 20,
      color: theme === 'dark' ? Colors.GRAY :"#333",
    },
    hintText: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 20,
      color: Colors.GRAY,
    },
    input: {
      height: 40,
      color: theme === 'dark' ? Colors.GRAY :"gray",
      borderWidth: 1,
      marginBottom: 15,
      paddingHorizontal: 10,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to RenteEase Wallet</Text>
      <Text style={styles.hintText}>Your default password is: changeme</Text>

      <TextInput
        style={styles.input}
        placeholder="Old Password"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
        placeholderTextColor={Colors.GRAY}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        placeholderTextColor={Colors.GRAY}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholderTextColor={Colors.GRAY}
      />

      <Button title="Change Password" onPress={handleChangePassword} />
      {loading && (
        <View style={styles.loadingOverlay}>
          <RotatingDotsLoader />
        </View>
      )}
    </View>
  );
};



export default withAuth(WalletPassword);
