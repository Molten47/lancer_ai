import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, MessageSquare, Send, XCircle, ArrowLeft } from 'lucide-react';
import socket from '../../../Components/socket';
import TextareaAutosize from 'react-textarea-autosize';

const STATUS_MESSAGE_MAP = {
  'Recording provisional chat performance for freelancer 100': 'Recording chat performance...',
  'Updating user_profile with generated username and robust profile bio after interview termination.': 'Updating your profile...',
  'Recording chat performance score and review for freelancer 100.': 'Calculating test score...',
  'Updating freelancer username and profile bio after interview': 'Finalizing your profile...',
  'Evaluating freelancer responses': 'Evaluating your answers...',
  'Preparing next question': 'Preparing next question...',
  'Analyzing job requirements': 'Analyzing job requirements...',
};

const JobInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const own_id = localStorage.getItem('user_id');
  const messagesEndRef = useRef(null);

  const { recipient_id, chat_type } = location.state || {};
  
  // If no interview data, redirect
  if (!recipient_id || !chat_type) {
    useEffect(() => {
      navigate('/notifications', { replace: true });
    }, [navigate]);
    return null;
  }

  // --- State declarations ---
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Combined loading state
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  const [interviewId, setInterviewId] = useState(null);

  // --- Core logic functions moved inside useEffect for cleaner dependency management ---

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const checkAuthentication = () => {
      const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id');
      if (!authToken || !userId) {
        if (isMounted) {
          setSocketError('Authentication failed. Please sign in again.');
          setIsLoading(false);
          setTimeout(() => navigate('/signin', { replace: true }), 2000);
        }
        return false;
      }
      return true;
    };

    const initializeChat = async () => {
      if (!checkAuthentication()) {
        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
          setStatusMessage('Connecting to interviewer...');
        }

        const API_URL = import.meta.env.VITE_API_URL;
        const queryParams = new URLSearchParams({
          chat_type: chat_type,
          own_id: own_id,
          recipient_id: recipient_id
        });
        
        const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        };

        const response = await fetch(`${API_URL}/api/chat?${queryParams}`, {
          method: 'GET',
          headers: headers,
          mode: 'cors',
          credentials: 'include'
        });

        const chatData = await response.json();

        if (!response.ok) {
          if (isMounted) {
            setSocketError(chatData.error_message || `HTTP ${response.status}: Failed to initialize interview`);
            setIsLoading(false);
          }
          return;
        }

        if (chat_type === 'interview' && !chatData.well_received) {
          if (isMounted) {
            setSocketError('Job interview was not accepted by server');
            setIsLoading(false);
          }
          return;
        }
        
        // This is the key fix: Connect socket AFTER a successful API call
        if (!socket.connected) {
          socket.connect();
        }

        if (isMounted) {
          setIsLoading(false); // Hide the main loader after successful API call
        }

      } catch (error) {
        if (isMounted) {
          let errorMessage = 'Failed to initialize job interview';
          if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to server. Check your internet connection.';
          } else if (error.message.includes('401')) {
            errorMessage = 'Authentication failed. Please sign in again.';
          } else {
            errorMessage = error.message;
          }
          setSocketError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    // Socket listeners setup
    const setupSocketListeners = () => {
      socket.on('connect', () => {
        if (isMounted) {
          setIsConnected(true);
          setSocketError('');
          setStatusMessage('Connected. Awaiting first question...'); // New status
        }
        const userId = own_id || localStorage.getItem('user_id');
        socket.emit('join', { room_name: String(userId), user: parseInt(userId) });
      });

      socket.on('disconnect', () => {
        if (isMounted) {
          setIsConnected(false);
          setStatusMessage('Disconnected. Reconnecting...');
        }
      });

      socket.on('connect_error', (error) => {
        if (isMounted) {
          setSocketError('Failed to connect to interview server.');
          setIsConnected(false);
          setIsLoading(false);
        }
      });
      
      // ... (all other socket listeners)
      socket.on('new_message', (data, callback) => {
          if (isMounted) {
            const { message_content, sender_tag, own_id: senderOwnId, recipient_id } = data;
            const newMessage = {
              id: Date.now(),
              sender_id: senderOwnId || 'interviewer',
              message_content: message_content,
              sender_tag: sender_tag || 'interviewer',
              recipient_id: recipient_id,
              timestamp: new Date().toISOString(),
              questionNumber: data.questionNumber,
              totalQuestions: data.totalQuestions,
              isStatus: false
            };
            setMessages(prev => [...prev, newMessage]);
            setIsWaitingForResponse(true);
            setIsLoading(false); // New: stop loading after first message
            setStatusMessage('');
          }
          if (callback && typeof callback === 'function') callback();
      });

      socket.on('control_instruction', (data, callback) => {
          if (isMounted) {
            const { command, data: instructionData } = data;
            switch (command) {
              case 'interview_complete':
                setInterviewComplete(true);
                setIsWaitingForResponse(false);
                setIsLoading(false);
                setStatusMessage('Interview finished!');
                break;
              case 'next_question':
                setIsWaitingForResponse(true);
                setIsLoading(false); // Ensure loading stops here
                break;
              case 'error':
                setSocketError(instructionData?.message || 'An error occurred');
                setIsLoading(false);
                setStatusMessage('');
                break;
              case 'redirect':
                const redirectPath = instructionData.content === '/dashboard' 
                  ? '/freelancer-dashboard' 
                  : instructionData.content;
                navigate(redirectPath);
                break;
            }
          }
          if (callback && typeof callback === 'function') callback();
      });

      socket.on('status_update', (data, callback) => {
          if (isMounted && data.update) {
            const customMessage = STATUS_MESSAGE_MAP[data.update] || data.update;
            const statusMessage = {
              id: Date.now(),
              sender_id: 'status', 
              message_content: customMessage,
              timestamp: new Date().toISOString(),
              isStatus: true 
            };
            setMessages(prev => [...prev, statusMessage]);
          }
          if (callback && typeof callback === 'function') callback();
      });

      socket.on('notification', (data, callback) => {
          if (isMounted) {
            if (data.type === 'error') setSocketError(data.message);
            console.log(`Notification ${data.type}: ${data.message}`);
          }
          if (callback && typeof callback === 'function') callback();
      });
    };

    const cleanupSocketListeners = () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('new_message');
      socket.off('control_instruction');
      socket.off('status_update');
      socket.off('notification');
    };

    // Initial setup
    initializeChat();
    setupSocketListeners();
    
    // Cleanup function
    return () => {
      isMounted = false;
      cleanupSocketListeners();
      if (socket.connected) {
        socket.disconnect(); // Added to disconnect on component unmount
      }
    };
  }, [navigate, own_id, chat_type, recipient_id]);

  // Scroll to bottom effect
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Utility and handler functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setCurrentInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentInput.trim() === '' || !isWaitingForResponse || !isConnected) {
      return;
    }
    const userMessage = {
      id: Date.now(),
      sender_id: parseInt(own_id),
      message_content: currentInput.trim(),
      sender_tag: 'user',
      timestamp: new Date().toISOString(),
      isStatus: false
    };
    setMessages(prev => [...prev, userMessage]);
    socket.emit('send_message', {
      message_content: currentInput.trim(),
      own_id: parseInt(own_id || localStorage.getItem('user_id')),
      recipient_id: recipient_id
    });
    setCurrentInput('');
    setIsWaitingForResponse(false);
    setIsLoading(true); // New: set loading state while waiting for AI response
    setStatusMessage('Processing your answer...');
  };

  const handleBackToNotifications = () => navigate('/notifications');
  const handleContinueToDashboard = () => navigate('/task');
  
  // --- Render logic ---
  if (isLoading && !socketError) { // Changed this to use the new `isLoading` state
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <Loader2 className="h-16 w-16 text-green-600 mb-4 animate-spin" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connecting</h2>
        <p className="text-gray-600">{statusMessage}</p>
      </div>
    );
  }

  // Error state
  if (socketError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
        <p className="text-gray-600 mb-4 max-w-md">{socketError}</p>
        <button
          onClick={() => window.location.reload()}
          className="py-2 px-6 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-md transition-all mr-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Main interface
  return (
   <div className="w-full min-h-screen bg-gradient-to-b from-green-50 to-white flex justify-center py-12">
      <div className="w-full max-w-6xl flex flex-col rounded-xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-green-600 text-white rounded-t-xl px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl text-white font-bold flex items-center">
              <MessageSquare className="mr-3" />
              Job Interview
            </h2>
            <button
              onClick={handleBackToNotifications}
              className="flex items-center text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Notifications
            </button>
          </div>
          <p className="mt-2 text-lg opacity-90">
            {!interviewComplete
              ? "You're being interviewed for a specific job opportunity"
              : 'Interview complete! The client will review your responses.'}
          </p>
          <div className="mt-2 flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm opacity-75">
              {isConnected ? 'Connected to interviewer' : 'Connecting...'}
            </span>
          </div>
          <div className="mt-2 text-sm opacity-75">
            Interview ID: {recipient_id}
          </div>
          {messages.some(m => m.questionNumber) && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-white h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.max(0, messages.filter(m => m.questionNumber).length /
                      (messages.find(m => m.totalQuestions)?.totalQuestions || 6) * 100)}%`
                  }}
                ></div>
              </div>
              <p className="mt-1 text-sm text-white">
                {messages.filter(m => m.questionNumber).length} questions answered
              </p>
            </div>
          )}
        </div>

        {/* Chat content */}
        <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {!isConnected && messages.length === 0 && (
              <div className="text-center text-green-600 p-2 bg-green-100 rounded-md">
                <Loader2 className="inline-block h-4 w-4 animate-spin mr-1" />
                Connecting to interviewer...
              </div>
            )}
            {/* Messages */}
            {messages.map((message) => (
              <div key={message.id}>
                {message.isStatus ? (
                  // Status bubble
                  <div className="flex justify-center">
                    <div className="bg-gray-200 text-gray-700 text-xs py-1 px-3 rounded-full shadow-sm max-w-[75%] text-center">
                      {message.message_content}
                    </div>
                  </div>
                ) : (
                  // Regular chat message bubble
                  <div
                    className={`flex ${message.sender_id === parseInt(own_id) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-4 rounded-xl shadow-sm ${message.sender_id === parseInt(own_id)
                        ? 'bg-green-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                        }`}
                    >
                      <p className="text-sm md:text-base">{message.message_content}</p>
                      {message.questionNumber && (
                        <p className="text-xs mt-1 opacity-75">
                          Question {message.questionNumber} of {message.totalQuestions}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Loading indicator */}
            {isLoadingQuestion && (
              <div className="flex justify-start">
                <div className="max-w-[75%] p-4 rounded-xl shadow-sm bg-white text-gray-800 rounded-bl-none border border-gray-200">
                  <p className="text-sm md:text-base animate-pulse">
                    {STATUS_MESSAGE_MAP[statusMessage] || statusMessage || 'Interviewer is typing...'}
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form or completion message */}
          {!interviewComplete ? (
            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center">
                <TextareaAutosize
                  value={currentInput}
                  onChange={handleInputChange}
                  disabled={!isConnected || !isWaitingForResponse || isLoadingQuestion}
                  className="flex-1 resize-none border border-gray-300 rounded-l-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 h-12 overflow-hidden"
                  placeholder={
                    !isConnected
                      ? 'Connecting...'
                      : isLoadingQuestion
                        ? STATUS_MESSAGE_MAP[statusMessage] || statusMessage || 'Interviewer is typing...'
                        : isWaitingForResponse
                          ? 'Type your response...'
                          : 'Please wait...'
                  }
                  rows={1}
                  minRows={1}
                  maxRows={6}
                />
                <button
                  type="submit"
                  disabled={!isConnected || !isWaitingForResponse || currentInput.trim() === '' || isLoadingQuestion}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 m-4 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          ) : (
            <div className="border-t border-gray-200 p-6 flex flex-col items-center bg-white">
              <p className="text-center text-gray-700 mb-4">
                You've successfully completed the job interview! The client will review your responses and get back to you.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleBackToNotifications}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium"
                >
                  Back to Notifications
                </button>
                <button
                  onClick={handleContinueToDashboard}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium"
                >
                  Continue to Tasks
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobInterview;