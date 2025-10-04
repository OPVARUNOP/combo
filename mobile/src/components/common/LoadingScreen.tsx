import React, { FC } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '../../constants/theme';

interface LoadingScreenProps {
  style?: StyleProp<ViewStyle>;
  color?: string;
  size?: 'small' | 'large' | number;
}

export const LoadingScreen: FC<LoadingScreenProps> = ({
  style,
  color = colors.primary,
  size = 'large',
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  } as ViewStyle,
});

export default LoadingScreen;
