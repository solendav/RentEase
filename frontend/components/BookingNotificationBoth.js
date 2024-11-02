import React, { useState, useEffect, useCallback } from "react";
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
  Button,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "./../constants/Colors";
import { useNavigation } from "@react-navigation/native";

// Fetch bookings based on userId and type (bookingIn or bookingOut)
const fetchBookings = async (userId, type, onCountUpdate) => {
  try {
    let bookings = [];

    if (type === "bookingIn") {
      // Fetch tenant bookings for 'bookingIn'
      const response = await fetch(
        `https://renteasebackend-orna.onrender.com/api/bookings/tenant/${userId}`
      );
      if (!response.ok) throw new Error("Network response was not ok");

      bookings = await response.json();

      // Filter bookings where approval is "accepted" and status is not "booked"
      bookings = bookings.filter(
        (booking) =>
          booking.approval === "accepted" && booking.status !== "booked"
      );
    } else if (type === "bookingOut") {
      // Fetch notifications for 'bookingOut'
      const response = await fetch(
        `https://renteasebackend-orna.onrender.com/notifications/${userId}`
      );
      if (!response.ok) throw new Error("Network response was not ok");

      bookings = await response.json();

      // Apply different filtering logic if needed for bookingOut
      // You can modify this part to suit your notification structure
    }

    // Update booking count if provided
    if (onCountUpdate) {
      onCountUpdate(bookings.length);
    }

    return bookings;
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
const fetchOwnerDetails = async (userId) => {
  try {
    const response = await axios.get(
      `https://renteasebackend-orna.onrender.com/users/${userId}`
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

const BookingNotificationBoth = () => {
  const [userId, setUserId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toggle, setToggle] = useState("bookingIn"); // "bookingIn" or "bookingOut"
  const [bookingCount, setBookingCount] = useState(0);
  const navigation = useNavigation();
  const [bookingCountIn, setBookingCountIn] = useState(0);
  const [bookingCountOut, setBookingCountOut] = useState(0);
  // Fetch data method updates based on toggle state
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const storedUserId = await SecureStore.getItemAsync("user_id");
      if (storedUserId) {
        setUserId(storedUserId);
  
        if (toggle === "bookingIn") {
          const fetchedBookings = await fetchBookings(
            storedUserId,
            "bookingIn",
            (count) => {
              setBookingCountIn(count); // Update booking count for bookingIn
            }
          );
  
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
          } else {
            setBookings([]); // Reset bookings if none found
          }
        } else if (toggle === "bookingOut") {
          const fetchedBookings = await fetchBookings(
            storedUserId,
            "bookingOut",
            (count) => {
              setBookingCountOut(count); // Update booking count for bookingOut
            }
          );
  
          if (fetchedBookings.length > 0) {
            // Fetch property and owner details for each bookingOut
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
          } else {
            setBookings([]); // Reset bookings if none found
          }
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
  }, [toggle]);
  

  useEffect(() => {
    fetchData(); // Call fetch data on first render and toggle change
  }, [fetchData, toggle]);

  const handleViewDetails = (bookingId) => {
    navigation.navigate("BookingDetail", { bookingId });
  };
  const handleViewNotification = (bookingId, tenantId) => {
    // Perform action for bookingOut
    // Navigate to notification details or any other action
    navigation.navigate("NotificationDetails", {
      bookingId: bookingId,
    });
  };
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            toggle === "bookingIn" && styles.activeToggle,
          ]}
          onPress={() => setToggle("bookingIn")}
        >
          <Text
            style={[
              styles.toggleText,
              toggle === "bookingIn" && styles.activeToggleText,
            ]}
          >
            Items you Booked
          </Text>
          <Text   style={[
              styles.count,
              toggle === "bookingIn" && styles.activeToggleText,
            ]}>({bookingCountIn})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            toggle === "bookingOut" && styles.activeToggle,
          ]}
          onPress={() => setToggle("bookingOut")}
        >
          <Text
            style={[
              styles.toggleText,
              toggle === "bookingOut" && styles.activeToggleText,
            ]}
          >
            your Booking property
          </Text>
          <Text   style={[
              styles.count,
              toggle === "bookingOut" && styles.activeToggleText,
            ]}>({bookingCountOut})</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00796b" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      ) : bookings.length > 0 ? (
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
                  onPress={() => {
                    if (toggle === "bookingIn") {
                      handleViewDetails(item._id); // For bookingIn
                    } else if (toggle === "bookingOut") {
                      handleViewNotification(item._id, item.tenant_id); // For bookingOut
                    }
                  }}
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
      ) : (
        <View style={styles.centered}>
          <Text style={styles.noBookingsText}>No bookings found</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00796b" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  toggleButton: {
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#00796b",
    backgroundColor: "#fff",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: Colors.PRIMARY,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00796b",
  },
  activeToggleText: {
    color: "#fff",
  },
  count: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00796b",
    marginLeft: 10,
  },
  bookingItem: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  propertyImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 5,
  },
  bookingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
    color: "#555",
  },
  approval: {
    fontSize: 14,
    color: "#00796b",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 10,
  },
  footerbutton: {
    width: "100%",
    borderRadius: 5,
  },
  gradient: {
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  footerText: {
    color: "#fff",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flex: 1,
  },
  noBookingsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "red",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
 
});

export default BookingNotificationBoth;
