import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Theme
import { colors, spacing } from '../../styles/theme';

const AuthScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to COMBO</Text>
        <Text style={styles.subtitle}>Your Music, Your Way</Text>
      </View>

      <View style={styles.authOptions}>
        <TouchableOpacity
          style={[styles.authButton, isLogin && styles.activeButton]}
          onPress={() => setIsLogin(true)}
        >
          <Text style={[styles.authButtonText, isLogin && styles.activeButtonText]}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.authButton, !isLogin && styles.activeButton]}
          onPress={() => setIsLogin(false)}
        >
          <Text style={[styles.authButtonText, !isLogin && styles.activeButtonText]}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.placeholder}>
        <Ionicons name='musical-notes' size={64} color={colors.primary} />
        <Text style={styles.placeholderText}>{isLogin ? 'Login Screen' : 'Register Screen'}</Text>
        <Text style={styles.placeholderSubtext}>Authentication UI would be implemented here</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  activeButton: {
    backgroundColor: colors.primary,
  },
  activeButtonText: {
    color: colors.text,
  },
  authButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.md,
  },
  authButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  authOptions: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.xxl,
  },
  placeholder: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  placeholderSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  placeholderText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
});

export default AuthScreen;
