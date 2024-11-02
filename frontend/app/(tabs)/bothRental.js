import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from "expo-linear-gradient";
const bothRental = () => {
  const [bookings, setBookings] = useState([]);
  const [rentedProperty, setRentedProperty] = useState(true);
  const [myRental, setMyRental] = useState(false);
  const navigation = useNavigation();
  const [userId, setUserId] = useState(false);
  // Fetch bookings based on userId and current toggle
  const fetchBookings = async () => {
    try {
      const userId = await SecureStore.getItemAsync("user_id");
      if (!userId) throw new Error("User ID not found");
      setUserId(userId);
      const endpoint = `https://renteasebackend-orna.onrender.com/bookingsrent/${userId}`;
      const { data } = await axios.get(endpoint);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error.message);
      alert("Failed to fetch bookings. Please try again later.");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleToggleRentedProperty = () => {
    setRentedProperty(true);
    setMyRental(false);
  };

  const handleToggleMyRental = () => {
    setRentedProperty(false);
    setMyRental(true);
  };

  const handleViewDetails = (bookingId) => {
    navigation.navigate("RentedPropertydetail", { bookingId });
  };

  // Function to calculate days remaining
  const calculateDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Function to format dates in short format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, rentedProperty && styles.activeToggle]}
          onPress={handleToggleRentedProperty}
        >
          <Text style={styles.toggleButtonText}>Rented As A Tenant</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, myRental && styles.activeToggle]}
          onPress={handleToggleMyRental}
        >
          <Text style={styles.toggleButtonText}>Rented Property As Owner</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={bookings.filter((booking) => {
          if (rentedProperty) {
            return booking.tenant_id.toString() === userId;
          } else if (myRental) {
            return booking.owner_id.toString() === userId;
          }
          return false;
        })}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleViewDetails(item._id)}
            style={styles.bookingItem}
          >
            <View style={styles.bookingContent}>
              <Image
                source={{
                  uri:
                    item.property_id &&
                    item.property_id.image &&
                    item.property_id.image.length > 0
                      ? `https://renteasebackend-orna.onrender.com/uploads/${item.property_id.image[0]}`
                      : "https://via.placeholder.com/100x100.png?text=No+Image",
                }}
                style={styles.propertyImage}
              />
              <View style={styles.textContainer}>
                <Text style={styles.propertyName}>
                  {item.property_id?.property_name || "N/A"}
                </Text>
                <Text style={styles.date}>
                  Start Date: {formatDate(item.start_date)}
                </Text>
                <Text style={styles.date}>
                  End Date: {formatDate(item.end_date)}
                </Text>
                <Text style={styles.approval}>
                  {item.status !== "pending"
                    ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                    : ""}
                </Text>
              </View>
            </View>

            {rentedProperty && (
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

                {item.damaged && item.returned ? (
                  <View style={styles.countdownContainer}>
                    <Text style={styles.ReturnedText}>Damage Solved</Text>
                  </View>
                ) : item.returned ? (
                  <View style={styles.countdownContainer}>
                    <Text style={styles.ReturnedText}>Returned</Text>
                  </View>
                ) : item.damaged ? (
                  <TouchableOpacity
                    style={styles.damageReportButton}
                    onPress={() => {
                      navigation.navigate("DamageReportTenant", {
                        bookingId: item._id,
                      });
                    }}
                  >
                    <Text style={styles.damageReportText}>Damage Reported</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.countdownContainer}>
                    <Text style={styles.countdownText}>
                      {calculateDaysRemaining(item.end_date)} days remaining
                    </Text>
                  </View>
                )}
              </View>
            ) }
                {myRental && (
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.footerbutton}
                  onPress={() => handleViewDetails(item._id)}
                >
                  <LinearGradient
                    colors={["#05668D", "#034f6c"]} // Updated gradient colors
                    style={styles.gradient}
                  >
                    <Text style={styles.footerText}>View Details</Text>
                  </LinearGradient>
                </TouchableOpacity>
             

              {item.returned ? (
                <View style={styles.countdownContainer}>
                  <Text style={{ color: Colors.PRIMARY, fontWeight: "bold" }}>
                    {" "}
                    Returned{" "}
                  </Text>
                </View>
              ) : item.damaged ? (
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownText}>Damaged</Text>
                </View>
              ) : (
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownText}>
                    {calculateDaysRemaining(item.end_date)} days remaining
                  </Text>
                </View>
              )}
              </View>
            ) }

          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text style={styles.errorText}>No Bookings Found</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
  },
  activeToggle: {
    backgroundColor: "#00796b",
  },
  toggleButtonText: {
    color: "#000",
    fontWeight: "bold",
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
  damageReportButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5,
  },
  damageReportText: {
    color: "#fff",
    textAlign: "center",
  },
  ReturnedText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00796b",
  },
});

export default bothRental;
