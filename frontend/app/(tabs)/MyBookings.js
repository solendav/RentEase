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
  useColorScheme,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/Colors";
import withAuth from "./../../components/withAuth";
import withRoleAccess from "../../components/withRoleAccess";
import RotatingDotsLoader from "./../../components/RotatingDotsLoader";
import { ThemeContext } from "../contexts/ThemeContext"; // Import the theme context

// Fetch bookings based on userId
const fetchBookings = async (userId) => {
  try {
    const response = await fetch(
      `https://renteasebackend-orna.onrender.com/api/bookings/tenant/${userId}`
    );
    if (!response.ok) throw new Error("Network response was not ok");

    const bookings = await response.json();

    // Filter out bookings with status "booked"
    const filteredBookings = bookings.filter(
      (booking) => booking.status !== "booked"
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

const MyBookings = ({ navigation }) => {
  const [userId, setUserId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggle, setToggle] = useState("all");

  const [counts, setCounts] = useState({
    all: 0,
    accepted: 0,
    rejected: 0,
    Pending: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const handlePayment = () => {
    navigation.navigate("(tabs)", { screen: "Wallet" });
  };

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
          setCounts({
            all: bookingsWithDetails.filter(
              (booking) => booking.status !== "booked"
            ).length,

            accepted: bookingsWithDetails.filter(
              (booking) =>
                booking.approval === "accepted" && booking.status !== "booked"
            ).length,
            rejected: bookingsWithDetails.filter(
              (booking) => booking.approval === "rejected"
            ).length,
            Pending: bookingsWithDetails.filter(
              (booking) => booking.approval === "Pending"
            ).length,
          });
          setFilteredBookings(bookingsWithDetails);
        }
      } else {
        Alert.alert(
          "Authentication Required",
          "You must sign in to add a property.",
          [
            {
              text: "Cancel",
              onPress: () => router.back(),
              style: "cancel",
            },
            {
              text: "Sign In",
              onPress: () => router.push("/signin"),
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

  useEffect(() => {
    if (toggle === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(
        bookings.filter((booking) => booking.approval === toggle)
      );
    }
  }, [toggle, bookings]);

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
    toggleContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginVertical: 10,
    },
    toggleButton: {
      backgroundColor: theme === "dark" ? Colors.GRAY : "#e0e0e0",
      borderRadius: 10,
      padding: 10,
      width: "22%",
      alignItems: "center",
    },
    activeButton: {
      backgroundColor: theme === "dark" ? Colors.PRIMARY : Colors.PRIMARY,
    },
    buttonText: {
      fontSize: 14,
      color: theme === "dark" ? "#fff" : "#000",
    },
    allText: {
      color: theme === "dark" ? "#fff" : "#000",
    },
    acceptedText: {
      color: theme === "dark" ? "#fff" : "#000",
    },
    rejectedText: {
      color: theme === "dark" ? "#fff" : "#000",
    },
    pendingText: {
      color: theme === "dark" ? "#fff" : "#000",
    },
    countContainer: {
      backgroundColor: "red",
      borderRadius: 10,
      padding: 3,
      position: "absolute",
      top: -5,
      right: -5,
      width: 15,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    countText: {
      color: "#fff",
      fontSize: 12,
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
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      zIndex: 100,
    },
    disabledButton: {
      backgroundColor: theme === "dark" ? "#D3D3D3" : "#A9A9A9", // Shady color for the disabled button
    },
    disabledButtonText: {
      color: "#C0C0C0", // Shady color for the disabled text
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
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, toggle === "all" && styles.activeButton]}
          onPress={() => setToggle("all")}
        >
          <Text style={[styles.buttonText, styles.allText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            toggle === "accepted" && styles.activeButton,
          ]}
          onPress={() => setToggle("accepted")}
        >
          <Text style={[styles.buttonText, styles.acceptedText]}>Accepted</Text>
          <View style={styles.countContainer}>
            <Text style={styles.countText}>{counts.accepted}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            toggle === "rejected" && styles.activeButton,
          ]}
          onPress={() => setToggle("rejected")}
        >
          <Text style={[styles.buttonText, styles.rejectedText]}>Rejected</Text>
          <View style={styles.countContainer}>
            <Text style={styles.countText}>{counts.rejected}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            toggle === "Pending" && styles.activeButton,
          ]}
          onPress={() => setToggle("Pending")}
        >
          <Text style={[styles.buttonText, styles.pendingText]}>Pending</Text>
          <View style={styles.countContainer}>
            <Text style={styles.countText}>{counts.Pending}</Text>
          </View>
        </TouchableOpacity>
      </View>
      {filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
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
                  {item.approval}
                  {item.status === "booked"
                    ? " & Booked"
                    : item.status === "canceled"
                    ? " & Canceled"
                    : ""}
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
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ) : loading ? (
        <View style={styles.loadingOverlay}>
          <RotatingDotsLoader />
        </View>
      ) : (
        <View style={styles.centered}>
          <Text style={styles.noBookingsText}>No Booking yet!.</Text>
        </View>
      )}
    </View>
  );
};

export default withAuth(withRoleAccess(MyBookings, ["1", "3"]));
