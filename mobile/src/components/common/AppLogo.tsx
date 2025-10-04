import React from 'react';
import { 
  View, 
  Image, 
  Text, 
  StyleSheet, 
  Platform, 
  StyleProp, 
  ViewStyle, 
  ImageStyle,
  TextStyle
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import theme from '../../styles/theme';

const colors = theme.light.colors;
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  fontFamily: {
    regular: 'System',
    medium: 'System',
    light: 'System',
    thin: 'System',
    bold: 'System-Bold',
  },
};

type LogoSize = 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
type LogoVariant = 'default' | 'light' | 'dark' | 'gradient' | 'image';

interface AppLogoProps {
  size?: LogoSize;
  showText?: boolean;
  variant?: LogoVariant;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
  width?: number;
  height?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'medium',
  showText = true,
  variant = 'default',
  style,
  animated = true,
  width,
  height,
}) => {
  const getLogoSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 64;
      case 'xl':
        return 80;
      case 'xxl':
        return 100;
      default:
        return 48;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return typography.fontSize.lg;
      case 'large':
        return typography.fontSize['3xl'];
      case 'xl':
        return typography.fontSize['4xl'];
      case 'xxl':
        return typography.fontSize['5xl'];
      default:
        return typography.fontSize['2xl'];
    }
  };

  const logoSize = getLogoSize();
  const textSize = getTextSize();

  // Placeholder for actual logo image
  const LogoImage = () => {
    // Replace this with your actual logo image
    // Example: <Image source={require('../../assets/images/logo.png')} style={styles.logoImage} />

    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={[styles.logoContainer, { width: logoSize, height: logoSize }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.logoText, { fontSize: logoSize * 0.6, color: '#FFFFFF' }]}>
            C
          </Text>
        </LinearGradient>
      );
    } else if (variant === 'image') {
      return (
        <View style={[styles.logoContainer, { width: logoSize, height: logoSize }]}>
          {/* Replace with your actual logo image */}
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Text style={[styles.logoText, { fontSize: logoSize * 0.6, color: '#FFFFFF' }]}>
              C
            </Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={[styles.logoContainer, { width: logoSize, height: logoSize }]}>
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Text style={[styles.logoText, { fontSize: logoSize * 0.6, color: '#FFFFFF' }]}>
              C
            </Text>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, style]}>
      <LogoImage />

      {showText && (
        <Text style={[styles.logoName, { fontSize: textSize, color: colors.text }]}>COMBO</Text>
      )}
    </View>
  );
};

export const LogoWithTagline = ({ style }) => (
  <View style={[styles.taglineContainer, style]}>
    <AppLogo size='large' showText={true} />
    <Text style={styles.tagline}>Your Music, Your Way</Text>
  </View>
);

export const BrandedHeader = ({ title, subtitle, showLogo = true, style }) => (
  <View style={[styles.brandedHeader, style]}>
    {showLogo && <AppLogo size='medium' showText={true} />}
    <View style={styles.headerText}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
  </View>
);

export const BrandedCard = ({ children, title, style, variant = 'default' }) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.card,
          borderColor: colors.primary,
          borderWidth: 1,
        };
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          ...Platform.select({
            ios: {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
        };
      default:
        return {
          backgroundColor: colors.card,
        };
    }
  };

  return (
    <View style={[styles.brandedCard, getCardStyle(), style]}>
      {title && <Text style={styles.cardTitle}>{title}</Text>}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  brandedCard: {
    borderRadius: 12,
    margin: spacing.md,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  brandedHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  cardTitle: {
    color: colors.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerSubtitle: {
    color: colors.onSurface,
    fontSize: typography.fontSize.lg,
    textAlign: 'center',
  },
  headerText: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  headerTitle: {
    color: colors.text,
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  logoContainer: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    marginRight: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoIcon: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
  },
  logoName: {
    fontFamily: typography.fontFamily.bold,
    fontWeight: '700',
    letterSpacing: 2,
  },
  logoText: {
    fontFamily: typography.fontFamily.bold,
    fontWeight: '900',
  },
  tagline: {
    color: colors.onSurface,
    fontSize: typography.fontSize.lg,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  taglineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppLogo;
