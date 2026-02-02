import { callApi, setUserSession, getUserId } from '../config/apiV1';
import type { UserSession } from '../config/apiV1';
import type { PriestRegistrationResponse } from './authService';
export const authServiceV1 = {
  
  // --- OTP Generation ---
  
  sendOTP: (mobile: string) => { 
    return callApi('/auth/generate_otp', 'POST', { mobile_number: mobile });
  },

  sendAuthorityOTP: (mobile: string) => {
    return callApi('/auth/authority_generate_otp', 'POST', { mobile_number: mobile });
  },

  // --- OTP Validation & Session Creation ---

  validateOTP: async (mobile: string, otp: string) => {
    const response = await callApi('/auth/validate_otp', 'POST', { mobile_number: mobile, otp });
    
    if (response.status === 0 && response.data) {
      const userData = JSON.parse(response.data);
      
      // Construct the session object exactly like your LoginScreen did
      const sessionData: UserSession = {
        ...userData,
        loginType: 'user'
      };
      
      // Save it centrally
      setUserSession(sessionData);
      
      return { ...response, userData: sessionData };
    }
    return response;
  },

  validateAuthorityOTP: async (mobile: string, otp: string) => {
    const response = await callApi('/auth/authority_validate_otp', 'POST', { mobile_number: mobile, otp });
    
    if (response.status === 0 && response.data) {
      const userData = JSON.parse(response.data);
      
      // Construct the session object for authority
      const sessionData: UserSession = {
        ...userData,
        loginType: 'authority'
      };
      
      // Save it centrally
      setUserSession(sessionData);
      
      return { ...response, userData: sessionData };
    }
    return response;
  },

  // --- Registration ---

  async savePriestProfile(profileData: any): Promise<any> {
  try {
    const currentUserId = getUserId();
    console.log('Current User ID:', currentUserId);

    // Add/Overwrite entry_user_id
    const finalProfileData = {
      ...profileData,
      entry_user_id: currentUserId || 5
    };

    // callApi already returns parsed JSON response
    const data = await callApi('/priest/save_user_profile', 'POST', finalProfileData);

    // Check the API's status field (not HTTP status)
    if (data.status === 0) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to save priest profile');
    }
  } catch (error) {
    console.error('Error saving priest profile:', error);
    throw error;
  }
},
 async registerPriest(priestData: any) {
    const currentUserId = getUserId(); 
     
    // Auto-inject entry_user_id
    const finalData = { 
      ...priestData, 
      entry_user_id: currentUserId || 1 
    };
    
    return callApi('/priest/register_user', 'POST', finalData);
  }
};