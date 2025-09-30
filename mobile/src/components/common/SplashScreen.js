import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { colors } from '../../styles/theme';

const SplashScreen = ({ onAnimationComplete }) => {
  // Simple timeout to simulate animation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>COMBO</Text>
        <Text style={styles.subtitle}>Your Music, Your Way</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
});

export default SplashScreen;
