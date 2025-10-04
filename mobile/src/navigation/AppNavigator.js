import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, animation } from '../styles/theme';
import DownloadsScreen from '../screens/secondary/DownloadsScreen';
import LikedSongsScreen from '../screens/secondary/LikedSongsScreen';
import RecentPlaysScreen from '../screens/secondary/RecentPlaysScreen';
import CreatePlaylistScreen from '../screens/secondary/CreatePlaylistScreen';
import EditPlaylistScreen from '../screens/secondary/EditPlaylistScreen';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import LibraryScreen from '../screens/main/LibraryScreen';
import PlayerScreen from '../screens/player/PlayerScreen';
import PlaylistScreen from '../screens/secondary/PlaylistScreen';
import AlbumScreen from '../screens/secondary/AlbumScreen';
import ArtistScreen from '../screens/secondary/ArtistScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SocialScreen from '../screens/social/SocialScreen';

// Auth screens
import AuthScreen from '../screens/auth/AuthScreen';

// Artist/creator screens
import ArtistPortalScreen from '../screens/artist/ArtistPortalScreen';
import UploadMusicScreen from '../screens/artist/UploadMusicScreen';
import ArtistAnalyticsScreen from '../screens/artist/ArtistAnalyticsScreen';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

import { useTheme } from '../context/ThemeContext';

// Tab Navigator
const MainTabs = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Library') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Social') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          paddingBottom: 4,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name='Home' component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name='Search' component={SearchScreen} options={{ title: 'Search' }} />
      <Tab.Screen name='Library' component={LibraryScreen} options={{ title: 'Library' }} />
      <Tab.Screen name='Social' component={SocialScreen} options={{ title: 'Social' }} />
      <Tab.Screen name='Profile' component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
const MainStack = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: theme.colors.background },
        cardStyleInterpolator: forHorizontalIOS,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        transitionSpec: {
          open: animation.presets.page,
          close: animation.presets.page,
        },
      }}
    >
      <Stack.Screen name='MainTabs' component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name='Player'
        component={PlayerScreen}
        options={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'vertical',
          cardOverlayEnabled: true,
          cardStyle: { backgroundColor: 'transparent' },
          cardStyleInterpolator: ({ current: { progress } }) => ({
            cardStyle: {
              opacity: progress.interpolate({
                inputRange: [0, 0.5, 0.9, 1],
                outputRange: [0, 0.25, 0.7, 1],
              }),
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1000, 0],
                  }),
                },
              ],
            },
            overlayStyle: {
              opacity: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.8],
                extrapolate: 'clamp',
              }),
            },
          }),
        }}
      />
      <Stack.Screen
        name='Playlist'
        component={PlaylistScreen}
        options={({ route }) => ({
          title: route.params?.title || 'Playlist',
          headerBackTitle: 'Back',
        })}
      />
      <Stack.Screen
        name='Album'
        component={AlbumScreen}
        options={({ route }) => ({
          title: route.params?.title || 'Album',
          headerBackTitle: 'Back',
        })}
      />
      <Stack.Screen
        name='Artist'
        component={ArtistScreen}
        options={({ route }) => ({
          title: route.params?.name || 'Artist',
          headerBackTitle: 'Back',
        })}
      />
      <Stack.Screen
        name='Settings'
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name='Downloads'
        component={DownloadsScreen}
        options={{
          title: 'Downloads',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name='LikedSongs'
        component={LikedSongsScreen}
        options={{
          title: 'Liked Songs',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name='RecentPlays'
        component={RecentPlaysScreen}
        options={{
          title: 'Recently Played',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name='CreatePlaylist'
        component={CreatePlaylistScreen}
        options={{
          title: 'Create Playlist',
          headerBackTitle: 'Cancel',
        }}
      />
      <Stack.Screen
        name='EditPlaylist'
        component={EditPlaylistScreen}
        options={({ route }) => ({
          title: route.params?.isNew ? 'Create Playlist' : 'Edit Playlist',
          headerBackTitle: 'Cancel',
        })}
      />
      <Stack.Screen name='ArtistPortal' component={ArtistPortalScreen} />
      <Stack.Screen name='UploadMusic' component={UploadMusicScreen} />
      <Stack.Screen name='ArtistAnalytics' component={ArtistAnalyticsScreen} />
    </Stack.Navigator>
  );
};

// Auth Stack Navigator
const AuthStack = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name='Auth' component={AuthScreen} />
    </Stack.Navigator>
  );
};

// Root Navigator (Handles authentication flow)
const RootNavigator = () => {
  // In a real app, you would check the user's authentication status here
  const isAuthenticated = true; // Replace with actual auth check

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name='MainApp' component={MainStack} />
      ) : (
        <Stack.Screen name='Auth' component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
