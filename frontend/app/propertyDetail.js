import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as SecureStore from "expo-secure-store";
import { Colors } from "../constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Reviews from "./../components/Review";
import Swiper from "react-native-swiper";
import { useRouter } from "expo-router";
import { ThemeContext } from "./../app/contexts/ThemeContext";
import RotatingDotsLoader from "./../components/RotatingDotsLoader";

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

const PropertyDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { _id } = route.params;
  const router = useRouter();
  const [property, setProperty] = useState({ image: [] });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nearestPlace, setNearestPlace] = useState(null);
  const [distance, setDistance] = useState(null);
  const { theme } = useContext(ThemeContext);

  const calculateIncreasedPrice = (price) => price * 1.04; // Increase price by 4%
  const updatedPrice = calculateIncreasedPrice(property.price || 0);

  const fetchProperty = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://renteasebackend-orna.onrender.com/properties/${_id}`
      );
      console.log("Property data:", response.data);
      setProperty(response.data);

      await fetchUserProfile(response.data.user_id);

      const userId = await SecureStore.getItemAsync("user_id");
      try {
        const favoriteResponse = await axios.get(
          `https://renteasebackend-orna.onrender.com/favorites/${userId}/${_id}`
        );
        setLiked(favoriteResponse.data && favoriteResponse.data.liked);
      } catch (favoriteError) {
        console.error("Error fetching favorite status:", favoriteError);
        setLiked(false);
      }

      const places = await fetchNearbyPlaces(
        response.data.location.latitude,
        response.data.location.longitude
      );
      if (places.length > 0) {
        const closestPlace = places.reduce(
          (nearest, place) => {
            const placeDistance = calculateDistance(
              response.data.location.latitude,
              response.data.location.longitude,
              place.lat,
              place.lon
            );
            return placeDistance < nearest.distance
              ? { place, distance: placeDistance }
              : nearest;
          },
          { place: null, distance: Infinity }
        );

        setNearestPlace(closestPlace.place);
        setDistance(closestPlace.distance);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching property details:", error);
      setError(error.response ? error.response.data.message : error.message);
      setLoading(false);
    }
  }, [_id]);

  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const response = await axios.get(
        `https://renteasebackend-orna.onrender.com/api/profile/${userId}`
      );
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const handleLike = async () => {
    try {
      const userId = await SecureStore.getItemAsync("user_id");
      if (!userId) {
        Alert.alert(
          "Registration Required",
          "You need to register or log in to save the property.",
          [
            {
              text: "Register",
              onPress: () => {
                router.push("/auth/SignIn");
              },
              style: "default",
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ],
          { cancelable: true }
        );
        return;
      }
      if (liked) {
        const response = await axios.delete(
          `https://renteasebackend-orna.onrender.com/favorites/${userId}/${_id}`
        );
        if (response.status === 200) {
          setLiked(false);
        }
      } else {
        const response = await axios.post(
          `https://renteasebackend-orna.onrender.com/favorites`,
          {
            property_id: _id,
            user_id: userId,
            liked: !liked,
          }
        );
        if (response.status === 200) {
          setLiked(!liked);
        }
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProperty();
    setRefreshing(false);
  }, [fetchProperty]);

  const defaultRegion = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const location = property?.location || defaultRegion;
  const nearestPlaceLocation = nearestPlace
    ? {
        latitude: parseFloat(nearestPlace.lat),
        longitude: parseFloat(nearestPlace.lon),
      }
    : null;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === "dark" ? Colors.BLACK : "f9f9f9",
    },
    contentContainer: {
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
    description: {
      fontSize: 16,
      color: theme === "dark" ? Colors.GRAY : "#555",
      textAlign: "center",
    },
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 20,
      backgroundColor: theme === "dark" ? Colors.BLACK : "#fff",
    },
    fullWidthItem: {
      width: "100%",
      padding: 15,
      backgroundColor: theme === "dark" ? Colors.BLACK : "#fff",
    },
    infoItem: {
      width: "48%",
      padding: 15,
      marginBottom: 10,
      backgroundColor: theme === "dark" ? Colors.BLACK : "#fff",
      borderRadius: 10,
    },
    infoLabel: {
      fontWeight: "bold",
    },
    price: {
      fontSize: 24,
      fontWeight: "bold",
      color: Colors.PRIMARY,
      textAlign: "center",
    },
    buttonContainer: {
      marginTop: 10,
      alignItems: "center",
    },
    button: {
      backgroundColor: Colors.PRIMARY,
      padding: 10,
      borderRadius: 5,
      width: "80%",
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: 18,
    },
    mapContainer: {
      height: 300,
      marginBottom: 20,
    },
    map: {
      flex: 1,
      borderRadius: 15,
    },
    nearestPlaceText: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme === "dark" ? Colors.GRAY : "#333",
    },
    errorText: {
      color: "red",
      textAlign: "center",
      marginTop: 20,
    },
  });

  if (loading) {
    return <RotatingDotsLoader />;
  }

  if (error) {
    return <Text style={styles.errorText}>Error: {error}</Text>;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.imageContainer}>
        {property.image.length > 0 ? (
          <Swiper
            style={styles.imageScrollView}
            showsPagination={true}
            dotColor="#fff"
            activeDotColor={Colors.PRIMARY}
          >
            {property.image.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={styles.image}
              />
            ))}
          </Swiper>
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No images available</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.likeButton}
          onPress={handleLike}
        >
          <MaterialIcons
            name={liked ? "favorite" : "favorite-border"}
            size={24}
            color={liked ? "red" : "#333"}
          />
        </TouchableOpacity>
        <Text style={styles.propertyName}>{property.name}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.description}>{property.description}</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Price:</Text>
            <Text style={styles.price}>${updatedPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text>{property.type}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text>{property.location ? `${property.location.latitude}, ${property.location.longitude}` : 'Not available'}</Text>
          </View>
          {property.features && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Features:</Text>
              <Text>{property.features.join(", ")}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Chat", { userId: user._id })}
          >
            <Text style={styles.buttonText}>Contact Owner</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={location}
          showsUserLocation={true}
        >
          <Marker coordinate={location} title={property.name} />
          {nearestPlaceLocation && (
            <>
              <Marker coordinate={nearestPlaceLocation} title="Nearest Place" />
              <Polyline
                coordinates={[
                  {
                    latitude: location.latitude,
                    longitude: location.longitude,
                  },
                  nearestPlaceLocation,
                ]}
                strokeColor="#000"
                strokeWidth={2}
              />
            </>
          )}
        </MapView>
        {nearestPlace && (
          <View>
            <Text style={styles.nearestPlaceText}>
              Nearest Place: {nearestPlace.display_name} ({distance.toFixed(2)} km away)
            </Text>
          </View>
        )}
      </View>

      <Reviews propertyId={_id} />
    </ScrollView>
  );
};

export default PropertyDetail;
