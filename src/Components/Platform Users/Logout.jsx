// src/components/LogoutButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import useAuthService from '../auth';

const LogoutButton = ({ className = "" }) => {
  const navigate = useNavigate();
  const { clearTokens } = useAuthService();

  const handleLogout = async () => {
    try {
      // Optional: Call logout API endpoint if your backend requires it
      // const API_URL = import.meta.env.VITE_API_URL;
      // await fetch(`${API_URL}/api/logout`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      //     'Content-Type': 'application/json',
      //   },
      // });

      // Clear all local storage data
      clearTokens();
      
      // Redirect to signin page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, still clear local data and redirect
      clearTokens();
      navigate('/login', { replace: true });
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors ${className}`}
    >
      <LogOut size={16} />
      Logout
    </button>
  );
};

export default LogoutButton;