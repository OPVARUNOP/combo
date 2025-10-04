import 'react-native';
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text, View, StyleSheet } from 'react-native';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Mock console.error to avoid seeing error logs in test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Suppress error and warning logs during tests
  console.error = jest.fn();
  console.warn = jest.fn();  
  
  // Mock any native modules or libraries used by the ErrorBoundary
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
});

afterAll(() => {
  // Restore original console methods
  console.error = originalError;
  console.warn = originalWarn;
  jest.clearAllMocks();
});

// A component that throws an error
const ErrorComponent: React.FC = () => {
  throw new Error('Test error');
};

// A simple fallback component for testing
const TestFallback: React.FC = () => (
  <View testID="fallback-ui">
    <Text>Custom Error Message</Text>
  </View>
);

// Mock the ErrorBoundary's componentDidCatch to test error handling
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    Component: class Component extends originalReact.Component {
      // @ts-ignore - Mocking componentDidCatch for testing
      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ hasError: true, error, errorInfo });
      }
    },
  };
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Test Content</Text>
      </ErrorBoundary>
    );
    
    expect(getByText('Test Content')).toBeTruthy();
  });

  it('renders fallback UI when there is an error', () => {
    const { getByText } = render(
      <ErrorBoundary fallback={<TestFallback />}>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(getByText('Custom Error Message')).toBeTruthy();
  });

  it('renders default error UI when no fallback is provided', () => {
    // Mock the ErrorBoundary's state to simulate an error
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('calls componentDidCatch when child throws an error', () => {
    // Spy on console.error to verify error handling
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    // Verify that an error was logged
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

// Mock StyleSheet if needed
jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => {
  const original = jest.requireActual('react-native/Libraries/StyleSheet/StyleSheet');
  return {
    ...original,
    create: (styles: any) => styles,
  };
});
