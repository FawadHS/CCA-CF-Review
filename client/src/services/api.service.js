import { API_CONFIG, getEnvironment } from '../config/api.config.js';

class ApiService {
  constructor() {
    this.environment = getEnvironment();
    this.baseUrl = API_CONFIG.BASE[this.environment];
    this.defaultTimeout = API_CONFIG.TIMEOUT.default;
  }

  async request(endpoint, options = {}) {
    const url = this.getFullUrl(endpoint);
    const controller = new AbortController();
    const timeout = options.timeout || this.defaultTimeout;
    
    // Set up timeout
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  getFullUrl(endpoint) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }
}

export const apiService = new ApiService();