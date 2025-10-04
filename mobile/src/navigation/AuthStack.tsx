import React from 'react';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { LoginScreen, RegisterScreen, ForgotPasswordScreen } from '../screens';
import { AuthStackParamList } from './types';
import { colors } from '../constants/theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  const screenOptions: NativeStackNavigationOptions = {
    headerStyle: {
      backgroundColor: colors.background,
    },
    headerTintColor: colors.primary,
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    headerBackTitleVisible: false,
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
    </Stack.Navigator>
  );
};

export default AuthStack;
