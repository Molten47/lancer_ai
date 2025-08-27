import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Bot, Clock, User } from 'lucide-react';

const RightSideModal = ({ isOpen, onClose, job }) => {
  const [countdown, setCountdown] = useState(3600); // 1 hour in seconds for demo

  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const dummyProfile = {
    name: "client_username",
    jobTitle: "Job title",
    profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2680&auto=format&fit=crop"
  };

  const latestUpdate = {
    message: "New message from client 'FashionForward': 'Please review the latest mockups.'",
    time: "2 minutes ago",
    read: false
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0  bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="fixed inset-y-0 right-0 max-w-sm w-full max-h-5/6 rounded-xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        {/* Modal Header */}
        <div className="flex flex-col p-6 border-b border-gray-200 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          
          {/* Profile and Job Title */}
          <div className="flex flex-col items-center justify-center mt-4">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-2">
              <img src={dummyProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{dummyProfile.name}</h3>
            <p className="text-sm text-gray-500">{dummyProfile.jobTitle}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col space-y-6 overflow-y-auto h-full pb-32">
          {/* Job Description */}
          <div className="flex flex-col">
            <h4 className="text-md font-semibold text-gray-800 mb-2">Job Description:</h4>
            <p className="text-sm text-gray-600">{job?.description || "No description available."}</p>
          </div>

          {/* Timer/Countdown */}
          <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
            <Clock size={20} className="text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800">Time Remaining</span>
              <span className="text-lg font-bold text-blue-600">{formatTime(countdown)}</span>
            </div>
          </div>

          {/* Latest Updates */}
          <div className="flex flex-col relative">
            <h4 className="text-md font-semibold text-gray-800 mb-2">Latest Updates:</h4>
            
            {/* Red Ribbon for new messages */}
            {!latestUpdate.read && (
              <div className="absolute top-0 right-0 transform rotate-45 -mt-2 -mr-4 w-16 h-1 bg-red-500 origin-top-left"></div>
            )}
            
            <div className="flex items-center space-x-3 p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
              <MessageSquare size={20} className="text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{latestUpdate.message}</p>
                <span className="text-xs text-gray-500">{latestUpdate.time}</span>
              </div>
            </div>
          </div>

          {/* AI Assistant Icon */}
      <div className="absolute bottom-6 right-6 group">
       <div className='absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-1 group-hover:translate-y-0'>
    <div className='bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg relative whitespace-nowrap'>
      <p className='text-sm font-medium'>Hey! I'm your AI assistant</p>
      {/* Speech bubble tail */}
      <div className='absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-indigo-600'></div>
    </div>
      </div>
      <button
    className="p-3 bg-indigo-600 rounded-full text-white shadow-lg hover:bg-indigo-700 transition-transform hover:transform-gpu hover:scale-115"
    aria-label="Open AI Assistant"
  >
       <Bot size={24} />
     </button>
       </div>
        </div>
      </div>
    </div>
  );
};

export default RightSideModal;