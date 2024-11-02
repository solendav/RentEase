import React, { useState, useCallback } from "react";
import { Alert, View, Text } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const withRoleAccess = (WrappedComponent, requiredRoles) => {
  return (props) => {
    const [hasAccess, setHasAccess] = useState(null);
    const navigation = useNavigation();

    const checkRole = useCallback(async () => {
      try {
        const userRole = await SecureStore.getItemAsync("role");
        if (userRole && requiredRoles.includes(userRole)) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
          Alert.alert(
            "Access Denied",
            "You do not have the required permissions to access this page.",
            [
              {
                text: "Update Role",
                onPress: () => navigation.navigate("Settings"),
              },
              {
                text: "Cancel",
                onPress: () => navigation.navigate("Home"),
              },
            ]
          );
        }
      } catch (error) {
        console.error("Role check error:", error);
        setHasAccess(false);
      }
    }, [navigation, requiredRoles]);

    useFocusEffect(
      useCallback(() => {
        checkRole();
      }, [checkRole])
    );

    if (hasAccess === null) {
      return (
        <View>
          <Text>Loading...</Text>
        </View>
      );
    }

    return hasAccess ? <WrappedComponent {...props} /> : null;
  };
};

export default withRoleAccess;
