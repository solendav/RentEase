import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import axios from "axios";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location"; // For Expo managed workflow
import { ThemeContext } from "./../app/contexts/ThemeContext";
import { Colors } from "../constants/Colors";
import { useTranslation } from 'react-i18next';

const PropertyPage = () => {
  const { t, i18n } = useTranslation();

  const [currentProperties, setCurrentProperties] = useState([]);
  const [selectedOption, setSelectedOption] = useState("New Arrival");
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  // Function to retrieve properties based on the selected option
  const retrieveProperties = async (option) => {
    setLoading(true); // Set loading to true before fetching properties
    try {
      let url = "https://renteasebackend-orna.onrender.com/properties";
      if (option === "On Your Location") {
        if (!userLocation) {
          // If location is not available, return and don't make an API call
          console.log("Location not available yet, fetching location...");
          await fetchUserLocation(); // Ensure we have the location
          if (!userLocation) {

            setLoading(false);
            return;
          }
        }
        url += `/nearby?lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
      } else if (option === "New Arrival") {
        url += "/new-arrival";
      }

      const response = await axios.get(url);
      setCurrentProperties(response.data);
    } catch (error) {
     
    } finally {
      setLoading(false); // Set loading to false after fetching properties
    }
  };

  // Function to fetch user location
  const fetchUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    } catch (error) {
      console.log("Error fetching user location:", error);
    }
  };

  useEffect(() => {
    const getUserLocation = async () => {
      if (selectedOption === "On Your Location") {
        await fetchUserLocation();
      }
    };

    getUserLocation();
    retrieveProperties(selectedOption);
  }, [selectedOption]);



  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    optionsContainer: {
      paddingHorizontal: 15,
      marginVertical: 10,
    },
    optionsTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    optionsScrollView: {
      paddingVertical: 5,
    },
    optionButton: {
      backgroundColor: theme === 'dark' ? '#303030' : '#f0f0f0', 
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionText: {
      fontSize: 16,
      color: theme === 'dark' ? "#D3D3D3" : Colors.BLACK, 
    },
    recommendation: {
      paddingHorizontal: 15,
      marginVertical: 10,
    },
    itemScrollView: {
      paddingVertical: 5,
    },
    itemContainer: {
      width: 150,
      backgroundColor: theme === 'dark' ? '#303030' : '#fff', 
      marginRight: 15,
      borderRadius: 10,
      shadowColor: "#000", 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.3, 
      shadowRadius: 5, 
      elevation: 8, 
      marginVertical: 15,
    
    },
    image: {
      width: "100%",
      height: 120,
      borderRadius: 10,
    },
    itemTextContainer: {
      marginVertical: 5,
    },
    description: {
      fontSize: 14,
      fontWeight: "bold",
      marginHorizontal:10
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      
      marginHorizontal:10,
    },
    ratingText: {
      fontSize: 14,
      color: "#FFD700",
      marginLeft: 5,
    },
  });



  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? "#212121" : "#fff" },
      ]}
    >
      <View style={styles.optionsContainer}>
        <Text
          style={[
            styles.optionsTitle,
            { color: theme === "dark" ? "#fff" : "#333" },
          ]}
        >
          {t("Advanced Options")}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.optionsScrollView}
        >
          {[t('New Arrival'), t('On Your Location')].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                selectedOption === option && {
                  backgroundColor: theme === "dark" ? Colors.PRIMARY : Colors.PRIMARY,
                },
              ]}
              onPress={() => setSelectedOption(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedOption === option && {
                    color: theme === "dark" ? "#fff" : "#fff",
                  },
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.recommendation}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" /> // Show loading indicator
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.itemScrollView}
          >
            {currentProperties.map((item) => (
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
                  <Text
                    style={[
                      styles.description,
                      { color: theme === "dark" ? "#fff" : "#000" },
                    ]}
                  >
                    {item.property_name}
                  </Text>
                </View>
                <View style={styles.ratingContainer}>
                  <FontAwesome name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {" "}
                    {typeof item.average_rating === "number"
                      ? item.average_rating.toFixed(1)
                      : "0.0"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};



export default PropertyPage;
