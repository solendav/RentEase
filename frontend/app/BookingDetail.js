import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "../constants/Colors";
import Header from "./../components/Header";
import withAuth from "./../components/withAuth";
import withRoleAccess from "../components/withRoleAccess";
import withProfileVerification from "../components/withProfileVerification";
import Icon from 'react-native-vector-icons/FontAwesome'; 
const BookingDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState(null);
  const [property, setProperty] = useState({ image: [] });
  const [user, setUser] = useState(null);
  const [account, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [pricePerDay, setPricePerDay] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    try {
      const bookingResponse = await axios.get(
        `https://renteasebackend-orna.onrender.com/bookings/${bookingId}`
      );
      setBooking(bookingResponse.data);
      const initialStartDate = new Date(bookingResponse.data.start_date);
      const initialEndDate = new Date(bookingResponse.data.end_date);
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);

      const propertyResponse = await axios.get(
        `https://renteasebackend-orna.onrender.com/properties/${bookingResponse.data.property_id}`
      );
      setProperty(propertyResponse.data);
      setPricePerDay(propertyResponse.data.price);
      if (bookingResponse.data.owner_id) {
        await fetchAccountData(bookingResponse.data.owner_id);
      }

      if (propertyResponse.data.user_id) {
        await fetchUserProfile(propertyResponse.data.user_id);
      }

      setLoading(false);
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message);
      setLoading(false);
    }
  }, [bookingId, fetchUserProfile]);

  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const response = await axios.get(
        `https://renteasebackend-orna.onrender.com/api/profile/${userId}`
      );
      setUser(response.data);
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message);
    }
  }, []);
  const fetchAccountData = useCallback(async (ownerId) => {
    try {
      if (ownerId) {
        const response = await axios.get(
          `https://renteasebackend-orna.onrender.com/api/account/${ownerId}`
        );
        setAccountData(response.data);
      } else {
        console.error("Owner ID is not available.");
      }
    } catch (err) {
      setError("Error fetching account data");
      console.error("Fetch account data error:", err);
    }
  }, []);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    } else {
      console.error("No booking ID provided.");
    }
  }, [bookingId, fetchBooking]);

  useEffect(() => {
    // Calculate total price when startDate, endDate, or pricePerDay changes
    if (startDate && endDate && pricePerDay) {
      const timeDiff = Math.abs(endDate - startDate);
      const numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert time difference to days
      const calculatedPrice = numberOfDays * pricePerDay;
      setTotalPrice(calculatedPrice);
    }
  }, [startDate, endDate, pricePerDay]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBooking();
    setRefreshing(false);
  }, [fetchBooking]);

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleStartDateChange = (event, selectedDate) => {
    const date = selectedDate || startDate;
    if (date instanceof Date) {
      if (date <= endDate) {
        setStartDate(date);
      } else {
        setStartDate(new Date(date.setDate(date.getDate() - 1)));
      }
    }
    setShowStartDatePicker(false);
  };

  const handleEndDateChange = (event, selectedDate) => {
    const date = selectedDate || endDate;
    if (date instanceof Date) {
      if (date >= startDate) {
        setEndDate(date);
      } else {
        setEndDate(new Date(date.setDate(date.getDate() + 1)));
      }
    }
    setShowEndDatePicker(false);
  };

  const handleSubmit = async () => {
    if (startDate && endDate && totalPrice) {
      try {
        await axios.put(`https://renteasebackend-orna.onrender.com/bookings/${bookingId}`, {
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          total_price: totalPrice,
        });
        alert("Booking updated successfully!");
        fetchBooking(); // Refresh booking details
        setIsEditing(false); // Exit editing mode
      } catch (error) {
        setError(error.response ? error.response.data.message : error.message);
      }
    }
  };
  const handleCancel = async () => {
    try {
      await axios.patch(`https://renteasebackend-orna.onrender.com/bookingscancel/${bookingId}`);
      alert("Booking canceled successfully!");
      navigation.goBack(); // Navigate back after successful deletion
    } catch (error) {
      console.error(
        "Error canceling the booking:",
        error.response ? error.response.data.message : error.message
      );
      alert("Failed to cancel the booking.");
    }
  };
  const calculateIncreasedPrice = (totalPrice) => {
    return totalPrice * 1.04; // Increase price by 4%
  };
  const updatedPrice = calculateIncreasedPrice(totalPrice);
  const handlePayment = () => {
    if (account) {
      navigation.navigate("Wallet", {
        newprice: updatedPrice,
        accountnum: account.account_no,
        bookingId: bookingId,
      });
      console.log("Total Price before calculation: ", updatedPrice);
    } else {
      alert("Account information is not available.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error fetching booking details:{" "}
          {typeof error === "string" ? error : JSON.stringify(error)}
        </Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text>No booking details available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.PRIMARY]}
          />
        }
      >
        <View style={styles.propertyContainer}>
          <Header title="My Bookings" />
          <View style={styles.imageContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imageScrollView}
            >
              {property.image && property.image.length > 0 ? (
                property.image.map((image, index) => (
                  <Image
                    key={index}
                    source={{
                      uri: `https://renteasebackend-orna.onrender.com/uploads/${image}`,
                    }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ))
              ) : (
                <View style={styles.noImageContainer}>
                  <Text>No images available</Text>
                </View>
              )}
            </ScrollView>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.propertyName}>{property.property_name}</Text>
            {isEditing ? (
              <View>
                <Text style={styles.bookingDates}>Start Date:</Text>
                <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                  <Text style={styles.dateText}>
                    {startDate.toDateString()}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.bookingDates}>End Date:</Text>
                <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                  <Text style={styles.dateText}>{endDate.toDateString()}</Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={handleStartDateChange}
                  />
                )}
                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={handleEndDateChange}
                  />
                )}
                <Text style={styles.totalPrice}>
                  Total Price: ETP: {updatedPrice || "N/A"} Birr
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.bookingDates}>
                  From: {booking.start_date || "N/A"}
                </Text>
                <Text style={styles.bookingDates}>
                  To: {booking.end_date || "N/A"}
                </Text>
                <Text style={{ color: "green" }}>
                  {" "}
                  Price including service 4% fee
                </Text>
                <Text style={styles.totalPrice}>
                  Total Price: ETP: {updatedPrice || "N/A"} Birr
                </Text>
              
              </View>
            )}
            <Text style={styles.status}>{booking.approval || "N/A"}</Text>
            <Text style={styles.message}>{booking.message || " "}</Text>
            
            {user ? (
              <View style={styles.userContainer}>
                <View style={styles.profileHeader}>
                {user.profile_picture ? (
              <Image
                source={{
                  uri: `https://renteasebackend-orna.onrender.com/uploads/${user.profile_picture}`,
                }}
                style={styles.userImage}
              />
            ) : (
              <Icon name="user" size={50} color="#ccc" style={styles.userImage} /> 
            )}
                  <View>
                    <Text style={styles.userName}>
                      {user.first_name} {user.last_name}
                    </Text>
                    <Text style={styles.userBio}>{user.phoneNumber}</Text>
                    <Text style={styles.ownerLabel}>Owner</Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          ) : booking.approval === "Pending" ? (
            <TouchableOpacity style={styles.button} onPress={handleEditToggle}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          ) : booking.approval === "accepted" ? (
            <TouchableOpacity style={styles.pbutton} onPress={handlePayment}>
              <Text style={styles.buttonText}>Payment</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.buttonText}>Cancel Booking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom:20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: Colors.ERROR,
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  propertyContainer: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
    marginTop: 20,
  },
  imageScrollView: {
    flex: 1,
  },
  image: {
    width: Dimensions.get("window").width - 42,
    height: "100%",
    borderRadius: 20,
    marginHorizontal: 5,
  },
  noImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  detailsContainer: {
    padding: 16,

    marginTop: 10,
    marginBottom: 30,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  propertyName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bookingDates: {
    fontSize: 18,
    marginVertical: 4,
  },
  dateText: {
    fontSize: 16,
    color: Colors.PRIMARY,
    marginBottom: 8,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  status: {
    fontSize: 20,
    marginVertical: 4,
    color: "green",
  },
  message: {
    fontSize: 16,
    marginVertical: 4,
  },
  userContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#efefef",
    borderRadius: 10,
    padding: 10,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#efefef",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userBio: {
    fontSize: 16,
  },
  ownerLabel: {
    fontSize: 16,
    fontStyle: "italic",
    color: Colors.PRIMARY,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginBottom:20
  },
  button: {
    flex: 1,
    padding: 10,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  pbutton: {
    flex: 1,
    padding: 10,
    backgroundColor: "#4caf50",
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default withAuth(withRoleAccess(withProfileVerification(BookingDetail), ["1", "3"]));
