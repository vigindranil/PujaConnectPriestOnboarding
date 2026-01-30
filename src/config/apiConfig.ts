/**
 * API Configuration
 * 
 * This file contains all API configuration settings for the application.
 * Settings can be overridden by environment variables with VITE_ prefix.
 */

export const API_CONFIG = {
  /**
   * Base URL for all API requests
   * Default: http://115.187.62.16:8005/PujaConnectRestAPI/api
   */
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://115.187.62.16:8005/PujaConnectRestAPI/api',

  /**
   * Basic Authentication Header for token generation
   * Default: 'Basic YURtaW4jVG9rZW4kR2VOYVJhVGUyNjphZG1pbkAxMjM='
   */
  AUTH_HEADER: import.meta.env.VITE_AUTH_HEADER || 'Basic YURtaW4jVG9rZW4kR2VOYVJhVGUyNjphZG1pbkAxMjM=',

  /**
   * LocalStorage key for storing authentication token
   */
  TOKEN_STORAGE_KEY: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'puja_connect_auth_token',

  /**
   * Timeout for API requests in milliseconds
   */
  REQUEST_TIMEOUT: 30000,

  /**
   * Enable debug logging
   */
  DEBUG: import.meta.env.VITE_DEBUG === 'true',

  /**
   * API Endpoints
   */
  ENDPOINTS: {
    AUTH: {
      GENERATE_TOKEN: '/auth/generateToken',
      GENERATE_OTP: '/auth/generate_otp',
      VERIFY_OTP: '/auth/verify_otp',
    },
  },
};

/**
 * Get full API URL for an endpoint
 * @param endpoint - The endpoint path
 * @returns Full URL
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Log debug messages if DEBUG mode is enabled
 * @param message - Message to log
 * @param data - Optional data to log
 */
export const debugLog = (message: string, data?: any): void => {
  if (API_CONFIG.DEBUG) {
    console.log(`[PujaConnect API] ${message}`, data || '');
  }
};
