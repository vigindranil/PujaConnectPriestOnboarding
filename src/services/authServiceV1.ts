import { callApi, setUserSession, getUserId } from '../config/apiV1';
import type { UserSession } from '../config/apiV1';
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

  registerPriest: (priestData: any) => {
    const currentUserId = getUserId(); 
    
    // Auto-inject entry_user_id
    const finalData = { 
      ...priestData, 
      entry_user_id: currentUserId || 1 
    };
    
    return callApi('/authority/register_authority_user', 'POST', finalData);
  }
};