// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/app.js',
    '!src/socket.js',
    '!src/config/*.js',
    '!src/services/storage.service.js',
    '!src/services/pdf.service.js',
    '!src/services/notification.service.js',
    '!src/services/logger.service.js',
    '!src/utils/handleLogger.js',
    '!src/middleware/upload.js',
  ],
  coverageReporters: ['text']
}