import React, {  useEffect, useState, useRef,useCallback, useReducer } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { Colors } from "./../../constants/Colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import CheckBox from "expo-checkbox";
import * as SecureStore from "expo-secure-store";

const SignUp = () => {
  const [step, setStep] = useState(1); // Track which step the user is on
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [terms, setTerms] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const router =useRouter();
  const scrollViewRef = useRef(null);
  const { agree } = route.params;

  useFocusEffect(
    useCallback(() => {
      setStep(1);
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("");
      setVerificationCode("");
      setTermsAccepted(agree === true); // Set termsAccepted if agree is true
    }, [agree])
  );
  
  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword || !role) {
      Alert.alert("Validation Error", "All fields must be filled out.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "https://renteasebackend-orna.onrender.com/initiateSignUp",
        {
          user_name: username,
          email,
          password,
          role,
        }
      );
      Alert.alert("Registration Initiated", response.data.message);
      setStep(2); // Move to the verification step
    } catch (error) {
      console.error(
        "Sign Up initiation failed",
        error.response?.data || error.message
      );
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message ||
          "An error occurred during registration initiation."
      );
    }
  };
  


  const handleVerification = async () => {
    if (!verificationCode) {
      Alert.alert("Validation Error", "Please enter the verification code.");
      return;
    }

    try {
      const response = await axios.post(
        "https://renteasebackend-orna.onrender.com/verifyAndCreateUser",
        {
          email,
          code: verificationCode,
        }
      );

      Alert.alert("Verification Successful", response.data.message);
      router.push("/auth/SignIn");
    } catch (error) {
      console.error(
        "Verification failed",
        error.response?.data || error.message
      );
      Alert.alert(
        "Verification Failed",
        error.response?.data?.message ||
          "An error occurred during verification."
      );
    }
  };
 
 

  return (
    <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>
      {step === 1 && (
        <>
          <Text style={styles.title}>Sign Up</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor={Colors.GRAY}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              placeholderTextColor={Colors.GRAY}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                placeholderTextColor={Colors.GRAY}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={24}
                  color={Colors.GRAY}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor={Colors.GRAY}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={showConfirmPassword ? "visibility" : "visibility-off"}
                  size={24}
                  color={Colors.GRAY}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Role</Text>
            <Picker
              selectedValue={role}
              onValueChange={(itemValue) => setRole(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select a role" value="" />
              <Picker.Item label="Tenant" value="1" />
              <Picker.Item label="Owner" value="2" />
              <Picker.Item label="Both" value="3" />
            </Picker>
          </View>
          <View style={styles.termsContainer}>
            <CheckBox
              value={termsAccepted}
              onValueChange={setTermsAccepted}
              color={termsAccepted ? Colors.PRIMARY : "#e0e0e0"}
            />
            <TouchableOpacity
             onPress={() => navigation.navigate('TermsAndCondition')}
              style={styles.termsTextContainer}
            >
              <Text style={styles.termsText}>I accept the </Text>
              <Text style={styles.termsLink}>Terms and Conditions</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSignUp}
            style={[
              styles.button,
              { backgroundColor: termsAccepted ? Colors.PRIMARY : "#9E9E9E" },
            ]}
            disabled={!termsAccepted}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.title}>Verify Your Account</Text>

          <TextInput
            value={verificationCode}
            onChangeText={setVerificationCode}
            style={styles.input}
            placeholder="Enter the verification code"
            
            placeholderTextColor={Colors.GRAY}
          />

          <TouchableOpacity onPress={handleVerification} style={styles.button}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: Colors.PRIMARY,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    padding: 15,
    borderColor: "#D0D0D0",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
  },
  passwordContainer: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  picker: {
    borderColor: "#D0D0D0",
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
    backgroundColor: "#FFFFFF",
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingLeft: 20,
  },
  termsTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  termsText: {
    fontSize: 16,
    marginLeft: 8,
  },
  termsLink: {
    fontSize: 16,
    color: "blue", // Change color to indicate a link
    textDecorationLine: "underline", // Underline the text to make it look like a link
  },
});

export default SignUp;
