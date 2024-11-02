import React, { useState, useEffect } from "react";
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
import { Colors } from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import withAuth from "../components/withAuth";
import withRoleAccess from "../components/withRoleAccess";
import withProfileVerification from "../components/withProfileVerification";
const ETHIOPIA_BOUNDS = {
  latitudeMin: 3.4,
  latitudeMax: 14.9,
  longitudeMin: 33.7,
  longitudeMax: 48.0,
};

const AddProperty = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null); // Store the image URI
  const [status, setStatus] = useState(true); // Assume true as default status
  const [userId, setUserId] = useState(""); // State to store user_id
  const [role, setRole] = useState(null); // State to store user role
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [region, setRegion] = useState({
    latitude: 8.0, // Center of Ethiopia
    longitude: 39.0,
    latitudeDelta: 7.0,
    longitudeDelta: 7.0,
  });

  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync("user_id");
        const storedRole = await SecureStore.getItemAsync("role");

        if (!storedUserId) {
          Alert.alert(
            "Authentication Required",
            "You must sign in to add a property.",
            [
              {
                text: "Cancel",
                onPress: () => router.back(),
                style: "cancel",
              },
              {
                text: "Sign In",
                onPress: () => router.push("/signin"),
              },
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
                onPress: () => router.back(),
                style: "cancel",
              },
              {
                text: "Go to Profile Details",
                onPress: () => router.push("/ProfileDetail"),
              },
            ]
          );
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleRegister = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID is not available.");
      return;
    }

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !image ||
      latitude === null ||
      longitude === null
    ) {
      Alert.alert(
        "Validation Error",
        "All fields must be filled out, an image is required, and a valid location must be selected."
      );
      return;
    }

    const formData = new FormData();
    formData.append("property_name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("status", status.toString());
    formData.append("user_id", userId);
    formData.append("latitude", latitude.toString()); // Change to latitude
    formData.append("longitude", longitude.toString()); // Change to longitude

    // Append image file to FormData
    formData.append("image", {
      uri: image,
      name: image.split("/").pop(),
      type: "image/jpeg",
    });

    console.log("FormData before sending:", formData);

    try {
      const response = await axios.post(
        "https://renteasebackend-orna.onrender.com/addProperty",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      Alert.alert(
        "Registration Successful",
        "Property has been added successfully."
      );
      // Clear form after successful submission
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setImage(null);
      setLatitude(null);
      setLongitude(null);
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        "An error occurred during registration."
      );
      console.log(
        "Register failed",
        error.response ? error.response.data : error.message
      );
    }
  };

  const pickImage = async () => {
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
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri); // Get the URI from the assets array
    }
  };

  const handleMapPress = (event) => {
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
    } else {
      Alert.alert(
        "Invalid Location",
        "The selected location is outside the allowed region (Ethiopia)."
      );
    }
  };
  const commision= price*0.06;

  if (!userId || (role !== 2 && role !== 3)) {
    // Do not render the form if the user is not authorized
    return null;
  }

  return (
    <ScrollView style={{ flex: 1, marginTop: 30 }}>
      <View style={{ padding: 10 }}>
        <Ionicons
          onPress={() => router.back()}
          style={{ marginLeft: 20 }}
          name="arrow-back"
          size={24}
          color="black"
        />
        <Text
          style={{
            fontSize: 23,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Add a New Property
        </Text>

        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold" }}>
            Property Name
          </Text>
          <TextInput
            value={name}
            onChangeText={(text) => setName(text)}
            style={styles.input}
            placeholder="Enter Property Name"
            placeholderTextColor={Colors.GRAY}
          />
        </View>

        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold" }}>Price</Text>
          <TextInput
            value={price}
            onChangeText={(text) => setPrice(text)}
            style={styles.input}
            placeholder="Price"
            placeholderTextColor={Colors.GRAY}
          />
        </View>

        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold" }}>Category</Text>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select a Category" value="" />
            <Picker.Item label="House" value="House" />
            <Picker.Item label="Car" value="Car" />
            <Picker.Item label="Bike" value="Bike" />
            <Picker.Item label="Clothe" value="Clothe" />
            <Picker.Item label="Shoes" value="Shoes" />
            <Picker.Item label="Electronics" value="Electronics" />
            <Picker.Item label="Furniture" value="Furniture" />
            <Picker.Item label="Book" value="Book" />
            <Picker.Item label="Other" value="Other" />

            {/* Add more categories as needed */}
          </Picker>
        </View>

        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold" }}>Description</Text>
          <TextInput
            value={description}
            onChangeText={(text) => setDescription(text)}
            style={[styles.input, { height: 100 }]}
            placeholder="Enter Description"
            placeholderTextColor={Colors.GRAY}
            multiline
          />
        </View>

        <View style={styles.mapContainer}>
          <Text style={{ fontSize: 17, fontWeight: "bold" }}>
            Select Location
          </Text>
          <MapView
            style={styles.map}
            initialRegion={region}
            onPress={handleMapPress}
            onRegionChangeComplete={(newRegion) => {
              if (
                newRegion.latitude < ETHIOPIA_BOUNDS.latitudeMin ||
                newRegion.latitude > ETHIOPIA_BOUNDS.latitudeMax ||
                newRegion.longitude < ETHIOPIA_BOUNDS.longitudeMin ||
                newRegion.longitude > ETHIOPIA_BOUNDS.longitudeMax
              ) {
                setRegion({
                  ...region,
                  latitude: Math.max(
                    ETHIOPIA_BOUNDS.latitudeMin,
                    Math.min(newRegion.latitude, ETHIOPIA_BOUNDS.latitudeMax)
                  ),
                  longitude: Math.max(
                    ETHIOPIA_BOUNDS.longitudeMin,
                    Math.min(newRegion.longitude, ETHIOPIA_BOUNDS.longitudeMax)
                  ),
                });
              }
            }}
          >
            {latitude && longitude && (
              <Marker coordinate={{ latitude, longitude }} />
            )}
          </MapView>
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              Latitude: {latitude ? latitude.toFixed(6) : "Not selected"}
            </Text>
            <Text style={styles.locationText}>
              Longitude: {longitude ? longitude.toFixed(6) : "Not selected"}
            </Text>
          </View>
        </View>

        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold" }}>Image</Text>
          <Pressable onPress={pickImage} style={styles.imagePicker}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <Text style={{ color: Colors.GRAY }}>Select Image</Text>
            )}
          </Pressable>
        </View>
        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 17, fontWeight: "bold" }}>Price</Text>
          <TextInput
            value={commision}
            onChangeText={commision}
            style={styles.input}
            placeholder="Price"
            placeholderTextColor={Colors.GRAY}
          />
        </View>

        <TouchableOpacity onPress={handleRegister} style={styles.button}>
          <Text style={styles.buttonText}>Add Property</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  input: {
    borderColor: Colors.GRAY,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  picker: {
    padding: 10,
    borderColor: "#D0D0D0",
    borderWidth: 1,
    marginTop: 10,
    borderRadius: 10,
  },
  mapContainer: {
    marginVertical: 10,
    borderColor: Colors.GRAY,
    borderWidth: 1,
    borderRadius: 5,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: 200,
  },
  locationInfo: {
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePicker: {
    padding: 10,
    borderColor: "#D0D0D0",
    borderWidth: 1,
    marginTop: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
});

export default withAuth(withRoleAccess(withProfileVerification(AddProperty), ["2", "3"]));
