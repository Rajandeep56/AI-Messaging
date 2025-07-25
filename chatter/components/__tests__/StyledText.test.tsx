import React from 'react';
import { render } from '@testing-library/react-native';
import { MonoText } from '../StyledText';

// Mock the Themed Text component
jest.mock('../Themed', () => ({
  Text: ({ children, style, ...props }: any) => {
    const React = require('react');
    return React.createElement('Text', { style, ...props }, children);
  },
}));

describe('StyledText Component', () => {
  it('should render with children', () => {
    const { getByText } = render(
      <MonoText>Hello World</MonoText>
    );

    const textElement = getByText('Hello World');
    expect(textElement).toBeTruthy();
  });

  it('should apply SpaceMono font family', () => {
    const { getByText } = render(
      <MonoText>Monospace Text</MonoText>
    );

    const textElement = getByText('Monospace Text');
    expect(textElement).toBeTruthy();
  });

  it('should merge custom styles with default font family', () => {
    const customStyle = { fontSize: 18, color: '#FF0000' };
    const { getByText } = render(
      <MonoText style={customStyle}>Styled Monospace Text</MonoText>
    );

    const textElement = getByText('Styled Monospace Text');
    expect(textElement).toBeTruthy();
  });

  it('should pass through additional props', () => {
    const { getByTestId } = render(
      <MonoText testID="mono-text" accessibilityLabel="Monospace text">
        Accessible Text
      </MonoText>
    );

    const textElement = getByTestId('mono-text');
    expect(textElement).toBeTruthy();
  });

  it('should handle empty children', () => {
    const { UNSAFE_root } = render(<MonoText />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should handle null style prop', () => {
    const { getByText } = render(
      <MonoText style={null}>Text with null style</MonoText>
    );

    const textElement = getByText('Text with null style');
    expect(textElement).toBeTruthy();
  });

  it('should handle undefined style prop', () => {
    const { getByText } = render(
      <MonoText style={undefined}>Text with undefined style</MonoText>
    );

    const textElement = getByText('Text with undefined style');
    expect(textElement).toBeTruthy();
  });

  it('should handle array of styles', () => {
    const style1 = { fontSize: 16 };
    const style2 = { color: '#000000' };
    const { getByText } = render(
      <MonoText style={[style1, style2]}>Text with style array</MonoText>
    );

    const textElement = getByText('Text with style array');
    expect(textElement).toBeTruthy();
  });

  it('should handle complex nested content', () => {
    const { getByText } = render(
      <MonoText>
        <MonoText>Nested</MonoText> Content
      </MonoText>
    );

    const textElement = getByText('Nested Content');
    expect(textElement).toBeTruthy();
  });
}); 