/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/tests/'
    ],
    testMatch: [
      '**/__tests__/**/*.js',
      '**/?(*.)+(spec|test).js'
    ],
    setupFiles: [
      '<rootDir>/jest.setup.js'
    ]
  };