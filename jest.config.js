module.exports = {
  preset: 'jest-expo',
  // setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  collectCoverage: true,
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**'
  ],
  coverageReporters: ['text', 'lcov'],
}; 