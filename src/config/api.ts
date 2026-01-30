/**
 * API Configuration
 * Centralized configuration for API endpoints and authentication
 */

export const API_CONFIG = {
  // Base URL from environment variable
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://vigpl.com/PujaConnectRestAPI/api',
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      SEND_OTP: '/auth/generate_otp',
      VERIFY_OTP: '/auth/validate_otp',
      VALIDATE_OTP: '/auth/validate_otp',
    },
    MASTER: {
      GET_ALL_LANGUAGES: '/master/get_all_languages',
      GET_STATES: '/master/get_all_states',
      GET_DISTRICTS: '/master/get_all_districts',
      GET_POLICE_STATIONS: '/master/get_all_ps',
      GET_TEMPLES: '/master/get_all_temple',
      GET_DOCUMENT_TYPES: '/master/get_all_doc_type',
    },
    PRIEST: {
      REGISTER: '/priest/register_authority_user',
      SAVE_PROFILE: '/authority/save_authority_user_profile', // Add this line
      GET_ALL: '/priests/getAll',
      UPDATE: '/priests/update',
      DELETE: '/priests/delete',
    },
  },

  // Default Bearer Token (from .env or fallback)
  DEFAULT_BEARER_TOKEN: import.meta.env.VITE_DEFAULT_BEARER_TOKEN || 'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJzZWxmIiwic3ViIjoiYURtaW4jVG9rZW4kR2VOYVJhVGUyNiIsImV4cCI6MTc2OTE0NTQwMiwiaWF0IjoxNzY5MDU5MDAyLCJzY29wZSI6IlJPTEVfQURNSU4ifQ.RZcQfkuKH4FGJ-KPZYO_2qhp2Ib3oqOShTvhnh3nEcG4JxhcOg6gp9A5PVdPfs6G63bp9o7q1ukgrhPEx4A7plRMdtpJp8SFOj403lK-sxh_X0fZYv6LTrxWozCZ6lBzpnvPtf1c1HX74HFrKSGwS-V8VqmGOqWzJKASXbkWPpn4ciB8gUD78uHZ4Nx3mEZld2zxTwEsIxbhqUpAnvvdp2UG936LjIEpGmoeAY2bZiKwG71fGqbmBD7WDvqeVU_WQsBKuU_j27ctyW7eDgY9d8R6oCZjZSlg2QdVbww_tjd1QQg-oO8N3eDcrE6ngWCVqJR7ME12u-hHCqZzTi1zOeDiMNxnsHIRlu8bn_-Mwv8mquIeQYLcmGyjK7n_if3ikDJ81NKRZmxvsEjOUC9mlPsEljxOKDuM0ZVUmW7v8SUiITcFV-4lIODJF_t6HINJRCXxOIfpxhkKQIqLVfP_9jVZl5F-hTEhV7Vb8SqWeDZOIbFEvoUnLFOpohgIv9PD3QS-hb_aH4zG8-xjheCIuODXsqQzq3tvZ1sOnYNXyDd-e6AOz1pRoxZw4czT5cUggXsS2U8T_xEamB2g5Mv9U8_t-DFbUe58V3y0pXinwyKcu2CPToWbP2Y2iPCxyw9f0vtznxD5N_NPpM9nlSpGD5BKU0tYXMxwYv6SR7fqCrY',

  // Token Storage Key
  TOKEN_STORAGE_KEY: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'puja_connect_auth_token',

  // Debug Mode
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
};

/**
 * Get full API URL for an endpoint
 * @param endpoint - The endpoint path (e.g., '/master/get_all_languages')
 * @returns Full URL ready for fetch
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Get Authorization Bearer Token
 * @returns Bearer token from localStorage or default token
 */
export const getAuthToken = (): string => {
  return localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY) || API_CONFIG.DEFAULT_BEARER_TOKEN;
};

/**
 * Get standard API request headers
 * @returns Headers object with authorization and content-type
 */
export const getApiHeaders = (): HeadersInit => {
  return {
    'accept': '*/*',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`,
  };
};
