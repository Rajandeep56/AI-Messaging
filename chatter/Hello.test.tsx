import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

describe('Sample Test', () => {
  it('renders a hello message', () => {
    const { getByText } = render(<Text>Hello, World!</Text>);
    expect(getByText('Hello, World!')).toBeTruthy();
  });
}); 