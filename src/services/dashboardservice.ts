import { callApi } from '../config/apiV1';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vigpl.com/PujaConnectRestAPI/api';
const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || 'http://115.187.62.16:8005/PujaConnectRestAPI/api';

export interface DashboardStats {
  today_survey_qty: number;
  total_survey_qty: number;
  total_pending_qty: number;
  total_approved_qty: number;
  total_rejected_qty: number;
}

export interface DashboardPriestInfo {

  priest_dob: string;
  priest_name: string;
  priest_gender: string;
  priest_contact_no: string;
  priest_email: string;
  priest_present_city_town_village: string;
  priest_approval_status: string;
  priest_present_post_office: string;
  priest_experience_year: number;



}

export interface ApiResponse<T> {
  version: string;
  status: number;
  message: string;
  data: T;
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
    const payload = { agent_id: agentId };
    const response = await callApi('/dashboard/get_agent_dashboard', 'POST', payload);
    if (response && response.status === 0 && response.data) {
      const parsedData: DashboardStats = JSON.parse(response.data);
      return parsedData;
    }
    throw new Error(response?.message || 'Failed to fetch dashboard data');
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
  agentId: number,
  priestuserId: number,
  statusId:number,
  pageNo:number,
  pageSize:number,
  fromDate:string,
  toDate:string
  
  
): Promise<DashboardPriestInfo[]> => {
  try {

    const payload = {
      authority_user_id: agentId,
      priest_user_id: priestuserId,
      status_id: statusId,
      page_no: pageNo,
      page_size: pageSize,
      from_date: fromDate,
      to_date: toDate
    };
    console.log("Payload in service:",payload);
    console.log("agentId:",agentId);
    const response = await callApi(
      '/priest/get_authority_priest_info',
      'POST',
      payload
    );

    if (response?.status === 0 && response.data) {
      return JSON.parse(response.data) as DashboardPriestInfo[];
    }

    throw new Error(response?.message || 'No data received');
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
