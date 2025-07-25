import '@testing-library/jest-native/extend-expect';

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: '/test/documents/',
  getInfoAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
}));

// Mock react-native Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Appearance: {
    getColorScheme: jest.fn(),
    addChangeListener: jest.fn(),
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
  Stack: {
    Screen: ({ children }) => children,
  },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Global test utilities
global.console = {
  ...console,
  error: jest.fn(),
}; 