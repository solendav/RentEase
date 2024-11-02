import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ThemeContext } from "./../app/contexts/ThemeContext"; // Import ThemeContext
import { Colors } from "../constants/Colors";

const getInitials = (username) => {
  if (!username) return "";
  const names = username.split(" ");
  const initials = names.map((name) => name.charAt(0).toUpperCase()).join("");
  return initials;
};

const Header = ({ title }) => {
  const [username, setUsername] = useState("");
  const { theme } = useContext(ThemeContext); // Access the theme context
  const router = useRouter();

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const storedUsername = await SecureStore.getItemAsync("username");
        setUsername(storedUsername);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
  }, []);

  const initials = getInitials(username);

  const handleBackPress = () => {
    console.log("Back button pressed");
    router.back(); // Navigate back
  };

  const handleProfilePress = () => {
    router.push("/Profiles"); // Navigate to Profile page
  };

  // Dynamic styles based on theme
  const dynamicStyles = styles(theme);

  return (
    <View style={dynamicStyles.header}>
      <TouchableOpacity onPress={handleBackPress} style={dynamicStyles.backButton}>
        <Ionicons name="chevron-back" size={25} color={dynamicStyles.iconColor.color} />
      </TouchableOpacity>
      <Text style={dynamicStyles.title}>{title}</Text>
      <TouchableOpacity
        style={dynamicStyles.profileButton}
        onPress={handleProfilePress}
      >
        <Text style={dynamicStyles.profileText}>{initials}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = (theme) =>
  StyleSheet.create({
    header: {
      height: 40,
      marginTop: 20,
      marginHorizontal: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      textAlign: "center",
      flex: 1,
      color: theme === "dark" ? "#fff" : "#000", // Adjust based on theme
    },
    profileButton: {
      width: 30,
      height: 30,
      borderRadius: 22.5,
      backgroundColor: Colors.PRIMARY,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor:Colors.GRAY,
    },
    profileText: {
      fontSize: 18,
      color: "#fff",
      fontWeight: "bold",
    },
    backButton: {
      padding: 5,
    },
    iconColor: {
      color: theme === "dark" ? "#fff" : "#000", // Adjust based on theme
    },
  });

export default Header;
