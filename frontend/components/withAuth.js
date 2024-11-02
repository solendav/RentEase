import React, { useState, useCallback } from "react";
import { Alert, View, Text } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const navigation = useNavigation();

    const checkAuth = useCallback(async () => {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        Alert.alert(
          "Authentication Required",
          "You need to be logged in to access this page.",
          [
            {
              text: "Login",
              onPress: () => navigation.navigate("SignIn"),
            },
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => navigation.navigate("Home"),
            },
          ]
        );
      }
    }, [navigation]);

    useFocusEffect(
      useCallback(() => {
        checkAuth();
      }, [checkAuth])
    );

    if (isAuthenticated === null) {
      return (
        <View>
          <Text>"Loading..."</Text>
        </View>
      );
    }

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };
};

export default withAuth;
