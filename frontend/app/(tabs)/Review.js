import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import SecureStore from "expo-secure-store";
import axios from "axios";
import withAuth from "../../components/withAuth";

const Review = ({ route, navigation }) => {
  const { propertyId } = route.params;
  const [reviewMessage, setReviewMessage] = useState("");
  const [rating, setRating] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await SecureStore.getItemAsync("user_id");
        setUserId(id);
      } catch (err) {
        setError("Error fetching user ID");
      }
    };
    fetchUserId();
  }, []);

  const handleSubmit = async () => {
    const ratingNumber = Number(rating);
    if (!reviewMessage.trim()) {
      Alert.alert("Error", "Please provide a review message.");
      return;
    }
    if (isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      Alert.alert("Error", "Please provide a rating between 1 and 5.");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "User ID is not available.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("https://renteasebackend-orna.onrender.com/reviews", {
        user_id: userId,
        property_id: propertyId,
        review: reviewMessage,
        rating: ratingNumber,
      });
      Alert.alert("Success", "Review submitted successfully!");
      navigation.goBack(); // Navigate back to the previous screen
    } catch (err) {
      setError("Error submitting review");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>Write a Review</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Write your review here..."
            multiline
            value={reviewMessage}
            onChangeText={setReviewMessage}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Rating (1 to 5)"
            keyboardType="numeric"
            value={rating}
            onChangeText={setRating}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Review</Text>
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  content: {
    width: "100%",
    maxWidth: 500,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  textInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
    height: 150,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});

export default withAuth(Review);
