import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated as RNAnimated,
  Easing,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// Theme
import { colors, spacing, typography, shadows } from '../../styles/theme';

const { width } = Dimensions.get('window');

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

const TabBar = ({ state, descriptors, navigation }) => {
  const focusedIndex = useSharedValue(state.index);
  const animationValues = state.routes.map(() => new RNAnimated.Value(0));

  // Animate the active tab indicator
  const animatedStyle = useAnimatedStyle(() => {
    const tabWidth = width / state.routes.length;
    return {
      width: tabWidth - 40, // Slightly smaller than tab width
      transform: [
        {
          translateX: withSpring(focusedIndex.value * tabWidth + 20, {
            damping: 15,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  // Animate tab icons on press
  const animateTabPress = (index) => {
    RNAnimated.sequence([
      RNAnimated.timing(animationValues[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      RNAnimated.timing(animationValues[index], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const icon = options.tabBarIcon;
          const isFocused = state.index === index;

          // Animation for icon scale
          const scale = animationValues[index].interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 1.2, 1],
          });

          const onPress = () => {
            animateTabPress(index);
            focusedIndex.value = index;

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Animated styles for icon and label
          const iconAnimatedStyle = {
            transform: [{ scale }],
          };

          const labelAnimatedStyle = {
            opacity: withTiming(isFocused ? 1 : 0.7, { duration: 200 }),
            transform: [
              {
                translateY: withTiming(isFocused ? 0 : 2, { duration: 200 }),
              },
            ],
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <RNAnimated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                  <Ionicons
                    name={isFocused ? icon.replace('-outline', '') : icon}
                    size={24}
                    color={isFocused ? colors.primary : colors.textSecondary}
                  />
                </RNAnimated.View>
                <Animated.Text 
                  style={[
                    styles.label,
                    labelAnimatedStyle,
                    { color: isFocused ? colors.primary : colors.textSecondary }
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Animated.Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Active indicator */}
      <Animated.View style={[styles.indicator, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.gray800,
    ...shadows.sm,
  },
  background: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: colors.surface,
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    height: 4,
    backgroundColor: colors.primary,
    bottom: 0,
    left: 0,
    borderRadius: 2,
    ...shadows.sm,
  },
});

export default TabBar;
