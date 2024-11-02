import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import axios from "axios";

const Reviews = ({ propertyId }) => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0); // Default to 0
  const [showReviews, setShowReviews] = useState(false);
  const [users, setUsers] = useState({});
  const [numberOfRaters, setNumberOfRaters] = useState(0); // Number of raters

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(false); // Set loading state to true before fetching data
  
      try {
        // Fetch reviews
        const response = await axios.get(
          `https://renteasebackend-orna.onrender.com/reviews/${propertyId}`
        );
  
     
        if (!response.data || !response.data.reviews) {
          setReviews([]);
          setAverageRating(0); // Set default rating
          setNumberOfRaters(0); // Set default number of raters
          setUsers({}); // Clear user profiles
          setLoading(false);
          return;
        }
  
        const reviewsData = response.data.reviews;
  
        // Check if there are reviews
        if (reviewsData.length === 0) {
          // If no reviews, clear state or handle accordingly
          setReviews([]);
          setAverageRating(0); // Set default rating
          setNumberOfRaters(0); // Set default number of raters
          setUsers({}); // Clear user profiles
          setLoading(false);
          return;
        }
        setLoading(false);
        // Set reviews, average rating, and number of raters
        setReviews(reviewsData);
        setAverageRating(response.data.averageRating || 0);
        setNumberOfRaters(reviewsData.length);
        
        // Fetch user profiles for all users in the reviews
        const userIds = reviewsData.map((review) => review.user_id);
  
        const userResponses = await Promise.all(
          userIds.map((id) =>
            axios.get(`https://renteasebackend-orna.onrender.com/api/profile/${id}`)
          )
        );
  
        const userData = userResponses.reduce((acc, curr) => {
          acc[curr.data.user_id] = curr.data;
          return acc;
        }, {});
        setUsers(userData);
  
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Handle case where reviews endpoint is not found
          setReviews([]);
          setAverageRating(0);
          setNumberOfRaters(0);
          setUsers({});
          
        }
      } finally {
        setLoading(false); // Ensure loading state is updated after the fetch
      }
    };
  
    fetchReviews();
  }, [propertyId]);
  

  const toggleReviews = () => {
    setShowReviews(!showReviews);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const renderReviews = () => {
    return reviews.map((item) => {
      const user = users[item.user_id];
      const imageUrl = user
        ? `https://renteasebackend-orna.onrender.com/uploads/${user.profile_picture}`
        : "https://via.placeholder.com/50"; // Default image URL

      return (
        <View key={item._id} style={styles.reviewContainer}>
          {user ? (
            <View style={styles.reviewContent}>
              <View style={styles.userInfoContainer}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.userImage}
                  onError={() => console.log("Failed to load image")}
                />
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {user.first_name} {user.last_name}
                  </Text>
                  <Text style={styles.userEmail}>{user.phoneNumber}</Text>
                </View>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>Rating: {item.rating}/5</Text>
                </View>
              </View>
              <View style={styles.reviewLabel}>
                <Text style={styles.reviewLabelText}>Review:</Text>
              </View>
              <View style={styles.reviewTextContainer}>
                <Text style={styles.reviewText}>{item.review}</Text>
              </View>
            </View>
          ) : (
            <Text>User data not found for ID: {item.user_id}</Text>
          )}
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      {averageRating !== null && (
        <View style={styles.averageRatingContainer}>
          <FontAwesome name="star" size={24} color="gold" />
          <Text style={styles.averageRatingText}>
            {averageRating.toFixed(1)} / 5
          </Text>
          <Text style={styles.ratersText}>
            ({numberOfRaters} {numberOfRaters === 1 ? "user" : "users"})
          </Text>
          <TouchableOpacity onPress={toggleReviews} style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>
              {showReviews ? "Hide Reviews" : "View Reviews"}
            </Text>
            <MaterialIcons
              name={showReviews ? "expand-less" : "expand-more"}
              size={24}
              color="blue"
            />
          </TouchableOpacity>
        </View>
      )}

      {showReviews && <ScrollView>{renderReviews()}</ScrollView>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    backgroundColor: "#fff",
  },
  averageRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  averageRatingText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 5,
  },
  ratersText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 10,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    
  },
  toggleButtonText: {
    fontSize: 16,
    marginRight: 10,
    color:'blue'
  },
  reviewContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
  },
  reviewContent: {
    flexDirection: "column",
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Adjusted to push rating to the right
    marginBottom: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  userDetails: {
    flexDirection: "column",
    flex: 1, // Allow user details to take up remaining space
  },
  userName: {
    fontSize: 15,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 12,
    color: "#555",
  },
  ratingContainer: {
    justifyContent: "flex-end", // Ensure it is aligned to the right
  },
  ratingText: {
    fontSize: 16,
    color: "green",
    textAlign: "right", // Align text to the right
  },
  reviewLabel: {
    marginBottom: 5,
  },
  reviewLabelText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  reviewTextContainer: {
    marginTop: 5,
  },
  reviewText: {
    fontSize: 14,
    color: "#333",
  },
});

export default Reviews;
