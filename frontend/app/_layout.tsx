import React from 'react';
import { useFonts } from 'expo-font';
import { Text } from 'react-native';
import { Stack } from 'expo-router';
import { ThemeProvider, ThemeContext } from './../app/contexts/ThemeContext';

import AuthLayout from './auth/_layout';
export default function RootLayout() {
  useFonts({
    'outfit': require('./../assets/fonts/Outfit-Regular.ttf'),
    'outfit-medium': require('./../assets/fonts/Outfit-Medium.ttf'),
    'outfit-bold': require('./../assets/fonts/Outfit-Bold.ttf')
  });

  return (
    <ThemeProvider>
   <Stack>
    <Stack.Screen name="(tabs)" options={{headerShown:false}}/> 
    <Stack.Screen name="auth"  options={{headerShown:false}}/> 
    <Stack.Screen name="index" options={{headerShown:false}}/> 
    <Stack.Screen name="properties" options={{headerShown:false}}/>
    <Stack.Screen name="addProperty" options={{headerShown:false}}/>
    <Stack.Screen name="Profiles" options={{ headerShown: false }} />
    <Stack.Screen name="RentalRequest" options={{ headerShown: false }} />
    <Stack.Screen name="NotificationDetails" options={{ headerShown: false }} /> 
    <Stack.Screen name="EditProperty" options={{ headerShown: false }} /> 
    <Stack.Screen name="BookingDetail" options={{ headerShown: false }} /> 
    <Stack.Screen name="ChangePassword" options={{ headerShown: false }} /> 
    <Stack.Screen name="EditProfile" options={{ headerShown: false }} /> 
    <Stack.Screen name="TransactionHistory" options={{ headerShown: false }} /> 
    <Stack.Screen name="WalletPassword" options={{ headerShown: false }} />
    <Stack.Screen name="TransactionDetail" options={{ headerShown: false }} /> 
    <Stack.Screen name="TermsAndCondition" options={{ headerShown: false }} /> 
    <Stack.Screen name="DamageReportTenant" options={{ headerShown: false }} /> 
    <Stack.Screen name="AboutUs" options={{ headerShown: false }} /> 
   </Stack>
   </ThemeProvider>
  );
}


