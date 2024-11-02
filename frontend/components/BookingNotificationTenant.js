import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "./../constants/Colors";
import { ThemeContext } from "./../app/contexts/ThemeContext";
import { useNavigation } from '@react-navigation/native';
import RotatingDotsLoader from "./RotatingDotsLoader";
// Fetch bookings based on userId
const fetchBookings = async (userId) => {
  try {
    const response = await fetch(
      `https://renteasebackend-orna.onrender.com/api/bookings/tenant/${userId}`
    );
    if (!response.ok) throw new Error("Network response was not ok");

    const bookings = await response.json();
    
    // Filter bookings where approval is "accepted" and status is not "booked"
    const filteredBookings = bookings.filter(
      (booking) => booking.approval === "accepted" && booking.status !== "booked"
    );

    return filteredBookings;
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return [];
  }
};
  

// Fetch property details based on propertyId
const fetchPropertyDetails = async (propertyId) => {
  try {
    const response = await axios.get(
      `https://renteasebackend-orna.onrender.com/properties/${propertyId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch property details:", error);
    return null;
  }
};

// Fetch owner details based on ownerId
const fetchOwnerDetails = async (ownerId) => {
  try {
    const response = await axios.get(
      `https://renteasebackend-orna.onrender.com/users/${ownerId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch owner details:", error);
    return null;
  }
};

// Format date to Month Day, Year
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
};

const BookingNotificationTenant = ({ onCountUpdate }) => {
  const [userId, setUserId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const storedUserId = await SecureStore.getItemAsync("user_id");
      if (storedUserId) {
        setUserId(storedUserId);

        const fetchedBookings = await fetchBookings(storedUserId);
        if (fetchedBookings.length > 0) {
          const bookingsWithDetails = await Promise.all(
            fetchedBookings.map(async (booking) => {
              const propertyDetails = await fetchPropertyDetails(
                booking.property_id
              );
              const ownerDetails = await fetchOwnerDetails(booking.owner_id);

              return {
                ...booking,
                property: propertyDetails,
                owner: ownerDetails,
              };
            })
          );

          setBookings(bookingsWithDetails);
          // Update the count when fetching data
          if (onCountUpdate) onCountUpdate(bookingsWithDetails.length);
        } else {
          // Update the count when fetching data
          if (onCountUpdate) onCountUpdate(0);
        }
      } else {
        Alert.alert(
          "Authentication Required",
          "You must sign in to view your bookings.",
          [
            {
              text: "Cancel",
              onPress: () => navigation.goBack(),
              style: "cancel",
            },
            {
              text: "Sign In",
              onPress: () => navigation.navigate("SignIn"),
            },
          ]
        );
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewDetails = (bookingId) => {
    navigation.navigate("BookingDetail", { bookingId });
  };

  const handleRefresh = () => {
    fetchData();
  };

  const { theme } = useContext(ThemeContext); // Get the current theme

  // Dynamic styles based on color scheme and theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: theme === "dark" ? Colors.BLACK : "#fff",
    },
    bookingItem: {
      backgroundColor: theme === "dark" ? Colors.BLACK : "#ffffff",
      borderRadius: 10,
      marginBottom: 10,
      padding: 10,
      flexDirection: "column",
      justifyContent: "space-between",
      flex: 1,
    },
    bookingContent: {
      flexDirection: "row",
      flex: 1,
    },
    propertyImage: {
      width: 120,
      height: 80,
      borderRadius: 10,
    },
    textContainer: {
      flex: 1,
      marginLeft: 10,
    },
    propertyName: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme === "dark" ? Colors.PRIMARY : Colors.PRIMARY,
    },
    date: {
      fontSize: 14,
      color: theme === "dark" ? Colors.WHITE : "#555555",
    },
    approval: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#00796b",
      textAlign: "right",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
    },
    gradient: {
      borderRadius: 10,
      padding: 10,
      marginRight: 5,
    },
    footerText: {
      color: "#ffffff",
      fontSize: 14,
      textAlign: "center",
    },
    footerbutton: {
      padding: 10,
    },
    paymentButton: {
      backgroundColor: "#4caf50",
      borderRadius: 10,
      padding: 10,
      marginRight: 5,
    },
    paymentButtonText: {
      color: "#ffffff",
      fontSize: 14,
      textAlign: "center",
    },

    noBookingsText: {
      fontSize: 16,
      color: theme === "dark" ? Colors.PRIMARY : "#777777",
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorText: {
      color: "#f44336",
    },
    list: {
      paddingBottom: 20,
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0)",
      zIndex: 100,
    },
  });

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {bookings.length > 0 ? (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.bookingItem}>
              <View style={styles.bookingContent}>
                <Image
                  source={{
                    uri: item.property?.image?.[0]
                      ? `https://renteasebackend-orna.onrender.com/uploads/${item.property.image[0]}`
                      : "https://via.placeholder.com/100x100.png?text=No+Image",
                  }}
                  style={styles.propertyImage}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.propertyName}>
                    Property: {item.property?.property_name || "N/A"}
                  </Text>
                  <Text style={styles.date}>
                    Start Date: {formatDate(item.start_date)}
                  </Text>
                  <Text style={styles.date}>
                    End Date: {formatDate(item.end_date)}
                  </Text>
                </View>
                <Text style={styles.approval}>
                  {item.approval} {item.status === "booked" && "& Booked"}
                </Text>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.footerbutton}
                  onPress={() => handleViewDetails(item._id)}
                >
                  <LinearGradient
                    colors={["#034f6c", "#05668D"]}
                    style={styles.gradient}
                  >
                    <Text style={styles.footerText}>View Details</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          style={styles.list}
        />
      ) : loading ? (
        <View style={styles.loadingOverlay}>
         <RotatingDotsLoader />
        </View>
      ) : (
        <View style={styles.centered}>
          <Text style={styles.noBookingsText}>You have no bookings.</Text>
        </View>
      )}
   
    </View>
  );
};

export default BookingNotificationTenant;