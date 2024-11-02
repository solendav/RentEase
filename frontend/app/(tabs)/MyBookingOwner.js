import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/Colors";
import withAuth from "../../components/withAuth";
import withRoleAccess from "../../components/withRoleAccess";
import RotatingDotsLoader from "../../components/RotatingDotsLoader";
import { useRoute, useNavigation } from "@react-navigation/native";
// Fetch bookings based on userId
const fetchBookings = async (userId) => {
  try {
    const response = await fetch(
      `https://renteasebackend-orna.onrender.com/api/bookings/owner/${userId}`
    );
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
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

// Calculate days remaining from current date to end date
const calculateDaysRemaining = (endDate) => {
  const today = new Date();
  const end = new Date(endDate);
  const timeDiff = end - today;
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  return daysRemaining > 0 ? daysRemaining : 0;
};

const MyBookings = () => {
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
        }
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
    navigation.navigate("RentedPropertydetail", { bookingId });
  };

  const handleRefresh = () => {
    fetchData();
  };



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
                <Text style={styles.approval}>{item.status}</Text>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.footerbutton}
                  onPress={() => handleViewDetails(item._id)}
                >
                  <LinearGradient
                     colors={["#05668D", "#034f6c"]} 
                    style={styles.gradient}
                  >
                    <Text style={styles.footerText}>View Details</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {item.returned ? (
   <View style={styles.countdownContainer}>
   <Text style={{color:Colors.PRIMARY, fontWeight:'bold'}}> Returned </Text>
 </View>
) : item.damaged ? (
  <View style={styles.countdownContainer}>
  <Text style={styles.countdownText}>
   Damaged
  </Text>
</View>
) : (
  <View style={styles.countdownContainer}>
    <Text style={styles.countdownText}>
      {calculateDaysRemaining(item.end_date)} days remaining
    </Text>
  </View>
)}
            </View>
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ): loading ? (
        <View style={styles.loadingOverlay}>
          <RotatingDotsLoader />
        </View>
        ) : (
          <View style={styles.centered}>
            <Text style={styles.noBookingsText}>No Rented Property Yet !.</Text>
          </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  bookingItem: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
    position: "relative",
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
  },
  date: {
    fontSize: 14,
    color: "#555555",
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
  countdownContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ff5722",
  },
  noBookingsText: {
    fontSize: 16,
    color: "#777777",
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
    backgroundColor:"rgba(255, 255, 255, 0.5)", // Make it completely transparent
    zIndex: 100, // Ensure it's on top
  },
});

export default withAuth(withRoleAccess(MyBookings,["2","3"]));
