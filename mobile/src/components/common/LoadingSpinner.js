import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';

// Theme
import { colors } from '../../styles/theme';

const { width } = Dimensions.get('window');

const LoadingSpinner = ({ size = 'medium', color = colors.primary, style }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'medium';
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingSpinner;
