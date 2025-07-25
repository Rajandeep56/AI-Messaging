import { useColorScheme } from '../useColorScheme';

// Mock react-native
jest.mock('react-native', () => ({
  Appearance: {
    getColorScheme: jest.fn(),
    addChangeListener: jest.fn(),
  },
}));

describe('useColorScheme', () => {
  const mockAppearance = require('react-native').Appearance;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return light theme by default', () => {
    mockAppearance.getColorScheme.mockReturnValue('light');

    const result = useColorScheme();
    expect(result).toBe('light');
  });

  it('should return dark theme when system is in dark mode', () => {
    mockAppearance.getColorScheme.mockReturnValue('dark');

    const result = useColorScheme();
    expect(result).toBe('dark');
  });

  it('should return null when no color scheme is available', () => {
    mockAppearance.getColorScheme.mockReturnValue(null);

    const result = useColorScheme();
    expect(result).toBeNull();
  });

  it('should return undefined when color scheme is undefined', () => {
    mockAppearance.getColorScheme.mockReturnValue(undefined);

    const result = useColorScheme();
    expect(result).toBeUndefined();
  });

  it('should call getColorScheme to get the current theme', () => {
    mockAppearance.getColorScheme.mockReturnValue('light');

    useColorScheme();

    expect(mockAppearance.getColorScheme).toHaveBeenCalled();
  });

  it('should handle multiple calls consistently', () => {
    mockAppearance.getColorScheme.mockReturnValue('dark');

    const result1 = useColorScheme();
    const result2 = useColorScheme();

    expect(result1).toBe('dark');
    expect(result2).toBe('dark');
    expect(mockAppearance.getColorScheme).toHaveBeenCalledTimes(2);
  });

  it('should handle invalid color scheme values', () => {
    mockAppearance.getColorScheme.mockReturnValue('invalid');

    const result = useColorScheme();
    expect(result).toBe('invalid');
  });

  it('should handle empty string color scheme', () => {
    mockAppearance.getColorScheme.mockReturnValue('');

    const result = useColorScheme();
    expect(result).toBe('');
  });

  it('should handle case sensitivity', () => {
    mockAppearance.getColorScheme.mockReturnValue('LIGHT');

    const result = useColorScheme();
    expect(result).toBe('LIGHT');
  });

  it('should handle numeric values', () => {
    mockAppearance.getColorScheme.mockReturnValue(1);

    const result = useColorScheme();
    expect(result).toBe(1);
  });

  it('should handle boolean values', () => {
    mockAppearance.getColorScheme.mockReturnValue(true);

    const result = useColorScheme();
    expect(result).toBe(true);
  });
}); 