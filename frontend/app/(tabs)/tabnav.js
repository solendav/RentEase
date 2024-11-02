import React, { useState, useEffect, useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Home from "./Home";
import Explore from "./Explore";
import Notification from "./Notification";
import Saved from "./Saved";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { ThemeContext } from "./../contexts/ThemeContext";
import { Colors } from "../../constants/Colors";
const Tab = createBottomTabNavigator();

const TabNav = () => {
  const { t } = useTranslation(); // useTranslation hook

  const [pendingCount, setPendingCount] = useState(0);
  // To determine light or dark mode
  const { theme } = useContext(ThemeContext);
  // Define the styles object within the correct scope
  const styles = StyleSheet.create({
    iconContainer: {
      position: "relative",
    },
    badgeContainer: {
      position: "absolute",
      top: -5,
      right: -5,
      backgroundColor: "red",
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    badgeText: {
      color: "white",
      fontWeight: "bold",
    },
  });

  const getUserId = async () => {
    try {
      const userId = await SecureStore.getItemAsync("user_id");
      return userId;
    } catch {
      return null;
    }
  };

  const fetchAccountNumber = async (userId) => {
    try {
      const response = await axios.get(
        `https://renteasebackend-orna.onrender.com/api/account/${userId}`
      );
      return response.data.account_no;
    } catch (error) {
      console.error("Error fetching account number:", error);
      throw error;
    }
  };

  const fetchTransactions = async (userId, accountNo) => {
    try {
      const response = await axios.get(
        "https://renteasebackend-orna.onrender.com/api/transactionsnotification",
        {
          params: { userId, accountNo },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching transactions:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };

  const fetchPendingCount = async () => {
    try {
      const userId = await getUserId();
      if (!userId) {
        return;
      }

      const notificationsResponse = await axios.get(
        `https://renteasebackend-orna.onrender.com/notifications/${userId}`
      );
      const notifications = notificationsResponse.data;
      const bookingsCount = notifications.filter(
        (notification) => notification.approval === "Pending"
      ).length;

      const accountNo = await fetchAccountNumber(userId);
      const transactions = await fetchTransactions(userId, accountNo);
      const transactionsCount = transactions.length;

      setPendingCount(bookingsCount + transactionsCount);
    } catch (error) {
      console.error(
        "Error fetching pending notifications count:",
        error.message
      );
    }
  };

  useEffect(() => {
    fetchPendingCount(); // Initial fetch

    const intervalId = setInterval(fetchPendingCount, 20000); // Refresh every 20 seconds

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, []);

  const renderTabBarIcon = (route, color, size) => {
    let iconName;
    let badge;

    switch (route.name) {
      case t("Home"):
        iconName = "home";
        break;
      case t("Explore"):
        iconName = "search";
        break;
      case t("Notification"):
        iconName = "notifications-outline";
        badge =
          pendingCount > 0 ? (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          ) : null;
        break;
      case t("Saved"):
        iconName = "heart-outline";
        break;
      default:
        iconName = "home";
        break;
    }

    return (
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={size} color={color} />
        {badge}
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => renderTabBarIcon(route, color, size),
        headerShown: false,
        tabBarActiveTintColor:
          theme === "dark" ? Colors.PRIMARY : Colors.PRIMARY, // Example: Dynamic active color
        tabBarInactiveTintColor: theme === "dark" ? "lightgray" : "gray", // Example: Dynamic inactive color
        tabBarStyle: {
          backgroundColor: theme === "dark" ? "#161515" : "#fff", // Example: Dynamic background color
        },
      })}
    >
      <Tab.Screen name={t("Home")} component={Home} />
      <Tab.Screen name={t("Explore")} component={Explore} />
      <Tab.Screen name={t("Notification")} component={Notification} />
      <Tab.Screen name={t("Saved")} component={Saved} />
    </Tab.Navigator>
  );
};

export default TabNav;
