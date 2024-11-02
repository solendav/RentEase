import React, { useState, useEffect, useCallback } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import InitialsButton from "./InitialButton"; // Ensure the correct path
import { useRouter } from "expo-router";
const HeaderRightButton = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Hook to check if the screen is focused
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showLoginText, setShowLoginText] = useState(false);
  const router = useRouter();
  const checkSignInStatus = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      setIsSignedIn(!!token);
    } catch (error) {
      console.error("Failed to fetch sign-in status:", error);
      setIsSignedIn(false);
    }
  }, []);

  useEffect(() => {
    checkSignInStatus();
  }, [checkSignInStatus, isFocused]); // Refresh on screen focus

  const handlePress = () => {
    if (isSignedIn) {
      navigation.navigate("Profiles");
    } else {
      setShowLoginText(!showLoginText);
      if (showLoginText) {
        navigation.navigate("auth", { screen: "SignIn" });
      }
    }
  };

  return isSignedIn ? (
    <InitialsButton onPress={handlePress} />
  ) : (
    <TouchableOpacity onPress={handlePress} style={styles.button}>
      <View
        style={showLoginText ? styles.expandedButton : styles.iconContainer}
      >
        <Ionicons name="person" size={20} color="gray" />
        {showLoginText && <Text style={styles.loginText}>Login</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 25,
    padding: 5,
    marginRight: 10,
    backgroundColor: "white",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandedButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 25,
    borderColor: "gray",
    backgroundColor: "white",
  },
  loginText: {
    marginLeft: 10,
    color: "gray",
    fontSize: 16,
  },
});

export default HeaderRightButton;
