import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Animated,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, animation } from '../styles/theme';

export const AnimatedButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  animationPreset = 'button',
  ...props
}) => {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
      ...animation.presets[animationPreset],
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
      ...animation.presets[animationPreset],
    }).start();
  };

  const getButtonColors = () => {
    if (disabled) {
      return {
        background: colors.gray600,
        text: colors.textDisabled,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          background: [colors.buttonPrimary, colors.buttonPrimaryPressed],
          text: colors.white,
        };
      case 'secondary':
        return {
          background: [colors.buttonSecondary, colors.buttonSecondaryPressed],
          text: colors.white,
        };
      case 'success':
        return {
          background: [colors.buttonSuccess, colors.buttonSuccessPressed],
          text: colors.white,
        };
      case 'danger':
        return {
          background: [colors.buttonDanger, colors.buttonDangerPressed],
          text: colors.white,
        };
      case 'outline':
        return {
          background: 'transparent',
          border: colors.primary,
          text: colors.primary,
        };
      default:
        return {
          background: [colors.buttonPrimary, colors.buttonPrimaryPressed],
          text: colors.white,
        };
    }
  };

  const buttonColors = getButtonColors();
  const buttonSize = size === 'small' ? 40 : size === 'large' ? 56 : 48;
  const fontSize = size === 'small' ? typography.fontSize.sm : typography.fontSize.base;
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleValue }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          {
            height: buttonSize,
            backgroundColor: buttonColors.background,
            borderColor: buttonColors.border,
            borderWidth: variant === 'outline' ? 2 : 0,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        {...props}
      >
        {variant !== 'outline' ? (
          <LinearGradient
            colors={Array.isArray(buttonColors.background) ? buttonColors.background : [buttonColors.background]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <ActivityIndicator color={buttonColors.text} size="small" />
              ) : (
                <>
                  {icon && (
                    <Ionicons
                      name={icon}
                      size={iconSize}
                      color={buttonColors.text}
                      style={styles.icon}
                    />
                  )}
                  <Text style={[styles.buttonText, { color: buttonColors.text, fontSize }]}>
                    {title}
                  </Text>
                </>
              )}
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.buttonContent}>
            {loading ? (
              <ActivityIndicator color={buttonColors.text} size="small" />
            ) : (
              <>
                {icon && (
                  <Ionicons
                    name={icon}
                    size={iconSize}
                    color={buttonColors.text}
                    style={styles.icon}
                  />
                )}
                <Text style={[styles.buttonText, { color: buttonColors.text, fontSize }]}>
                  {title}
                </Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const FloatingActionButton = ({
  icon,
  onPress,
  size = 56,
  style,
  animationPreset = 'bounce',
  ...props
}) => {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
      ...animation.presets[animationPreset],
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
      ...animation.presets[animationPreset],
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleValue }],
        },
        styles.fabContainer,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.fab, { width: size, height: size, borderRadius: size / 2 }]}
        {...props}
      >
        <LinearGradient
          colors={colors.gradientPrimary}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={icon} size={size * 0.4} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const IconButton = ({
  icon,
  onPress,
  size = 40,
  variant = 'default',
  style,
  animationPreset = 'button',
  ...props
}) => {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
      ...animation.presets[animationPreset],
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.buttonPrimary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.buttonSecondary,
        };
      default:
        return {
          backgroundColor: 'transparent',
        };
    }
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleValue }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.iconButton,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            ...getButtonStyle(),
          },
        ]}
        {...props}
      >
        <Ionicons name={icon} size={size * 0.4} color={colors.white} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.lg,
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
  gradient: {
    flex: 1,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontWeight: '600',
  },
  icon: {
    marginRight: spacing.sm,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  fab: {
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  fabGradient: {
    flex: 1,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default AnimatedButton;
