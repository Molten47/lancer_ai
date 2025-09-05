// src/components/LogoutButton.jsx
import React, { useState } from 'react'; // Import useState
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import useAuthService from '../auth';
import ConfirmationModal from '../Platform Users/LogoutModal'; // Import the new modal component

const LogoutButton = ({ className = "" }) => {
  const navigate = useNavigate();
  const { clearTokens } = useAuthService();
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal

  const handleLogout = async () => {
    try {
      // You can keep your API call commented out if you're not using it
      // const API_URL = import.meta.env.VITE_API_URL;
      // await fetch(`${API_URL}/api/logout`, { ... });

      // Clear all local storage data
      clearTokens();
      
      // Redirect to signin page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, still clear local data and redirect
      clearTokens();
      navigate('/login', { replace: true });
    } finally {
      setIsModalOpen(false); // Ensure modal closes regardless
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)} // Open the modal on click
        className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors ${className}`}
      >
        <LogOut size={16} />
        Log Out
      </button>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} // Close the modal
        onConfirm={handleLogout} // Execute logout on confirm
        title="Confirm Log Out"
        message="Are you sure you want to log out of your account?"
        confirmText="Yes, Log Out"
        cancelText="Cancel"
      />
    </>
  );
};

export default LogoutButton;