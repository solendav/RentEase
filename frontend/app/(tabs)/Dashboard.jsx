import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Colors } from './../../constants/Colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [propertyCount, setPropertyCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);  // Pending bookings
  const [rentedCount, setRentedCount] = useState(0);    // Rented bookings
  const [transactionCount, setTransactionCount] = useState(0);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // State to handle refresh

  const navigation = useNavigation();
const fetchBookingsForRole = async (userId, userRole) => {
  let tenantBookings = [];
  let ownerBookings = [];

  try {
    if (userRole === '1' || userRole === '3') {
      // Fetch tenant bookings
      const tenantResponse = await axios.get(`http://10.139.161.59:8000/api/bookings/tenant/${userId}`);
      tenantBookings = tenantResponse.data.bookings || [];
    }

    if (userRole === '2' || userRole === '3') {
      // Fetch owner bookings
      const ownerResponse = await axios.get(`http://10.139.161.59:8000/api/bookings/owner/${userId}`);
      ownerBookings = ownerResponse.data.bookings || [];
    }

    return { tenantBookings, ownerBookings };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error; // Re-throw error for handling in the calling function
  }
};

// Example of use in fetchDashboardData
const fetchDashboardData = useCallback(async () => {
  try {
    const userId = await SecureStore.getItemAsync('user_id');
    const userRole = await SecureStore.getItemAsync('role');

    if (!userId || !userRole) {
      Alert.alert('Error', 'Unable to fetch user information');
      return;
    }

    setRole(userRole); // Set role for conditional rendering

    const propertyResponse = await axios.get(`http://10.139.161.59:8000/api/properties/user/${userId}`);
    const propertyCount = propertyResponse.data.length || 0;

    const { tenantBookings, ownerBookings } = await fetchBookingsForRole(userId, userRole);

    console.log('Tenant Bookings:', tenantBookings);
    console.log('Owner Bookings:', ownerBookings);

    // Combine and deduplicate bookings for role 3
    let uniqueBookings = [];
    if (userRole === '3') {
      const combinedBookings = [...tenantBookings, ...ownerBookings];
      const seen = new Set();
      uniqueBookings = combinedBookings.filter(booking => {
        const isDuplicate = seen.has(booking._id.toString());
        seen.add(booking._id.toString());
        return !isDuplicate;
      });
    } else {
      uniqueBookings = userRole === '1' ? tenantBookings : ownerBookings;
    }

    const pendingBookings = uniqueBookings;
    const rentedBookings = uniqueBookings;

    const accountResponse = await axios.get(`http://10.139.161.59:8000/api/account/${userId}`);
    const { account_no } = accountResponse.data || {};

    const transactionsResponse = await axios.get("http://10.139.161.59:8000/api/transactionsnotification", {
      params: { userId, accountNo: account_no },
    });
    const transactionCount = transactionsResponse.data.length || 0;

    setPropertyCount(propertyCount);
    setBookingCount(pendingBookings.length);
    setRentedCount(rentedBookings.length);
    setTransactionCount(transactionCount);

    setLoading(false);
    setRefreshing(false);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    Alert.alert('Error', 'Failed to fetch dashboard data.');
    setLoading(false);
    setRefreshing(false);
  }
}, []);

  

  useEffect(() => {
    fetchDashboardData(); // Fetch data on mount
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData(); // Fetch data on refresh
  }, [fetchDashboardData]);

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("username");
      await SecureStore.deleteItemAsync("user_id");
      await SecureStore.deleteItemAsync("themes");

      Alert.alert("Logout", "Logged out successfully.");

      // Reset the navigation stack and navigate to the Home screen
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }], // Ensure "Home" matches your route name
      });
    } catch (error) {
      console.log("Logout error", error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <Text style={styles.title}>Dashboard</Text>

      {/* Container for Cards - Two cards per row */}
      <View style={styles.cardContainer}>
        {/* Conditionally show property count for role 2 (Owner) and role 3 (Both Tenant & Owner) */}
        {(role === '2' || role === '3') && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Number of Properties</Text>
            <Text style={styles.cardCount}>{propertyCount}</Text>
          </View>
        )}

        {/* Booking Count (Show for all roles) */}
        {/* <View style={styles.card}>
          <Text style={styles.cardTitle}>Pending Bookings</Text>
          <Text style={styles.cardCount}>{bookingCount}</Text>
        </View> */}

        {/* Rented Property Count (Show for all roles) */}
        {/* <View style={styles.card}>
          <Text style={styles.cardTitle}>Rented Properties</Text>
          <Text style={styles.cardCount}>{rentedCount}</Text>
        </View> */}

        {/* Transaction Count (Show for all roles) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Number of Transactions</Text>
          <Text style={styles.cardCount}>{transactionCount}</Text>
        </View>
      </View>

      <View style={styles.containerbutton}>
        {/* Profile */}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profiles')}>
          <Icon name="person" size={40} color={Colors.PRIMARY} />
          <Text style={styles.label}>Profile</Text>
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings" size={40} color={Colors.PRIMARY} />
          <Text style={styles.label}>Settings</Text>
        </TouchableOpacity>

        {/* Wallet */}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Wallet')}>
          <Icon name="account-balance-wallet" size={40} color={Colors.PRIMARY} />
          <Text style={styles.label}>Wallet</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.button} onPress={() => handleLogout()}>
          <Icon name="logout" size={40} color={Colors.PRIMARY} />
          <Text style={styles.label}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignItems: "center",
    textAlign: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Evenly space the cards
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '48%', // Ensure two cards take up the entire row
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: "center",
  },
  cardCount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginTop: 10,
    textAlign: "center",
  },
  containerbutton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Distribute buttons evenly
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  button: {
    width: '45%', // Adjust width to fit two buttons per row
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    marginTop: 5,
    color: Colors.PRIMARY,
  },
});

export default Dashboard;
