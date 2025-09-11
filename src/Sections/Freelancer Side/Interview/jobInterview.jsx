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
  // Add more mappings as needed
};

const JobInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const own_id = localStorage.getItem('user_id');
  const messagesEndRef = useRef(null);

  // Get interview parameters from navigation state
  const { recipient_id, chat_type } = location.state || {};
  
  // If no interview data, redirect back to notifications
  if (!recipient_id || !chat_type) {
    useEffect(() => {
      navigate('/notifications', { replace: true });
    }, []);
    return null;
  }

  // State declarations
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [interviewId, setInterviewId] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Authentication check
  const checkAuthentication = () => {
    const token = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');


    setIsLoadingAuth(false);
    return true;
  };

  // Initialize job interview chat
  const initializeChat = async () => {
    try {
      setIsLoadingQuestion(true);
      setStatusMessage('Connecting to interviewer...');

      const API_URL = import.meta.env.VITE_API_URL;
      const queryParams = new URLSearchParams({
        chat_type: chat_type,
        own_id: own_id || localStorage.getItem('user_id') || 'temp_user',
        recipient_id: recipient_id
      });
      
      const headers = {
        'Content-Type': 'application/json',
      };

      // Enhanced token checking with debug info
      const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      console.log('Auth Debug Info:', {
        hasAccessJWT: !!localStorage.getItem('access_jwt'),
        hasAccessToken: !!localStorage.getItem('access_token'),
        userId: own_id,
        chatType: chat_type,
        recipientId: recipient_id,
        tokenLength: authToken ? authToken.length : 0
      });

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      } else {
        console.warn('No authentication token found in localStorage');
        setSocketError('No authentication token found. Please sign in again.');
        setTimeout(() => {
          navigate('/signin', { replace: true });
        }, 1500);
        return;
      }

      console.log('Making request to:', `${API_URL}/api/chat?${queryParams}`);
      console.log('Request headers:', headers);

      const response = await fetch(`${API_URL}/api/chat?${queryParams}`, {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        credentials: 'include'
      });

      let chatData;
      try {
        chatData = await response.json();
      } catch (jsonError) {
        if (import.meta.env.DEV) {
          if (!socket.connected) {
            socket.connect();
          }
          return;
        }
        throw new Error('Invalid response format from server');
      }

      if (!response.ok) {
        if (response.status === 401) {
          if (!authToken) {
            setSocketError('Please complete the signup process to start the interview.');
            setTimeout(() => {
              navigate('/signup', { replace: true });
            }, 2000);
          } else {
            setSocketError('Session expired. Please sign in again.');
            setTimeout(() => {
              navigate('/signin', { replace: true });
            }, 1000);
          }
          return;
        }
        throw new Error(chatData.error_message || `HTTP ${response.status}: Failed to initialize interview`);
      }

      if (chat_type === 'interview') {
        if (!chatData.well_received) {
          throw new Error('Job interview was not accepted by server');
        }
      }

      if (!socket.connected) {
        socket.connect();
      }

    } catch (error) {
      let errorMessage = 'Failed to initialize job interview';
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        if (error.message.includes('CORS') || error.toString().includes('CORS')) {
          errorMessage = 'Connection blocked by CORS policy. Please contact support or try again later.';
        } else {
          errorMessage = 'Cannot connect to server. Please check your internet connection or try again later.';
        }
      } else if (error.message.includes('401') || error.message.includes('unrecognized')) {
        errorMessage = 'Authentication failed. Please sign in again.';
      } else if (error.message.includes('well_received')) {
        errorMessage = 'Server rejected the interview request';
      } else if (error.message.includes('API URL')) {
        errorMessage = 'Server configuration error. Please contact support.';
      } else {
        errorMessage = error.message;
      }

      setSocketError(errorMessage);
      setIsLoadingQuestion(false);
      setStatusMessage('');

      if (errorMessage.includes('sign in') || errorMessage.includes('Authentication')) {
        setTimeout(() => {
          navigate('/signin', { replace: true });
        }, 2000);
      }
    }
  };

  // Setup socket listeners
  const setupSocketListeners = () => {
    socket.on('connect', () => {
      setIsConnected(true);
      setSocketError('');
      
      const userId = own_id || localStorage.getItem('user_id');
      socket.emit('join', {
        room_name: String(userId),
        user: parseInt(userId)
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      setSocketError('Failed to connect to interview server');
      setIsConnected(false);
      setIsLoadingQuestion(false);
      setStatusMessage('');
    });

    socket.on('new_message', (data, callback) => {
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
      setIsLoadingQuestion(false);
      setStatusMessage('');

      if (callback && typeof callback === 'function') {
        callback();
      }
    });

    socket.on('control_instruction', (data, callback) => {
      const { command, data: instructionData } = data;
      switch (command) {
        case 'interview_complete':
          setInterviewComplete(true);
          setIsWaitingForResponse(false);
          setIsLoadingQuestion(false);
          setStatusMessage('Interview finished!');
          break;
        case 'next_question':
          setIsWaitingForResponse(true);
          break;
        case 'error':
          setSocketError(instructionData?.message || 'An error occurred');
          setIsLoadingQuestion(false);
          setStatusMessage('');
          break;
       case 'redirect':
      if (instructionData?.type === 'url' && instructionData.content) {
        // Check if the redirect URL is '/dashboard' and change it
        const redirectPath = instructionData.content === '/dashboard' 
          ? '/freelancer-dashboard' 
          : instructionData.content;
        navigate(redirectPath); 
      } else if (instructionData?.type === 'external_url' && instructionData.content) {
        window.location.href = instructionData.content;
      }
      break;
        default:
          console.log('Unknown command:', command);
      }
      if (callback && typeof callback === 'function') {
        callback();
      }
    });

    socket.on('status_update', (data, callback) => {
      if (data.update) {
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
      if (callback && typeof callback === 'function') {
        callback();
      }
    });

    socket.on('notification', (data, callback) => {
      const { message, type } = data;
      if (type === 'error') {
        setSocketError(message);
      } else if (type === 'warning') {
        console.warn('Notification warning:', message);
      } else if (type === 'info') {
        console.info('Notification info:', message);
      }
      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  };

  // Cleanup socket listeners
  const cleanupSocketListeners = () => {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');
    socket.off('new_message');
    socket.off('control_instruction');
    socket.off('status_update');
    socket.off('notification');
  };

  // Utility functions
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
    }, () => {
    });

    setCurrentInput('');
    setIsWaitingForResponse(false);
    setIsLoadingQuestion(true);
    setStatusMessage('Processing your answer...');
  };

  const handleBackToNotifications = () => {
    navigate('/notifications');
  };

  const handleContinueToDashboard = () => {
    navigate('/task');
  };

  // Effects
  useEffect(() => {
    if (!checkAuthentication()) {
      return;
    }
    initializeChat();
    setupSocketListeners();
    return cleanupSocketListeners;
  }, [navigate, own_id, chat_type, recipient_id, location.state]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Loading state
  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <Loader2 className="h-16 w-16 text-blue-600 mb-4 animate-spin" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Setting Up Job Interview</h2>
        <p className="text-gray-600">Please wait while we connect you to the interviewer...</p>
      </div>
    );
  }

  // Error state
  if (socketError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {socketError.includes('Authentication') || socketError.includes('sign in')
            ? 'Authentication Required'
            : 'Connection Error'}
        </h2>
        <p className="text-gray-600 mb-4 max-w-md">{socketError}</p>
        {import.meta.env.DEV && (
          <div className="mb-4 p-3 bg-yellow-100 rounded-lg text-sm text-left max-w-md">
            <strong>Debug Info:</strong><br />
            User ID: {own_id || localStorage.getItem('user_id') || 'null'}<br />
            Has Token: {localStorage.getItem('access_jwt') ? 'Yes' : 'No'}<br />
            API URL: {import.meta.env.VITE_API_URL || 'Not set'}<br />
            User Role: {localStorage.getItem('userRole') || 'Not set'}<br />
            Chat Type: {chat_type || 'Not set'}<br />
            Recipient ID: {recipient_id || 'Not set'}
          </div>
        )}
        <div className="space-y-2">
          {!socketError.includes('Authentication') && !socketError.includes('sign in') && (
            <button
              onClick={() => {
                setSocketError('');
                window.location.reload();
              }}
              className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-all mr-2"
            >
              Try Again
            </button>
          )}
          <button
            onClick={handleBackToNotifications}
            className="py-2 px-6 bg-gray-500 hover:bg-gray-600 text-white rounded-md shadow-md transition-all mr-2"
          >
            Back to Notifications
          </button>
          <button
            onClick={() => navigate('/signin', { replace: true })}
            className="py-2 px-6 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-md transition-all"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Main job interview interface
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