module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2021
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'no-undef': 'error'
  },
  globals: {
    fs: true,
    require: true,
    process: true,
    __dirname: true,
    module: true
  }
};