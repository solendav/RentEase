import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer"; // Ensure correct import
import { ThemeContext } from "./../contexts/ThemeContext"; // Import ThemeContext
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
const fetchProfile = async (userId) => {
  try {
    const response = await axios.get(
      `https://renteasebackend-orna.onrender.com/api/profile/userown/${userId}`
    );
    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.log("Failed to fetch Profile:", error);
    return null;
  }
};

const CustomDrawerContent = (props) => {
  const navigation = useNavigation();
  const { theme, toggleTheme } = React.useContext(ThemeContext); // Use ThemeContext
  const [profilePicture, setProfilePicture] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const storedUserId = await SecureStore.getItemAsync("user_id");
      if (storedUserId) {
        const fetchedProfile = await fetchProfile(storedUserId);
        if (fetchedProfile) {
          setProfilePicture(
            fetchedProfile.profile_picture
              ? `https://renteasebackend-orna.onrender.com/uploads/${fetchedProfile.profile_picture}`
              : null
          );
          setUsername(
            `${fetchedProfile.first_name} ${fetchedProfile.last_name}`
          );
        } else {
          setProfilePicture(null);
          setUsername("Username");
        }
      } else {
        setProfilePicture(null);
        setUsername("Username");
      }
    } catch (error) {
      console.log("Failed to get user profile:", error);
      
    } finally {
      setLoading(false);
    }
  }, [refreshKey]);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  useEffect(() => {
    loadProfileData();
  }, [refreshKey]);

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("username");
      await SecureStore.deleteItemAsync("user_id");
      await SecureStore.deleteItemAsync("themes");
      // Clear profile data
      setProfilePicture(null);
      setUsername("Username");

      Alert.alert("Logout", "Logged out successfully.");

      // Reset the navigation stack and navigate to the Home screen
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }], // Ensure "Home" matches your route name
      });
    } catch (error) {
      console.log("Logout error", error);
     
    }
  };

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

  const showPhotoOptions = () => {
    Alert.alert(
      "Change Profile Picture",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: handleTakePhoto,
        },
        {
          text: "Gallery",
          onPress: handleChoosePhoto,
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: theme === "dark" ? "#000" : "#fff" },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={theme === "dark" ? "#fff" : "#000"}
        />
      </View>
    );
  }



  return (
    <View style={{ flex: 1 }}>
    <DrawerContentScrollView
      {...props}
      
      contentContainerStyle={{
        backgroundColor: theme === "dark" ? "#161515" : "#fff",
      }}
    >
      <View
        style={[
          styles.drawerHeader,
          { backgroundColor: theme === "dark" ? "#161515" : "#fff" },
        ]}
      >
        <View style={styles.profileContainer}>
          <TouchableOpacity
            onPress={showPhotoOptions}
            style={styles.profilePictureContainer}
          >
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                style={styles.profilePicture}
                onError={(e) =>
                  console.error("Failed to load image:", e.nativeEvent.error)
                }
              />
            ) : (
              <View style={[styles.profilePicture, styles.iconContainer]}>
                <Ionicons
                  name="person"
                  size={50}
                  color={theme === "dark" ? "#ccc" : "#333"}
                />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.cameraIcon,
              { backgroundColor: theme === "dark" ? "#555" : "#ddd" },
            ]}
            onPress={showPhotoOptions}
          >
            <Ionicons name="camera" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Text
          style={[
            styles.username,
            { color: theme === "dark" ? "#fff" : "#000" },
          ]}
        >
          {username}
        </Text>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Login"
        labelStyle={{ color: theme === "dark" ? "#ccc" : "#000" }} // Dynamic label color
        icon={() => (
          <Ionicons
            name="log-in"
            size={20}
            color={theme === "dark" ? "#ccc" : "#000"}
          />
        )}
        onPress={() => router.push("/auth/SignIn")} // Assuming navigation.navigate("SignIn")
        rightIcon={() => (
          <Ionicons
            name="arrow-forward"
            size={20}
            color={theme === "dark" ? "#ccc" : "#000"}
          />
        )}
      />
      <DrawerItem
        label="Logout"
        labelStyle={{ color: theme === "dark" ? "#ccc" : "#000" }} // Dynamic label color
        icon={() => (
          <Ionicons
            name="log-out"
            size={20}
            color={theme === "dark" ? "#ccc" : "#000"}
          />
        )}
        onPress={handleLogout}
        rightIcon={() => (
          <Ionicons
            name="arrow-forward"
            size={20}
            color={theme === "dark" ? "#ccc" : "#000"}
          />
        )}
        style={styles.logoutItem}
      />
    </DrawerContentScrollView>
    <View style={styles.footer}>
        <DrawerItem
          label="About Us"
          labelStyle={{ color: "#ccc", fontSize:20,fontWeight:"bold"}} // Dynamic label color
          icon={() => (
            <Ionicons
              name="information-circle"
              size={20}
              color={"#ccc" }
            />
          )}
          onPress={() => navigation.navigate("AboutUs")} // Navigate to About Us page
          style={styles.aboutUsItem} // Add style if needed
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerHeader: {
    alignItems: "center",
    padding: 16,
  },
  profileContainer: {
    position: "relative",
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  profilePictureContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderRadius: 50,
    padding: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutItem: {
    marginTop: "auto",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
    backgroundColor: "#e0e0e0",
  },
  footer: {
    backgroundColor:Colors.PRIMARY,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
   
  },
  aboutUsItem: {
    marginTop: 0,
  },
});

export default CustomDrawerContent;
