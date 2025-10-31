import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { clearAuthData, setAuthData } from '../store/userSlice';

const useAuthService = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!(localStorage.getItem('access_jwt') || localStorage.getItem('access_token'))
  );

  // FIXED: Helper to sync localStorage with Redux
  const syncAuthToRedux = () => {
    const accessToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_jwt') || localStorage.getItem('refresh_token');
    const userId = localStorage.getItem('user_id');

    if (accessToken && userId) {
      dispatch(setAuthData({
        user_id: userId,
        tokens: {
          access: accessToken,
          refresh: refreshToken
        },
        isAuthenticated: true
      }));
      setIsAuthenticated(true);
    }
  };

  const setTokens = (accessJwt, refreshJwt, userId = null) => {
    localStorage.setItem('access_jwt', accessJwt);
    localStorage.setItem('refresh_jwt', refreshJwt);
    
    // FIXED: If userId provided, store it
    if (userId) {
      localStorage.setItem('user_id', userId);
    }
    
    setIsAuthenticated(true);
    
    // CRITICAL: Update Redux immediately
    const storedUserId = userId || localStorage.getItem('user_id');
    if (storedUserId) {
      dispatch(setAuthData({
        user_id: storedUserId,
        tokens: {
          access: accessJwt,
          refresh: refreshJwt
        },
        isAuthenticated: true
      }));
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('access_jwt');
    localStorage.removeItem('refresh_jwt');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('userRole');
    localStorage.removeItem('profile_data');
    localStorage.removeItem('profileCompleted');
    localStorage.removeItem('showSignupSuccess');
    localStorage.removeItem('fromProfileSetup');

    // Clear Redux auth state
    dispatch(clearAuthData());

    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_jwt') || localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.error('No refresh token found');
      clearTokens();
      return null;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/token_refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();
      console.log('Token refresh response:', data);

      if (!response.ok || !data.well_received) {
        console.error('Token refresh failed:', data.error_message);
        clearTokens();
        return null;
      }

      const newAccessToken = data.access_jwt || data.access_token;
      const newRefreshToken = data.refresh_jwt || data.refresh_token || refreshToken;
      const userId = data.user_id || localStorage.getItem('user_id');
      
      setTokens(newAccessToken, newRefreshToken, userId);
      return newAccessToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      clearTokens();
      return null;
    }
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    let token = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
    if (!token) {
      token = await refreshAccessToken();
      if (!token) {
        console.error('Failed to refresh token');
        return null;
      }
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 && !url.includes('token_refresh')) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const retryHeaders = { ...options.headers, Authorization: `Bearer ${newToken}` };
        return fetch(url, { ...options, headers: retryHeaders });
      }
      console.error('Retry failed after token refresh');
      return null;
    }

    return response;
  };

  return {
    setTokens,
    clearTokens,
    isAuthenticated,
    makeAuthenticatedRequest,
    refreshAccessToken,
    syncAuthToRedux  // EXPORT this for App.js to use
  };
};

export default useAuthService;