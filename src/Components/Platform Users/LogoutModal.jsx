// src/components/ConfirmationModal.jsx
import React from 'react';
import { X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Log Out', cancelText = 'Cancel' }) => {
  if (!isOpen) {
    return null;
  }

  return (
    // This is the main modal container. It handles positioning and z-index.
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
      {/* This is the semi-transparent overlay. */}
      <div 
        className="fixed inset-0 bg-black opacity-65"
        onClick={onClose} // Allow closing modal by clicking outside
      ></div>

      {/* This is the modal card itself. It's a sibling of the overlay. */}
      <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm relative z-50">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.15 3.375 1.98 3.375h14.54c1.83 0 2.846-1.875 1.98-3.375l-7.24-12.55c-.866-1.5-3.094-1.5-3.96 0l-7.24 12.55zM12 18.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-500">{message}</p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={onConfirm}
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:mt-0 sm:w-auto"
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;