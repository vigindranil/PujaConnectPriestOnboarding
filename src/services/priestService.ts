// Priest Service - Handles all priest-related API calls

import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vigpl.com/PujaConnectRestAPI/api';

export interface PriestAddressData {
  priest_user_id: number;
  present_house_no: string;
  present_street_name: string;
  present_city_name: string;
  present_post_office: string;
  present_pin_code: string;
  present_state_id: number;
  present_district_id: number;
  present_ps_id: number;
  priest_present_latitude: number;
  priest_present_longitude: number;
  permanent_house_no: string;
  permanent_street_name: string;
  permanent_city_name: string;
  permanent_post_office: string;
  permanent_pin_code: string;
  permanent_state_id: number;
  permanent_district_id: number;
  permanent_ps_id: number;
  entry_user_id: number;
}

export interface PujaPriceInfo {
  priest_user_id: number;
  puja_type_id: number;
  puja_duration: number;
  puja_without_samagri_amount: number;
  puja_with_samagri_amount: number;
  travel_expenses_per_km: number;
  entry_user_id: number;
  priest_present_latitude: number;
  priest_present_longitude: number;
}

export interface ApiResponse {
  version: string;
  status: number;
  message: string;
  data: any;
}

export interface PriestPujaListPayload {
  priest_user_id: number;
  pries_puja_list: Array<{  // Note: key matches your curl (pries_puja_list)
    puja_type_id: number;
    puja_duration: number;
    puja_without_samagri_amount: number;
    puja_with_samagri_amount: number;
  }>;
  travel_expenses_per_km: number;
  entry_user_id: number;
  priest_present_latitude: number;
  priest_present_longitude: number;
}

class PriestService {
  /**
   * Save Priest Address Information
   */
  async savePriestAddress(addressData: PriestAddressData): Promise<ApiResponse> {
    try {
      const token = await authService.getValidToken();
      
      const encData = JSON.stringify(addressData);

      const response = await fetch(`${API_BASE_URL}/authority/save_priest_address_info`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enc_data: encData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.status === 0) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to save priest address');
      }
    } catch (error) {
      console.error('Error saving priest address:', error);
      throw error;
    }
  }

  /**
   * Save Priest Puja Information
   */
  async savePriestPujaInfo(pujaInfo: PujaPriceInfo): Promise<ApiResponse> {
    try {
      const token = await authService.getValidToken();
      
      const encData = JSON.stringify(pujaInfo);

      const response = await fetch(`${API_BASE_URL}/priest/save_puja_info`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enc_data: encData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.status === 0) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to save puja info');
      }
    } catch (error) {
      console.error('Error saving puja info:', error);
      throw error;
    }
  }

  /**
   * Save Multiple Puja Information (Batch)
   */
  async saveBatchPujaInfo(
    priestUserId: number,
    pujaData: Array<{
      pujaTypeId: number;
      duration: number;
      withoutSamagriAmount: number;
      withSamagriAmount: number;
    }>,
    latitude: number,
    longitude: number
  ): Promise<ApiResponse> { // Changed return type from ApiResponse[] to ApiResponse
    try {
      const token = await authService.getValidToken();
      const currentUser = localStorage.getItem('puja_connect_user');
      let entryUserId = 1;
      if (currentUser) {
          try { entryUserId = JSON.parse(currentUser).user_id || 1; } catch(e) {}
      }

      // 1. Construct the payload matching the new API structure
      const payload: PriestPujaListPayload = {
        priest_user_id: priestUserId,
        pries_puja_list: pujaData.map(p => ({
          puja_type_id: p.pujaTypeId,
          puja_duration: p.duration,
          puja_without_samagri_amount: p.withoutSamagriAmount,
          puja_with_samagri_amount: p.withSamagriAmount
        })),
        travel_expenses_per_km: 0, // Hardcoded or pass as argument if captured in form
        entry_user_id: entryUserId, 
        priest_present_latitude: latitude,
        priest_present_longitude: longitude
      };

      const encData = JSON.stringify(payload);

      // 2. Make a SINGLE API call
      const response = await fetch(`${API_BASE_URL}/priest/save_puja_info`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enc_data: encData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.status === 0) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to save puja info');
      }
    } catch (error) {
      console.error('Error saving batch puja info:', error);
      throw error;
    }
  }

 /**
   * Save Priest Professional and Temple Details
   */
  async savePriestProfessionalDetails(payload: {
    priest_user_id: number;
    professional_info: {
      exp_year: number;
      remarks: string;
    };
    language_info: Array<{
      language_id: number;
      language_type_id: number;
    }>;
    temple_info?: {
      temple_id: number;
      temple_name: string;
      temple_address: string;
      managing_authority_name: string;
      remarks: string;
    };
    // entry_user_id removed from arguments
  }): Promise<ApiResponse> {
    try {
      const token = await authService.getValidToken();

      // --- LOGIC TO PICK ENTRY USER ID FROM LOCAL STORAGE ---
      let entryUserId = 1; // Default
      const storedUser = localStorage.getItem('puja_connect_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.user_id) {
            entryUserId = parsedUser.user_id;
          }
        } catch (e) {   
          console.error("Error parsing user cookie:", e);
        }
      }
      // -----------------------------------------------------

      // Merge the retrieved ID into the payload
      const finalPayload = {
        ...payload,
        entry_user_id: entryUserId
      };

      const encData = JSON.stringify(finalPayload);

      const response = await fetch(`${API_BASE_URL}/priest/save_professional_details`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enc_data: encData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.status === 0) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to save professional details');
      }
    } catch (error) {
      console.error('Error saving professional details:', error);
      throw error;
    }
  }

  
}

// Export singleton instance
export const priestService = new PriestService();