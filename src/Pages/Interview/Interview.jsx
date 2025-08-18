import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, MessageSquare, Send, XCircle } from 'lucide-react';
import socket from '../../Components/socket';

const Interview = ({ chat_type = 'platform_interviewer'}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const own_id = localStorage.getItem('user_id');
  
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [interviewId, setInterviewId] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  // NEW: Add state for message deduplication and flow control
  const [lastMessageId, setLastMessageId] = useState(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [isTypingIndicatorVisible, setIsTypingIndicatorVisible] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  
  const messagesEndRef = useRef(null);

  // Socket connection management
  useEffect(() => {
    console.log('Interview component mounted, localStorage:', {
      user_id: localStorage.getItem('user_id'),
      userRole: localStorage.getItem('userRole'),
      access_jwt: localStorage.getItem('access_jwt'),
      refresh_jwt: localStorage.getItem('refresh_jwt'),
      access_token: localStorage.getItem('access_token'),
      refresh_token: localStorage.getItem('refresh_token'),
    });

    // Authentication check
    const token = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('userRole');
    
    if (!userId && !userRole) {
      console.log('No user data found, redirecting to signup');
      setSocketError('Please complete the signup process first.');
      setTimeout(() => {
        navigate('/signup', { replace: true });
      }, 1500);
      return;
    }

    if (!token && userRole) {
      console.log('User in signup flow, checking if they need to complete profile setup');
      const fromProfileSetup = location.state?.fromProfileSetup;
      
      if (!fromProfileSetup) {
        setSocketError('Please complete your profile setup first.');
        setTimeout(() => {
          navigate('/profile_setup', { 
            replace: true, 
            state: { role: userRole } 
          });
        }, 1500);
        return;
      }
    }

    if (!userId && userRole) {
      console.log('Missing user ID, redirecting to signin');
      setSocketError('Session data incomplete. Please sign in again.');
      setIsLoadingAuth(false);
      setTimeout(() => {
        navigate('/signin', { replace: true });
      }, 1500);
      return;
    }

    setIsLoadingAuth(false);

    // Initialize chat and setup socket
    const initializeChat = async () => {
      try {
        setIsLoadingQuestion(true);
        setTypingMessage('Initializing interview...');
        setIsTypingIndicatorVisible(true);
        
        // Use the same API URL as socket.js
        const API_URL = import.meta.env.VITE_API_URL || 'https://lancer-web-service.onrender.com';
        
        console.log('Initializing chat with API_URL:', API_URL);
        
        const queryParams = new URLSearchParams({
          chat_type: chat_type,
          own_id: own_id || localStorage.getItem('user_id') || 'temp_user',
          recipient_id: 'platform_interviewer'
        });

        console.log('Making API request to:', `${API_URL}/api/chat?${queryParams}`);

        const headers = {
          'Content-Type': 'application/json',
        };

        const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_URL}/api/chat?${queryParams}`, {
          method: 'GET',
          headers: headers,
          mode: 'cors',
          credentials: 'include'
        });

        console.log('API Response status:', response.status);

        let chatData;
        try {
          chatData = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          if (import.meta.env.DEV) {
            console.warn('JSON parsing failed, attempting socket connection anyway...');
            if (!socket.connected) {
              socket.connect();
            }
            return;
          }
          throw new Error('Invalid response format from server');
        }

        console.log('Chat API response:', chatData);

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
          throw new Error(chatData.error_message || `HTTP ${response.status}: Failed to initialize chat`);
        }

        if (chat_type === 'platform_interviewer') {
          if (!chatData.well_received) {
            throw new Error('Platform interview was not accepted by server');
          }
          console.log('Platform interview initialized successfully');
        }
        
        // Connect to socket after successful API call
        console.log('Connecting to socket...');
        setTypingMessage('Connecting to interview server...');
        if (!socket.connected) {
          socket.connect();
        }
        
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        
        let errorMessage = 'Failed to initialize interview';
        
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
          if (error.message.includes('CORS') || error.toString().includes('CORS')) {
            errorMessage = 'Connection blocked by CORS policy. Please contact support or try again later.';
            
            if (import.meta.env.DEV) {
              console.warn('CORS error detected, but attempting socket connection for development...');
              setTimeout(() => {
                if (!socket.connected) {
                  socket.connect();
                }
              }, 2000);
              errorMessage += ' (Attempting socket connection anyway for development)';
            }
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
        setIsTypingIndicatorVisible(false);
        
        if (errorMessage.includes('sign in') || errorMessage.includes('Authentication')) {
          setTimeout(() => {
            navigate('/signin', { replace: true });
          }, 2000);
        }
        return;
      }
    };

    initializeChat();

    // ENHANCED: Setup socket event listeners with flow control
    const setupSocketListeners = () => {
      // Connection events
      socket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        setSocketError('');
        setTypingMessage('Preparing first question...');
        
        // Join room as per documentation
        const userId = own_id || localStorage.getItem('user_id');
        socket.emit('join', {
          room_name: String(userId),
          user: parseInt(userId)
        });
        
        console.log('Joined socket room with:', {
          room_name: String(userId),
          user: parseInt(userId)
        });
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
        setIsTypingIndicatorVisible(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setSocketError('Failed to connect to interview server');
        setIsConnected(false);
        setIsLoadingQuestion(false);
        setIsTypingIndicatorVisible(false);
      });

      // ENHANCED: Message listener with deduplication
      socket.on('new_message', (data) => {
        console.log('Received new message:', data);
        
        const { message_content, sender_tag, own_id: senderOwnId, recipient_id } = data;
        
        // Create unique message ID based on content and timestamp
        const messageId = `${senderOwnId}-${message_content.slice(0, 20)}-${Date.now()}`;
        
        // Prevent duplicate messages
        if (lastMessageId === messageId) {
          console.log('Duplicate message detected, ignoring');
          return;
        }
        
        setLastMessageId(messageId);
        
        const newMessage = {
          id: messageId,
          sender_id: senderOwnId || 'ai',
          message_content: message_content,
          sender_tag: sender_tag || 'ai',
          recipient_id: recipient_id,
          timestamp: new Date().toISOString(),
          questionNumber: data.questionNumber,
          totalQuestions: data.totalQuestions
        };
        
        // Update question number if present
        if (data.questionNumber) {
          setCurrentQuestionNumber(data.questionNumber);
        }
        
        setMessages(prev => [...prev, newMessage]);
        
        // Hide typing indicator and enable response
        setIsTypingIndicatorVisible(false);
        setIsLoadingQuestion(false);
        setIsWaitingForResponse(true);
      });

      // ENHANCED: Status update listener for typing indicators
      socket.on('status_update', (data) => {
        console.log('Received status update:', data);
        
        if (data.update) {
          // Show custom typing messages based on status
          if (data.update.includes('thinking') || data.update.includes('processing')) {
            setTypingMessage('AI is analyzing your response...');
            setIsTypingIndicatorVisible(true);
          } else if (data.update.includes('generating') || data.update.includes('preparing')) {
            const questionNum = currentQuestionNumber + 1;
            setTypingMessage(`Preparing question ${questionNum}...`);
            setIsTypingIndicatorVisible(true);
          } else {
            setTypingMessage(data.update);
            setIsTypingIndicatorVisible(true);
          }
        }
      });

      // Control instruction listener
      socket.on('control_instruction', (data) => {
        console.log('Received control instruction:', data);
        
        const { command, data: instructionData } = data;
        
        switch(command) {
          case 'interview_complete':
            setInterviewComplete(true);
            setIsWaitingForResponse(false);
            setIsTypingIndicatorVisible(false);
            break;
          case 'next_question':
            setTypingMessage(`Preparing next question...`);
            setIsTypingIndicatorVisible(true);
            setIsWaitingForResponse(false);
            break;
          case 'error':
            setSocketError(instructionData?.message || 'An error occurred');
            setIsTypingIndicatorVisible(false);
            break;
          default:
            console.log('Unknown command:', command);
        }
      });

      // Notification listener
      socket.on('notification', (data) => {
        console.log('Received notification:', data);
        
        const { message, sender, type, anc } = data;
        
        if (type === 'error') {
          setSocketError(message);
          setIsTypingIndicatorVisible(false);
        } else if (type === 'warning') {
          console.warn('Notification warning:', message);
        } else if (type === 'info') {
          console.info('Notification info:', message);
        }
        
        if (anc) {
          console.log('Additional notification context:', anc);
        }
      });
    };

    setupSocketListeners();

    // Cleanup function
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('new_message');
      socket.off('control_instruction');
      socket.off('status_update');
      socket.off('notification');
    };
  }, [navigate, own_id, chat_type, location.state]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTypingIndicatorVisible]);

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
      id: `user-${Date.now()}`,
      sender_id: parseInt(own_id),
      message_content: currentInput.trim(),
      sender_tag: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Send message to socket
    socket.emit('send_message', {
      message_content: currentInput.trim(),
      own_id: parseInt(own_id || localStorage.getItem('user_id')),
      recipient_id: 'platform_interviewer'
    });

    // Reset state for next question flow
    setCurrentInput('');
    setIsWaitingForResponse(false);
    setIsLoadingQuestion(true);
    
    // Show immediate typing indicator
    setTypingMessage('AI is analyzing your response...');
    setIsTypingIndicatorVisible(true);
  };

  const handleContinueToDashboard = () => {
    navigate('/task');
  };

  // Show loading while checking authentication
  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <Loader2 className="h-16 w-16 text-blue-600 mb-4 animate-spin" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Setting Up Interview</h2>
        <p className="text-gray-600">Please wait while we prepare your interview...</p>
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
            <strong>Debug Info:</strong><br/>
            User ID: {own_id || localStorage.getItem('user_id') || 'null'}<br/>
            Has Token: {localStorage.getItem('access_jwt') ? 'Yes' : 'No'}<br/>
            API URL: {import.meta.env.VITE_API_URL || 'Not set'}<br/>
            User Role: {localStorage.getItem('userRole') || 'Not set'}<br/>
            From Profile Setup: {location.state?.fromProfileSetup ? 'Yes' : 'No'}
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
            onClick={() => navigate('/signin', { replace: true })}
            className="py-2 px-6 bg-gray-500 hover:bg-gray-600 text-white rounded-md shadow-md transition-all"
          >
            Go to Sign In
          </button>
          {localStorage.getItem('userRole') && (
            <button
              onClick={() => navigate('/profile_setup', { replace: true })}
              className="mt-2 py-2 px-6 bg-green-500 hover:bg-green-600 text-white rounded-md shadow-md transition-all block mx-auto"
            >
              Go to Profile Setup
            </button>
        )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white flex justify-center py-12">
      <div className="w-full max-w-6xl flex flex-col rounded-xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-blue-600 text-white rounded-t-xl px-8 py-6 border-b border-gray-200">
          <h2 className="text-3xl text-white font-bold flex items-center">
            <MessageSquare className="mr-3" />
            AI Interview
          </h2>
          <p className="mt-2 text-lg opacity-90">
            {!interviewComplete
              ? "Our AI will ask you questions to understand your skills better"
              : 'Interview complete! Your profile is ready.'}
          </p>
          
          {/* Connection status */}
          <div className="mt-2 flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm opacity-75">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>

          {/* Enhanced Progress bar */}
          {(messages.some(m => m.questionNumber) || currentQuestionNumber > 0) && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-white h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${Math.max(0, currentQuestionNumber / 
                      (messages.find(m => m.totalQuestions)?.totalQuestions || 6) * 100)}%` 
                  }}
                ></div>
              </div>
              <p className="mt-1 text-sm text-white">
                {currentQuestionNumber > 0 ? `Question ${currentQuestionNumber}` : 'Starting interview...'}
                {messages.find(m => m.totalQuestions) && ` of ${messages.find(m => m.totalQuestions).totalQuestions}`}
              </p>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {!isConnected && !socketError && (
              <div className="text-center text-blue-600 p-2 bg-blue-100 rounded-md">
                <Loader2 className="inline-block h-4 w-4 animate-spin mr-1" /> 
                Connecting to interview server...
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === parseInt(own_id) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-xl shadow-sm ${
                    message.sender_id === parseInt(own_id)
                      ? 'bg-blue-600 text-white rounded-br-none'
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
            ))}

            {/* Enhanced typing indicator */}
            {isTypingIndicatorVisible && (
              <div className="flex justify-start">
                <div className="max-w-[75%] p-4 rounded-xl shadow-sm bg-white text-gray-800 rounded-bl-none border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <p className="text-sm md:text-base italic text-gray-600">
                      {typingMessage || 'AI is preparing next question...'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input area */}
          {!interviewComplete ? (
            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center">
                <textarea
                  value={currentInput}
                  onChange={handleInputChange}
                  disabled={!isConnected || !isWaitingForResponse || isLoadingQuestion}
                  className="flex-1 resize-none border border-gray-300 rounded-l-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 overflow-hidden"
                  placeholder={
                    !isConnected
                      ? 'Connecting...'
                      : isTypingIndicatorVisible
                        ? 'Please wait for the question...'
                        : isWaitingForResponse
                          ? 'Type your response...'
                          : 'Please wait...'
                  }
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!isConnected || !isWaitingForResponse || currentInput.trim() === '' || isLoadingQuestion || isTypingIndicatorVisible}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 m-4 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              
              {/* Status message */}
              {isConnected && (
                <div className="mt-2 text-xs text-gray-500 text-center">
                  {isTypingIndicatorVisible 
                    ? 'Please wait for the AI to finish preparing the question'
                    : isWaitingForResponse 
                      ? 'You can now respond to the question'
                      : 'Waiting for next question...'
                  }
                </div>
              )}
            </form>
          ) : (
            <div className="border-t border-gray-200 p-6 flex flex-col items-center bg-white">
              <p className="text-center text-gray-700 mb-4">
                You've successfully completed the interview! Your profile is now ready.
              </p>
              <button
                onClick={handleContinueToDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;