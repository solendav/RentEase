import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Button,
  Linking,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import axios from "axios";
import { useRoute, useIsFocused } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import PasswordModal from "./PasswordModel"; // Ensure this matches your file name
import { Card, Menu, IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import withAuth from './../../components/withAuth'
import withProfileVerification from "../../components/withProfileVerification";
import RotatingDotsLoader from './../../components/RotatingDotsLoader'; 
import { Colors } from "../../constants/Colors";
const Wallet = () => {
  const [accountData, setAccountData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [modalVisible, setModalVisible] = useState(true); // Initially show modal for password
  const [sessionStart, setSessionStart] = useState(Date.now()); // Track session start time
  const [activeSection, setActiveSection] = useState(""); // Track active section
  const [amount, setAmount] = useState("");
  const [gateway, setGateway] = useState("Chapa");
  const [accountNumber, setAccountNumber] = useState("");
  const navigation = useNavigation(); // For navigation
  const scrollViewRef = useRef(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [isDepositVisible, setIsDepositVisible] = useState(false);
  const route = useRoute();
  const isFocused = useIsFocused();
  const [routeParams, setRouteParams] = useState({
    newprice: null,
    accountnum: null,
    bookingId: null,
  });
  const [isVisible, setIsVisible] = useState(false);
  const toggleMenu = () => {
    setIsVisible(!isVisible);
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const toggleDepositVisibility = () => {
    setIsDepositVisible(!isDepositVisible);
  };
  React.useEffect(() => {
    if (!isFocused) {
      // Reset parameters when navigating away
      setRouteParams({
        newprice: null,
        accountnum: null,
        bookingId: null,
      });
      setActiveSection("");
    }
  }, [isFocused]);
  useEffect(() => {
    if (route.params) {
      const { newprice, accountnum, bookingId } = route.params;
      if (newprice && accountnum) {
        setRouteParams({ newprice, accountnum, bookingId });
        setActiveSection("transfer");
      }
    }
  }, [route.params]);

  const Transferhandling = () => {
    // Check routeParams before proceeding
    if (routeParams.newprice === null || routeParams.accountnum === null) {
      Alert.alert("Transfer", "To Transfer balance first book the property.");
      return;
    } else {
      setActiveSection("transfer");
    }

    // Proceed with transfer logic

    // Add your transfer logic here
  };
  const fetchAccountData = async (userId) => {
    try {
      const response = await axios.get(
        `https://renteasebackend-orna.onrender.com/api/account/${userId}`
      );
      setAccountData(response.data);
    } catch (err) {
      setError("Error fetching account data");
      console.error("Fetch account data error:", err);
    }
  };

  const fetchProfileData = async (userId) => {
    try {
      const response = await axios.get(
         `https://renteasebackend-orna.onrender.com/api/profile/user/${userId}`
      );
      const fetchedUserName = response.data.first_name || "User";
      setProfileData(response.data);
      setUserName(fetchedUserName);
    } catch (err) {
      setError("Error fetching profile data");
      console.error("Fetch profile data error:", err);
      if (err.response && err.response.status === 404) {
        setError("Profile not found");
      }
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        setError("User ID is missing.");
        setLoading(false);
        return;
      }

      await fetchAccountData(userId);
      await fetchProfileData(userId);
      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  const handlePasswordVerified = () => {
    fetchData(); // Fetch data after password is verified
    setModalVisible(false); // Hide the password modal
  };

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      // Validate input
      if (!amount || parseFloat(amount) <= 0) {
        Alert.alert("Error", "Please enter a valid amount.");
        return;
      }

      // Get user ID from SecureStore
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        Alert.alert("Error", "User ID is missing.");
        return;
      }

      // Send withdrawal request to the server
      const response = await axios.post("https://renteasebackend-orna.onrender.com/withdraw", {
        userId,
        amount,
        paymentGateway: gateway,
      });

      const { message, payment_url } = response.data;

      // Handle success response
      if (response.status === 200) {
        Alert.alert("Success", message, [
          {
            text: "OK",
            onPress: async () => {
              // Refetch account data
              await fetchAccountData(userId);
              setAmount(""); // Clear amount field
              if (payment_url) {
                // Redirect to the payment URL (Open in browser or WebView)
                Linking.openURL(payment_url).catch((err) =>
                  console.error("Failed to open URL:", err)
                );
              }
            },
          },
        ]);
      } else {
        Alert.alert("Error", message || "Failed to initiate withdrawal.");
      }
      setLoading(false);
    } catch (error) {
      Alert.alert(
        "Error",
        "An error occurred while processing your withdrawal."
      );
      console.error("Withdraw Error:", error.message);
    }
  };

  const handleDeposit = async () => {
    setLoading(true);
    try {
      // Validate input
      if (!amount || parseFloat(amount) <= 0) {
        Alert.alert("Error", "Please enter a valid amount.");
        return;
      }

      // Get user ID from SecureStore
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        Alert.alert("Error", "User ID is missing.");
        return;
      }

      // Send deposit request to the server
      const response = await axios.post("https://renteasebackend-orna.onrender.com/deposit", {
        userId,
        amount,
      });

      const { payment_url, balance } = response.data;

      // Handle success response
      if (payment_url) {
        Alert.alert("Deposit Successful", `Your balance is now ${balance}.`, [
          {
            text: "OK",
            onPress: async () => {
              // Refetch account data
              await fetchAccountData(userId);
              setAmount(""); // Clear amount field
            },
          },
        ]);

        // Redirect to the payment URL (Open in browser or WebView)
        Linking.openURL(payment_url).catch((err) =>
          console.error("Failed to open URL:", err)
        );
      } else {
        Alert.alert("Error", "Failed to initiate deposit.");
      }
      setLoading(false);
    } catch (error) {
      console.error("Deposit Error:", error.message);
      if (error.response) {
        // Server responded with a status other than 200 range
        Alert.alert(
          "Error",
          `Server responded with status ${error.response.status}: ${
            error.response.data.message || "Unknown error"
          }`
        );
      } else if (error.request) {
        // Request was made but no response was received
        Alert.alert("Error", "No response received from the server.");
      } else {
        // Something happened in setting up the request
        Alert.alert("Error", `Request error: ${error.message}`);
      }
    }
  };

  const handleTransfer = async () => {
    setLoading(true);
    try {
      // Use newprice and accountnum directly
      const { newprice, accountnum, bookingId } = routeParams; // Assuming routeParams contains these values

      console.log(
        "Amount:",
        newprice,
        "Account Number:",
        accountnum,
        "Account Number:",
        accountnum
      );

      if (!newprice || parseFloat(newprice) <= 0 || !accountnum) {
        Alert.alert("Error", "Please enter a valid amount and account number.");
        return;
      }

      // Get user ID from SecureStore
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        Alert.alert("Error", "User ID is missing.");
        return;
      }

      // Send transfer request to the server
      const response = await axios.post(
        "https://renteasebackend-orna.onrender.com/api/transfer",
        {
          fromAccountNo: accountData.account_no,
          toAccountNo: accountnum,
          amount: newprice,
          bookingId: bookingId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { message, balance } = response.data;

      // Handle success response
      if (response.status === 200) {
        Alert.alert("Success", message, [
          {
            text: "OK",
            onPress: () => {
              // Clear any required fields or states
              setActiveSection(""); // Hide section after submission
              // Update balance after transfer
              setAccountData((prevData) => ({ ...prevData, balance }));
            },
          },
        ]);
      } else {
        Alert.alert("Error", message || "Failed to complete the transfer.");
      }
      setLoading(false);
    } catch (error) {
      Alert.alert("Error", "An error occurred while processing your transfer.");
      console.error("Transfer Error:", error.message);
    }
  };
  const handleOwnDeposit = async () => {
    setLoading(true);
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        Alert.alert("Error", "User ID is missing.");
        return;
      }
      const response = await axios.put(
        `https://renteasebackend-orna.onrender.com/api/account/own-deposit/${userId}`,
        {
          transferAmount: amount,
        }
      );
      const { message, balance } = response.data;
      if (response.status === 200) {
        Alert.alert(
          "Deposit Successful",
          `Your transfer ${amount} to your deposit.`,
          [
            {
              text: "OK",
              onPress: async () => {
                // Refetch account data
                await fetchAccountData(userId);
                setAmount(""); // Clear amount field
              },
            },
          ]
        );
        // Optionally update the state with the new account data

        setActiveSection(""); // Close the transfer section
      } else {
        Alert.alert(
          "Transfer Failed",
          "An error occurred during the transfer."
        );
      }
      setLoading(false);
    } catch (error) {
      console.error("Transfer error:", error);
      Alert.alert("Transfer Failed", "An error occurred during the transfer.");
    }
  };
  const handleDepositToBalance = async () => {
    setLoading(true);
    try {
      const userId = await SecureStore.getItemAsync("user_id");

      if (!userId) {
        Alert.alert("Error", "User ID is missing.");
        return;
      }

      const response = await axios.put(
        `https://renteasebackend-orna.onrender.com/api/account/deposit-to-balance/${userId}`,
        {
          transferAmount: amount,
        }
      );

      if (response.status === 200) {
        const { message, balance } = response.data;
        Alert.alert(
          "Transfer Successful",
          `Your transfer of ${amount} to your balance was successful.`,
          [
            {
              text: "OK",
              onPress: async () => {
                // Refetch account data
                await fetchAccountData(userId);
                setAmount(""); // Clear amount field
              },
            },
          ]
        );
        // Optionally update the state with the new account data
        setActiveSection(""); // Close the transfer section
      } else {
        Alert.alert(
          "Transfer Failed",
          "An error occurred during the transfer."
        );
      }
      setLoading(false);
    } catch (error) {
      console.error("Transfer error:", error);
      Alert.alert("Transfer Failed", "An error occurred during the transfer.");
    }
  };

  useEffect(() => {
    if (modalVisible) {
      fetchData(); // Initial fetch
      const intervalId = setInterval(() => {
        const currentTime = Date.now();
        const inactiveTime = currentTime - sessionStart;
        if (inactiveTime > 5 * 60 * 1000) {
          // 5 minutes in milliseconds
          setModalVisible(true); // Show password modal after 5 minutes of inactivity
        }
      }, 1000); // Check every second

      return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }
  }, [modalVisible, sessionStart]);

  useEffect(() => {
    setSessionStart(Date.now()); // Update session start time on user action
  }, [modalVisible]);

  useEffect(() => {
    // Show the password modal when entering the Wallet page
    const unsubscribe = navigation.addListener("focus", () => {
      setModalVisible(true);
    });

    return unsubscribe; // Cleanup the listener
  }, [navigation]);

  
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
       <View style={styles.menucontainer}>
          <TouchableOpacity onPress={toggleMenu} style={styles.iconContainermunu}>
            <MaterialIcons name="more-vert" size={24} color="black" />
          </TouchableOpacity>
          {isVisible && (
            <View style={styles.menu}>
              <TouchableOpacity style={styles.menuItem}>
                <Text>Account Number  :{accountData?.account_no}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}
              onPress={()=>{navigation.navigate("WalletPassword")}}>
                <Text>Change Password</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        ref={scrollViewRef}
      >
       
        <View style={styles.headerContainer}>
          <Text style={styles.header}>RentEase Wallet</Text>
        </View>

        <Card style={styles.balanceCard}>
          <Card.Content>
            <View style={styles.cardContent}>
              <Text style={styles.balanceText}>
                Balance:{" "}
                {isBalanceVisible
                  ? `$${accountData.balance.toFixed(2)}`
                  : "******"}
                <MaterialIcons
                  name={isBalanceVisible ? "visibility" : "visibility-off"}
                  size={24}
                  color="#000"
                  onPress={toggleBalanceVisibility}
                  style={styles.iconButton}
                />
              </Text>
            </View>
            <View style={styles.depositContainer}>
              <Text style={styles.depositText}>
                Deposit:{" "}
                {isDepositVisible
                  ? `$${accountData.deposit.toFixed(2)}`
                  : "******"}
              </Text>
              <MaterialIcons
                name={isDepositVisible ? "visibility" : "visibility-off"}
                size={20}
                color="#000"
                onPress={toggleDepositVisibility}
                style={styles.depositIconButton}
              />
            </View>
          </Card.Content>
        </Card>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => setActiveSection("withdraw")}
          >
            <Ionicons name="arrow-down" size={40} color="#fff" />
            <Text style={styles.buttonText}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => setActiveSection("deposit")}
          >
            <Ionicons name="arrow-up" size={40} color="#fff" />
            <Text style={styles.buttonText}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => navigation.navigate("TransactionHistory")}
          >
            <Ionicons name="list" size={40} color="#fff" />
            <Text style={styles.buttonText}>Transaction History</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonsContainer2}>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => setActiveSection("owendeposit")}
          >
            <Ionicons name="list" size={40} color="#fff" />
            <Text style={styles.buttonText}>transfer to own deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => setActiveSection("withdrawdeposit")}
          >
            <Ionicons name="list" size={40} color="#fff" />
            <Text style={styles.buttonText}>Withdraw from deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={Transferhandling}
          >
            <Ionicons name="swap-horizontal" size={40} color="#fff" />
            <Text style={styles.buttonText}>Transfer</Text>
          </TouchableOpacity>
        </View>
        {activeSection === "withdraw" && (
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Withdraw Funds</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleWithdraw}
            >
              <Text style={styles.submitButtonText}>Withdraw</Text>
            </TouchableOpacity>
            <Button title="Cancel" onPress={() => setActiveSection("")} />
          </View>
        )}

        {activeSection === "deposit" && (
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Deposit Funds</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleDeposit}
            >
              <Text style={styles.submitButtonText}>Deposit</Text>
            </TouchableOpacity>
            <Button title="Cancel" onPress={() => setActiveSection("")} />
          </View>
        )}
        {activeSection === "owendeposit" && (
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Deposit Funds</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleOwnDeposit}
            >
              <Text style={styles.submitButtonText}>Own Deposit</Text>
            </TouchableOpacity>
            <Button title="Cancel" onPress={() => setActiveSection("")} />
          </View>
        )}
        {activeSection === "withdrawdeposit" && (
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Deposit Funds</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleDepositToBalance}
            >
              <Text style={styles.submitButtonText}>Own Deposit</Text>
            </TouchableOpacity>
            <Button title="Cancel" onPress={() => setActiveSection("")} />
          </View>
        )}

        {activeSection === "transfer" && (
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Transfer Funds </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter amount"
              value={routeParams.newprice?.toString() || ""}
              onChangeText={setAmount}
              multiline={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter account number"
              value={routeParams.accountnum || ""}
              onChangeText={setAccountNumber}
              multiline={false}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleTransfer}
            >
              <Text style={styles.submitButtonText}>Transfer</Text>
            </TouchableOpacity>
            <Button title="Cancel" onPress={() => setActiveSection("")} />
          </View>
        )}

        <PasswordModal
          visible={modalVisible}
          onPasswordVerified={handlePasswordVerified}
          onClose={() => setModalVisible(false)}
        />
           {/* Overlay for loading */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <RotatingDotsLoader />
        </View>
      )}
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "center",
    paddingBottom: 10,
    marginTop:10
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  balanceCard: {
    margin: 20,
    padding: 20,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",

    paddingBottom: 20,
  },
  balanceText: {
    fontSize: 20,
  },
  iconButton: {
    marginLeft: 10,
  },
  depositContainer: {
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    right: 10,
  },
  depositText: {
    fontSize: 16,
  },
  depositIconButton: {
    marginLeft: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonsContainer2: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  buttonWrapper: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 5,
    marginHorizontal: 5,
    // Remove the large margin
    // marginBottom: 200
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  actionSection: {
    marginVertical: 10,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  submitButton: {
    padding: 15,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "red",
  },
  scrollViewContent: {
    flexGrow: 1, // Make the ScrollView take up available space
  },
  menucontainer: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1, // Ensure this component is on top
  },
  iconContainermunu: {
    padding: 15, // Adjust padding to ensure a large enough touchable area
    justifyContent: 'center',
    alignItems: 'center',
 
  },
  menu: {
    position: 'absolute',
    right: 0,
    top: 40, // Adjust to position the menu below the icon
    backgroundColor: 'white',
    borderRadius: 4,
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: 10,
    width: 150, // Adjust width as needed
    zIndex: 2, // Ensure menu is above other elements
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:"rgba(255, 255, 255, 0.5)", // Make it completely transparent
    zIndex: 100, // Ensure it's on top
  },// Semi-transparent background
  
});

export default withAuth(withProfileVerification(Wallet));
