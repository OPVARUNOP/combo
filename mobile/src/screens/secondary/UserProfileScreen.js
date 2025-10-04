import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

const UserProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile Screen</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default UserProfileScreen;
