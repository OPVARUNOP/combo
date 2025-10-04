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
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, typography, radius, shadows } from '../../styles/theme';
import { loginUser, clearError } from '../../store/slices/authSlice';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Show error alert if there's an error
    if (error) {
      Alert.alert('Login Failed', error, [
        {
          text: 'Try Again',
          style: 'default',
        },
      ]);
    }
  }, [error]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      // Navigation will be handled by the auth state change in RootNavigator
    } catch (error) {
      // Error is already handled by the slice
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('Register');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={colors.gradientBg} style={styles.gradient}>
        {/* Logo/Brand Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>COMBO</Text>
            <Text style={styles.tagline}>Your Music, Your Way</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

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
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name='lock-closed'
              size={20}
              color={passwordError ? colors.error : colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, passwordError && styles.inputError]}
              placeholder='Password'
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) {
                  setPasswordError('');
                }
              }}
              secureTextEntry={!showPassword}
              autoCapitalize='none'
              autoCorrect={false}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          {/* Forgot Password */}
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size='small' />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name='logo-google' size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name='logo-apple' size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name='logo-facebook' size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Section */}
        <View style={styles.footerSection}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  divider: {
    backgroundColor: colors.white10,
    flex: 1,
    height: 1,
  },
  dividerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: spacing.xl,
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginHorizontal: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
  eyeIcon: {
    padding: spacing.sm,
  },
  footerSection: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: height * 0.05,
    paddingHorizontal: spacing.xl,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: height * 0.15,
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
  loginButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.md,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    color: colors.white,
    fontSize: typography.fontSize['6xl'],
    fontWeight: 'bold',
    letterSpacing: typography.letterSpacing.wider,
  },
  signUpLink: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  signUpText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
  },
  socialButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white10,
    borderRadius: radius.full,
    borderWidth: 1,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.lg,
    marginBottom: spacing['3xl'],
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

export default LoginScreen;
