import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import withAuth from './../../components/withAuth'
const WalletPassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState(null);

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
    } catch (error) {
      console.error("Error changing password", error);
      Alert.alert("Error", "Failed to change password.");
    }
  };

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
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button title="Change Password" onPress={handleChangePassword} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  hintText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "gray",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});

export default withAuth(WalletPassword);
