/**
 * API CONFIGURATION & UTILITIES
 * Centralized file for Base URL, Token Management, and Session Data.
 */

// 1. Configuration & Constants
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://vigpl.com/PujaConnectRestAPI/api',
  BASE_URL2:import.meta.env.VITE_BASE_API_URL || 'http://115.187.62.16:8005/PujaConnectRestAPI/api',
  AUTH_HEADER: import.meta.env.VITE_AUTH_HEADER || 'Basic YURtaW4jVG9rZW4kR2VOYVJhVGUyNjphZG1pbkAxMjM=',
  STORAGE_KEYS: {
    TOKEN: 'puja_connect_auth_token',
    USER: 'puja_connect_user',
  }
};

// 2. Types (Matching your LoginScreen logic)
export interface UserSession {
  user_id: number;
  user_name: string;
  user_type_id: number;
  user_full_name: string;
  loginType: 'user' | 'authority';
  [key: string]: any;
}

// 3. Token Management (Auth Token)

export const getToken = (): string | null => {
  try {
    const stored = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
    if (!stored) return null;
    
    const { token, expiry } = JSON.parse(stored);
    if (expiry && new Date().getTime() > expiry) {
      clearSession();
      return null;
    }
    return token;
  } catch {
    return null;
  }
};

export const setToken = (accessToken: string, expiresAt: string): void => {
  const expiryTime = new Date(expiresAt).getTime();
  localStorage.setItem(API_CONFIG.STORAGE_KEYS.TOKEN, JSON.stringify({ 
    token: accessToken, 
    expiry: expiryTime 
  }));
};

// 4. User Session Management (User Data + Login Type)

export const getUserSession = (): UserSession | null => {
  try {
    const stored = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const setUserSession = (data: UserSession) => {
  localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(data));
};

// --- Specific Getters for your App ---

export const getUserId = (): number => {
  const session = getUserSession();
  return session?.user_id ? Number(session.user_id) : 0;
};

export const getUserName = (): string => {
  const session = getUserSession();
  return session?.user_name || '';
};

export const getUserLoginType = (): 'user' | 'authority' | null => {
  const session = getUserSession();
  return session?.loginType || null;
};

export const clearSession = () => {
  localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN);
  localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER);
};

// 5. Internal: System Token Generator
const generateSystemToken = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL2}/auth/generateToken`, {
      method: 'POST',
      headers: {
        'Authorization': API_CONFIG.AUTH_HEADER,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.status === 0 && data.data?.access_token) {
      setToken(data.data.access_token, data.data.expires_at);
      return data.data.access_token;
    }
    throw new Error('Failed to generate system token');
  } catch (error) {
    console.error('System Token Error:', error);
    throw error;
  }
};

// 6. Universal API Caller
export const callApi = async (
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
  payload: any = null,
   isRetry = false
): Promise<any> => {
  
  let token = getToken();
  if (!token) token = await generateSystemToken();

  const headers: HeadersInit = {
    'accept': '*/*',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Wrap payload in { enc_data: ... } automatically for POST/PUT
  let body = "";
  if (payload) {
    body = JSON.stringify({ enc_data: JSON.stringify(payload) });
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL2}${endpoint}`, {
      method,
      headers,
      body
    });

    if (response.status === 401 && !isRetry) {
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN);
      return callApi(endpoint, method, payload, true);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Call Failed [${endpoint}]`, error);
    throw error;
  }
};