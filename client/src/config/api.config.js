export const API_CONFIG = {
  // Base configuration
  BASE: {
    development: 'http://localhost:5000/api',
    staging: 'https://staging-caa-cf-review.azurewebsites.net/api',
    production: '/api' // Relative path for same-origin requests
  },
  
  // Timeouts (in milliseconds)
  TIMEOUT: {
    default: 30000,
    upload: 120000
  },
  
  // Rate limiting
  RATE_LIMIT: {
    maxRetries: 3,
    retryDelay: 1000
  }
};

// Environment detection
export function getEnvironment() {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'development';
  }
  if (window.location.hostname.includes('staging')) {
    return 'staging';
  }
  return 'production';
}