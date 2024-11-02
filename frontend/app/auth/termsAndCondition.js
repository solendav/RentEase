import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from "expo-router";
const TermsAndConditions = () => {
  const [terms, setTerms] = useState(null);
  const navigation = useNavigation();
  const router = useRouter();
  useEffect(() => {
    // Fetch the latest terms and conditions from the server
    axios.get('https://renteasebackend-orna.onrender.com/api/terms-and-conditions')
      .then(response => {
        setTerms(response.data);
      })
      .catch(error => {
        console.error('Error fetching terms:', error);
        Alert.alert('Error', 'Unable to fetch terms and conditions.');
      });
  }, []);

  const handleAgree = () => {
    // Navigate to the Sign-Up page and pass the "agree" parameter
    navigation.navigate('SignUp', { agree: true });
  };

  const handleDisagree = () => {
    // Optionally handle the disagreement action
    Alert.alert('Notice', 'You must agree to the terms and conditions to continue.');
  };

  if (!terms) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>{terms.title}</Text>
        <Text style={{ fontSize: 16, marginBottom: 20 }}>{terms.content}</Text>
        <Button title="Agree" onPress={handleAgree} color="green" />
        <View style={{ marginVertical: 10 }} />
        <Button title="Disagree" onPress={handleDisagree} color="red" />
      </View>
    </ScrollView>
  );
};

export default TermsAndConditions;
