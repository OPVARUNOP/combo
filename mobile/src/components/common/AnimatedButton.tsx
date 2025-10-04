import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
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
  WithSpringConfig,
  WithTimingConfig,
} from 'react-native-reanimated';

// Define theme colors locally to avoid dependency on theme file
const localColors = {
  // Basic colors
  primary: '#3B82F6',
  secondary: '#1E40AF',
  success: '#10B981',
  danger: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  gray600: '#475569',
  
  // Text colors
  text: '#1F2937',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  onSurface: '#1F2937',
  
  // Background colors
  background: '#F9FAFB',
  surface: '#FFFFFF',
  elevated: '#F3F4F6',
  card: '#FFFFFF',
  
  // Border colors
  border: '#E5E7EB',
  
  // Button colors
  buttonPrimary: '#3B82F6',
  buttonPrimaryPressed: '#2563EB',
  buttonSecondary: '#6B7280',
  buttonSecondaryPressed: '#4B5563',
  buttonSuccess: '#10B981',
  buttonSuccessPressed: '#059669',
  buttonDanger: '#EF4444',
  buttonDangerPressed: '#DC2626',
  
  // Other UI colors
  error: '#EF4444',
  placeholder: '#9CA3AF',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#EF4444',
};

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';
type AnimationPreset = 'button' | 'bounce' | 'scale' | 'fade';

interface ButtonColors {
  background: string | string[];
  text: string;
  border?: string;
}

interface AnimatedButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  animationPreset?: AnimationPreset;
  children?: ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
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
  // Use local colors instead of theme
  const theme = { colors: localColors };
  
  // Animation presets
  const animation = {
    presets: {
      button: { damping: 10, stiffness: 500 },
      bounce: { damping: 15, stiffness: 300 },
      scale: { damping: 10, stiffness: 400 },
      fade: { damping: 20, stiffness: 300 },
    } as const,
  };
  
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

  const getButtonColors = (): ButtonColors => {
    if (disabled) {
      return {
        background: theme.colors.gray600,
        text: theme.colors.textDisabled,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          background: theme.colors.primary,
          text: theme.colors.white,
        };
      case 'secondary':
        return {
          background: theme.colors.secondary,
          text: theme.colors.white,
        };
      case 'success':
        return {
          background: theme.colors.success,
          text: theme.colors.white,
        };
      case 'danger':
        return {
          background: theme.colors.danger,
          text: theme.colors.white,
        };
      case 'outline':
        return {
          background: 'transparent',
          text: theme.colors.primary,
          border: `1px solid ${theme.colors.primary}`,
        };
      default:
        return {
          background: theme.colors.primary,
          text: theme.colors.white,
        };
    }
  };

  const buttonColors = getButtonColors();
  const buttonSize = size === 'small' ? 40 : size === 'large' ? 56 : 48;
  const fontSize = size === 'small' ? 14 : 16; // Updated to use numbers directly
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  const renderButtonContent = () => (
    <View style={styles.buttonContent}>
      {loading ? (
        <ActivityIndicator color={buttonColors.text} size="small" />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon as any}
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
  );

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
            backgroundColor: Array.isArray(buttonColors.background) ? 'transparent' : buttonColors.background,
            borderColor: buttonColors.border,
            borderWidth: variant === 'outline' ? 2 : 0,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        {...props}
      >
        {variant !== 'outline' && Array.isArray(buttonColors.background) ? (
          <LinearGradient
            colors={buttonColors.background}
            style={[styles.gradient, { height: '100%', width: '100%' }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {renderButtonContent()}
          </LinearGradient>
        ) : (
          renderButtonContent()
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

interface FloatingActionButtonProps extends Omit<AnimatedButtonProps, 'title' | 'variant' | 'size'> {
  icon: string;
  size?: number;
  animationPreset?: AnimationPreset;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  size = 56,
  style,
  animationPreset = 'bounce',
  ...props
}) => {
  // Use local colors instead of theme
  const theme = { colors: localColors };
  const scaleValue = useSharedValue(1);

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.9, animation.presets[animationPreset]);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, animation.presets[animationPreset]);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.fab,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.colors.primary,
          },
        ]}
        {...props}
      >
        <Ionicons name={icon as any} size={size * 0.5} color={theme.colors.white} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Define the IconButton specific variant type
type IconButtonVariant = 'default' | 'outline' | 'ghost';

interface IconButtonProps extends Omit<AnimatedButtonProps, 'title' | 'size' | 'variant'> {
  icon: string;
  size?: number;
  variant?: IconButtonVariant;
  liked?: boolean;
  animationPreset?: AnimationPreset;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 40,
  variant = 'default',
  style,
  animationPreset = 'button',
  liked = false,
  ...props
}) => {
  // Use local colors instead of theme
  const theme = { colors: localColors };
  
  // Map the IconButtonVariant to ButtonVariant
  const getButtonVariant = (v: IconButtonVariant): ButtonVariant => {
    switch (v) {
      case 'default':
        return 'primary';
      case 'ghost':
        return 'outline';
      case 'outline':
        return 'outline';
      default:
        return 'primary';
    }
  };
  
  const buttonVariant = getButtonVariant(variant);
  const scaleValue = useSharedValue(1);

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.9, animation.presets[animationPreset]);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, animation.presets[animationPreset]);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const getButtonStyle = () => {
    switch (variant) {
      case 'outline':
        return {
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: 'transparent',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: theme.colors.surface,
        };
    }
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
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
        <Ionicons
          name={icon as any}
          size={size * 0.6}
          color={liked ? theme.colors.error : theme.colors.text}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonText: {
    fontFamily: 'System',
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
  fab: {
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Animation presets
const animation = {
  presets: {
    button: {
      damping: 10,
      stiffness: 100,
    },
    bounce: {
      damping: 15,
      stiffness: 200,
    },
    scale: {
      damping: 15,
      stiffness: 100,
    },
    fade: {
      duration: 150,
    },
  },
};
