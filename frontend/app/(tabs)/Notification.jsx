import React, { useState, useCallback, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import BookingNotificationTenant from '../../components/BookingNotificationTenant'; // Import tenant notification component
import BookingNotification from './../../components/BookingNotification'; // Import owner notification component
import BookingNotificationBoth from './../../components/BookingNotificationBoth'; // Import both notification component
import TransactionNotification from './../../components/TransactionNotification'; // Import TransactionNotification component
import withAuth from "../../components/withAuth";
import { ThemeContext } from './../contexts/ThemeContext';
import { Colors } from "./../../constants/Colors";

const Notifications = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('booking'); // State for the active tab
  const [loading, setLoading] = useState(true);
  const [bookingCount, setBookingCount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [role, setRole] = useState(null); // State for role
  const { theme } = useContext(ThemeContext);

  const getUserId = async () => {
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      return userId;
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };

  const getUserRole = async () => {
    try {
      const storedRole = await SecureStore.getItemAsync('role');
      return parseInt(storedRole); // Ensure the role is an integer
    } catch (error) {
      console.error("Error fetching role:", error);
      return null;
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchNotifications = async () => {
        setLoading(true);
        try {
          const userId = await getUserId();
          const userRole = await getUserRole();
          setRole(userRole); // Set role state

          if (!userId) {
            Alert.alert("Error", "Failed to retrieve user ID.");
            return;
          }
          // Fetch notifications based on activeTab
        } catch (error) {
          console.error("Error fetching notifications:", error);
          Alert.alert("Error", "Failed to fetch notifications.");
        } finally {
          setLoading(false);
        }
      };
      fetchNotifications();
    }, [activeTab])
  );

  const renderBookingNotification = () => {
    if (role === 1) {
      return <BookingNotificationTenant onCountUpdate={setBookingCount} />;
    } else if (role === 2) {
      return <BookingNotification onCountUpdate={setBookingCount} />;
    } else if (role === 3) {
      return <BookingNotificationBoth onCountUpdate={setBookingCount} />;
    }
    return null;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme === 'dark' ? Colors.BLACK : "#f9f9f9",
    },
    header: {
      marginBottom: 20,
    },
    headerTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
    },
    toggleContainer: {
      flexDirection: 'row',
      marginTop: 10,
    },
    toggleButton: {
      flex: 1,
      padding: 10,
      backgroundColor: '#e0e0e0',
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 5,
    },
    activeToggleButton: {
      backgroundColor: Colors.PRIMARY,
    },
    toggleButtonText: {
      fontSize: 16,
      color: '#333',
    },
    activeToggleButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Make it slightly transparent
      zIndex: 100, // Ensure it's on top
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <View style={styles.toggleContainer}>
          <Pressable
            style={[styles.toggleButton, activeTab === 'booking' && styles.activeToggleButton]}
            onPress={() => setActiveTab('booking')}
          >
            <Text style={[styles.toggleButtonText, activeTab === 'booking' && styles.activeToggleButtonText]}>
              Booking ({bookingCount})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleButton, activeTab === 'transaction' && styles.activeToggleButton]}
            onPress={() => setActiveTab('transaction')}
          >
            <Text style={[styles.toggleButtonText, activeTab === 'transaction' && styles.activeToggleButtonText]}>
              Transaction ({transactionCount})
            </Text>
          </Pressable>
        </View>
      </View>
      {/* Conditionally render booking notification components based on the role */}
      {activeTab === 'booking' && renderBookingNotification()}
      {activeTab === 'transaction' && <TransactionNotification onCountUpdate={setTransactionCount} />}
    </View>
  );
};

export default withAuth(Notifications);
