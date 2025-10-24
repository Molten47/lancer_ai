import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import AIAssistantChat from './DashboardClient'; // Adjust path as needed

const AssistantModal = ({ isOpen, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const modalRef = useRef(null);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-white bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={`fixed z-50 transition-all duration-300 ${
          isMinimized
            ? 'bottom-6 right-6 w-80 h-16'
            : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh]'
        }`}
      >
        {/* Modal Content */}
        <div className="w-full h-full bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Plus className='text-blue-600 size-7' />
              </div>
              <div>
                <h3 className="font-semibold text-white">Client Assistant</h3>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 text-white hover:text-gray-200 transition-colors rounded-lg hover:bg-blue-500"
                title={isMinimized ? 'Expand' : 'Minimize'}
                aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white hover:text-gray-200 transition-colors rounded-lg hover:bg-blue-500"
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Chat Content - Hidden when minimized */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden">
              <AIAssistantChat
                chat_type="client_assistant"
                assistantName="Project Assistant"
                assistantAvatar="AI"
                className="[&>div:first-child]:hidden"
                onMessageSent={(message) => {
                  console.log('Message sent:', message);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AssistantModal;