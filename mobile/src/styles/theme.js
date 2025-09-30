import { Platform } from 'react-native';

// Brand colors for COMBO - Blue & Black Dark Theme
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
  black50: 'rgba(0, 0, 0, 0.5)',

  // Gradient colors - Blue theme
  gradientStart: '#3B82F6', // Blue-500
  gradientMiddle: '#1D4ED8', // Blue-700
  gradientEnd: '#1E40AF', // Blue-800
  gradientBg: ['#0F0F23', '#1A1A2E', '#16213E'], // Dark gradient
  gradientPrimary: ['#3B82F6', '#1D4ED8', '#1E40AF'], // Blue gradient
  gradientSecondary: ['#1E40AF', '#1D4ED8', '#3B82F6'], // Reverse blue gradient

  // Button specific colors
  buttonPrimary: '#3B82F6',
  buttonPrimaryPressed: '#1D4ED8',
  buttonSecondary: '#1E40AF',
  buttonSecondaryPressed: '#1E3A8A',
  buttonSuccess: '#10B981',
  buttonSuccessPressed: '#059669',
  buttonDanger: '#EF4444',
  buttonDangerPressed: '#DC2626',

  // Blue theme variants for customization
  blueVariants: {
    // Ocean Blue Theme
    ocean: {
      primary: '#0EA5E9', // Sky-500
      primaryDark: '#0284C7', // Sky-600
      primaryLight: '#38BDF8', // Sky-400
      secondary: '#0369A1', // Sky-700
    },
    // Royal Blue Theme
    royal: {
      primary: '#4338CA', // Indigo-600
      primaryDark: '#3730A3', // Indigo-700
      primaryLight: '#6366F1', // Indigo-500
      secondary: '#312E81', // Indigo-800
    },
    // Electric Blue Theme
    electric: {
      primary: '#3B82F6', // Blue-500
      primaryDark: '#1D4ED8', // Blue-700
      primaryLight: '#60A5FA', // Blue-400
      secondary: '#1E40AF', // Blue-800
    },
    // Deep Blue Theme
    deep: {
      primary: '#1E40AF', // Blue-800
      primaryDark: '#1E3A8A', // Blue-900
      primaryLight: '#3B82F6', // Blue-500
      secondary: '#1D4ED8', // Blue-700
    },
    // Cyan Blue Theme
    cyan: {
      primary: '#06B6D4', // Cyan-500
      primaryDark: '#0891B2', // Cyan-600
      primaryLight: '#22D3EE', // Cyan-400
      secondary: '#0E7490', // Cyan-700
    },
  },
};

// Typography
export const typography = {
  fontFamily: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto-Regular',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    semiBold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Black',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
  },
};

// Spacing
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
  '7xl': 96,
  '8xl': 128,
};

// Border radius
export const radius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
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
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  '2xl': {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 24,
    },
    shadowOpacity: 0.45,
    shadowRadius: 11.14,
    elevation: 16,
  },
};

// Animation
export const animation = {
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
    // Customizable animation speeds
    buttonPress: 150, // Button press animation
    pageTransition: 250, // Screen transitions
    modalSlide: 300, // Modal animations
    loadingSpinner: 1000, // Loading indicators
    fadeIn: 200, // Fade in animations
    bounce: 400, // Bounce animations
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  // Animation presets for different UI elements
  presets: {
    button: {
      duration: 150,
      easing: 'easeOut',
    },
    modal: {
      duration: 300,
      easing: 'easeInOut',
    },
    page: {
      duration: 250,
      easing: 'easeInOut',
    },
    loading: {
      duration: 2000,
      easing: 'linear',
      loop: true,
    },
    bounce: {
      duration: 400,
      easing: 'bounce',
    },
    elastic: {
      duration: 600,
      easing: 'elastic',
    },
  },
};

// Z-index
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// Export the theme
export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  animation,
  zIndex,
};

export default theme;
