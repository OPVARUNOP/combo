import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  WithSpringConfig,
  WithTimingConfig,
} from 'react-native-reanimated';
import { colors } from '@constants/theme';
import { AppLogo } from './AppLogo';

interface SplashScreenProps {
  onAnimationComplete?: () => void;
  style?: StyleProp<ViewStyle>;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onAnimationComplete, 
  style 
}) => {
  const opacity = useSharedValue<number>(0);
  const scale = useSharedValue<number>(0.8);

  useEffect(() => {
    const timingConfig: WithTimingConfig = { duration: 1000 };
    const springConfig: WithSpringConfig = { 
      damping: 15, 
      stiffness: 100 
    };

    opacity.value = withTiming(1, timingConfig);
    scale.value = withSpring(1, springConfig, () => {
      if (onAnimationComplete) {
        runOnJS(onAnimationComplete)();
      }
    });
  }, [onAnimationComplete, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={[styles.container, style]}
    >
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <AppLogo width={120} height={120} />
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SplashScreen;
