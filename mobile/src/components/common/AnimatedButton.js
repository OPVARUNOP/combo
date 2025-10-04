import React, { useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import { colors, spacing, radius, typography, animation } from '../styles/theme';

import { useTheme } from '../../styles/theme';

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
  const { theme } = useTheme();
  const scaleValue = useSharedValue(1);

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.95, animation.presets[animationPreset]);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, animation.presets[animationPreset]);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const getButtonColors = () => {
    if (disabled) {
      return {
        background: theme.colors.gray600,
        text: theme.colors.textDisabled,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          background: [theme.colors.buttonPrimary, theme.colors.buttonPrimaryPressed],
          text: theme.colors.white,
        };
      case 'secondary':
        return {
          background: [theme.colors.buttonSecondary, theme.colors.buttonSecondaryPressed],
          text: theme.colors.white,
        };
      case 'success':
        return {
          background: [theme.colors.buttonSuccess, theme.colors.buttonSuccessPressed],
          text: theme.colors.white,
        };
      case 'danger':
        return {
          background: [theme.colors.buttonDanger, theme.colors.buttonDangerPressed],
          text: theme.colors.white,
        };
      case 'outline':
        return {
          background: 'transparent',
          border: theme.colors.primary,
          text: theme.colors.primary,
        };
      default:
        return {
          background: [theme.colors.buttonPrimary, theme.colors.buttonPrimaryPressed],
          text: theme.colors.white,
        };
    }
  };

  const buttonColors = getButtonColors();
  const buttonSize = size === 'small' ? 40 : size === 'large' ? 56 : 48;
  const fontSize = size === 'small' ? typography.fontSize.sm : typography.fontSize.base;
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  return (
    <Animated.View style={[animatedStyle, style]}>
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
            colors={
              Array.isArray(buttonColors.background)
                ? buttonColors.background
                : [buttonColors.background]
            }
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <ActivityIndicator color={buttonColors.text} size='small' />
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
              <ActivityIndicator color={buttonColors.text} size='small' />
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
  const { theme } = useTheme();
  const scaleValue = useSharedValue(1);

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.9, animation.presets[animationPreset]);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, animation.presets[animationPreset]);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  return (
    <Animated.View style={[animatedStyle, styles.fabContainer, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.fab, { width: size, height: size, borderRadius: size / 2 }]}
        {...props}
      >
        <LinearGradient
          colors={theme.colors.gradientPrimary}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={icon} size={size * 0.4} color={theme.colors.white} />
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
  liked = false,
  ...props
}) => {
  const { theme } = useTheme();
  const scaleValue = useSharedValue(1);
  const colorValue = useSharedValue(liked ? 1 : 0);

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.9, animation.presets[animationPreset]);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, animation.presets[animationPreset]);
  };

  useEffect(() => {
    if (liked) {
      colorValue.value = withTiming(1, { duration: 200 });
      scaleValue.value = withSequence(
        withSpring(1.3, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
    } else {
      colorValue.value = withTiming(0, { duration: 200 });
    }
  }, [liked, colorValue, scaleValue]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const iconColor = interpolateColor(
      colorValue.value,
      [0, 1],
      [theme.colors.text, theme.colors.error],
    );
    return { color: iconColor };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.buttonPrimary,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.buttonSecondary,
        };
      default:
        return {
          backgroundColor: 'transparent',
        };
    }
  };

  return (
    <Animated.View style={animatedContainerStyle}>
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
          style,
        ]}
        {...props}
      >
        <Animated.Text style={animatedIconStyle}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={size * 0.5} />
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
