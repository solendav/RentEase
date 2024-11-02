import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ThemeContext } from "./../app/contexts/ThemeContext";
import { Colors } from "./../constants/Colors";
import Header from "../components/Header";

const EditProfile = () => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState(new Date());
  const [profilePicture, setProfilePicture] = useState(null);
  const [idImage, setIdImage] = useState(null);
  const [userId, setUserId] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchUserIdAndProfileData = async () => {
      try {
        const id = await SecureStore.getItemAsync("user_id");
        if (id) {
          setUserId(id);
          // Fetch profile data
          const response = await axios.get(
            `https://renteasebackend-orna.onrender.com/api/profile/${id}`
          );
          const profileData = response.data;

          // Set the state with the existing profile data
          setFirstName(profileData.first_name || "");
          setMiddleName(profileData.middle_name || "");
          setLastName(profileData.last_name || "");
          setPhoneNumber(profileData.phoneNumber || "");
          setAddress(profileData.address || "");
          setBirthDate(
            profileData.birth_date
              ? new Date(profileData.birth_date)
              : new Date()
          );
          setProfilePicture(
            profileData.profile_picture
              ? `https://renteasebackend-orna.onrender.com/uploads/${profileData.profile_picture}`
              : null
          );
          setIdImage(
            profileData.id_image
              ? `https://renteasebackend-orna.onrender.com/uploads/${profileData.id_image}`
              : null
          );
        } else {
          Alert.alert("Error", "User ID is missing.");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        Alert.alert("Error", "Failed to load profile data.");
      }
    };

    fetchUserIdAndProfileData();
  }, []);

  const handleChoosePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handlePhotoOptions = async (option) => {
    if (option === "gallery") {
      await handleChoosePhoto();
    } else if (option === "camera") {
      await handleTakePhoto();
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const pickImage = async (type) => {
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
      if (type === "profile") {
        setProfilePicture(result.assets[0].uri);
      } else if (type === "id") {
        setIdImage(result.assets[0].uri);
      }
    }
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID is missing.");
      return;
    }

    if (
      !firstName ||
      !middleName ||
      !lastName ||
      !phoneNumber ||
      !address ||
      !birthDate
    ) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("first_name", firstName);
    formData.append("middle_name", middleName);
    formData.append("last_name", lastName);
    formData.append("phoneNumber", phoneNumber);
    formData.append("address", address);
    formData.append("birth_date", birthDate.toISOString());

    if (profilePicture) {
      formData.append("profile_picture", {
        uri: profilePicture,
        name: profilePicture.split("/").pop(),
        type: "image/jpeg",
      });
    }

    if (idImage) {
      formData.append("id_image", {
        uri: idImage,
        name: idImage.split("/").pop(),
        type: "image/jpeg",
      });
    }

    try {
      const response = await axios.patch(
        `https://renteasebackend-orna.onrender.com/api/profileedit/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      Alert.alert('Success', response.data.message);
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
    
  };

  const styles = StyleSheet.create({
    maincontainer: {
      flexGrow: 1,
     
      backgroundColor: theme === "dark" ? Colors.BLACK : "#fff",
    },
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: theme === "dark" ? Colors.BLACK : " ",
    },
    inputContainer: {
      marginBottom: 15,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme === "dark" ? Colors.PRIMARY : Colors.PRIMARY,
    },
    ilabel: {
      fontSize: 16,
      fontWeight: "bold",
      color: Colors.GRAY,
    },
    input: {
      height: 40,
      borderColor: theme === "dark" ? Colors.GRAY : Colors.GRAY,
      borderBottomWidth: 1,
      color: theme === "dark" ? Colors.GRAY : Colors.GRAY,
      paddingHorizontal: 10,
    },
    datePicker: {
      padding: 10,
      borderColor: Colors.GRAY,
      borderBottomWidth: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    datePickerText: {
      fontSize: 16,
      color: theme === "dark" ? Colors.WHITE : Colors.BLACK,
    },
    dateText: {
      fontSize: 16,
      marginTop: 10,
      color: theme === "dark" ? Colors.WHITE : Colors.BLACK,
    },
    imagePickerContainer: {
      marginBottom: 15,
    },
    imagePicker: {
      padding: 10,
      borderColor: Colors.GRAY,
      borderBottomWidth: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    image: {
      width: "100%",
      height: 200,
      borderRadius: 5,
    },
    button: {
      backgroundColor: Colors.PRIMARY,
      padding: 15,
      borderRadius: 5,
      alignItems: "center",
      marginBottom: 80,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
    },
    drawerHeader: {
      alignItems: "center",
      padding: 16,
    },
    profileContainer: {
      position: "relative",
      width: 80,
      height: 80,
      borderRadius: 40,
      overflow: "hidden",
      alignSelf: "center",
    },
    profileImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    photoOptionsButton: {
      marginTop: 10,
      padding: 10,
      backgroundColor: Colors.PRIMARY,
      borderRadius: 5,
    },
    photoOptionsText: {
      color: "#fff",
      textAlign: "center",
    },
    cancelButton: {
      backgroundColor: Colors.DANGER,
      padding: 10,
      borderRadius: 5,
    },
    cancelButtonText: {
      color: "#fff",
      textAlign: "center",
    },
  });

  return (
    <View style={styles.maincontainer}>
      <Header title="Edit Profile" />
    <ScrollView contentContainerStyle={styles.container}>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>First Name:</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Middle Name:</Text>
        <TextInput
          style={styles.input}
          value={middleName}
          onChangeText={setMiddleName}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Last Name:</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number:</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Address:</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />
      </View>
      <Pressable
        style={styles.datePicker}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.datePickerText}>Birth Date</Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Text style={styles.dateText}>{birthDate.toDateString()}</Text>
      <View style={styles.imagePickerContainer}>
        <Text style={styles.ilabel}>Profile Picture:</Text>
        {profilePicture && (
          <Image source={{ uri: profilePicture }} style={styles.image} />
        )}
        <TouchableOpacity
          onPress={() => pickImage("profile")}
          style={styles.photoOptionsButton}
        >
          <Text style={styles.photoOptionsText}>Choose Profile Picture</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.imagePickerContainer}>
        <Text style={styles.ilabel}>ID Image:</Text>
        {idImage && <Image source={{ uri: idImage }} style={styles.image} />}
        <TouchableOpacity
          onPress={() => pickImage("id")}
          style={styles.photoOptionsButton}
        >
          <Text style={styles.photoOptionsText}>Choose ID Image</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
};

export default EditProfile;
