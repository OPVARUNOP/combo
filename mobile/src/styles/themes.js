import { colors as baseColors } from './theme';

export const themes = {
  dark_blue: {
    ...baseColors,
  },
  light: {
    ...baseColors,
    background: '#F8FAFC',
    surface: '#FFFFFF',
    elevated: '#F1F5F9',
    card: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#475569',
    textDisabled: '#94A3B8',
    textInverse: '#F8FAFC',
    gradientBg: ['#F8FAFC', '#F1F5F9', '#E2E8F0'],
  },
  dark_purple: {
    ...baseColors,
    primary: '#7C3AED',
    primaryDark: '#6D28D9',
    primaryLight: '#9F67FF',
    secondary: '#5B21B6',
    secondaryDark: '#4C1D95',
    secondaryLight: '#7C3AED',
    gradientPrimary: ['#7C3AED', '#6D28D9', '#5B21B6'],
    buttonPrimary: '#7C3AED',
    buttonPrimaryPressed: '#6D28D9',
  },
  dark_green: {
    ...baseColors,
    primary: '#10B981',
    primaryDark: '#059669',
    primaryLight: '#34D399',
    secondary: '#047857',
    secondaryDark: '#065F46',
    secondaryLight: '#10B981',
    gradientPrimary: ['#10B981', '#059669', '#047857'],
    buttonPrimary: '#10B981',
    buttonPrimaryPressed: '#059669',
  },
};
