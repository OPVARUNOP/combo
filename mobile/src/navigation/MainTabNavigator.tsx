import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabParamList, HomeStackParamList, SearchStackParamList, LibraryStackParamList, ProfileStackParamList } from './types';
import { HomeScreen, SearchScreen, LibraryScreen, ProfileScreen } from '../screens';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

// Create stack navigators for each tab
const HomeStack = createStackNavigator<HomeStackParamList>();
const SearchStack = createStackNavigator<SearchStackParamList>();
const LibraryStack = createStackNavigator<LibraryStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// Home Stack
const HomeStackScreen = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen 
      name="HomeMain" 
      component={HomeScreen} 
      options={{ headerShown: false }}
    />
    {/* Add other home tab screens here */}
  </HomeStack.Navigator>
);

// Search Stack
const SearchStackScreen = () => (
  <SearchStack.Navigator>
    <SearchStack.Screen 
      name="SearchMain" 
      component={SearchScreen} 
      options={{ headerShown: false }}
    />
    {/* Add other search tab screens here */}
  </SearchStack.Navigator>
);

// Library Stack
const LibraryStackScreen = () => (
  <LibraryStack.Navigator>
    <LibraryStack.Screen 
      name="LibraryMain" 
      component={LibraryScreen} 
      options={{ headerShown: false }}
    />
    {/* Add other library tab screens here */}
  </LibraryStack.Navigator>
);

// Profile Stack
const ProfileStackScreen = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen 
      name="ProfileMain" 
      component={ProfileScreen} 
      options={{ headerShown: false }}
    />
    {/* Add other profile tab screens here */}
  </ProfileStack.Navigator>
);

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Library') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchStackScreen} 
        options={{ title: 'Search' }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryStackScreen} 
        options={{ title: 'Library' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
