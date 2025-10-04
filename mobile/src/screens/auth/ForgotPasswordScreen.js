import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, typography, radius, shadows } from '../../styles/theme';

// Mock auth API for forgot password
const authAPI = {
  forgotPassword: async (email) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock successful response
    return {
      data: {
        message: 'Password reset instructions sent to your email',
        success: true,
      },
    };
  },
};

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    // Clear any existing errors when component mounts
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const handleSendResetEmail = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setEmailSent(true);
    } catch (error) {
      Alert.alert(
        'Reset Failed',
        error.response?.data?.message || 'Failed to send reset email. Please try again.',
        [
          {
            text: 'Try Again',
            style: 'default',
          },
        ],
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setEmail('');
  };

  if (emailSent) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient colors={colors.gradientBg} style={styles.gradient}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>COMBO</Text>
              <Text style={styles.tagline}>Check Your Email</Text>
            </View>
          </View>

          {/* Success Section */}
          <View style={styles.successSection}>
            <View style={styles.successIconContainer}>
              <Ionicons name='mail' size={64} color={colors.primary} />
            </View>

            <Text style={styles.successTitle}>Reset Email Sent</Text>
            <Text style={styles.successMessage}>
              We've sent a password reset link to{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>

            <Text style={styles.instructionsText}>
              Click the link in the email to reset your password. If you don't see the email, check
              your spam folder.
            </Text>

            {/* Resend Button */}
            <TouchableOpacity style={styles.resendButton} onPress={handleResendEmail}>
              <Text style={styles.resendButtonText}>Send Another Email</Text>
            </TouchableOpacity>

            {/* Back to Login Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={colors.gradientBg} style={styles.gradient}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>COMBO</Text>
            <Text style={styles.tagline}>Reset Your Password</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name='mail'
              size={20}
              color={emailError ? colors.error : colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder='Email'
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) {
                  setEmailError('');
                }
              }}
              keyboardType='email-address'
              autoCapitalize='none'
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          {/* Send Reset Button */}
          <TouchableOpacity
            style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
            onPress={handleSendResetEmail}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size='small' />
            ) : (
              <Text style={styles.resetButtonText}>Send Reset Email</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToLogin}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Remember your password? <Text style={styles.footerLink}>Sign In</Text>
          </Text>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    textDecorationLine: 'underline',
  },
  container: {
    flex: 1,
  },
  emailText: {
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
  footerLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  footerSection: {
    alignItems: 'center',
    paddingBottom: height * 0.05,
    paddingHorizontal: spacing.xl,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  gradient: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: height * 0.12,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: typography.fontSize.base,
    paddingVertical: spacing.md,
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white10,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  instructionsText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing['2xl'],
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    color: colors.white,
    fontSize: typography.fontSize['5xl'],
    fontWeight: 'bold',
    letterSpacing: typography.letterSpacing.wider,
  },
  resendButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white10,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  resendButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: '500',
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.md,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    lineHeight: 22,
    marginBottom: spacing['3xl'],
    textAlign: 'center',
  },
  successIconContainer: {
    marginBottom: spacing.xl,
  },
  successMessage: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    lineHeight: 24,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  successSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  successTitle: {
    color: colors.white,
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.lg,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  title: {
    color: colors.white,
    fontSize: typography.fontSize['3xl'],
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
