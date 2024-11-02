import React, { useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { ThemeContext } from "./contexts/ThemeContext";
import { Colors } from "../constants/Colors";
import { useRoute } from "@react-navigation/native";
const DamageForm = () => {
  const [description, setDescription] = useState("");
  const [estimation, setEstimation] = useState("");
  const [imageUris, setImageUris] = useState([]); // Array to store image URIs
  const { theme } = useContext(ThemeContext);
  const [bookingId, setBookingId] = useState(""); // Assuming bookingId is provided from a parent component
  const route = useRoute();
  useEffect(() => {
    if (route.params?.bookingId) {
      setBookingId(route.params.bookingId);
    }
  }, [route.params?.bookingId]);

  const handleRegister = async () => {
    const formData = new FormData();
    formData.append("bookingId", bookingId); 
    formData.append("description", description);
    formData.append("estimation", estimation);

    // Append image files to FormData
    imageUris.forEach((uri, index) => {
      formData.append("image", {
        uri,
        name: `image_${index}.jpg`,
        type: "image/jpeg",
      });
    });

    try {
      const response = await axios.post(
        "https://renteasebackend-orna.onrender.com/damage-report",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      Alert.alert(
        "Registration Successful",
        "damage report has been added successfully."
      );
      setDescription("");
      setEstimation("");
      setImageUris([]);
    } catch (error) {
      console.error("Register failed:", error);
      Alert.alert(
        "Registration Failed",
        "An error occurred during registration."
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

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection: true, // Allow multiple images selection
        allowsEditing: false,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImageUris(result.assets.map((asset) => asset.uri)); // Update state with multiple image URIs
      }
    } catch (error) {
      console.error("Error picking image:", error); // Log the error for debugging
      Alert.alert(
        "Error",
        "An error occurred while picking images."
      );
    }
  };

  const removeImage = (uri) => {
    setImageUris(imageUris.filter((imageUri) => imageUri !== uri));
  };

  const getThemedStyles = (theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        padding: 16,
        backgroundColor: theme === "dark" ? Colors.BLACK : Colors.WHITE, // Dynamic background
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
        color: theme === "dark" ? Colors.WHITE : Colors.PRIMARY, // Dynamic color
      },
      input: {
        borderColor: theme === "dark" ? Colors.GRAY : Colors.GRAY, // Dynamic border color
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor:
          theme === "dark" ? Colors.DARK_GRAY : Colors.LIGHT_GRAY, // Dynamic background
        color: theme === "dark" ? Colors.WHITE : Colors.BLACK, // Dynamic text color
      },
      button: {
        backgroundColor:
          theme === "dark" ? Colors.DARK_PRIMARY : Colors.PRIMARY, // Dynamic background
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 16,
      },
      buttonText: {
        color: theme === "dark" ? Colors.WHITE : Colors.WHITE, // Dynamic text color
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
      submitButton: {
        backgroundColor:
          theme === "dark" ? Colors.DARK_PRIMARY : Colors.PRIMARY, // Dynamic background
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
      },
      submitButtonText: {
        color: theme === "dark" ? Colors.WHITE : Colors.WHITE, // Dynamic text color
        fontSize: 18,
        fontWeight: "bold",
      },
    });

  const styles = getThemedStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            value={estimation}
            onChangeText={setEstimation}
            style={styles.input}
            placeholder="Enter estimation"
            placeholderTextColor={theme === "dark" ? Colors.GRAY : Colors.GRAY} // Dynamic placeholder color
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
            placeholderTextColor={theme === "dark" ? Colors.GRAY : Colors.GRAY} // Dynamic placeholder color
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
            {imageUris.map((uri, index) => (
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

        <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
          <Text style={styles.submitButtonText}>Report Property Damage</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default DamageForm;