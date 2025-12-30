import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export interface User {
  id: string;
 phone_number: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_admin: boolean;
  is_banned: boolean;
 is_online: boolean;
  last_seen: Date;
  created_at: Date;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
 const smsSent = ref(false);
  const smsSending = ref(false);

  // Initialize auth from localStorage
  function initialize() {
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedRefreshToken && storedUser) {
      token.value = storedToken;
      refreshToken.value = storedRefreshToken;
      user.value = JSON.parse(storedUser);
      isAuthenticated.value = true;
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    }
  }

  // Send SMS code
  async function sendSMSCode(phone: string) {
    try {
      smsSending.value = true;
      const response = await axios.post('/api/auth/send-code', { phone });
      smsSent.value = true;
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    } finally {
      smsSending.value = false;
    }
  }

  // Verify SMS code and login
  async function verifySMSCode(phone: string, code: string) {
    try {
      isLoading.value = true;
      const response = await axios.post('/api/auth/verify-code', { phone, code });
      
      // Store auth data
      token.value = response.data.token;
      refreshToken.value = response.data.refreshToken;
      user.value = response.data.user;
      isAuthenticated.value = true;
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      
      // Store in localStorage
      if (token.value) localStorage.setItem('token', token.value);
      if (refreshToken.value) localStorage.setItem('refreshToken', refreshToken.value);
      if (user.value) localStorage.setItem('user', JSON.stringify(user.value));
      
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    } finally {
      isLoading.value = false;
    }
  }

  // Get user profile
 async function fetchUserProfile() {
    try {
      const response = await axios.get('/api/auth/profile');
      user.value = response.data;
      
      // Update localStorage
      if (user.value) localStorage.setItem('user', JSON.stringify(user.value));
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token expired, logout user
        await logout();
      }
      throw error.response?.data || error;
    }
  }

  // Update user profile
  async function updateProfile(profileData: { firstName?: string; lastName?: string; avatar_url?: string }) {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      user.value = response.data;
      
      // Update localStorage
      if (user.value) localStorage.setItem('user', JSON.stringify(user.value));
      
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Logout
  async function logout() {
    // Clear auth data
    token.value = null;
    refreshToken.value = null;
    user.value = null;
    isAuthenticated.value = false;
    
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
  }

  // Refresh token
  async function refreshTokenFn() {
    if (!refreshToken.value) {
      await logout();
      return false;
    }

    try {
      const response = await axios.post('/api/auth/refresh', {
        refreshToken: refreshToken.value
      });

      token.value = response.data.token;
      
      // Update axios header
      if (token.value) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      }
      
      // Update localStorage
      if (token.value) localStorage.setItem('token', token.value);
      
      return true;
    } catch (error) {
      await logout();
      return false;
    }
  }

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    smsSent,
    smsSending,
    initialize,
    sendSMSCode,
    verifySMSCode,
    fetchUserProfile,
    updateProfile,
    logout,
    refreshTokenFn
  };
});