export const ENV_CONFIG = {
  development: {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    enableDebug: true,
    enableMocks: true
  },
  staging: {
    apiUrl: 'https://staging-caa-cf-review.azurewebsites.net',
    enableDebug: true,
    enableMocks: false
  },
  production: {
    apiUrl: 'https://caa-cf-review.azurewebsites.net',
    enableDebug: false,
    enableMocks: false
  }
};