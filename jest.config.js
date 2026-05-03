// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterFramework: ['<rootDir>/tests/setup.js'],
}