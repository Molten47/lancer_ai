import React from 'react';
import { X } from 'lucide-react';
import AIAssistantChat from './FreelancerAssistant'; // Make sure this path is correct

const AIAssistantModal = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0  bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="fixed inset-y-0 right-0 max-w-sm w-full h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        {/* Modal Header */}
        <div className="flex justify-end p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body with AIAssistantChat component */}
        <div className="h-full">
          <AIAssistantChat />
        </div>
      </div>
    </div>
  );
};

export default AIAssistantModal;