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
import { Colors } from "./../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import withAuth from './../components/withAuth';
import withRoleAccess from "../components/withRoleAccess";
import withProfileVerification from "../components/withProfileVerification";
import RotatingDotsLoader from "../components/RotatingDotsLoader";
import { ThemeContext } from "./contexts/ThemeContext";
import Header from "../components/Header";

const ETHIOPIA_BOUNDS = {
  latitudeMin: 3.4,
  latitudeMax: 14.9,
  longitudeMin: 33.7,
  longitudeMax: 48.0,
};

const fetchPropertyDetails = async (propertyId) => {
  try {
    const response = await axios.get(
      `https://renteasebackend-orna.onrender.com/properties/${propertyId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching property details:", error);
    return null;
  }
};

const fetchNearbyPlaces = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&limit=10&q=${latitude},${longitude}`
    );
    return response.data || [];
  } catch (error) {
    console.error("Error fetching nearby places:", error.message);
    return [];
  }
};

const EditProperty = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState(true);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [commission, setCommission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: 8.0,
    longitude: 39.0,
    latitudeDelta: 7.0,
    longitudeDelta: 7.0,
  });

  const navigation = useNavigation();
  const route = useRoute();
  const propertyId = route.params?.propertyId;
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
              {
                text: "Cancel",
                onPress: () => navigation.goBack(),
                style: "cancel",
              },
              { text: "Sign In", onPress: () => navigation.navigate("SignIn") },
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
              {
                text: "Cancel",
                onPress: () => navigation.goBack(),
                style: "cancel",
              },
              {
                text: "Go to Profile Details",
                onPress: () => navigation.navigate("ProfileDetail"),
              },
            ]
          );
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    const loadPropertyDetails = async () => {
      setLoading(true);
      if (propertyId) {
        const propertyData = await fetchPropertyDetails(propertyId);
        if (propertyData) {
          setName(propertyData.property_name);
          setDescription(propertyData.description);
          setPrice(propertyData.price.toString());
          setCategory(propertyData.category);
          setQuantity(propertyData.quantity.toString());
          setImages(propertyData.images || []);
          setStatus(propertyData.status);
          setLatitude(propertyData.location.latitude);
          setLongitude(propertyData.location.longitude);
          setRegion({
            latitude: propertyData.location.latitude,
            longitude: propertyData.location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });

          const nearbyPlaces = await fetchNearbyPlaces(
            propertyData.location.latitude,
            propertyData.location.longitude
          );
          setNearby(nearbyPlaces || []);
        }
      }
      setLoading(false);
    };

    fetchUserDetails();
    loadPropertyDetails();
  }, [propertyId]);

  useEffect(() => {
    const calculateCommission = () => {
      if (
        price.trim() !== "" &&
        !isNaN(parseFloat(price)) &&
        quantity.trim() !== "" &&
        !isNaN(parseFloat(quantity))
      ) {
        const baseCommission = parseFloat(price) * 0.06;
        const calculatedCommission = baseCommission * parseFloat(quantity);
        setCommission(calculatedCommission.toFixed(2));
      } else {
        setCommission(null);
      }
    };

    calculateCommission();
  }, [price, quantity]);

  const handleQuantityChange = (text) => setQuantity(text);

  const handlePriceChange = (text) => setPrice(text);

  const handleUpdate = async () => {
    setLoading(true);
    if (!userId) {
      Alert.alert("Error", "User ID is not available.");
      setLoading(false);
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
      setLoading(false);
      return;
    }

    const nearestAddress = nearby.length > 0 ? nearby[0].display_name : "";

    const formData = new FormData();
    formData.append("property_name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("quantity", quantity);
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
      await axios.put(
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
      console.error(
        "Update failed",
        error.response ? error.response.data : error.message
      );
    } finally {
      setLoading(false);
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
      setNearby(nearbyPlaces || []);

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } else {
      Alert.alert(
        "Location out of bounds",
        "Please select a location within Ethiopia."
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Header title="Edit Property" />
      {loading ? (
        <RotatingDotsLoader />
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.label}>Property Name:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Description:</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Price:</Text>
          <TextInput
            style={styles.input}
            value={price}
            keyboardType="numeric"
            onChangeText={handlePriceChange}
          />

          <Text style={styles.label}>Category:</Text>
          <Picker
            selectedValue={category}
            style={styles.picker}
            onValueChange={(itemValue) => setCategory(itemValue)}
          >
            {/* Add picker items as needed */}
            <Picker.Item label="Select Category" value="" />
            <Picker.Item label="Category 1" value="category1" />
            <Picker.Item label="Category 2" value="category2" />
          </Picker>

          <Text style={styles.label}>Quantity:</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            keyboardType="numeric"
            onChangeText={handleQuantityChange}
          />

          <Text style={styles.label}>Status:</Text>
          <Picker
            selectedValue={status}
            style={styles.picker}
            onValueChange={(itemValue) => setStatus(itemValue)}
          >
            <Picker.Item label="Available" value={true} />
            <Picker.Item label="Not Available" value={false} />
          </Picker>

          <Text style={styles.label}>Images:</Text>
          <TouchableOpacity onPress={pickImages} style={styles.imagePicker}>
            <Text style={styles.imagePickerText}>Pick Images</Text>
          </TouchableOpacity>
          <View style={styles.imageContainer}>
            {images.map((imageUri, index) => (
              <Image key={index} source={{ uri: imageUri }} style={styles.image} />
            ))}
          </View>

          <Text style={styles.label}>Location:</Text>
          <MapView
            style={styles.map}
            region={region}
            onPress={handleMapPress}
          >
            {latitude && longitude && (
              <Marker coordinate={{ latitude, longitude }} />
            )}
          </MapView>

          <Text style={styles.commission}>Estimated Commission: ${commission || 'N/A'}</Text>

          <Pressable onPress={handleUpdate} style={styles.updateButton}>
            <Text style={styles.updateButtonText}>Update Property</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    marginBottom: 16,
    color: Colors.text,
  },
  picker: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    marginBottom: 16,
  },
  imagePicker: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    marginBottom: 16,
  },
  imagePickerText: {
    color: Colors.white,
    fontSize: 16,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 8,
    marginBottom: 8,
  },
  map: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  commission: {
    fontSize: 16,
    marginBottom: 16,
    color: Colors.text,
  },
  updateButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  updateButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
});

export default withAuth(withRoleAccess(withProfileVerification(EditProperty)));
