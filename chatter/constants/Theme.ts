import { useColorScheme } from 'react-native';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Message colors
  messageSent: string;
  messageReceived: string;
  messageText: string;
  messageTime: string;
  
  // UI elements
  border: string;
  divider: string;
  shadow: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Chat specific
  chatBackground: string;
  inputBackground: string;
  suggestionBackground: string;
  typingIndicator: string;
  
  // Navigation
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  header: string;
  headerText: string;
}

const lightTheme: ThemeColors = {
  // Primary colors
  primary: '#007AFF',
  primaryLight: '#4DA3FF',
  primaryDark: '#0056CC',
  
  // Background colors
  background: '#F8F9FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text colors
  text: '#000000',
  textSecondary: '#6C757D',
  textTertiary: '#ADB5BD',
  
  // Message colors
  messageSent: '#DCF8C6',
  messageReceived: '#FFFFFF',
  messageText: '#000000',
  messageTime: '#8E8E93',
  
  // UI elements
  border: '#E1E5E9',
  divider: '#F0F0F0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  
  // Chat specific
  chatBackground: '#E5DAC9',
  inputBackground: '#FFFFFF',
  suggestionBackground: '#F8F9FA',
  typingIndicator: '#8E8E93',
  
  // Navigation
  tabBar: '#FFFFFF',
  tabBarActive: '#007AFF',
  tabBarInactive: '#8E8E93',
  header: '#007AFF',
  headerText: '#FFFFFF',
};

const darkTheme: ThemeColors = {
  // Primary colors
  primary: '#0A84FF',
  primaryLight: '#5E9EFF',
  primaryDark: '#0056CC',
  
  // Background colors
  background: '#000000',
  surface: '#1C1C1E',
  card: '#2C2C2E',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',
  
  // Message colors
  messageSent: '#0A84FF',
  messageReceived: '#2C2C2E',
  messageText: '#FFFFFF',
  messageTime: '#8E8E93',
  
  // UI elements
  border: '#38383A',
  divider: '#2C2C2E',
  shadow: 'rgba(0, 0, 0, 0.3)',
  
  // Status colors
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#0A84FF',
  
  // Chat specific
  chatBackground: '#1C1C1E',
  inputBackground: '#2C2C2E',
  suggestionBackground: '#3A3A3C',
  typingIndicator: '#8E8E93',
  
  // Navigation
  tabBar: '#1C1C1E',
  tabBarActive: '#0A84FF',
  tabBarInactive: '#8E8E93',
  header: '#1C1C1E',
  headerText: '#FFFFFF',
};

export function useTheme(): ThemeColors {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}

export { lightTheme, darkTheme }; 