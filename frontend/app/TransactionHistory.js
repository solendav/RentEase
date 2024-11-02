import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Header from './../components/Header'
import { Colors } from "../constants/Colors";
import withAuth from './../components/withAuth'
import { MaterialIcons } from '@expo/vector-icons';
import RotatingDotsLoader from './../components/RotatingDotsLoader'; 
import { ThemeContext } from "./../app/contexts/ThemeContext";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const { theme } = useContext(ThemeContext);
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const userId = await getUserId();

        if (!userId) {
          setError("User not authenticated");
          return;
        }

        const accountNo = await fetchAccountNumber(userId);
        const transactionsData = await fetchTransactions(userId, accountNo);

        setTransactions(transactionsData);
        setFilteredTransactions(transactionsData);
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch transactions.');
        setError("Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [activeFilter, transactions]);

  const getUserId = async () => {
    try {
      return await SecureStore.getItemAsync('user_id');
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null;
    }
  };

  const fetchAccountNumber = async (userId) => {
    try {
      const response = await axios.get(`https://renteasebackend-orna.onrender.com/api/account/${userId}`);
      return response.data.account_no;
    } catch (error) {
      console.error('Error fetching account number:', error);
      throw error;
    }
  };

  const fetchTransactions = async (userId, accountNo) => {
    try {
      const response = await axios.get('https://renteasebackend-orna.onrender.com/api/transactionsnotification', {
        params: { userId, accountNo }
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching transactions:', err);
      throw err;
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (activeFilter === "deposit") {
      filtered = transactions.filter(
        (transaction) =>
          transaction.type === "deposit" || transaction.type === "withdraw"
      );
    } else if (activeFilter === "transfer") {
      filtered = transactions.filter(
        (transaction) => transaction.type === "transfer"
      );
    } else if (activeFilter === "own-deposit") {
      filtered = transactions.filter(
        (transaction) =>
          transaction.type === "own-deposit" ||
          transaction.type === "deposit-to-balance"
      );
    }

    setFilteredTransactions(filtered);
  };



  if (error) {
    return <Text>{error}</Text>;
  }

  const renderItem = ({ item }) => {
    let content = null;

    if (item.type === "deposit" || item.type === "withdrawal") {
      content = (
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionAmount}>Amount: ${item.amount}</Text>
          <Text style={styles.transactionTxRef}>TX Ref: {item.tx_ref}</Text>
        
          <Text style={styles.transactionText}>
            Using: {item.payment_provider}
          </Text>
          <Text style={styles.transactionType}>Type: {item.type}</Text>
          <Text style={styles.transactionDate}>Date: {item.updatedAt}</Text>
          {item.payment_url && (
            <TouchableOpacity onPress={() => Linking.openURL(item.payment_url)}>
              <Text style={styles.linkText}>Payment Receipt</Text>
            </TouchableOpacity>
          )}
            {item.payment_provider && (
              <Text style={styles.transactionPaymentProvider}>Payment Provider: {item.payment_provider}</Text>
            )}
        </View>
      );
    } else if (item.type === "transfer") {
      content = (
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionFromAccount}>
            From Account: {item.fromAccountNo}
          </Text>
          <Text style={styles.transactionToAccount}>
            To Account: {item.toAccountNo}
          </Text>
          <Text style={styles.transactionAmount}>Amount: ${item.amount}</Text>
          <Text style={styles.transactionTrRef}>TX Ref: {item.tx_ref}</Text>
          <Text style={styles.transactionType}>Type: {item.type}</Text>
          <Text style={styles.transactionDate}>Date: {item.updatedAt}</Text>
        </View>
      );
    } else if (
      item.type === "own-deposit" ||
      item.type === "deposit-to-balance"
    ) {
      content = (
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionType}>Type: {item.type}</Text>
          <Text style={styles.transactionAmount}>Amount: ${item.amount}</Text>
          <Text style={styles.transactionTxRef}>TX Ref: {item.tx_ref}</Text>
          <Text style={styles.transactionDate}>Date: {item.updatedAt}</Text>
        </View>
      );
    }

    return (
    <View style={styles.transactionContainer}>
       <View style={styles.transactionHeader}>
          <Text style={styles.transactionDate}>
            {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      {content}
      <TouchableOpacity style={styles.approvalIcon}>
          <MaterialIcons name="check-circle" size={24} color="green" />
        </TouchableOpacity>
      </View>
  
  );
  };

  const toggleButtonStyle = (type) =>
    activeFilter === type ? styles.activeButton : styles.inactiveButton;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      backgroundColor: theme === 'dark' ? Colors.BLACK : "f9f9f9",
     
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      marginTop:20
    },
    activeButton: {
      flex: 1,
      padding: 10,
      backgroundColor: Colors.PRIMARY,
      borderRadius: 5,
      marginHorizontal: 5,
      alignItems: "center",
    },
    inactiveButton: {
      flex: 1,
      padding: 10,
      backgroundColor: "#ccc",
      borderRadius: 5,
      marginHorizontal: 5,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "bold",
    },
    transactionContainer: {
      padding: 15,
      marginBottom: 15,
      backgroundColor: theme === 'dark' ? '#303030' : '#fff',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#e0e0e0",
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
      position: "relative",
      width: "100%",
    },
    transactionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: theme === 'dark' ? Colors.GRAY :"#e0e0e0",
      paddingBottom: 10,
      marginBottom: 10,
    },
    transactionDate: {
      fontSize: 14,
      color: "#888",
    },
    transactionDetails: {
      marginBottom: 10,
    },
    transactionAmount: {
      fontSize: 16,
      color: "#4caf50",
    },
    transactionType: {
      fontSize: 16,
      color: "#333",
    },
    transactionTxRef: {
      fontSize: 16,
      color: theme === 'dark' ? Colors.GRAY :"#555",
    },
    transactionPaymentUrl: {
      fontSize: 14,
      color: "#007bff",
      textDecorationLine: "underline",
    },
    transactionPaymentProvider: {
      fontSize: 14,
      color: "#ff5722",
    },
    transactionFromAccount: {
      fontSize: 16,
      color: theme === 'dark' ? Colors.GRAY :"#333",
    },
    transactionToAccount: {
      fontSize: 16,
      color: theme === 'dark' ? Colors.GRAY :"#333",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    noTransactionsText: {
      fontSize: 16,
      textAlign: "center",
      color: theme === 'dark' ? Colors.GRAY :"#888",
    },
    flatListContentContainer: {
      paddingHorizontal: 20,
    },
    flatList: {
      width: "100%",
    },
    approvalIcon: {
      position: "absolute",
      top: 15,
      right: 15,
    },
    linkText: {
      fontSize: 16,
      color:Colors.PRIMARY,
      textDecorationLine: "underline",
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:"rgba(255, 255, 255, 0.1)", // Make it completely transparent
      zIndex: 100, // Ensure it's on top
    },
  });
  return (
    <View style={styles.container}>
      <Header title={"Transaction History"}/>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={toggleButtonStyle("all")}
          onPress={() => setActiveFilter("all")}
        >
          <Text style={styles.buttonText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={toggleButtonStyle("deposit")}
          onPress={() => setActiveFilter("deposit")}
        >
          <Text style={styles.buttonText}>Deposit/Withdraw</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={toggleButtonStyle("transfer")}
          onPress={() => setActiveFilter("transfer")}
        >
          <Text style={styles.buttonText}>Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={toggleButtonStyle("own-deposit")}
          onPress={() => setActiveFilter("own-deposit")}
        >
          <Text style={styles.buttonText}>Withen Account</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredTransactions}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <RotatingDotsLoader />
        </View>
      )}
    </View>
  );
};



export default withAuth(TransactionHistory);
