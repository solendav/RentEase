import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";

// Import your components here
import TenantComponent from "./cate";
import OwnerComponent from "./MyBookingOwner";
import BothComponent from "./bothRental";

const RoleBasedPage = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch role from SecureStore
  const fetchRole = async () => {
    try {
      const storedRole = await SecureStore.getItemAsync("role");
      if (storedRole) {
        setRole(parseInt(storedRole, 10));
      }
    } catch (error) {
      console.error("Failed to fetch role:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Render based on the role
  switch (role) {
    case 1:
      return <TenantComponent />;
    case 2:
      return <OwnerComponent />;
    case 3:
      return <BothComponent />;
    default:
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Invalid role r not assigned.</Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#f44336",
  },
});

export default RoleBasedPage;
