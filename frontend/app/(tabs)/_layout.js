import React, { useContext, useEffect, useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { ThemeContext } from "./../contexts/ThemeContext";
import CustomDrawerContent from "./CustomDrawerContent";
import HeaderRightButton from "./../../components/HeaderRightButton";
import TabNav from "./tabnav";
import Explore from "./Explore";
import Profile from "./Profile";
import Saved from "./Saved";
import Home from "./Home";
import Dashboard from "./Dashboard";
import AddProperty from "./AddProperty";
import Settings from "./Settings";
import MyBookingOwner from "./MyBookingOwner";
import MyBookings from "./MyBookings";
import PersonalProfile from "./ProfileForm";
import Cate from "./cate";
import Wallet from "./Wallet";
import MyProperty from "./MyProperty";

import { Colors } from "../../constants/Colors";
import axios from "axios";
import { View, Text } from "react-native"; // Import View and Text
import i18n from "../i18n/index";
import { I18nextProvider } from "react-i18next";
import { useTranslation } from "react-i18next";
import RoleBasedPage from "./RoleBasedPage";
const Drawer = createDrawerNavigator();

const DrawerNav = () => {
  const { theme } = useContext(ThemeContext);
  const [bookingCount, setBookingCount] = useState(0);
  const [endCount, setEndCount] = useState(0);
  const { t } = useTranslation(); // useTranslation hook

  useEffect(() => {
    const fetchUserIdAndBookingData = async () => {
      try {
        // Fetch user ID from SecureStore
        const userId = await SecureStore.getItemAsync("user_id");
  
        if (userId) {
          // Fetch the bookings for the user
          const response = await fetch(
            `https://renteasebackend-orna.onrender.com/api/bookings/tenant/${userId}`
          );
          const data = await response.json();
  
          if (Array.isArray(data)) {
            const now = new Date(); // Get the current date
  
            // Calculate booking count
            const bookingCount = data.filter(
              (booking) =>
                booking.approval === "accepted" && booking.status !== "booked" && booking.returned !== true
            ).length;
  
            // Calculate end count
            const endCount = data.filter(
              (booking) =>
                booking.approval === "accepted" &&
                booking.status == "booked" &&
                booking.returned !== true &&
               
                new Date(booking.end_date) <= now
            ).length;
  
            // Set counts in state
            setBookingCount(bookingCount);
            setEndCount(endCount);
          } else {
            console.error("Unexpected response format: ", data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch booking data", error);
      }
    };
  
    // Set an interval to refresh data every 10 seconds
    const intervalId = setInterval(fetchUserIdAndBookingData, 10000);
  
    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);
  
  // Define header styles based on the current theme
  const headerStyle = {
    backgroundColor: theme === "dark" ? "#161515" : "#fff",
  };

  const headerTintColor = theme === "dark" ? "#fff" : "#000";

  const headerTitleStyle = {
    color: headerTintColor,
  };

  // Define drawer styles based on the current theme
  const drawerStyle = {
    backgroundColor: theme === "dark" ? "#161515" : "#fff",
  };

  // Define styles for the booking count badge
  const countBadgeStyle = {
    backgroundColor: "red",
    color: "white",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 12,
    fontWeight: "bold",
    fontSize: 14,
  };

  return (
    <I18nextProvider i18n={i18n}>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ route }) => ({
          drawerIcon: ({ color, size }) => {
            let iconName;

            switch (route.name) {
              case "Home":
                iconName = "home";
                break;
              case "Explore":
                iconName = "search";
                break;
              case "Notification":
                iconName = "notifications-outline";
                break;
              case "Saved":
                iconName = "heart-outline";
                break;
              default:
                iconName = "home";
                break;
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          drawerActiveTintColor:
            theme === "dark" ? Colors.PRIMARY : Colors.PRIMARY,
          drawerInactiveTintColor: theme === "dark" ? "#aaa" : "gray",
          headerStyle: headerStyle,
          headerTintColor: headerTintColor,
          headerTitleStyle: headerTitleStyle,
          headerRight: () => <HeaderRightButton />,
          drawerStyle: drawerStyle,
        })}
      >
        <Drawer.Screen
          name={t("Main")}
          component={TabNav}
          options={{
            drawerLabel: t("Home"),
            drawerLabelStyle: { color: theme === "dark" ? "#fff" : "#000" },
          }}
        />
        <Drawer.Screen
          name="Settings"
          component={Settings}
          options={{
            drawerLabel: t("Settings"),
            drawerLabelStyle: { color: theme === "dark" ? "#fff" : "#000" },
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={24} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            drawerLabel: t("dashboard"),
            drawerLabelStyle: { color: theme === "dark" ? "#fff" : "#000" },
            drawerIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={24} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Add Property"
          component={AddProperty}
          options={{
            drawerLabel: t("Add Property"),
            drawerLabelStyle: { color: theme === "dark" ? "#fff" : "#000" },
            drawerIcon: ({ color, size }) => (
              <Ionicons name="add-outline" size={24} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="My Bookings"
          component={MyBookings}
          options={{
            drawerLabel: ({ focused, color }) => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: theme === "dark" ? "#fff" : "#000",
                    marginLeft: 0,
                    marginRight:8,
                    fontSize: 15,
                  }}
                >
                  {t("My Bookings")}     
                </Text>
                {bookingCount > 0 && (
                  <Text style={countBadgeStyle}>{bookingCount}</Text>
                )}
              </View>
            ),
            drawerLabelStyle: { color: theme === "dark" ? "#fff" : "#000" },
            drawerIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={24} color={color} />
            ),
          }}
        />
      
        <Drawer.Screen
          name="Personal Profile"
          component={PersonalProfile}
          options={{
            drawerLabel: t("Personal Profile"),
            drawerLabelStyle: { color: theme === "dark" ? "#fff" : "#000" },
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={24} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="My Property"
          component={MyProperty}
          options={{
            drawerLabel: t("My Property"),
            drawerLabelStyle: { color: theme === "dark" ? "#fff" : "#000" },
            drawerIcon: ({ color, size }) => (
              <Ionicons name="today" size={24} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="My Rentals"
          component={RoleBasedPage}
          options={{
            drawerLabel: ({ focused, color }) => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: theme === "dark" ? "#fff" : "#000",
                    marginLeft: 0,
                    marginRight:8,
                    fontSize: 15,
                  }}
                >
                  {t("My Rentals")}    
                </Text>
                {endCount > 0 && (
                  <Text style={countBadgeStyle}>{endCount}</Text>
                )}
              </View>
            ),
            drawerLabelStyle: { color: theme === "dark" ? "#fff" : "#000" },
            drawerIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={24} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Wallet"
          component={Wallet}
          options={{
            drawerLabel: t("Wallet"),
            drawerLabelStyle: { color: theme === "dark" ? "#fff" : "#000" },
            drawerIcon: ({ color, size }) => (
              <Ionicons name="wallet-outline" size={24} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </I18nextProvider>
  );
};

export default DrawerNav;
