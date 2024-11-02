import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Header from "./../components/Header";
import Icon from "react-native-vector-icons/MaterialIcons";
import withAuth from "./../components/withAuth";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "./../app/contexts/ThemeContext"; // Adjust the path as needed
import { Colors } from "./../constants/Colors"; // Assuming you have a Colors file for standard colors
import RotatingDotsLoader from "./../components/RotatingDotsLoader";
const fetchProfile = async (userId) => {
  try {
    const response = await axios.get(
      `https://renteasebackend-orna.onrender.com/api/profile/userown/${userId}`
    );

    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error("Failed to fetch Profile:", error);
    return null;
  }
};

const ProfileDetail = ({ profile }) => {
  const [scaleValue] = useState(new Animated.Value(0));
  const { theme } = useContext(ThemeContext); // Access the theme

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.profileDetail,
        {
          transform: [{ scale: scaleValue }],
          backgroundColor: theme === "dark" ? Colors.BLACK : "#fff", // Conditionally apply background color
          shadowColor: theme === "dark" ? Colors.GRAY : Colors.GRAY, // Conditionally apply shadow color
        },
      ]}
    >
      <View style={styles.imageContainer}>
        {profile.profile_picture ? (
          <View style={styles.profilePictureContainer}>
            <Image
              source={{
                uri: `https://renteasebackend-orna.onrender.com/uploads/${profile.profile_picture}`,
              }}
              style={styles.profileImage}
              onError={(e) =>
                console.error("Failed to load image:", e.nativeEvent.error)
              }
            />
            {profile.verification === "verified" ? (
              <Icon
                name="verified"
                size={28}
                color={theme === "dark" ? Colors.PRIMARY : Colors.PRIMARY} // Conditionally apply icon color
                style={styles.verifiedIcon}
              />
            ) : (
              <Text style={{color:"red"}}>Not Verified</Text>
            )}
          </View>
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Icon
              name="person"
              size={50}
              color={theme === "dark" ? Colors.GRAY : Colors.GRAY}
            />
          </View>
        )}
      </View>

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.nameText,
            { color: theme === "dark" ? Colors.WHITE : Colors.BLACK },
          ]}
        >
          {profile.first_name} {profile.last_name}
        </Text>
        <Text
          style={[
            styles.infoText,
            { color: theme === "dark" ? Colors.PRIMARY : Colors.PRIMARY },
          ]}
        >
          {profile.phoneNumber}
        </Text>
        <Text
          style={[
            styles.infoText,
            { color: theme === "dark" ? Colors.PRIMARY : Colors.PRIMARY },
          ]}
        >
          {profile.address}
        </Text>
      </View>

      {profile.id_image && (
        <View style={styles.idImageContainer}>
          <Text
            style={[
              styles.label,
              { color: theme === "dark" ? Colors.WHITE : Colors.BLACK },
            ]}
          >
            ID Image
          </Text>
          <Image
            source={{
              uri: `https://renteasebackend-orna.onrender.com/uploads/${profile.id_image}`,
            }}
            style={styles.idImage}
            onError={(e) =>
              console.error("Failed to load ID image:", e.nativeEvent.error)
            }
          />
        </View>
      )}
    </Animated.View>
  );
};

const Profiles = () => {
  const { theme } = useContext(ThemeContext); // Access the theme
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync("user_id");
        if (storedUserId) {
          setUserId(storedUserId);
          const fetchedProfile = await fetchProfile(storedUserId);
          setProfile(fetchedProfile);
        }
      } catch (error) {
        console.error("Failed to get user ID from SecureStore:", error);
        setError("Failed to get user ID.");
      } finally {
        setLoading(false);
      }
    };

    getUserId();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const handleEditProfile = () => {
    navigation.navigate("EditProfile", { userId });
  };

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: "red" }]}>{error}</Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          backgroundColor: theme === "dark" ? Colors.BLACK : "#fff",
        },
      ]}
    >
      <Header title="Profile" />
      <TouchableOpacity
        style={[
          styles.editIcon,
          {
            backgroundColor: Colors.PRIMARY,
          },
        ]}
        onPress={handleEditProfile}
      >
        <Animated.View style={{ transform: [{ scale: fadeAnim }] }}>
          <Icon name="edit" size={28} color={Colors.WHITE} />
        </Animated.View>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {profile ? (
          <ProfileDetail profile={profile} />
        ) : (
          <View style={styles.centered}>
            <Text
              style={[
                styles.noProfileText,
                {
                  color: theme === "dark" ? Colors.GRAY : Colors.GRAY,
                },
              ]}
            >
              No profile data found
            </Text>
          </View>
        )}
      </ScrollView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <RotatingDotsLoader />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingTop: 20,
  },
  profileDetail: {
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  profilePictureContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignSelf: "center",
    marginBottom: 15,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 16,
  },
  idImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginVertical: 10,
  },
  idImageContainer: {
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noProfileText: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  editIcon: {
    position: "absolute",
    top: 100,
    right: 20,
    padding: 10,
    borderRadius: 50,
    zIndex: 1000,
    elevation: 5,
  },
  verifiedIcon: {
    position: "absolute",
    top: 5,
    right: 100,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 3,
    elevation: 2,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Make it completely transparent
    zIndex: 100, // Ensure it's on top
  },
});

export default withAuth(Profiles);
