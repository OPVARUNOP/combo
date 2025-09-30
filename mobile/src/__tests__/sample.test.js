import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

describe('Sample test', () => {
  it('renders text correctly', () => {
    const { getByText } = render(<Text>Hello, world!</Text>);
    expect(getByText('Hello, world!')).toBeTruthy();
  });
});
