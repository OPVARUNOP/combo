import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../styles/theme';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service in production
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // In production, you would send this to your error reporting service
    // Example: Sentry.captureException(error, { contexts: { errorInfo } });
  }

  private handleRetry = (): void => {
    const { onRetry } = this.props;
    this.setState({ hasError: false, error: null });
    if (onRetry) {
      onRetry();
    }
  };

  public render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Ionicons name="warning" size={64} color={colors.error} />
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorMessage}>
              We're sorry, but something unexpected happened. Please try again.
            </Text>

            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>

            {__DEV__ && error && (
              <View style={styles.devError}>
                <Text style={styles.devErrorTitle}>Development Error:</Text>
                <Text style={styles.devErrorText}>{error.toString()}</Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  errorContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center' as const,
  },
  errorMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.white,
    textTransform: 'uppercase' as const,
  },
  devError: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    width: '100%',
  },
  devErrorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
    marginBottom: spacing.xs,
  },
  devErrorText: {
    fontSize: 12,
    color: colors.error,
  },
});

export default ErrorBoundary;
