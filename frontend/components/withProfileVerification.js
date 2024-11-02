import React, { useState, useCallback } from "react";
import { Alert, View, Text } from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const withProfileVerification = (WrappedComponent) => {
  return (props) => {
    const [isVerified, setIsVerified] = useState(null);
    const navigation = useNavigation();

    const checkProfileVerification = useCallback(async () => {
      try {
        const userId = await SecureStore.getItemAsync("user_id");
        if (userId) {
          const response = await axios.get(
            `https://renteasebackend-orna.onrender.com/api/profile/user/${userId}`
          );

          // Assuming response.data is an array and you need to check its length
          if (response.data.length === 0) {
            // If no profile is found, show the dialog box
            setIsVerified(false);
            Alert.alert(
              "Profile Not Verified",
              "Your profile is not verified. Please complete the verification process.",
              [
                {
                  text: "Go to Profile",
                  onPress: () => navigation.navigate("Profiles"),
                },
                {
                  text: "Cancel",
                  onPress: () => navigation.navigate("Home"),
                },
              ]
            );
          } else {
            setIsVerified(true);
          }
        } else {
          
          setIsVerified(false);
        }
      } catch (error) {
       
        setIsVerified(false);
      }
    }, [navigation]);

    useFocusEffect(
      useCallback(() => {
        checkProfileVerification();
      }, [checkProfileVerification])
    );

    if (isVerified === null) {
      return (
        <View>
          <Text>Loading...</Text>
        </View>
      );
    }

    return isVerified ? <WrappedComponent {...props} /> : null;
  };
};

export default withProfileVerification;
