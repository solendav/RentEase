import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import Header from "./../components/Header";
import withAuth from './../components/withAuth'
import { Colors } from "../constants/Colors";
import Swiper from "react-native-swiper";
import RotatingDotsLoader from "../components/RotatingDotsLoader";
const NotificationDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [owner, setOwner] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = useCallback(async () => {
    console.log("Fetching details with bookingId:", bookingId);
    setLoading(true);
    try {
      const bookingResponse = await axios.get(
        `https://renteasebackend-orna.onrender.com/bookings/${bookingId}`
      );
      console.log("Booking response:", bookingResponse.data);
      setBooking(bookingResponse.data);

      if (bookingResponse.data.tenant_id) {
        const tenantResponse = await axios.get(
          `https://renteasebackend-orna.onrender.com/api/profile/${bookingResponse.data.tenant_id}`
        );
        console.log("Tenant response:", tenantResponse.data);
        setTenant(tenantResponse.data);
      }

      if (bookingResponse.data.owner_id) {
        const ownerResponse = await axios.get(
          `https://renteasebackend-orna.onrender.com/api/profile/${bookingResponse.data.owner_id}`
        );
        console.log("Owner response:", ownerResponse.data);
        setOwner(ownerResponse.data);
      }

      if (bookingResponse.data.property_id) {
        const propertyResponse = await axios.get(
          `https://renteasebackend-orna.onrender.com/properties/${bookingResponse.data.property_id}`
        );
        console.log("Property response:", propertyResponse.data);
        setProperty(propertyResponse.data);
      }
    } catch (error) {
      console.error(
        "Error fetching details:",
        error.response ? error.response.data : error.message
      );
      setError(error.response ? error.response.data.message : error.message);
    } finally {
      console.log("Fetch complete.");
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleAccept = async () => {
    try {
      await axios.patch(`https://renteasebackend-orna.onrender.com/bookings/${bookingId}`, {
        approval: "accepted",
      });
      Alert.alert("Success", "Booking request accepted.");
      navigation.goBack();
    } catch (error) {
      console.error(
        "Error accepting booking request:",
        error.response ? error.response.data : error.message
      );
      Alert.alert("Error", "Failed to accept booking request.");
    }
  };

  const handleReject = async () => {
    try {
      await axios.patch(`https://renteasebackend-orna.onrender.com/bookings/${bookingId}`, {
        approval: "rejected",
      });
      Alert.alert("Success", "Booking request rejected.");
      navigation.goBack();
    } catch (error) {
      console.error(
        "Error rejecting booking request:",
        error.response ? error.response.data : error.message
      );
      Alert.alert("Error", "Failed to reject booking request.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingOverlay}>
      <RotatingDotsLoader />
    </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Requested Property" />
      <ScrollView style={styles.scrollView}>
     {/* Image Section */}
     <View style={styles.imageContainer}>
          <Swiper
            style={styles.imageSwiper}
            showsPagination
            paginationStyle={styles.paginationStyle}
            dotStyle={styles.dotStyle}
            activeDotStyle={styles.activeDotStyle}
            loop={true} 
            autoplay={true} // Enable automatic swiping
    autoplayTimeout={5} // Set the interval for automatic swiping (2 seconds)
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
                <Text style={styles.noImageText}>No images available</Text>
              </View>
            )}
          </Swiper>
          
          <Text style={styles.propertyName}>{property.property_name}</Text>
        </View>

        {booking && (
          <View style={styles.section}>
            <Text style={styles.bookingTitle}>Booking Details</Text>
            <Text style={styles.bookingDetail}>Booking ID: {booking._id}</Text>
            <Text style={styles.bookingDetail}>
              Start Date: {new Date(booking.start_date).toLocaleDateString()}
            </Text>
            <Text style={styles.bookingDetail}>
              End Date: {new Date(booking.end_date).toLocaleDateString()}
            </Text>
            <Text style={styles.bookingDetail}>Status: {booking.approval}</Text>
            <Text style={styles.bookingDetail}>Message: {booking.message}</Text>
            <Text style={styles.bookingDetail}>total Price: {booking.totalPrice}</Text>
          </View>
        )}

        {tenant && (
          <View style={styles.userContainer}>
          <View style={styles.profileHeader}>
            <Image
              source={{
                uri: `https://renteasebackend-orna.onrender.com/uploads/${tenant.profile_picture}`,
              }}
              style={styles.userImage}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {tenant.first_name} {tenant.last_name}
              </Text>
              <Text style={styles.userEmail}>{tenant.phoneNumber}</Text>
              <Text style={styles.ownerLabel}>Tenant</Text>
            </View>
          </View>
        </View>
        )}

        <View style={styles.buttonContainer}>
          <LinearGradient
            colors={["#ff5f5f", "#ff8c8c"]}
            style={styles.gradient}
          >
            <TouchableOpacity onPress={handleReject} style={styles.button}>
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={["#5fff5f", "#8cff8c"]}
            style={styles.gradient}
          >
            <TouchableOpacity onPress={handleAccept} style={styles.button}>
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <RotatingDotsLoader />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
  },
  imageScrollView: {
    height: 300,
  },
  image: {
    width: Dimensions.get("window").width,
    height: 300,
    borderRadius: 15,
  },
  noImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 300,
    backgroundColor: "#dcdcdc",
    borderRadius: 15,
  },
  noImageText: {
    color: "#666",
    fontSize: 16,
  },
 
  detailsContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginTop: -10,
    elevation: 5,
  },
  propertyName: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 10,
    padding: 7,
    fontSize: 20,
    fontWeight: "Bold",
    color: Colors.PRIMARY,
  },
  imageSwiper: {
    height: 300,
  },
  paginationStyle: {
    bottom: 10,
  },
  dotStyle: {
    backgroundColor: "rgba(0,0,0,.2)",
  },
  activeDotStyle: {
    backgroundColor: Colors.PRIMARY,
  },
  propertyDetails: {
    fontSize: 16,
    color: "#666",
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bookingDetail: {
    fontSize: 16,
    marginBottom: 5,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 10,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 16,
    color: "#333",
  },
  ownerLabel: {
    fontSize: 14,
    color: "#4CAF50",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  gradient: {
    borderRadius: 10,
    padding: 5,
    width: "45%",
    alignItems: "center",
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
    fontSize: 18,
    color: "#f00",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Make it completely transparent
    zIndex: 100, // Ensure it's on top
  },
});

export default withAuth(NotificationDetails);
