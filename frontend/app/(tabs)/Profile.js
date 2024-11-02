import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import withAuth from './../../components/withAuth'
const fetchProfile = async (userId) => {
  try {
    const response = await fetch(
      `http://10.139.167.195:8000/api/profile/user/${userId}`
    );
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch Profile:", error);
    return null;
  }
};

const ProfileDetail = ({ profile }) => {
  return (
    <View style={styles.profileDetail}>
      <Text style={styles.label}>First Name:</Text>
      <Text style={styles.text}>{profile.first_name || "N/A"}</Text>

      <Text style={styles.label}>Middle Name:</Text>
      <Text style={styles.text}>{profile.middle_name || "N/A"}</Text>

      <Text style={styles.label}>Last Name:</Text>
      <Text style={styles.text}>{profile.last_name || "N/A"}</Text>

      <Text style={styles.label}>Phone Number:</Text>
      <Text style={styles.text}>{profile.phoneNumber || "N/A"}</Text>

      <Text style={styles.label}>Address:</Text>
      <Text style={styles.text}>{profile.address || "N/A"}</Text>

      <Text style={styles.label}>Birth Date:</Text>
      <Text style={styles.text}>
        {profile.birth_date
          ? new Date(profile.birth_date).toDateString()
          : "N/A"}
      </Text>
    </View>
  );
};

const MyProfile = () => {
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync("user_id");
        console.log("Stored User ID:", storedUserId); // Log stored user ID
        if (storedUserId) {
          setUserId(storedUserId);
          const fetchedProfile = await fetchProfile(storedUserId);
          console.log("Fetched Profile:", fetchedProfile); // Log fetched profile
          setProfile(fetchedProfile);
        }
      } catch (error) {
        console.error("Failed to get user ID from SecureStore:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserId();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {profile ? (
        <ProfileDetail profile={profile} />
      ) : (
        <View style={styles.centered}>
          <Text style={styles.noProfileText}>No profile data found</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  profileDetail: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  text: {
    fontSize: 14,
    color: "#666666",
    marginVertical: 2,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noProfileText: {
    fontSize: 18,
    color: "#999999",
  },
});

export default withAuth(MyProfile);
