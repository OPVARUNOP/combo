import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

// Define the base theme
const baseTheme = {
  colors: {
    primary: '#6200ee',
    primaryContainer: '#3700b3',
    secondary: '#03dac4',
    secondaryContainer: '#018786',
    background: '#f6f6f6',
    surface: '#ffffff',
    error: '#b00020',
    onPrimary: '#ffffff',
    onSecondary: '#000000',
    onBackground: '#000000',
    onSurface: '#000000',
    onError: '#ffffff',
    text: '#000000',
    disabled: 'rgba(0, 0, 0, 0.38)',
    placeholder: 'rgba(0, 0, 0, 0.54)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#f50057',
    card: '#ffffff',
    border: '#e0e0e0',
  },
  roundness: 4,
  animation: {
    scale: 1.0,
  },
};

// Create light theme
const lightTheme = {
  ...MD3LightTheme,
  ...baseTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...baseTheme.colors,
  },
  dark: false,
};

// Create dark theme
const darkTheme = {
  ...MD3DarkTheme,
  ...baseTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...baseTheme.colors,
    primary: '#bb86fc',
    primaryContainer: '#3700b3',
    secondary: '#03dac4',
    background: '#121212',
    surface: '#1e1e1e',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onBackground: '#ffffff',
    onSurface: '#ffffff',
    text: '#ffffff',
    card: '#1e1e1e',
    border: '#2d2d2d',
  },
  dark: true,
};

export { lightTheme, darkTheme };

// Default export for backward compatibility
export default {
  light: lightTheme,
  dark: darkTheme,
};
