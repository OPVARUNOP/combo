/// <reference types="@testing-library/jest-native" />
/// <reference types="@testing-library/react-native" />

// Add any global type declarations here
declare module '@testing-library/react-native' {
  export * from '@testing-library/react-native';
}

declare module '@testing-library/jest-native' {
  export * from '@testing-library/jest-native';
}

// Add any other global type declarations you need here
