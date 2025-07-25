module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],
  coverageReporters: ['text', 'lcov'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-expo|@expo|expo|@react-native|react-native|@react-navigation|react-navigation|@react-native-async-storage|react-native-confirmation-code-field|react-native-mask-input|react-native-reanimated|react-native-safe-area-context|react-native-screens|react-native-web)/)',
  ],
}; 