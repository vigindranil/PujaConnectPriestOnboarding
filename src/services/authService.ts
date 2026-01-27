// API Configuration and Token Management Service

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vigpl.com/PujaConnectRestAPI/api';
const AUTH_HEADER = import.meta.env.VITE_AUTH_HEADER || 'Basic YURtaW4jVG9rZW4kR2VOYVJhVGUyNjphZG1pbkAxMjM=';
const TOKEN_STORAGE_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY || 'puja_connect_auth_token';

export interface TokenResponse {
  version: string;
  status: number;
  message: string;
  data: {
    access_token: string;
    created_at: string;
    expires_at: string;
  };
}

export interface OTPResponse {
  version: string;
  status: number;
  message: string;
  data: string; // JSON string containing user_name and user_otp
}

export interface UserData {
  user_id: number;
  user_name: string;
  user_type_id: number;
  user_full_name: string;
}

export interface PriestRegistrationData {
  user_name: string;
  contact_no: string;
  alternate_contact_no: string;
  registration_mode: number;
  user_type_id: number;
  email: string;
  entry_user_id: number;
}

export interface PriestRegistrationResponse {
  version: string;
  status: number;
  message: string;
  data: null;
}

export interface ValidateOTPResponse {
  version: string;
  status: number;
  message: string;
  data: string; // JSON string containing user_id, user_name, user_type_id, user_full_name
}

class AuthService {
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.loadTokenFromStorage();
  }

  /**
   * Load token from localStorage
   */
  private loadTokenFromStorage(): void {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      try {
        const { token, expiry } = JSON.parse(stored);
        if (expiry && new Date().getTime() < expiry) {
          this.token = token;
          this.tokenExpiry = expiry;
        } else {
          // Token expired, clear it
          this.clearToken();
        }
      } catch (error) {
        console.error('Error loading token from storage:', error);
        this.clearToken();
      }
    }
  }

  /**
   * Save token to localStorage
   */
  private saveTokenToStorage(token: string, expiresAt: string): void {
    try {
      // Parse expires_at timestamp to milliseconds
      const expiryTime = new Date(expiresAt).getTime();
      localStorage.setItem(
        TOKEN_STORAGE_KEY,
        JSON.stringify({
          token,
          expiry: expiryTime,
        })
      );
      this.token = token;
      this.tokenExpiry = expiryTime;
    } catch (error) {
      console.error('Error saving token to storage:', error);
    }
  }

  /**
   * Clear token from storage
   */
  clearToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Check if token is valid
   */
  isTokenValid(): boolean {
    if (!this.token || !this.tokenExpiry) {
      return false;
    }
    return new Date().getTime() < this.tokenExpiry;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Generate a new token
   */
  async generateToken(): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/generateToken`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_HEADER,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TokenResponse = await response.json();

      if (data.status === 0 && data.data.access_token) {
        this.saveTokenToStorage(data.data.access_token, data.data.expires_at);
        return data.data.access_token;
      } else {
        throw new Error(data.message || 'Failed to generate token');
      }
    } catch (error) {
      console.error('Error generating token:', error);
      throw error;
    }
  }

  /**
   * Get valid token, refresh if needed
   */
  async getValidToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.token!;
    }
    return this.generateToken();
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(mobileNumber: string): Promise<OTPResponse> {
    try {
      const token = await this.getValidToken();

      // Encrypt data (in this case, just pass as is, but in production use proper encryption)
      const encData = JSON.stringify({ mobile_number: mobileNumber });

      const response = await fetch(`${API_BASE_URL}/auth/generate_otp`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          enc_data: encData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OTPResponse = await response.json();

      if (data.status === 0) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(mobileNumber: string, otp: string): Promise<ValidateOTPResponse> {
    try {
      const token = await this.getValidToken();

      const encData = JSON.stringify({ mobile_number: mobileNumber, otp });

      const response = await fetch(`${API_BASE_URL}/auth/validate_otp`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          enc_data: encData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 0) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to verify OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  /**
   * Validate OTP and get user details
   */
  async validateOTP(mobileNumber: string, otp: string): Promise<{ userData: UserData; response: ValidateOTPResponse }> {
    try {
      const token = await this.getValidToken();

      const encData = JSON.stringify({ mobile_number: mobileNumber, otp });

      const response = await fetch(`${API_BASE_URL}/auth/validate_otp`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          enc_data: encData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ValidateOTPResponse = await response.json();

      if (data.status === 0) {
        // Parse user data from the response
        const userData = JSON.parse(data.data) as UserData;
        return { userData, response: data };
      } else {
        throw new Error(data.message || 'Failed to validate OTP');
      }
    } catch (error) {
      console.error('Error validating OTP:', error);
      throw error;
    }
  }

  /**
   * Helper to get current logged-in user ID from localStorage
   */
  private getCurrentUserId(): number {
    const stored = localStorage.getItem('puja_connect_user');
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        return userData.user_id ? Number(userData.user_id) : 1;
      } catch (error) {
        console.error('Error parsing user data for ID:', error);
      }
    }
    return 1; // Default to 1 (Admin/System) if no user found
  }

  /**
   * Register Priest
   */
  async registerPriest(priestData: PriestRegistrationData): Promise<PriestRegistrationResponse> {
    try {
      const token = await this.getValidToken();
       // Get the actual logged-in user ID
      const currentUserId = this.getCurrentUserId();

      const finalPriestData = {
        ...priestData,
        entry_user_id: currentUserId
      };
      
      // Prepare encrypted data
      const encData = JSON.stringify(finalPriestData);

      const response = await fetch(`${API_BASE_URL}/authority/register_authority_user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
        body: JSON.stringify({
          enc_data: encData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PriestRegistrationResponse = await response.json();

      if (data.status === 0) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to register priest');
      }
    } catch (error) {
      console.error('Error registering priest:', error);
      throw error;
    }
  }



  /**
 * Save Priest Profile
 */
async savePriestProfile(profileData: any): Promise<any> {
    try {
      const token = await this.getValidToken();
      
      // Get the actual logged-in user ID
      const currentUserId = this.getCurrentUserId();

      // Add/Overwrite entry_user_id
      const finalProfileData = {
        ...profileData,
        entry_user_id: currentUserId
      };
      
      // Prepare encrypted data
      const encData = JSON.stringify(finalProfileData);

      const response = await fetch(`${API_BASE_URL}/authority/save_authority_user_profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
        body: JSON.stringify({
          enc_data: encData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PriestRegistrationResponse = await response.json();

      if (data.status === 0) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to save priest profile');
      }
    } catch (error) {
      console.error('Error saving priest profile:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
