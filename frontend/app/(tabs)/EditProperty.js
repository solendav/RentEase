import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "./../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import withAuth from "../../components/withAuth";
import withRoleAccess from "../../components/withRoleAccess";
import { ThemeContext } from './../contexts/ThemeContext';
import RotatingDotsLoader from "../../components/RotatingDotsLoader";
const ETHIOPIA_BOUNDS = {
  latitudeMin: 3.4,
  latitudeMax: 14.9,
  longitudeMin: 33.7,
  longitudeMax: 48.0,
};

const fetchPropertyDetails = async (propertyId) => {
  try {
    const response = await axios.get(
      `https://renteasebackend-orna.onrender.com/property/${propertyId}`
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching property details:", error);
    return null;
  }
};

const EditProperty = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState(true);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [region, setRegion] = useState({
    latitude: 8.0,
    longitude: 39.0,
    latitudeDelta: 7.0,
    longitudeDelta: 7.0,
  });

  const router = useRouter();
  const { propertyId } = useSearchParams();
  const { theme } = useContext(ThemeContext); 
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync("user_id");
        const storedRole = await SecureStore.getItemAsync("role");

        if (!storedUserId) {
          Alert.alert(
            "Authentication Required",
            "You must sign in to edit a property.",
            [
              { text: "Cancel", onPress: () => router.back(), style: "cancel" },
              { text: "Sign In", onPress: () => router.push("/signin") },
            ]
          );
          return;
        }

        setUserId(storedUserId);
        setRole(parseInt(storedRole, 10));

        if (parseInt(storedRole, 10) !== 2 && parseInt(storedRole, 10) !== 3) {
          Alert.alert(
            "Access Denied",
            "You need to register as a Renter or Both Renter and Tenant to access this page.",
            [
              { text: "Cancel", onPress: () => router.back(), style: "cancel" },
              {
                text: "Go to Profile Details",
                onPress: () => router.push("/ProfileDetail"),
              },
            ]
          );
        }
      } catch (error) {
        console.log("Error fetching user details:", error);
      }
    };

    const loadPropertyDetails = async () => {
      if (propertyId) {
        const propertyData = await fetchPropertyDetails(propertyId);
        if (propertyData) {
          setName(propertyData.property_name);
          setDescription(propertyData.description);
          setPrice(propertyData.price.toString());
          setCategory(propertyData.category);
          setImages(propertyData.images); // Assuming images are stored as an array of URIs
          setStatus(propertyData.status);
          setLatitude(propertyData.location.latitude);
          setLongitude(propertyData.location.longitude);
          setRegion({
            latitude: propertyData.location.latitude,
            longitude: propertyData.location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
          // Fetch nearby places based on the current location
          const nearbyPlaces = await fetchNearbyPlaces(
            propertyData.location.latitude,
            propertyData.location.longitude
          );
          setNearby(nearbyPlaces);
        }
      }
    };

    fetchUserDetails();
    loadPropertyDetails();
  }, [propertyId]);

  const handleUpdate = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID is not available.");
      return;
    }

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      images.length === 0 ||
      latitude === null ||
      longitude === null
    ) {
      Alert.alert(
        "Validation Error",
        "All fields must be filled out, at least one image is required, and a valid location must be selected."
      );
      return;
    }

    const nearestAddress = nearby.length > 0 ? nearby[0].display_name : "";

    const formData = new FormData();
    formData.append("property_name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("status", status.toString());
    formData.append("user_id", userId);
    formData.append("latitude", latitude.toString());
    formData.append("longitude", longitude.toString());
    formData.append("address", nearestAddress);

    images.forEach((imageUri, index) => {
      formData.append("image", {
        uri: imageUri,
        name: `image_${index}.jpg`,
        type: "image/jpeg",
      });
    });

    try {
      const response = await axios.put(
        `https://renteasebackend-orna.onrender.com/updateProperty/${propertyId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      Alert.alert(
        "Update Successful",
        "Property has been updated successfully."
      );
    } catch (error) {
      Alert.alert("Update Failed", "An error occurred during the update.");
      console.log(
        "Update failed",
        error.response ? error.response.data : error.message
      );
    }
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "You need to grant access to the media library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages(result.assets.map((asset) => asset.uri));
    }
  };

  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    const { latitude, longitude } = coordinate;

    if (
      latitude >= ETHIOPIA_BOUNDS.latitudeMin &&
      latitude <= ETHIOPIA_BOUNDS.latitudeMax &&
      longitude >= ETHIOPIA_BOUNDS.longitudeMin &&
      longitude <= ETHIOPIA_BOUNDS.longitudeMax
    ) {
      setLatitude(latitude);
      setLongitude(longitude);

      const nearbyPlaces = await fetchNearbyPlaces(latitude, longitude);
      setNearby(nearbyPlaces);
    } else {
      Alert.alert(
        "Invalid Location",
        "The selected location is outside the allowed region (Ethiopia)."
      );
    }
  };

  const removeImage = (uri) => {
    setImages(images.filter((imageUri) => imageUri !== uri));
  };

  if (!userId || (role !== 2 && role !== 3)) {
    return null;
  }
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === "dark" ? Colors.BLACK : Colors.WHITE,
      padding: 16,
    },
    form: {
      flex: 1,
    },
    field: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 8,
    },
    input: {
      borderColor: Colors.GRAY,
      borderWidth: 1,
      borderRadius: 4,
      padding: 12,
      fontSize: 16,
    },
    picker: {
      height: 50,
      width: "100%",
    },
    button: {
      backgroundColor: Colors.PRIMARY,
      padding: 12,
      borderRadius: 4,
      alignItems: "center",
    },
    buttonText: {
      color: Colors.WHITE,
      fontSize: 16,
    },
    imageContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    imageWrapper: {
      position: "relative",
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    removeButton: {
      position: "absolute",
      top: 0,
      right: 0,
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      borderRadius: 12,
      padding: 2,
    },
    map: {
      width: "100%",
      height: 300,
      borderRadius: 8,
    },
    submitButton: {
      backgroundColor: Colors.PRIMARY,
      padding: 12,
      borderRadius: 4,
      alignItems: "center",
    },
    submitButtonText: {
      color: Colors.WHITE,
      fontSize: 16,
    },
  });
  

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Property Name</Text>
          <TextInput
            value={name}
            onChangeText={(text) => setName(text)}
            style={styles.input}
            placeholder="Enter Property Name"
            placeholderTextColor={Colors.GRAY}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            value={price}
            onChangeText={(text) => setPrice(text)}
            style={styles.input}
            placeholder="Enter Price"
            placeholderTextColor={Colors.GRAY}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Category" value="" />
            <Picker.Item label="Car" value="car" />
            <Picker.Item label="House" value="house" />
            <Picker.Item label="Bike" value="bike" />
            <Picker.Item label="Electronics" value="electronics" />
          </Picker>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={(text) => setDescription(text)}
            style={styles.input}
            placeholder="Enter Description"
            placeholderTextColor={Colors.GRAY}
            multiline
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Images</Text>
          <TouchableOpacity onPress={pickImages} style={styles.button}>
            <Text style={styles.buttonText}>Pick Images</Text>
          </TouchableOpacity>
          <View style={styles.imageContainer}>
            {images.map((imageUri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(imageUri)}
                >
                  <Ionicons name="close-circle" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Location</Text>
          <MapView
            style={styles.map}
            initialRegion={region}
            onPress={handleMapPress}
          >
            {latitude && longitude && (
              <Marker coordinate={{ latitude, longitude }} />
            )}
          </MapView>
        </View>

        <TouchableOpacity onPress={handleUpdate} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Update Property</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


export default withAuth(withRoleAccess(EditProperty,["2","3"]));
