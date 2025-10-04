import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import { useAppSelector } from '../store/hooks';
import { auth } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LoadingScreen } from '../components/common/LoadingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber; // Unsubscribe on unmount
  }, [initializing]);

  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user && accessToken ? (
          <Stack.Screen name='Main' component={MainTabNavigator} />
        ) : (
          <Stack.Screen name='Auth' component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
