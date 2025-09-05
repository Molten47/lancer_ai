import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
// import socket from '../../../Components/socket';

const STATUS_MESSAGE_MAP = {
  'initializing': 'Setting up your AI assistant...',
  'connecting': 'Connecting to AI services...',
  'processing': 'Processing your request...',
  'generating': 'Generating response...',
  // Add more mappings as needed
};

const AIAssistantChat = ({ 
  chat_type = 'client_assistant',
  assistantName = 'AI Assistant',
  assistantAvatar = 'AI',
  className = '',
  onMessageSent
}) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const own_id = localStorage.getItem('user_id');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [socketError, setSocketError] = useState('');
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [interviewId, setInterviewId] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);

  // Initialize component
  useEffect(() => {
    const init = async () => {
      // const isAuthenticated = checkAuthentication();
      // if (isAuthenticated) {
      //   setupSocketListeners();
      //   await initializeChat();
      // }
    };
    
    init();
    
    return () => {
      // cleanupSocketListeners();
    };
  }, []);

  // Authorization Checker
  const checkAuthentication = () => {
    // const token = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
    // const userId = localStorage.getItem('user_id');
    // const userRole = localStorage.getItem('userRole');

    // if (!userId && !userRole) {
    //   setSocketError('Please complete the signup process first.');
    //   setTimeout(() => {
    //     navigate('/signup', { replace: true });
    //   }, 1500);
    //   return false;
    // }

    // if (!token && userRole) {
    //   const fromProfileSetup = location.state?.fromProfileSetup;
    //   if (!fromProfileSetup) {
    //     setSocketError('Please complete your profile setup first.');
    //     setTimeout(() => {
    //       navigate('/profile_setup', {
    //         replace: true,
    //         state: { role: userRole }
    //       });
    //     }, 1500);
    //     return false;
    //   }
    // }

    // if (!userId && userRole) {
    //   setSocketError('Session data incomplete. Please sign in again.');
    //   setIsLoadingAuth(false);
    //   setTimeout(() => {
    //     navigate('/signin', { replace: true });
    //   }, 1500);
    //   return false;
    // }

    setIsLoadingAuth(false);
    return true;
  };

  // Chat Initialization - Fixed API integration
  const initializeChat = async () => {
    try {
      setIsLoadingQuestion(true);
      setStatusMessage('Initializing chat...');

      // const API_URL = import.meta.env.VITE_API_URL;
      // if (!API_URL) {
      //   throw new Error('API URL not configured. Please check your environment variables.');
      // }

      // const userId = own_id || localStorage.getItem('user_id') || 'temp_user';
      // const queryParams = new URLSearchParams({
      //   chat_type: chat_type,
      //   own_id: userId,
      //   recipient_id: 'client_assistant'
      // });
      
      // const headers = {
      //   'Content-Type': 'application/json',
      // };

      // const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      // if (authToken) {
      //   headers['Authorization'] = `Bearer ${authToken}`;
      // }

      // const response = await fetch(`${API_URL}/api/chat?${queryParams}`, {
      //   method: 'GET',
      //   headers: headers,
      //   mode: 'cors',
      //   credentials: 'include'
      // });

      // let chatData;
      // try {
      //   chatData = await response.json();
      // } catch (jsonError) {
      //   console.error('JSON parsing error:', jsonError);
      //   // In development, continue even if API fails
      //   if (import.meta.env.DEV) {
      //     console.log('Development mode: continuing without API data');
      //     setIsLoadingQuestion(false);
      //     setStatusMessage('');
      //     // if (!socket.connected) {
      //     //   socket.connect();
      //     // }
      //     return;
      //   }
      //   throw new Error('Invalid response format from server');
      // }

      // if (!response.ok) {
      //   if (response.status === 401) {
      //     if (!authToken) {
      //       setSocketError('Please complete the signup process to start the chat.');
      //       setTimeout(() => {
      //         navigate('/signup', { replace: true });
      //       }, 2000);
      //     } else {
      //       setSocketError('Session expired. Please sign in again.');
      //       setTimeout(() => {
      //         navigate('/signin', { replace: true });
      //       }, 1000);
      //     }
      //     return;
      //   } else if (response.status === 403) {
      //     setSocketError('Access denied. Please check your permissions.');
      //     return;
      //   } else if (response.status === 404) {
      //     setSocketError('Chat service not found. Please contact support.');
      //     return;
      //   }
      //   throw new Error(chatData.error_message || `HTTP ${response.status}: Failed to initialize chat`);
      // }

      // Handle successful response
      // if (chat_type === 'client_assistant') {
      //   // Load message history if available
      //   if (chatData.message_history && Array.isArray(chatData.message_history)) {
      //     const formattedMessages = chatData.message_history.map((msg, index) => ({
      //       id: msg.id || `history-${index}`,
      //       type: msg.sender_tag === 'ai' ? 'ai' : 'user',
      //       content: msg.message_content,
      //       timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      //       sender: msg.sender_tag === 'ai' ? assistantName : 'You',
      //       sender_id: msg.sender_id,
      //       recipient_id: msg.recipient_id,
      //       isStatus: false
      //     }));
      //     setMessages(formattedMessages);
      //   }

      //   // Set user_id if provided
      //   if (chatData.user_id && !localStorage.getItem('user_id')) {
      //     localStorage.setItem('user_id', chatData.user_id.toString());
      //   }
      // }

      // Connect socket after successful API initialization
      // if (!socket.connected) {
      //   socket.connect();
      // }

      setIsLoadingQuestion(false);
      setStatusMessage('');

    } catch (error) {
      // console.error('Chat initialization error:', error);
      
      // let errorMessage = 'Failed to initialize chat';
      // if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      //   if (error.message.includes('CORS') || error.toString().includes('CORS')) {
      //     errorMessage = 'Connection blocked by CORS policy. Please contact support or try again later.';
      //   } else {
      //     errorMessage = 'Cannot connect to server. Please check your internet connection or try again later.';
      //   }
      // } else if (error.message.includes('401') || error.message.includes('unrecognized')) {
      //   errorMessage = 'Authentication failed. Please sign in again.';
      // } else if (error.message.includes('API URL')) {
      //   errorMessage = 'Server configuration error. Please contact support.';
      // } else {
      //   errorMessage = error.message;
      // }

      // setSocketError(errorMessage);
      setIsLoadingQuestion(false);
      setStatusMessage('');

      // if (errorMessage.includes('sign in') || errorMessage.includes('Authentication')) {
      //   setTimeout(() => {
      //     navigate('/signin', { replace: true });
      //   }, 2000);
      // }
    }
  };

  // Socket connection management
  // const setupSocketListeners = () => {
  //   socket.on('connect', () => {
  //     setIsConnected(true);
  //     setSocketError('');
      
  //     const userId = own_id || localStorage.getItem('user_id');
  //     if (userId) {
  //       socket.emit('join', {
  //         room_name: String(userId),
  //         user: parseInt(userId)
  //       });
  //     }
  //   });

  //   socket.on('disconnect', () => {
  //     setIsConnected(false);
  //   });

  //   socket.on('connect_error', (error) => {
  //     console.error('Socket connection error:', error);
  //     setSocketError('Failed to connect to assistant server');
  //     setIsConnected(false);
  //     setIsLoadingAnswer(false);
  //     setStatusMessage('');
  //   });

  //   socket.on('new_message', (data, callback) => {
  //     const { message_content, sender_tag, own_id: senderOwnId, recipient_id } = data;
  //     const newMessage = {
  //       id: Date.now(),
  //       type: sender_tag === 'ai' ? 'ai' : 'user',
  //       content: message_content,
  //       timestamp: new Date(),
  //       sender: sender_tag === 'ai' ? assistantName : 'You',
  //       sender_id: senderOwnId || 'ai',
  //       recipient_id: recipient_id,
  //       isStatus: false
  //     };
      
  //     setMessages(prev => [...prev, newMessage]);
  //     setIsWaitingForResponse(false);
  //     setIsLoadingAnswer(false);
  //     setStatusMessage('');
  //     setIsTyping(false);

  //     if (callback && typeof callback === 'function') {
  //       callback();
  //     }
  //   });

  //   socket.on('control_instruction', (data, callback) => {
  //     const { command, data: instructionData } = data;
  //     switch (command) {
  //       case 'interview_complete':
  //         setInterviewComplete(true);
  //         setIsWaitingForResponse(false);
  //         setIsLoadingAnswer(false);
  //         setStatusMessage('Chat session completed!');
  //         break;
  //       case 'next_question':
  //         setIsWaitingForResponse(true);
  //         break;
  //       case 'error':
  //         setSocketError(instructionData?.message || 'An error occurred');
  //         setIsLoadingAnswer(false);
  //         setStatusMessage('');
  //         break;
  //       case 'redirect':
  //         if (instructionData?.url) {
  //           navigate(instructionData.url);
  //         }
  //         break;
  //       default:
  //         console.log('Unknown command:', command);
  //     }
  //     if (callback && typeof callback === 'function') {
  //       callback();
  //     }
  //   });

  //   socket.on('status_update', (data, callback) => {
  //     if (data.update) {
  //       const customMessage = STATUS_MESSAGE_MAP[data.update] || data.update;
  //       setStatusMessage(customMessage);
        
  //       const statusMessage = {
  //         id: Date.now(),
  //         type: 'status',
  //         content: customMessage,
  //         timestamp: new Date(),
  //         sender: 'System',
  //         sender_id: 'status', 
  //         isStatus: true 
  //       };
  //       setMessages(prev => [...prev, statusMessage]);
  //     }
  //     if (callback && typeof callback === 'function') {
  //       callback();
  //     }
  //   });

  //   socket.on('notification', (data, callback) => {
  //     const { message, type } = data;
  //     if (type === 'error') {
  //       setSocketError(message);
  //     } else if (type === 'warning') {
  //       console.warn('Notification warning:', message);
  //     } else if (type === 'info') {
  //       console.info('Notification info:', message);
  //     }
  //     if (callback && typeof callback === 'function') {
  //       callback();
  //     }
  //   });
  // };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    // if (!inputValue.trim() || !isConnected) return;

    const userId = own_id || localStorage.getItem('user_id');
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      sender: 'You',
      sender_id: userId,
      recipient_id: 'client_assistant',
      isStatus: false
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);

    // Emit message via socket using the correct event name
    // Documentation says to use "send_message" not "user_message"
    // socket.emit('send_message', {
    //   message_content: inputValue.trim(),
    //   own_id: parseInt(userId),
    //   recipient_id: 'client_assistant',
    // });

    // Call optional callback
    if (onMessageSent) {
      onMessageSent(userMessage);
    }

    // Clear input and show loading state
    setInputValue('');
    setIsWaitingForResponse(true);
    setIsLoadingAnswer(true);
    
    // Show typing indicator
    setTimeout(() => {
      setIsTyping(true);
    }, 500);

    // Focus back to input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Cleanup socket listeners
  // const cleanupSocketListeners = () => {
  //   socket.off('connect');
  //   socket.off('disconnect');
  //   socket.off('connect_error');
  //   socket.off('new_message');
  //   socket.off('control_instruction');
  //   socket.off('status_update');
  //   socket.off('notification');
  // };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Show loading state during authentication
  if (isLoadingAuth) {
    return (
      <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">{assistantAvatar}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{assistantName}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
              {isConnected ? 'Online' : 'Connecting...'} • {formatTime(new Date())}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            title="Chat History"
          >
            <MessageSquare size={20} />
          </button>
          <button 
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            title="Chat Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {socketError && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{socketError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoadingQuestion && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
            <p className="text-sm text-blue-800">{statusMessage || 'Loading...'}</p>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${
              message.type === 'user' ? 'justify-end' : 
              message.isStatus ? 'justify-center' : 'justify-start'
            }`}>
              {/* Status messages */}
              {message.isStatus && (
                <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  {message.content}
                </div>
              )}

              {/* Regular messages */}
              {!message.isStatus && (
                <>
                  {/* Avatar - only show for AI messages on left */}
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-semibold text-xs">{assistantAvatar}</span>
                    </div>
                  )}
                  
                  {/* Message bubble container */}
                  <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'} ${
                    message.type === 'user' ? 'max-w-[75%] sm:max-w-[70%] md:max-w-[65%] lg:max-w-[60%]' : 'max-w-[80%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-[65%]'
                  }`}>
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white rounded-br-md' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 px-1 ${
                      message.type === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {/* Avatar - only show for user messages on right */}
                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-semibold text-xs">U</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-semibold text-xs">{assistantAvatar}</span>
              </div>
              <div className="flex flex-col items-start max-w-[60%]">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 px-1">
                  {assistantName} is typing...
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-3 max-w-5xl mx-auto">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What do you want to get done?"
              disabled={!isConnected || isLoadingAnswer}
              className="w-full px-6 py-4 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-sm"
            />
            {inputValue && (
              <button 
                onClick={() => setInputValue('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !isConnected || isLoadingAnswer}
            className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
          >
            {isLoadingAnswer ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={20} className="text-white ml-0.5" />
            )}
          </button>
        </div>
        
        {/* Connection Status */}
        {!isConnected && (
          <div className="flex justify-center mt-3">
            <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
              Connection lost. Trying to reconnect...
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        {!isWaitingForResponse && messages.length === 0 && (
          <div className="flex justify-center mt-4">
            <div className="flex flex-wrap justify-center gap-2">
              <button 
                onClick={() => setInputValue("Help me find a web developer")}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                disabled={!isConnected}
              >
                Find Developer
              </button>
              <button 
                onClick={() => setInputValue("Show me my active projects")}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                disabled={!isConnected}
              >
                My Projects
              </button>
              <button 
                onClick={() => setInputValue("What can you help me with?")}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                disabled={!isConnected}
              >
                How it works
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantChat;