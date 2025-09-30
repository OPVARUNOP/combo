import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TrackPlayer from 'react-native-track-player';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Store
import { store, persistor } from './src/store/store';
import { initializeAuth } from './src/store/slices/authSlice';

// Services
import { setupPlayer } from './src/services/playerService';

// Theme
import { colors } from './src/styles/theme';

// Components
import LoadingSpinner from './src/components/common/LoadingSpinner';
import SplashScreen from './src/components/common/SplashScreen';

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <LoadingSpinner size="large" color={colors.primary} />
  </View>
);

const AppContent = () => {
  const dispatch = useDispatch();
  const [showSplash, setShowSplash] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  useEffect(() => {
    // Initialize authentication state
    dispatch(initializeAuth());

    // Setup TrackPlayer when app starts
    const initializePlayer = async () => {
      try {
        await setupPlayer();
      } catch (error) {
        console.error('Failed to setup TrackPlayer:', error);
      }
    };

    initializePlayer();

    // Setup TrackPlayer event listeners
    const setupEventListeners = async () => {
      try {
        TrackPlayer.addEventListener('playback-state', (state) => {
          console.log('Playback state changed:', state);
        });

        TrackPlayer.addEventListener('playback-track-changed', (data) => {
          console.log('Track changed:', data);
        });

        TrackPlayer.addEventListener('playback-queue-ended', (data) => {
          console.log('Queue ended:', data);
        });

        TrackPlayer.addEventListener('playback-error', (error) => {
          console.error('Playback error:', error);
        });
      } catch (error) {
        console.error('Failed to setup event listeners:', error);
      }
    };

    setupEventListeners();

    // Simulate app initialization time
    const initializeApp = async () => {
      // Add any additional initialization logic here
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for smooth transition
      setIsAppReady(true);
    };

    initializeApp();

    // Cleanup function
    return () => {
      // Cleanup TrackPlayer if needed
    };
  }, [dispatch]);

  // Show splash screen first, then loading, then main app
  if (showSplash) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <SplashScreen onAnimationComplete={handleSplashComplete} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
          translucent
        />
        <AppNavigator />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default App;
