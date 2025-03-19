/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],  // Added HTML reporter for local viewing
  coverageThreshold: {  // Optional: Set minimum coverage requirements
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/routes/',  // Optionally ignore route files if not directly testable
    '/models/'   // Optionally ignore model definitions
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  setupFiles: [
    '<rootDir>/jest.setup.js'
  ],
  clearMocks: true,  // Automatically clear mock calls between tests
  resetMocks: true,  // Reset mock implementation between tests
  restoreMocks: true // Restore original implementation after each test
};

module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    'no-undef': 'error'
  },
  globals: {
    fs: 'writable',
    process: true,
    require: true,
    module: true,
    __dirname: true
  }
};