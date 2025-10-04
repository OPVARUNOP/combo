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
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, typography, radius, shadows } from '../../styles/theme';
import { registerUser, clearError } from '../../store/slices/authSlice';

const { width, height } = Dimensions.get('window');

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error, [
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

  const validateUsername = (username) => {
    // Username should be 3-20 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password) => {
    // Password should be at least 8 characters with mixed case, numbers, and special characters
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters, alphanumeric and underscores only';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance
    if (!acceptTerms) {
      newErrors.terms = 'Please accept the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      const result = await dispatch(registerUser(userData)).unwrap();
      // Navigation will be handled by the auth state change in RootNavigator
    } catch (error) {
      // Error is already handled by the slice
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const toggleTerms = () => {
    setAcceptTerms(!acceptTerms);
    if (errors.terms) {
      setErrors((prev) => ({
        ...prev,
        terms: '',
      }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={colors.gradientBg} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>COMBO</Text>
              <Text style={styles.tagline}>Join the Music Revolution</Text>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name='person'
                size={20}
                color={errors.username ? colors.error : colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, errors.username && styles.inputError]}
                placeholder='Username'
                placeholderTextColor={colors.textSecondary}
                value={formData.username}
                onChangeText={(text) => handleInputChange('username', text)}
                autoCapitalize='none'
                autoCorrect={false}
              />
            </View>
            {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name='mail'
                size={20}
                color={errors.email ? colors.error : colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder='Email'
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            {/* Name Inputs Row */}
            <View style={styles.nameRow}>
              <View style={styles.nameInputContainer}>
                <TextInput
                  style={[styles.nameInput, errors.firstName && styles.inputError]}
                  placeholder='First Name'
                  placeholderTextColor={colors.textSecondary}
                  value={formData.firstName}
                  onChangeText={(text) => handleInputChange('firstName', text)}
                  autoCapitalize='words'
                />
              </View>
              <View style={styles.nameInputContainer}>
                <TextInput
                  style={[styles.nameInput, errors.lastName && styles.inputError]}
                  placeholder='Last Name'
                  placeholderTextColor={colors.textSecondary}
                  value={formData.lastName}
                  onChangeText={(text) => handleInputChange('lastName', text)}
                  autoCapitalize='words'
                />
              </View>
            </View>
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name='lock-closed'
                size={20}
                color={errors.password ? colors.error : colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder='Password'
                placeholderTextColor={colors.textSecondary}
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry={!showPassword}
                autoCapitalize='none'
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('password')}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name='lock-closed'
                size={20}
                color={errors.confirmPassword ? colors.error : colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                placeholder='Confirm Password'
                placeholderTextColor={colors.textSecondary}
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize='none'
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('confirmPassword')}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}

            {/* Terms and Conditions */}
            <TouchableOpacity onPress={toggleTerms} style={styles.termsContainer}>
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms && <Ionicons name='checkmark' size={16} color={colors.white} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} size='small' />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
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

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    alignItems: 'center',
    borderColor: colors.textSecondary,
    borderRadius: radius.sm,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: spacing.xxs,
    width: 20,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
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
  formSection: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  gradient: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: height * 0.08,
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
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    color: colors.white,
    fontSize: typography.fontSize['5xl'],
    fontWeight: 'bold',
    letterSpacing: typography.letterSpacing.wider,
  },
  nameInput: {
    backgroundColor: colors.surface,
    borderColor: colors.white10,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.fontSize.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  nameInputContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  registerButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.md,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  signInLink: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  signInText: {
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
  termsContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: spacing.xl,
    paddingRight: spacing.md,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  termsText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  title: {
    color: colors.white,
    fontSize: typography.fontSize['3xl'],
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});

export default RegisterScreen;
