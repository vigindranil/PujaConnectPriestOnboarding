import { callApi } from "../config/apiV1";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vigpl.com/PujaConnectRestAPI/api';
const BASE_API= import.meta.env.VITE_BASE_API_URL || 'http://115.187.62.16:8005/PujaConnectRestAPI/api';

export interface DashboardStats {
  today_survey_qty: number;
  total_survey_qty: number;
  total_pending_qty: number;
  total_approved_qty: number;
  total_rejected_qty: number;
}

export interface ApiResponse<T> {
  version: string;
  status: number;
  message: string;
  data: T;
}

export interface PriestInfo {
  priest_user_id: number;
  priest_name: string;
  priest_email: string;
  priest_mobile: string;
}

/**
 * Fetches agent dashboard statistics
 * @param agentId - The agent's user ID
 * @param authToken - The authorization bearer token
 * @returns Dashboard statistics
 */
export const getAgentDashboard = async (
  agentId: number,
  authToken: string
): Promise<DashboardStats> => {
  try {
    const requestData = {
      enc_data: JSON.stringify({
        agent_id: agentId
      })
    };

    const response = await fetch(`${API_BASE_URL}/dashboard/get_agent_dashboard`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = (await response.json()) as ApiResponse<string>;

    if (responseData.status === 0 && responseData.data) {
      // Parse the stringified JSON data
      const parsedData: DashboardStats = JSON.parse(responseData.data);
      return parsedData;
    } else {
      throw new Error(responseData.message || 'Failed to fetch dashboard data');
    }
  } catch (error) {
    console.error('API Error:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch dashboard statistics');
  }
};

/**
 * Gets the auth token from localStorage
 * Parses the JSON object to extract only the 'token' string
 * @returns The pure JWT token or null if not found
 */
export const getAuthToken = (): string | null => {
  const stored = localStorage.getItem('puja_connect_auth_token');
  if (stored) {
    try {
      // Attempt to parse the stored string as JSON
      const parsed = JSON.parse(stored);
      
      // If it has a .token property (as seen in your example), return that
      if (parsed && typeof parsed === 'object' && parsed.token) {
        return parsed.token;
      }
      
      // If it's a string but doesn't match the object structure, return as is
      // (This handles cases where it might be stored as a raw string)
      return stored;
    } catch (error) {
      console.warn('Error parsing auth token, returning raw value:', error);
      // If JSON.parse fails, assume it's a raw token string
      return stored;
    }
  }
  return null;
};

/**
 * Gets the user data from localStorage
 * @returns The user data or null if not found
 */
export const getUserData = (): { user_id: number } | null => {
  const stored = localStorage.getItem('puja_connect_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

export const getAuthorityPriestInfo = async (
 payload:any

): Promise<PriestInfo> => {
  try {
    const response = await callApi(
      '/priest/get_authority_priest_info',
      'POST',
      payload
    );

    
    if (response?.status === 0 && response.data) {
      
      return JSON.parse(response.data) as PriestInfo;
    }

    throw new Error(response?.message || 'Failed to fetch priest info');
  } catch (error) {
    console.error('API Error:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch priest info');
  }
};
