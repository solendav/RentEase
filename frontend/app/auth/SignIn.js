import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import the eye icon
import { Colors } from "../../constants/Colors";
import Header from "../../components/Header";
import { ThemeContext } from "./../contexts/ThemeContext";
const SignIn = () => {
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Manage password visibility
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const { theme } = useContext(ThemeContext);
  
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const handleSignIn = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://renteasebackend-orna.onrender.com/signIn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: username,
          password,
        }),
      });

      const result = await response.json();
      console.log("Sign In Result:", result);

      if (response.ok) {
        const userId = String(result.user._id);
        const role = String(result.user.role);
        const themes = String(result.user.themes);
        await SecureStore.setItemAsync("token", result.token);
        await SecureStore.setItemAsync("username", username);
        await SecureStore.setItemAsync("user_id", userId);
        await SecureStore.setItemAsync("role", role);
        await SecureStore.setItemAsync("themes", themes);
        Alert.alert("Success", "Logged in successfully!");
        router.push("/Home");
      } else {
        Alert.alert(
          "Error",
          result.message || "Login failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Sign In error", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://renteasebackend-orna.onrender.com/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        throw new Error("Response was not valid JSON");
      }
      if (response.ok) {
        Alert.alert("Success", result.message);
        setIsResetPassword(true);
      } else {
        Alert.alert("Error", result.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Forgot Password error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email || !otp || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://renteasebackend-orna.onrender.com/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp, newPassword }),
        }
      );

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        throw new Error("Response was not valid JSON");
      }

      if (response.ok) {
        Alert.alert("Success", result.message);
        setIsForgotPassword(false);
        setIsResetPassword(false);
      } else {
        Alert.alert("Error", result.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Reset Password error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      backgroundColor: "#fff",
      backgroundColor: theme === "dark" ? Colors.BLACK : "",
    },
    formContainer: {
      backgroundColor: theme === "dark" ? "#333" : "#f9f9f9",
      padding: 20,
      borderRadius: 10,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      marginVertical: 40,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
      color: Colors.PRIMARY,
    },
    input: {
      height: 50,
      borderColor: theme === "dark" ? Colors.GRAY : Colors.GRAY,
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 15,
      marginBottom: 15,
      color: theme === "dark" ? Colors.WHITE : Colors.BLACK,
    },
    passwordContainer: {
      position: "relative",
    },
    eyeIcon: {
      position: "absolute",
      right: 15,
      top: 15,
    },
    button: {
      backgroundColor: Colors.PRIMARY,
      paddingVertical: 15,
      borderRadius: 5,
      alignItems: "center",
    },
    buttonLoading: {
      backgroundColor: Colors.GRAY,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    switchButton: {
      marginTop: 10,
      alignItems: "center",
    },
    switchText: {
      color: Colors.PRIMARY,
      fontSize: 16,
    },
    signupButton: {
      marginTop: 20,
      alignItems: "center",
    },
    signupText: {
      color: Colors.PRIMARY,
      fontSize: 16,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="" />
      <View style={styles.formContainer}>
        {isForgotPassword ? (
          !isResetPassword ? (
            <View>
              <Text style={styles.title}>Forgot Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.GRAY}
              />
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={[styles.button, isLoading && styles.buttonLoading]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Email</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsForgotPassword(false)}
                style={styles.switchButton}
              >
                <Text style={styles.switchText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.title}>Reset Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Reset Password Token"
                value={otp}
                onChangeText={setOtp}
                placeholderTextColor={Colors.GRAY}
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  secureTextEntry={!isNewPasswordVisible}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholderTextColor={Colors.GRAY}
                />
                <TouchableOpacity
                  onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={
                      isNewPasswordVisible ? "visibility" : "visibility-off"
                    }
                    size={24}
                    color={Colors.PRIMARY}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  secureTextEntry={!isConfirmPasswordVisible}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholderTextColor={Colors.GRAY}
                />
                <TouchableOpacity
                  onPress={() =>
                    setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                  }
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={
                      isConfirmPasswordVisible ? "visibility" : "visibility-off"
                    }
                    size={24}
                    color={Colors.PRIMARY}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleResetPassword}
                style={[styles.button, isLoading && styles.buttonLoading]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsForgotPassword(false)}
                style={styles.switchButton}
              >
                <Text style={styles.switchText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View>
            <Text style={styles.title}>Sign In</Text>
            <TextInput
              style={styles.input}
              placeholder="Username or Email"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor={Colors.GRAY}
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor={Colors.GRAY}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={isPasswordVisible ? "visibility" : "visibility-off"}
                  size={24}
                  color={Colors.PRIMARY}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleSignIn}
              style={[styles.button, isLoading && styles.buttonLoading]}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsForgotPassword(true)}
              style={styles.switchButton}
            >
              <Text style={styles.switchText}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/auth/SignUp")}
              style={styles.signupButton}
            >
              <Text style={styles.signupText}>
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default SignIn;
