import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";

const RecommendationsSection = () => {
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  const fetchUserId = async () => {
    try {
      const storedUserId = await SecureStore.getItemAsync("user_id");
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const getLocationAndAddress = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setLoading(false);
        return;
      }

      let { coords } = await Location.getCurrentPositionAsync({});
      setLocation(coords);

      const [addressData] = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setAddress(addressData);

      if (coords && userId) {
        try {
          const apiUrl = `https://renteasebackend-orna.onrender.com/api/similar/${userId}?lat=${coords.latitude}&lng=${coords.longitude}`;
          const response = await axios.get(apiUrl);
          setFilteredProperties(response.data);
        } catch (err) {
          console.error("Error fetching properties:", err);
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error fetching location or address:", error);
      setErrorMsg("Failed to fetch location or address.");
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserId().then(() => {
        if (userId) {
          getLocationAndAddress();
        }
      });
    }, [userId]) // refetch when userId changes or screen is focused
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (errorMsg) {
    return <Text>{errorMsg}</Text>;
  }

  return (
    <View style={styles.recommendation}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.itemScrollView}
      >
        {filteredProperties.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={styles.itemContainer}
            onPress={() =>
              navigation.navigate("propertyDetail", { _id: item._id })
            }
          >
            <Image
              source={{
                uri:
                  item.image && item.image.length > 0
                    ? `https://renteasebackend-orna.onrender.com/uploads/${item.image[0]}`
                    : "https://via.placeholder.com/200x200.png?text=No+Image",
              }}
              style={styles.image}
              onError={() =>
                console.log(`Error loading image for item ${item._id}`)
              }
            />
            <View style={styles.itemTextContainer}>
              <Text style={styles.description}>{item.property_name}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <FontAwesome name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>
                {typeof item.average_rating === "number"
                  ? item.average_rating.toFixed(1)
                  : "0.0"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  recommendation: {
    marginVertical: 20,
  },
  itemScrollView: {
    paddingHorizontal: 10,
  },
  itemContainer: {
    marginRight: 15,
    width: 200,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 8,
  },
  itemTextContainer: {
    marginTop: 5,
  },
  description: {
    fontSize: 16,
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
  },
});

export default RecommendationsSection;
