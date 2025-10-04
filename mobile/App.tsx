import React, { useEffect, useCallback, useState } from 'react';
import { StatusBar, StyleSheet, View, LogBox, AppState, AppStateStatus, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// Store
import { store, persistor } from './src/store';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Theme
import { lightTheme, darkTheme } from './src/theme/theme';

// Components
import LoadingScreen from './src/components/common/LoadingScreen';
import ErrorBoundary from './src/components/common/ErrorBoundary';

// Initialize Firebase
const initFirebase = async () => {
  try {
    const { initializeFirebase } = await import('./src/services/firebase');
    await initializeFirebase();
  } catch (error) {
    console.error('Failed to initialize Firebase', error);
  }
};

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  // Handle the error
});

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'AsyncStorage has been extracted from react-native core',
  'Setting a timer',
  'VirtualizedLists should never be nested',
]);

// Type for the app state
type AppStateType = {
  appIsReady: boolean;
  appState: AppStateStatus;
};

const AppContent: React.FC = () => {
  const [appIsReady, setAppIsReady] = useState<boolean>(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    const initApp = async () => {
      try {
        // Load any resources needed before rendering the app
        await Promise.all([
          // Load fonts, assets, or any other resources here
          // Font.loadAsync(...)
        ]);
      } catch (e) {
        console.warn('Failed to load resources', e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    initApp();

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    setAppState(nextAppState);
    
    if (nextAppState === 'active') {
      // App has come to the foreground
      // Refresh any data that might be stale
    } else if (nextAppState === 'background') {
      // App has gone to the background
      // Save any unsaved data
    }
  };

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return <LoadingScreen />;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider onLayout={onLayoutRootView}>
            <GestureHandlerRootView style={styles.container}>
              <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.background}
              />
              <ErrorBoundary>
                <NavigationContainer theme={theme}>
                  <AppNavigator />
                </NavigationContainer>
              </ErrorBoundary>
              <ExpoStatusBar style={isDarkMode ? 'light' : 'dark'} />
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </PaperProvider>
      </PersistGate>
      </Provider>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ff3b30',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
});

export default App;
