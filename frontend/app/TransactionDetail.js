import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRoute } from "@react-navigation/native";
import withAuth from "../components/withAuth";
import { ThemeContext } from "../app/contexts/ThemeContext";
import { Colors } from "../constants/Colors";
import RotatingDotsLoader from "./../components/RotatingDotsLoader";
const TransactionDetail = () => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ownAccountNo, setOwnAccountNo] = useState("");
  const [fromAccountName, setFromAccountName] = useState("");
  const [toAccountName, setToAccountName] = useState("");
  const route = useRoute();
  const { transactionId } = route.params || {};
  const { theme } = useContext(ThemeContext);
  const getUserId = async () => {
    try {
      return await SecureStore.getItemAsync("user_id");
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };

  const fetchTransactionDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://renteasebackend-orna.onrender.com/tran/${transactionId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setTransaction(data);

      if (data.fromAccountNo) {
        await fetchAccountDetails(data.fromAccountNo, "from");
      }
      if (data.toAccountNo) {
        await fetchAccountDetails(data.toAccountNo, "to");
      }
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      Alert.alert("Error", "Failed to fetch transaction details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTransaction = async () => {
      if (transactionId) {
        await fetchTransactionDetail(); // Await fetchTransactionDetail
      }
    };
    loadTransaction();
  }, [transactionId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7f00ff" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Transaction not found.</Text>
      </View>
    );
  }

  const handleLinkPress = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Error", "Unable to open the URL.");
    }
  };

  let details;
  switch (transaction.type) {
    case "deposit":
    case "withdrawal":
      details = (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailItem}>
            Amount: ${transaction.amount.toFixed(2)}
          </Text>
          <Text style={styles.detailItem}>Type: {transaction.type}</Text>
          <Text style={styles.detailItem}>Tx Ref: {transaction.tx_ref}</Text>
          {transaction.payment_url && (
            <TouchableOpacity
              onPress={() => handleLinkPress(transaction.payment_url)}
            >
              <Text style={styles.detailItem}>Transaction Receipt</Text>
            </TouchableOpacity>
          )}
          {transaction.payment_provider && (
            <Text style={styles.detailItem}>
              Payment Provider: {transaction.payment_provider}
            </Text>
          )}
        </View>
      );
      break;
    case "transfer":
      details = (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailItem}>
            Amount: ${transaction.amount.toFixed(2)}
          </Text>
          <Text style={styles.detailItem}>Type: {transaction.type}</Text>
          <Text style={styles.detailItem}>Tx Ref: {transaction.tx_ref}</Text>
          <Text style={styles.detailItem}>
            From Account: {fromAccountName || transaction.fromAccountNo}
          </Text>
          <Text style={styles.detailItem}>
            To Account: {toAccountName || transaction.toAccountNo}
          </Text>
        </View>
      );
      break;
    case "own-deposit":
    case "deposit-to-balance":
      details = (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailItem}>
            Amount: ${transaction.amount.toFixed(2)}
          </Text>
          <Text style={styles.detailItem}>Type: {transaction.type}</Text>
          <Text style={styles.detailItem}>Tx Ref: {transaction.tx_ref}</Text>
        </View>
      );
      break;
    default:
      details = (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailItem}>
            Amount: ${transaction.amount.toFixed(2)}
          </Text>
          <Text style={styles.detailItem}>Type: {transaction.type}</Text>
          <Text style={styles.detailItem}>Tx Ref: {transaction.tx_ref}</Text>
        </View>
      );
      break;
  }
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme === "dark" ? Colors.BLACK : "f9f9f9",
    },

    errorText: {
      fontSize: 18,
      color: "#888",
      textAlign: "center",
      marginTop: 20,
    },
    headerText: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 20,
      color: theme === "dark" ? Colors.WHITE : Colors.BLACK,
    },
    detailsContainer: {
      backgroundColor: theme === "dark" ? "#303030" : "#fff",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#e0e0e0",
      padding: 20,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    detailItem: {
      fontSize: 16,
      color: theme === "dark" ? Colors.GRAY : "#333",
      marginBottom: 10,
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Make it completely transparent
      zIndex: 100, // Ensure it's on top
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Transaction Details</Text>
      {details}
      {loading && (
        <View style={styles.loadingOverlay}>
          <RotatingDotsLoader />
        </View>
      )}
    </View>
  );
};

export default withAuth(TransactionDetail);
