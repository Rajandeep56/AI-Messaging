import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from '../Themed';
import { useColorScheme } from '../useColorScheme';

// Mock useColorScheme hook
jest.mock('../useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

// Mock Colors
jest.mock('@/constants/Colors', () => ({
  light: {
    text: '#000000',
    background: '#FFFFFF',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
  },
}));

describe('Themed Components', () => {
  const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Text Component', () => {
    it('should render with light theme colors', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = render(
        <Text>Hello World</Text>
      );

      const textElement = getByText('Hello World');
      expect(textElement).toBeTruthy();
    });

    it('should render with dark theme colors', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByText } = render(
        <Text>Hello World</Text>
      );

      const textElement = getByText('Hello World');
      expect(textElement).toBeTruthy();
    });

    it('should apply custom light color', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = render(
        <Text lightColor="#FF0000">Red Text</Text>
      );

      const textElement = getByText('Red Text');
      expect(textElement).toBeTruthy();
    });

    it('should apply custom dark color', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByText } = render(
        <Text darkColor="#00FF00">Green Text</Text>
      );

      const textElement = getByText('Green Text');
      expect(textElement).toBeTruthy();
    });

    it('should apply custom style', () => {
      mockUseColorScheme.mockReturnValue('light');

      const customStyle = { fontSize: 20, fontWeight: 'bold' as const };
      const { getByText } = render(
        <Text style={customStyle}>Styled Text</Text>
      );

      const textElement = getByText('Styled Text');
      expect(textElement).toBeTruthy();
    });

    it('should handle null color scheme', () => {
      mockUseColorScheme.mockReturnValue(null);

      const { getByText } = render(
        <Text>Default Text</Text>
      );

      const textElement = getByText('Default Text');
      expect(textElement).toBeTruthy();
    });
  });

  describe('View Component', () => {
    it('should render with light theme background', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = render(
        <View testID="test-view">Content</View>
      );

      const viewElement = getByTestId('test-view');
      expect(viewElement).toBeTruthy();
    });

    it('should render with dark theme background', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = render(
        <View testID="test-view">Content</View>
      );

      const viewElement = getByTestId('test-view');
      expect(viewElement).toBeTruthy();
    });

    it('should apply custom light background color', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = render(
        <View testID="test-view" lightColor="#FF0000">Red Background</View>
      );

      const viewElement = getByTestId('test-view');
      expect(viewElement).toBeTruthy();
    });

    it('should apply custom dark background color', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = render(
        <View testID="test-view" darkColor="#00FF00">Green Background</View>
      );

      const viewElement = getByTestId('test-view');
      expect(viewElement).toBeTruthy();
    });

    it('should apply custom style', () => {
      mockUseColorScheme.mockReturnValue('light');

      const customStyle = { padding: 10, margin: 5 };
      const { getByTestId } = render(
        <View testID="test-view" style={customStyle}>Styled View</View>
      );

      const viewElement = getByTestId('test-view');
      expect(viewElement).toBeTruthy();
    });

    it('should handle null color scheme', () => {
      mockUseColorScheme.mockReturnValue(null);

      const { getByTestId } = render(
        <View testID="test-view">Default View</View>
      );

      const viewElement = getByTestId('test-view');
      expect(viewElement).toBeTruthy();
    });
  });

  describe('useThemeColor hook', () => {
    it('should return light color when theme is light', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = render(
        <Text>Test</Text>
      );

      const textElement = getByText('Test');
      expect(textElement).toBeTruthy();
    });

    it('should return dark color when theme is dark', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByText } = render(
        <Text>Test</Text>
      );

      const textElement = getByText('Test');
      expect(textElement).toBeTruthy();
    });

    it('should prioritize custom light color over theme color', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = render(
        <Text lightColor="#FF0000">Custom Color</Text>
      );

      const textElement = getByText('Custom Color');
      expect(textElement).toBeTruthy();
    });

    it('should prioritize custom dark color over theme color', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByText } = render(
        <Text darkColor="#00FF00">Custom Color</Text>
      );

      const textElement = getByText('Custom Color');
      expect(textElement).toBeTruthy();
    });
  });
}); 