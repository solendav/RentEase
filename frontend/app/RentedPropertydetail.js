import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  TextInput,
  Alert,
  scrollViewRef,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Colors } from "../constants/Colors";
import { Rating, Button } from "react-native-elements";
import withAuth from "./../components/withAuth";
import CircularCountdown from "../components/CircularCountdown";
import Swiper from "react-native-swiper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ThemeContext } from "./../app/contexts/ThemeContext";
import RotatingDotsLoader from "./../components/RotatingDotsLoader";
const BookingDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState(null);
  const [property, setProperty] = useState({ image: [] });
  const [user, setUser] = useState(null); // State for user profile
  const [usertenant, setUsertenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [showReview, setShowReview] = useState(false);
  const { theme } = useContext(ThemeContext);
  const scaleAnim = new Animated.Value(1);
  const [isReturned, setIsReturned] = useState(false);
  const [isDamaged, setIsDamaged] = useState(false);
  const fetchBooking = useCallback(async () => {
    setLoading(true);
    try {
      const bookingResponse = await axios.get(
        `https://renteasebackend-orna.onrender.com/bookings/${bookingId}`
      );
      setBooking(bookingResponse.data);
      setIsReturned(bookingResponse.data.returned);
      setIsDamaged(bookingResponse.data.damaged);
      const propertyResponse = await axios.get(
        `https://renteasebackend-orna.onrender.com/properties/${bookingResponse.data.property_id}`
      );
      setProperty(propertyResponse.data);

      // Fetch owner profile
      const userResponse = await axios.get(
        `https://renteasebackend-orna.onrender.com/api/profile/${bookingResponse.data.owner_id}`
      );
      setUser(userResponse.data);
      const userResponsetenant = await axios.get(
        `https://renteasebackend-orna.onrender.com/api/profile/${bookingResponse.data.tenant_id}`
      );
      setUsertenant(userResponsetenant.data);

      setLoading(false);
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message);
      setLoading(false);
    }
  }, [bookingId]);

  const fetchUserId = useCallback(async () => {
    try {
      const id = await SecureStore.getItemAsync("user_id");
      setUserId(id);
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  }, []);

  useEffect(() => {
    fetchBooking();
    fetchUserId();
  }, [fetchBooking, fetchUserId]);

  const isTenant = userId === booking?.tenant_id;
  const isOwner = userId === booking?.owner_id;
  const totalPrice = booking?.totalPrice;

  const calculateIncreasedPrice = (totalPrice) => {
    return totalPrice * 1.04; // Increase price by 4%
  };

  const updatedPrice = calculateIncreasedPrice(totalPrice);

  const handleGiveReview = () => {
    setShowReview(true);
    Animated.spring(scaleAnim, {
      toValue: 1.2,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });
  };
  const handlePressDamage = () => {
    navigation.navigate("DamageForm", { bookingId: booking._id }); 
  };
  const handlePress = async () => {
    try {
      // Make API request to transfer amount from frozen deposit
      const response = await axios.post(
        "https://renteasebackend-orna.onrender.com/api/transfer-from-frozen",
        { bookingId }
      );

      // Handle success or error response
      if (response.status === 200) {
        Alert.alert("Success", response.data.message);
      } else {
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      console.error("Error during API request:", error);
      Alert.alert("Error", "Failed to transfer amount from frozen deposit");
    }
  };
  const handleSubmitReview = async () => {
    try {
      // Ensure userId and propertyId are available
      if (!userId || !booking?.property_id) {
        console.error("User ID or Property ID is missing.");
        Alert.alert("Error", "User ID or Property ID is missing.");
        return;
      }

      // Validate rating and review
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        Alert.alert("Error", "Rating must be a number between 1 and 5.");
        return;
      }

      // Submit the review
      await axios.post("https://renteasebackend-orna.onrender.com/reviews", {
        user_id: userId,
        property_id: booking.property_id,
        rating,
        review,
      });

      // Handle success
      Alert.alert("Success", "Rating submitted successfully.");
      setShowReview(false); // Hide review form after submission
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert(
        "Error",
        "There was a problem submitting your review. Please try again."
      );
    }
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      marginBottom:20,
      backgroundColor: theme === "dark" ? Colors.BLACK : "f9f9f9",
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
      color: Colors.GRAY,
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
    likeButton: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      borderRadius: 30,
      padding: 10,
    },
    detailsContainer: {
      padding: 16,
      backgroundColor: theme === "dark" ? Colors.BLACK : "#fff",

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
    detailsContainer: {
      paddingHorizontal: 10,
      marginTop: 10,
    },

    bookingDetailsText: {
      fontSize: 16,
      marginTop: 5,
    },
    reviewButton: {
      backgroundColor: Colors.PRIMARY,
      padding: 10,
      borderRadius: 5,
      marginTop: 20,
      marginBottom:40
    },
    ownerButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 20,
    },
    returnedButton: {
      backgroundColor: Colors.PRIMARY,
      padding: 10,
      borderRadius: 5,
      flex: 1,
      marginRight: 10,
    },
    damageButton: {
      backgroundColor: "#FF6F6F",
      padding: 10,
      borderRadius: 5,
      flex: 1,
    },
    buttonText: {
      color: "#fff",
      textAlign: "center",
      fontWeight: "bold",
    },
    reviewContainer: {
      marginTop: 20,
      padding: 10,
      backgroundColor: theme === "dark" ? "#303030" : "#f5f5f5",
      borderRadius: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    rating: {
      marginBottom: 20,
    },
    textInput: {
      borderColor: theme === "dark" ? Colors.GRAY : "#ccc",
      borderWidth: 1,
      borderRadius: 5,
      padding: 10,
      height: 100,
      textAlignVertical: "top",
    },
    submitButton: {
      backgroundColor: Colors.PRIMARY,
      marginTop: 10,
      marginBottom:10
    },
    userContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 16,
      backgroundColor: theme === "dark" ? "#303030" : "#fff",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme === "dark" ? Colors.GRAY : "#eee",
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
      borderColor: theme === "dark" ? Colors.GRAY : "#eee",
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme === "dark" ? Colors.GRAY : "#333",
    },
    userBio: {
      fontSize: 16,
      color: theme === "dark" ? Colors.GRAY : "#333",
    },
    ownerLabel: {
      fontSize: 14,
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
    verifiedIcon: {
      // Adjust as needed
      backgroundColor: "#ffffff",
      borderRadius: 14,
      padding: 3,
      elevation: 2, // Adds a shadow for better visibility
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.5)", // Make it completely transparent
      zIndex: 100, // Ensure it's on top
    },
    disabledButton: {
      backgroundColor: '#6c757d', // Change to a color to indicate disabled state
    },
  });

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
    <ScrollView
      style={styles.container}
      ref={scrollViewRef}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.propertyContainer}>
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
        <View style={styles.detailsContainer}>
          <Text style={styles.bookingDetailsText}>
            Start Date: {new Date(booking.start_date).toDateString()}
          </Text>
          <Text style={styles.bookingDetailsText}>
            End Date: {new Date(booking.end_date).toDateString()}
          </Text>
          <Text style={styles.bookingDetailsText}>
            Total Price: ${booking.totalPrice}
          </Text>
          <View style={{ alignItems: "center" }}>
          <CircularCountdown startDate={booking.start_date} endDate={booking.end_date} />
          </View>
          {isTenant ? (
            <View>
              {/* User Profile Section */}
              {user ? (
                <View style={styles.userContainer}>
                  <View style={styles.profileHeader}>
                    <Image
                      source={{
                        uri: `https://renteasebackend-orna.onrender.com/uploads/${user.profile_picture}`,
                      }}
                      style={styles.userImage}
                    />

                    <View>
                      <Text style={styles.userName}>
                        {user.first_name} {user.last_name}
                      </Text>
                      <Text style={styles.userBio}>{user.phoneNumber}</Text>
                      <Text style={styles.ownerLabel}>Owner</Text>
                    </View>
                  </View>
                  {user.verification === "verified" && (
                    <Icon
                      name="verified"
                      size={28}
                      color="#4caf50"
                      style={styles.verifiedIcon}
                    />
                  )}
                </View>
              ) : (
                <Text>No profile information available</Text>
              )}
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={handleGiveReview}
              >
                <Text style={styles.buttonText}>Give Review</Text>
              </TouchableOpacity>
            </View>
          ) : isOwner ? (
            <View>
              {/* User Profile Section */}
              {usertenant ? (
                <View style={styles.userContainer}>
                  <View style={styles.profileHeader}>
                    <Image
                      source={{
                        uri: `https://renteasebackend-orna.onrender.com/uploads/${usertenant.profile_picture}`,
                      }}
                      style={styles.userImage}
                    />
                    <View>
                      <Text style={styles.userName}>
                        {usertenant.first_name} {usertenant.last_name}
                      </Text>
                      <Text style={styles.userBio}>
                        {usertenant.phoneNumber}
                      </Text>
                      <Text style={styles.ownerLabel}>Tenant</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <Text>No profile information available</Text>
              )}
             <View style={styles.ownerButtons}>
      <TouchableOpacity
        style={[styles.returnedButton, isReturned && styles.disabledButton]}
        onPress={handlePress}
        disabled={isReturned }
      >
        <Text style={styles.buttonText}>Returned</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.damageButton, (isReturned || isDamaged)  && styles.disabledButton]}
        onPress={handlePressDamage}
        disabled={isReturned || isDamaged }
      >
        <Text style={styles.buttonText}>Report For Damage</Text>
      </TouchableOpacity>
    </View>
            </View>
          ) : null}
        </View>
        {showReview && (
          <Animated.View
            style={[
              styles.reviewContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={styles.title}>Rate and Review</Text>
            <Rating
              showRating
              startingValue={rating}
              onFinishRating={setRating}
              style={styles.rating}
            />
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Write your review here..."
              value={review}
              onChangeText={setReview}
            />
            <Button
              title="Submit"
              buttonStyle={styles.submitButton}
              onPress={handleSubmitReview}
            />
          </Animated.View>
        )}
      </View>
      {loading && (
        <View style={styles.loadingOverlay}>
          <RotatingDotsLoader />
        </View>
      )}
    </ScrollView>
  );
};

export default withAuth(BookingDetail);
