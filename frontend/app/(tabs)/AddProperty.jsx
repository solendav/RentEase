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
  TouchableHighlight,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "./../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import withRoleAccess from "../../components/withRoleAccess";
import withAuth from "../../components/withAuth";
import withProfileVerification from "../../components/withProfileVerification";
import { ThemeContext } from "../contexts/ThemeContext";
import RotatingDotsLoader from "../../components/RotatingDotsLoader";
const ETHIOPIA_BOUNDS = {
  latitudeMin: 3.4,
  latitudeMax: 14.9,
  longitudeMin: 33.7,
  longitudeMax: 48.0,
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon1 - lon2);
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

const AddProperty = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImages] = useState([]); // Array to store image URIs
  const [status, setStatus] = useState(true); // Assume true as default status
  const [userId, setUserId] = useState(""); // State to store user_id
  const [role, setRole] = useState(null); // State to store user role
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [commission, setCommission] = useState(null); // State for commission

  const [nearby, setNearby] = useState([]); // State to store nearby places
  const [region, setRegion] = useState({
    latitude: 8.0, // Center of Ethiopia
    longitude: 39.0,
    latitudeDelta: 7.0,
    longitudeDelta: 7.0,
  });

  const router = useRouter();
  const { theme } = useContext(ThemeContext); 

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
                onPress: () => router.push("/Settings"),
              },
            ]
          );
        }
      } catch (error) {
        console.log("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const calculateCommission = () => {
      // Check if both price and quantity are valid numbers before calculating
      if (
        price.trim() !== "" &&
        !isNaN(parseFloat(price)) &&
        quantity.trim() !== "" &&
        !isNaN(parseFloat(quantity))
      ) {
        const baseCommission = parseFloat(price) * 0.06; // Calculate base commission
        const calculatedCommission = baseCommission * parseFloat(quantity); // Multiply by quantity
        setCommission(calculatedCommission.toFixed(2));
      } else {
        setCommission(null); // Reset commission to null if invalid
      }
    };

    calculateCommission(); // Recalculate commission when price or quantity changes
  }, [price, quantity]); // Dependency array, run effect when price or quantity changes

  const handleQuantityChange = (text) => {
    setQuantity(text);
  };
  const getPlaceholderText = () => {
    switch (category) {
      case 'Vehicle':
        return 'Market Price Range 1000-2000';
      case 'House':
        return 'Market Price Range 2000-3000';
      case 'Electronics':
        return 'Market Price Range 500-2000';
      case 'Cloth':
        return 'Market Price Range 1000-2000';
       case 'Event-Equipment':
          return 'Market Price Range 1000-2000';
        
      default:
        return 'Enter Price';
    }
  };

  const handlePriceChange = (text) => {
    setPrice(text);
  };

  const handleRegister = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID is not available.");
      return;
    }
     
    if (
      !name ||
      !description ||
      !price ||
      !quantity||
      !category ||
      image.length === 0 ||
      latitude === null ||
      longitude === null
    ) {
      Alert.alert(
        "Validation Error",
        "All fields must be filled out, at least one image is required, and a valid location must be selected."
      );
      return;
    }
  
    // Extract the full address from the nearby places
    const nearestAddress = nearby.length > 0 ? nearby[0].display_name : "";
  
    try {
      const depositResponse = await axios.get(`https://renteasebackend-orna.onrender.com/api/account/${userId}`);
      const { deposit } = depositResponse.data;
  
      // Compare deposit with commission
      if (deposit < commission) {
        Alert.alert(
          "Insufficient Deposit",
          `You need at least ${commission} in your account to register the property.`,
          [
            {
              text: "Deposit",
              onPress: () => {
                // Navigate to the wallet or deposit screen
                router.push("/Wallet"); // Replace with your actual wallet route
              },
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
        return; // Stop the registration if deposit is insufficient
      }


    const formData = new FormData();
    formData.append("property_name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("category", category);
    formData.append("status", status.toString());
    formData.append("user_id", userId);
    formData.append("latitude", latitude.toString());
    formData.append("longitude", longitude.toString());
    formData.append("address", nearestAddress); // Add the full address
  
    // Append image files to FormData
    image.forEach((imageUri, index) => {
      formData.append("image", {
        uri: imageUri,
        name: `image_${index}.jpg`,
        type: "image/jpeg",
      });
    });
  
    console.log("FormData before sending:", formData);
  
   
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
      setQuantity("");
      setCategory("");
      setImages([]);
      setLatitude(null);
      setLongitude(null);
      setNearby([]); // Clear nearby places after submission
    } catch (error) {
     
      console.log(
        "Register failed",
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
      allowsMultipleSelection: true, // Allow multiple images selection
      allowsEditing:false,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages(result.assets.map((asset) => asset.uri)); // Update state with multiple image URIs
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

      // Fetch nearby places
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
    setImages(image.filter((imageUri) => imageUri !== uri));
  };

  if (!userId || (role !== 2 && role !== 3)) {
    // Do not render the form if the user is not authorized
    return null;
  }

  const getThemedStyles = (theme) => StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme === 'dark' ? Colors.BLACK : Colors.WHITE, // Dynamic background
    },
    form: {
      marginVertical: 20,
    },
    field: {
      marginBottom: 16,
    },
    label: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
      color: theme === 'dark' ? Colors.WHITE : Colors.PRIMARY, // Dynamic color
    },
    input: {
      borderColor: theme === 'dark' ? Colors.GRAY : Colors.GRAY, // Dynamic border color
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: theme === 'dark' ? Colors.DARK_GRAY : Colors.LIGHT_GRAY, // Dynamic background
      color: theme === 'dark' ? Colors.WHITE : Colors.BLACK, // Dynamic text color
    },
    picker: {
      borderColor: theme === 'dark' ? Colors.WHITE : Colors.GRAY, // Dynamic border color
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: theme === 'dark' ? Colors.DARK_GRAY : Colors.LIGHT_GRAY, // Dynamic background
      color: theme === 'dark' ? Colors.WHITE : Colors.BLACK, // Dynamic text color
    },
    button: {
      backgroundColor: theme === 'dark' ? Colors.DARK_PRIMARY : Colors.PRIMARY, // Dynamic background
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 16,
    },
    buttonText: {
      color: theme === 'dark' ? Colors.WHITE : Colors.WHITE, // Dynamic text color
      fontSize: 16,
    },
    imagesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 16,
    },
    imageWrapper: {
      position: "relative",
      margin: 4,
      borderRadius: 8,
      overflow: "hidden",
      elevation: 4, // Shadow for Android
      shadowColor: "#000", // Shadow for iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
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
      padding: 4,
      backgroundColor: "rgba(255,255,255,0.8)",
      borderRadius: 12,
    },
    map: {
      width: "100%",
      height: 200,
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 16,
    },
    nearbyContainer: {
      marginTop: 16,
    },
    nearbyTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
      color: theme === 'dark' ? Colors.WHITE : Colors.PRIMARY, // Dynamic color
    },
    nearbyPlace: {
      fontSize: 14,
      marginBottom: 4,
      color: theme === 'dark' ? Colors.WHITE : Colors.BLACK, // Dynamic color
    },
    submitButton: {
      backgroundColor: theme === 'dark' ? Colors.DARK_PRIMARY : Colors.PRIMARY, // Dynamic background
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    submitButtonText: {
      color: theme === 'dark' ? Colors.WHITE : Colors.WHITE, // Dynamic text color
      fontSize: 18,
      fontWeight: "bold",
    },
  });

  const styles = getThemedStyles(theme); 

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
            placeholderTextColor={theme === 'dark' ? Colors.GRAY : Colors.GRAY} // Dynamic placeholder color
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
            <Picker.Item label="House" value="House" />
            <Picker.Item label="Electronics" value="Electronics" />
            <Picker.Item label="Vehicle" value="Vehicle" />
            <Picker.Item label="Cloth" value="Cloth" />
            <Picker.Item label="Event_Equipment" value="Event_Equipment"/>
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>
        <View style={styles.field}>
      <Text style={styles.label}>Price</Text>
      <TextInput
        value={price}
        onChangeText={handlePriceChange} // Call handlePriceChange on price change
        style={styles.input}
        placeholder={getPlaceholderText()}
        placeholderTextColor={theme === 'dark' ? Colors.GRAY : Colors.GRAY} // Dynamic placeholder color
        keyboardType="numeric"
      />
    </View>
        <View style={styles.field}>
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            value={quantity}
            onChangeText={handleQuantityChange} 
            style={styles.input}
            placeholder="Enter Quantity"
            placeholderTextColor={theme === 'dark' ? Colors.GRAY : Colors.GRAY} // Dynamic placeholder color
            keyboardType="numeric"
          />
        </View>

       

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={(text) => setDescription(text)}
            style={styles.input}
            placeholder="Enter Description"
            placeholderTextColor={theme === 'dark' ? Colors.GRAY : Colors.GRAY} // Dynamic placeholder color
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Select Images</Text>
          <TouchableOpacity style={styles.button} onPress={pickImages}>
            <Text style={styles.buttonText}>Pick Images</Text>
          </TouchableOpacity>
          <View style={styles.imagesContainer}>
            {image.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(uri)}
                >
                  <Ionicons name="close-circle" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Select Location</Text>
          <MapView
            style={styles.map}
            initialRegion={region}
            onPress={handleMapPress}
          >
            {latitude && longitude && (
              <Marker coordinate={{ latitude, longitude }} />
            )}
          </MapView>
          {nearby.length > 0 && (
            <View style={styles.nearbyContainer}>
              <Text style={styles.nearbyTitle}>Nearby Places:</Text>
              {nearby.map((place, index) => (
                <Text key={index} style={styles.nearbyPlace}>
                  {place.display_name}
                </Text>
              ))}
            </View>
          )}
        </View>
          <View style={{ marginVertical: 10 }}>
      <Text style={{ fontSize: 17, fontWeight: "bold", color: theme === 'dark' ? Colors.WHITE : Colors.PRIMARY }}>Commission  6%</Text>
      <TextInput
        value={commission} // Display the calculated commission
        onChangeText={() => {}} // Prevent manual input
        style={styles.input}
        placeholder="Commission"
        placeholderTextColor={theme === 'dark' ? Colors.GRAY : Colors.GRAY} // Dynamic placeholder color
        editable={false} // Disable manual editing
      />
    </View>

    <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme === 'dark' ? Colors.PRIMARY : Colors.PRIMARY }, // Dynamic background
          ]}
          onPress={handleRegister}
        >
          <Text style={[
            styles.submitButtonText,
            { color: theme === 'dark' ? Colors.WHITE : Colors.WHITE }, // Dynamic text color
          ]}>Register Property</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 26,
    backgroundColor: Colors.WHITE,
  },
  form: {
    marginVertical: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.PRIMARY,
  },
  input: {
    borderColor: Colors.GRAY,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  picker: {
    borderColor: Colors.GRAY,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: Colors.WHITE,
    fontSize: 16,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  imageWrapper: {
    position: "relative",
    margin: 4,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 4, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 12,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  nearbyContainer: {
    marginTop: 16,
  },
  nearbyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.PRIMARY,
  },
  nearbyPlace: {
    fontSize: 14,
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom:20
  },
  submitButtonText: {
    color: Colors.WHITE,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default withAuth(withRoleAccess(withProfileVerification(AddProperty), ["2","3"]));