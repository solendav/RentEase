import React, { useState, useCallback, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook
import withAuth from "./withAuth";
import { ThemeContext } from "../app/contexts/ThemeContext";
import { Colors } from "../constants/Colors";
import RotatingDotsLoader from './../components/RotatingDotsLoader';
const formatDate = (dateString) => {
  const date = parseISO(dateString);
  return format(date, "dd MMM yyyy");
};

const BookingNotification = ({ onCountUpdate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [notificationCount, setNotificationCount] = useState(0);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation(); // Get navigation object

  const getUserId = async () => {
    try {
      const userId = await SecureStore.getItemAsync("user_id");
      return userId;
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await getUserId();
      if (!userId) {
        Alert.alert("Error", "Failed to retrieve user ID.");
        return;
      }
      const response = await fetch(
        `http://10.139.165.212:8000/notifications/${userId}`
      );
      const data = await response.json();
      const filteredData = data.filter(
        (notification) => !notification.type || notification.type === "booking"
      );
      const sortedData = filteredData.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt) // Sorting in descending order
      );
      setNotifications(sortedData);
      const count = sortedData.length;
      setNotificationCount(count);
      if (onCountUpdate) onCountUpdate(count);

      // Fetch user names
      const usersData = {};
      for (const notification of sortedData) {
        if (notification.tenant_id) {
          const userResponse = await fetch(
            `http://10.139.165.212:8000/users/${notification.tenant_id}`
          );
          const user = await userResponse.json();
          usersData[notification.tenant_id] = user.user_name;
        }
      }
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      Alert.alert("Error", "Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }, [onCountUpdate]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const renderNotification = ({ item }) => (
    <View style={styles.notificationContainer}>
      <View style={styles.row}>
        <Ionicons name="person" size={24} color={Colors.PRIMARY} style={styles.icon} />
        <Text style={styles.userName}>
          {users[item.tenant_id] || "Loading..."}
        </Text>
        <Text style={styles.dateText}>{formatDate(item.updatedAt)}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("NotificationDetails", {
              bookingId: item._id,
              userId: item.tenant_id,
            })
          }
        >
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme === 'dark' ? Colors.BLACK : "#f9f9f9",
    },
    headerText: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      color:Colors.GRAY
    },
    notificationContainer: {
      padding: 15,
      marginBottom: 10,
      backgroundColor: theme === 'dark' ? '#303030' : '#fff',
      borderRadius: 5,
      borderWidth: 1,
      borderColor: Colors.GRAY,
      flexDirection: "row",
      alignItems: "center",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    icon: {
      marginRight: 10,
    },
    userName: {
      flex: 1,
      fontSize: 16,
      fontWeight: "bold",
    },
    dateText: {
      fontSize: 14,
      color: "green",
      marginLeft: 10,
      marginRight: 10,
    },
    button: {
      backgroundColor: Colors.PRIMARY,
      borderRadius: 5,
      padding: 10,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:"rgba(255, 255, 255, 0.1)", // Make it completely transparent
      zIndex: 100, // Ensure it's on top
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        You have {notificationCount} booking notifications
      </Text>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <RotatingDotsLoader />
        </View>
      )}
    </View>
  );
};



export default withAuth(BookingNotification);
