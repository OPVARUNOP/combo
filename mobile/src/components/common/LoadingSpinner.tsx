import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../../styles/theme';

type Size = 'small' | 'medium' | 'large';

interface LoadingSpinnerProps {
  size?: Size;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = colors.primary,
  style,
}) => {
  const getSize = (): 'small' | 'large' | number => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'large'; // 'medium' is not a valid value, using 'large' as default
    }
  };

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={getSize()} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default LoadingSpinner;
