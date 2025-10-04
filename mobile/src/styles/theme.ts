import { Platform } from 'react-native';
import { MD3LightTheme as DefaultTheme, MD3DarkTheme as DarkTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

// Base colors
export const colors = {
  // Brand colors - Blue gradient theme
  primary: '#3B82F6', // Blue-500
  primaryDark: '#1D4ED8', // Blue-700
  primaryLight: '#60A5FA', // Blue-400
  secondary: '#1E40AF', // Blue-800
  secondaryDark: '#1E3A8A', // Blue-900
  secondaryLight: '#3B82F6', // Blue-500

  // Background colors - Dark theme
  background: '#0F0F23', // Dark navy
  surface: '#1A1A2E', // Slightly lighter dark
  elevated: '#16213E', // Elevated surfaces
  card: '#0F172A', // Card backgrounds

  // Text colors
  text: '#F8FAFC', // Almost white
  textSecondary: '#94A3B8', // Light gray
  textDisabled: '#64748B', // Medium gray
  textInverse: '#0F0F23', // Dark for light backgrounds
  onSurface: '#F8FAFC', // Same as text color for dark theme

  // Status colors
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Red
  info: '#3B82F6', // Blue

  // Grayscale
  black: '#000000',
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',

  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(15, 15, 35, 0.9)',
  overlayLight: 'rgba(15, 15, 35, 0.7)',
  white10: 'rgba(248, 250, 252, 0.1)',
  white20: 'rgba(248, 250, 252, 0.2)',
};

// Typography
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    light: 'System',
    thin: 'System',
    bold: 'System-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  // Text styles
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    textTransform: 'uppercase',
    color: colors.white,
  },
};

// Spacing
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

// Shadows
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Animation
export const animation = {
  timing: {
    quick: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
  },
};

// Theme type
export type Theme = {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  animation: typeof animation;
};

// Default theme
export const lightTheme: Theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
};

// React Native Paper theme
export const paperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    text: colors.text,
    onSurface: colors.text,
    disabled: colors.gray500,
    placeholder: colors.gray400,
    backdrop: colors.overlay,
    notification: colors.error,
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

export const darkPaperTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    text: colors.text,
    onSurface: colors.text,
    disabled: colors.gray500,
    placeholder: colors.gray400,
    backdrop: colors.overlay,
    notification: colors.error,
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

// Navigation theme
export const navigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.gray800,
    notification: colors.error,
  },
};

export const darkNavigationTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.gray800,
    notification: colors.error,
  },
};

// Create a default export with all theme properties
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  paperTheme,
  darkPaperTheme,
  navigationTheme,
  darkNavigationTheme,
  // For backward compatibility
  light: lightTheme,
  dark: darkPaperTheme,
};

export default theme;
