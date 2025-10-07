import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { clearAuthData } from '../store/userSlice';
// REMOVED: Don't import initializeSocket here - App.jsx handles it


const useAuthService = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!(localStorage.getItem('access_jwt') || localStorage.getItem('access_token'))
  );

  const setTokens = (accessJwt, refreshJwt) => {
    localStorage.setItem('access_jwt', accessJwt);
    localStorage.setItem('refresh_jwt', refreshJwt);
    setIsAuthenticated(true);
    
    // REMOVED: Socket initialization - let App.jsx handle it via Redux state change
    // The socket will be initialized automatically when App.jsx detects auth state change
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


    //State to clear Redux auth state
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
      setTokens(newAccessToken, newRefreshToken);
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
  };
};

export default useAuthService;