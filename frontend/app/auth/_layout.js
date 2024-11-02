import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignIn from './SignIn';
import SignUp from './SignUp';
import TermsAndCondition from './termsAndCondition'
// Adjust path as needed
// Import other auth screens here if needed

const AuthStack = createStackNavigator();

function AuthLayout() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen
        name="SignIn"
        component={SignIn}
        options={{ headerShown: false }} // Hides header for SignIn
      />
       <AuthStack.Screen
        name="SignUp"
        component={SignUp}
        options={{ headerShown: false }} // Hides header for SignIn
      />
        <AuthStack.Screen
        name="termsAndCondition"
        component={TermsAndCondition}
        options={{ headerShown: false }} // Hides header for SignIn
      />
      {/* Add other auth screens here, e.g., SignUp, ForgotPassword, etc. */}
    </AuthStack.Navigator>
  );
}

export default AuthLayout;
