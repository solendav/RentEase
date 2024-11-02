import React, { useState, useCallback, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import withAuth from './withAuth';
import { ThemeContext } from "../app/contexts/ThemeContext";
import { Colors } from "../constants/Colors";
import RotatingDotsLoader from './../components/RotatingDotsLoader'; 
const TransactionNotification = ({ onCountUpdate }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [transactionCount, setTransactionCount] = useState(0);
  const { theme } = useContext(ThemeContext);
  // Function to fetch user ID from SecureStore
  const getUserId = async () => {
    try {
      return await SecureStore.getItemAsync('user_id');
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null;
    }
  };

  // Function to fetch account number based on user ID
  const fetchAccountNumber = async (userId) => {
    try {
      const response = await axios.get(`https://renteasebackend-orna.onrender.com/api/account/${userId}`);
      return response.data.account_no;
    } catch (error) {
      console.error('Error fetching account number:', error);
      throw error;
    }
  };

  // Function to fetch transactions using user ID and account number
  const fetchTransactions = useCallback(async (userId, accountNo) => {
    setLoading(true);
    try {
      console.log('Fetching transactions with userId:', userId, 'and accountNo:', accountNo);
      
      // Make the API request
      const response = await axios.get('https://renteasebackend-orna.onrender.com/api/transactionsnotification', {
        params: { userId, accountNo }
      });

      // Extract transactions from the response
      const transactions = response.data;

      // Sort transactions by 'updatedAt' in descending order
      const sortedTransactions = transactions.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt) // Sorting in descending order
      );

      // Count the number of transactions
      const transactionsCount = sortedTransactions.length;

      // Pass the count to the callback function
      if (onCountUpdate) onCountUpdate(transactionsCount);

      // Update the state with sorted transactions
      setTransactions(sortedTransactions);
      setTransactionCount(transactionsCount);

      return sortedTransactions;
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  }, [onCountUpdate]);

  // Fetch transactions when component mounts
  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        const userId = await getUserId();
        if (userId) {
          const accountNo = await fetchAccountNumber(userId);
          await fetchTransactions(userId, accountNo);
        }
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [fetchTransactions]);

  const handleLinkPress = (url) => {
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Unable to open the URL.')
    );
  };

  const handlePress = async (transactionId) => {
    try {
      // Make a PATCH request to update the 'seen' field
      const response = await axios.patch(`https://renteasebackend-orna.onrender.com/transactions/${transactionId}/update-seen`);
  
      if (response.status === 200) {
        console.log('Transaction updated successfully:', response.data);
        // You may want to update local state or refresh data here
      }
      
    } catch (error) {
    
    }
  };

  const renderTransaction = ({ item }) => {
    let details;
    switch (item.type) {
      case 'deposit':
      case 'withdrawal':
        details = (
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionAmount}>
              Amount: ${item.amount.toFixed(2)}
            </Text>
            <Text style={styles.transactionType}>Type: {item.type}</Text>
            <Text style={styles.transactionTxRef}>Tx Ref: {item.tx_ref}</Text>
            {item.payment_url && (
              <TouchableOpacity onPress={() => handleLinkPress(item.payment_url)}>
                <Text style={styles.transactionPaymentUrl}>Transaction Receipt</Text>
              </TouchableOpacity>
            )}
            {item.payment_provider && (
              <Text style={styles.transactionPaymentProvider}>Payment Provider: {item.payment_provider}</Text>
            )}
          </View>
        );
        break;
      case 'transfer':
        details = (
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionAmount}>
              Amount: ${item.amount.toFixed(2)}
            </Text>
            <Text style={styles.transactionType}>Type: {item.type}</Text>
            <Text style={styles.transactionTxRef}>Tx Ref: {item.tx_ref}</Text>
            <Text style={styles.transactionFromAccount}>From Account: {item.fromAccountNo}</Text>
            <Text style={styles.transactionToAccount}>To Account: {item.toAccountNo}</Text>
          </View>
        );
        break;
      case 'own-deposit':
      case 'deposit-to-balance':
        details = (
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionAmount}>
              Amount: ${item.amount.toFixed(2)}
            </Text>
            <Text style={styles.transactionType}>Type: {item.type}</Text>
            <Text style={styles.transactionTxRef}>Tx Ref: {item.tx_ref}</Text>
          </View>
        );
        break;
      default:
        details = (
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionAmount}>
              Amount: ${item.amount.toFixed(2)}
            </Text>
            <Text style={styles.transactionType}>Type: {item.type}</Text>
            <Text style={styles.transactionTxRef}>Tx Ref: {item.tx_ref}</Text>
          </View>
        );
        break;
    }

    return (
      <TouchableOpacity
        style={styles.transactionContainer}
        onPress={() => handlePress(item._id)}
      >
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionDate}>
            {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
        {details}
        <TouchableOpacity style={styles.approvalIcon}>
          <MaterialIcons name="check-circle" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 20,
      backgroundColor: theme === 'dark' ? Colors.BLACK : "f9f9f9",
      width: "100%",
    },
    transactionContainer: {
      padding: 15,
      marginBottom: 15,
      backgroundColor: theme === 'dark' ? '#303030' : '#fff',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Colors.GRAY,
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
      color: Colors.PRIMARY,
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
      color: Colors.PRIMARY,
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
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <View style={styles.container}>
      {transactions.length > 0 ? (
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={styles.noTransactionsText}>No transactions found.</Text>
        }
        contentContainerStyle={styles.flatListContentContainer}
        style={styles.flatList}
      />
    ) : loading ? (
        <View style={styles.loadingOverlay}>
          <RotatingDotsLoader />
        </View>
        ) : (
          <View style={styles.centered}>
            <Text style={styles.noBookingsText}>No Transaction Notification.</Text>
          </View>
        )}
    </View>
  );
};



export default withAuth(TransactionNotification);
