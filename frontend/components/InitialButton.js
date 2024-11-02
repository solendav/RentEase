import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Colors } from "../constants/Colors";

const getInitials = (username) => {
  if (!username) return "";
  const names = username.split(" ");
  const initials = names.map((name) => name.charAt(0).toUpperCase()).join("");
  return initials;
};

const InitialButton = ({ onPress }) => {
  const [username, setUsername] = useState("");

  const fetchUsername = useCallback(async () => {
    try {
      const storedUsername = await SecureStore.getItemAsync("username");
      setUsername(storedUsername || ""); // Default to empty string if null
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsername(); // Fetch username when component mounts or when `fetchUsername` changes
  }, [fetchUsername]);

  const initials = getInitials(username);

  return (
    <TouchableOpacity style={styles.initialsContainer} onPress={onPress}>
      <Text style={styles.initialsText}>{initials}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  initialsContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: Colors.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.GRAY,
    marginRight: 10,
  },
  initialsText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default InitialButton;
