import React from 'react';
import { View, Image, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { colors, spacing, typography } from '../styles/theme';

export const AppLogo = ({
  size = 'medium',
  showText = true,
  variant = 'default',
  style,
  animated = true,
}) => {
  const getLogoSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 64;
      case 'xl': return 80;
      case 'xxl': return 100;
      default: return 48;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return typography.fontSize.lg;
      case 'large': return typography.fontSize['3xl'];
      case 'xl': return typography.fontSize['4xl'];
      case 'xxl': return typography.fontSize['5xl'];
      default: return typography.fontSize['2xl'];
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
          colors={colors.gradientPrimary}
          style={[styles.logoContainer, { width: logoSize, height: logoSize }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.logoText, { fontSize: logoSize * 0.6, color: colors.white }]}>
            C
          </Text>
        </LinearGradient>
      );
    } else if (variant === 'image') {
      return (
        <View style={[styles.logoContainer, { width: logoSize, height: logoSize }]}>
          {/* Replace with your actual logo image */}
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Text style={[styles.logoText, { fontSize: logoSize * 0.6, color: colors.white }]}>
              C
            </Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={[styles.logoContainer, { width: logoSize, height: logoSize }]}>
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Text style={[styles.logoText, { fontSize: logoSize * 0.6, color: colors.white }]}>
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
        <Text style={[styles.logoName, { fontSize: textSize, color: colors.text }]}>
          COMBO
        </Text>
      )}
    </View>
  );
};

export const LogoWithTagline = ({ style }) => (
  <View style={[styles.taglineContainer, style]}>
    <AppLogo size="large" showText={true} />
    <Text style={styles.tagline}>Your Music, Your Way</Text>
  </View>
);

export const BrandedHeader = ({ title, subtitle, showLogo = true, style }) => (
  <View style={[styles.brandedHeader, style]}>
    {showLogo && <AppLogo size="medium" showText={true} />}
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
          backgroundColor: colors.elevated,
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: typography.fontFamily.bold,
    fontWeight: '900',
  },
  logoName: {
    fontFamily: typography.fontFamily.bold,
    fontWeight: '700',
    letterSpacing: 2,
  },
  taglineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  brandedHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  headerText: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  brandedCard: {
    borderRadius: 12,
    padding: spacing.lg,
    margin: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.md,
  },
});

export default AppLogo;
