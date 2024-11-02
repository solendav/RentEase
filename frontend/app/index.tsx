import { Redirect } from "expo-router";
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { useFonts } from 'expo-font';


export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity: 0
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Initial scale: 0.8

  // Load custom fonts
  useFonts({
    'outfit': require('./../assets/fonts/Outfit-Regular.ttf'),
    'outfit-medium': require('./../assets/fonts/Outfit-Medium.ttf'),
    'outfit-bold': require('./../assets/fonts/Outfit-Bold.ttf'),
  });

  // Animation sequence: Fade in and scale up the logo
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000, // 2 seconds for fade-in
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 2000, // 2 seconds for scaling up
        useNativeDriver: true,
      }),
    ]).start();

    // Redirect to Home after 5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [fadeAnim, scaleAnim]);

  if (!isLoading) {
    return <Redirect href="/Home" />;
  }

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('./../assets/images/logo.png')} // Replace with your logo path
        style={[styles.logo, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FE9EcEF', // White background color
  },
  logo: {
    width: 200, // Adjust the size as needed
    height: 200, // Adjust the size as needed
  },
});
