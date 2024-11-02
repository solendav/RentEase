import React, { useEffect, useState, useCallback,useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Colors } from "../../constants/Colors";
import withAuth from './../../components/withAuth'
import { ThemeContext } from './../contexts/ThemeContext';
import RotatingDotsLoader from './../../components/RotatingDotsLoader';
// Function to get the user ID from Secure Store
const getUserIdFromSecureStore = async () => {
  try {
    const userId = await SecureStore.getItemAsync("user_id");
    return userId;
  } catch (error) {
    console.error("Error fetching user ID from Secure Store:", error);
    return null;
  }
};

// Function to calculate distance between two points in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
};

// Function to fetch nearby places
const fetchNearbyPlaces = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&limit=10&q=${latitude},${longitude}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching nearby places:", error);
    return [];
  }
};

const Saved = () => {
  const navigation = useNavigation(); // Get the navigation object
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [propertyCount, setPropertyCount] = useState(0); // State for property count
  const { theme } = useContext(ThemeContext);
  const fetchFavorites = useCallback(async () => {
    setRefreshing(true);
    try {
      const userId = await getUserIdFromSecureStore();
      if (!userId) {
        throw new Error("User ID not found");
      }

      // Fetch favorite properties
      const response = await axios.get(
        `https://renteasebackend-orna.onrender.com/favorites/${userId}`
      );
      const favoriteData = response.data;

      // Fetch nearby places for each property
      const propertiesWithPlaces = await Promise.all(
        favoriteData.map(async (property) => {
          const nearbyPlaces = await fetchNearbyPlaces(
            property.location.latitude,
            property.location.longitude
          );

          // Calculate distances from the property to each nearby place
          const placesWithDistances = nearbyPlaces.map((place) => {
            const distance = calculateDistance(
              property.location.latitude,
              property.location.longitude,
              parseFloat(place.lat),
              parseFloat(place.lon)
            );
            return { ...place, distance };
          });

          return {
            ...property,
            nearestPlaces: placesWithDistances,
          };
        })
      );

      // Update the local state with the favorite properties
      setFavorites(propertiesWithPlaces);
      setPropertyCount(propertiesWithPlaces.length); // Set property count
      setLoading(false);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setError(error.response ? error.response.data.message : error.message);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [fetchFavorites])
  );

  const handleLikeToggle = async (favoriteId) => {
    try {
      console.log(`Removing favorite with ID: ${favoriteId}`); // Log the favoriteId

      // Ensure URL is correct
      await axios.delete(`https://renteasebackend-orna.onrender.com/favorites/${favoriteId}`);

      // Update the local state to remove the property from the UI
      setFavorites(
        favorites.filter((property) => property.favoriteId !== favoriteId)
      );
      setPropertyCount(favorites.length - 1); // Update property count
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const handleImagePress = async (propertyId) => {
    try {
      const userId = await getUserIdFromSecureStore();
      if (userId) {
        navigation.navigate("propertyDetail", {
          _id: propertyId,
          user_id: userId,
        });
      } else {
        Alert.alert("Error", "Unable to fetch user ID.");
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
      Alert.alert("Error", "An error occurred while navigating.");
    }
  };

 

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error fetching favorites:{" "}
          {typeof error === "string" ? error : JSON.stringify(error)}
        </Text>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? Colors.BLACK : "#f9f9f9",// Light background for the whole page
      padding: 20,
    },
    propertyCard: {
      backgroundColor: theme === 'dark' ? '#303030' : '#fff', // White background for each property card
      borderRadius: 10,
      shadowColor: "#000", // Shadow effect for depth
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
      padding: 15,
      marginBottom: 20,
    },
    imageRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    image: {
      width: 150,
      height: 120,
      borderRadius: 20,
      marginRight: 15,
      backgroundColor: "#fff", // Light grey background for image placeholder
      resizeMode: "cover",
    },
    textContainer: {
      flex: 1,
    },
    propertyName: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 5,
    },
    price: {
      fontSize: 16,
      color: theme === 'dark' ? '#303030' : '#fff',
    },
    heartIcon: {
      marginLeft: 10,
    },
    nearestPlaceContainer: {
      marginTop: 15,
    },
    nearestPlaceTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
    },
    nearestPlaceItem: {
      marginBottom: 10,
    },
    nearestPlaceName: {
      fontSize: 14,
      color: theme === 'dark' ? '#303030' : '#666',
    },
    nearestPlaceDistance: {
      fontSize: 12,
      color: theme === 'dark' ? '#303030' : '#fff',
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
    noData: {
      textAlign: "center",
      fontSize: 18,
      color: "#888",
    },
    errorText: {
      fontSize: 16,
      color: Colors.GRAY,
    },
    propertyCount: {
      fontSize: 25,
      fontWeight: "bold",
      marginBottom: 20,
      color: Colors.PRIMARY,
      marginLeft: 20,
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:"rgba(255, 255, 255, 0.1)", // Make it completely transparent
      zIndex: 100, // Ensure it's on top
    },
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchFavorites} />
      }
    >
      <Text style={styles.propertyCount}>
        {propertyCount} Favorite{" "}
        {propertyCount === 1 ? "Property" : "Properties"}
      </Text>
      {favorites.length === 0 ? (
        <Text style={styles.noData}>No favorites found</Text>
      ) : (
        favorites.map((property) => (
          <View key={property.favoriteId} style={styles.propertyCard}>
            <TouchableOpacity onPress={() => handleImagePress(property._id)}>
              <View style={styles.imageRow}>
                <Image
                  source={{
                    uri:
                      property.image && property.image.length > 0
                        ? `https://renteasebackend-orna.onrender.com/uploads/${property.image[0]}`
                        : "https://via.placeholder.com/120", // Placeholder image
                  }}
                  style={styles.image}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.propertyName}>
                    {property.property_name}
                  </Text>
                  <Text style={styles.price}>
                    ETP: {property.price} birr/day
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.heartIcon}
                  onPress={() => handleLikeToggle(property.favoriteId)}
                >
                  <MaterialCommunityIcons
                    name={property.liked ? "heart" : "heart-outline"}
                    size={30}
                    color={property.liked ? "red" : "#666"}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            {property.nearestPlaces.length > 0 && (
              <View style={styles.nearestPlaceContainer}>
                <Text style={styles.nearestPlaceTitle}>Nearest Places</Text>
                {property.nearestPlaces.map((place, index) => (
                  <View key={index} style={styles.nearestPlaceItem}>
                    <Text style={styles.nearestPlaceName}>
                      {place.display_name}
                    </Text>
                    <Text style={styles.nearestPlaceDistance}>
                      {place.distance.toFixed(2)} km
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))
      )}
      {loading && (
        <View style={styles.loadingOverlay}>
          <RotatingDotsLoader />
        </View>
      )}
    </ScrollView>
  );
};



export default withAuth(Saved);
