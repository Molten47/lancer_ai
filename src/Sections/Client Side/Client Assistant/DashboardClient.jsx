import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, MessageSquare, Minimize, X, CirclePlus, Paperclip, Smile, Loader2, CheckCircle, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import socket, { isSocketConnected } from '../../../Components/socket';
import TextareaAutosize from 'react-textarea-autosize';

const STATUS_MESSAGE_MAP = {
  'initializing': 'Setting up your AI assistant...',
  'connecting': 'Connecting to AI services...',
  'processing': 'Processing your request...',
  'generating': 'Generating response...',
};

const AIAssistantChat = ({ 
  chat_type = 'client_assistant',
  assistantName = 'Client Assistant',
  assistantAvatar = 'AI',
  className = '',
  onMessageSent,
  onClose,
  onMinimize
}) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const own_id = localStorage.getItem('user_id');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [socketError, setSocketError] = useState('');
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userAvatar, setUserAvatar] = useState('U');
  const [userName, setSenderName] = useState('You');
  const [attachments, setAttachments] = useState([]);

  // ✅ NEW: Helper function to mark last status message as complete
  const markLastStatusComplete = () => {
    setMessages(prev => {
      const statusIndices = prev
        .map((msg, idx) => msg.isStatus && !msg.isComplete ? idx : -1)
        .filter(idx => idx !== -1);
      
      if (statusIndices.length === 0) return prev;
      
      const lastStatusIndex = statusIndices[statusIndices.length - 1];
      const updated = [...prev];
      updated[lastStatusIndex] = { 
        ...updated[lastStatusIndex], 
        isComplete: true,
        completedAt: new Date().toISOString()
      };
      
      return updated;
    });
  };

  // FIXED: Consistent message type detection function
  const determineMessageType = (messageData, currentUserId) => {
    const currentUserStr = String(currentUserId);
    const senderStr = String(messageData.sender_id || messageData.own_id);
    const recipientStr = String(messageData.recipient_id);
    const senderTag = messageData.sender_tag;

    if (senderTag === 'ai') {
      return {
        type: 'ai',
        sender: assistantName
      };
    }

    if (senderTag === 'sender_a') {
      return {
        type: 'user',
        sender: userName
      };
    }

    if (senderTag === 'sender_b') {
      return {
        type: 'ai',
        sender: assistantName
      };
    }

    if (senderStr === 'client_assistant' || senderStr !== 'undefined') {
      return {
        type: 'ai',
        sender: assistantName
      };
    }

    if (senderStr === currentUserStr && senderStr !== 'undefined') {
      return {
        type: 'user',
        sender: userName
      };
    }

    if (recipientStr !== 'undefined' && senderStr !== 'undefined') {
      if (recipientStr === currentUserStr && senderStr === 'client_assistant') {
        return {
          type: 'ai',
          sender: assistantName
        };
      }

      if (recipientStr === 'client_assistant' && senderStr === currentUserStr) {
        return {
          type: 'user',
          sender: userName
        };
      }
    }

    console.warn('Could not determine message type, using content-based fallback', {
      messageData,
      currentUserId,
      senderTag,
      senderStr,
      recipientStr
    });

    const content = messageData.message_content || messageData.content || '';
    const contentLength = content.length;
    
    if (contentLength > 100 || 
        content.includes('I can help') || 
        content.includes('Let me assist') ||
        content.includes('I understand') ||
        content.includes('Based on') ||
        content.match(/^(Sure|Certainly|Of course|I'll|Let me)/)) {
      return {
        type: 'ai',
        sender: assistantName
      };
    }

    return {
      type: 'user',
      sender: userName
    };
  };

  // FIXED: Clear loading states function
  const clearLoadingStates = () => {
    setIsTyping(false);
    setIsLoadingAnswer(false);
    setIsWaitingForResponse(false);
    setStatusMessage('');
  };

  // Message filter for this chat type
  const createClientAssistantMessageFilter = (currentUserId, assistantId = 'client_assistant') => {
    return (messageData) => {
      if (!messageData || !currentUserId) return false;
      const { own_id, recipient_id, sender_tag, sender_id } = messageData;
      const currentUserStr = String(currentUserId);
      const senderStr = String(sender_id || own_id);
      const recipientStr = String(recipient_id);
      const assistantStr = String(assistantId);
      
      const isUserToAssistant = senderStr === currentUserStr && recipientStr === assistantStr;
      const isAssistantToUser = senderStr === assistantStr && recipientStr === currentUserStr;
      const isAIFromAssistant = sender_tag === 'ai' && (senderStr === assistantStr || recipientStr === currentUserStr);
      
      return isUserToAssistant || isAssistantToUser || isAIFromAssistant;
    };
  };

  const fetchUserProfile = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) return;

      const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      if (!authToken) return;

      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        mode: 'cors',
        credentials: 'include'
      });

      if (!response.ok) return;

      const profileResponse = await response.json();
      if (profileResponse.well_received && profileResponse.profile_data) {
        const profile = profileResponse.profile_data;
        setUserProfile(profile);

        const firstInitial = profile.firstname ? profile.firstname.charAt(0).toUpperCase() : '';
        const lastInitial = profile.lastname ? profile.lastname.charAt(0).toUpperCase() : '';
        const avatarInitials = firstInitial + lastInitial || 'U';
        setUserAvatar(avatarInitials);

        const displayName = profile.username || profile.firstname || 'You';
        setSenderName(displayName);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const checkAuthentication = () => {
    const token = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('userRole');

    if (!userId && !userRole) {
      setSocketError('Please complete the signup process first.');
      setTimeout(() => navigate('/signup', { replace: true }), 1500);
      return false;
    }

    if (!token && userRole && !location.state?.fromProfileSetup) {
      setSocketError('Please complete your profile setup first.');
      setTimeout(() => navigate('/profile_setup', { replace: true, state: { role: userRole } }), 1500);
      return false;
    }

    if (!userId && userRole) {
      setSocketError('Session data incomplete. Please sign in again.');
      setTimeout(() => navigate('/signin', { replace: true }), 1500);
      return false;
    }

    setIsLoadingAuth(false);
    return true;
  };

  const initializeChat = async () => {
    try {
      setIsLoadingQuestion(true);
      setStatusMessage('Initializing chat...');

      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) {
        throw new Error('API URL not configured');
      }

      const userId = own_id || localStorage.getItem('user_id') || 'temp_user';
      const queryParams = new URLSearchParams({
        chat_type: chat_type,
        own_id: userId,
        recipient_id: 'client_assistant'
      });
      
      const headers = { 'Content-Type': 'application/json' };
      const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(`${API_URL}/api/chat?${queryParams}`, {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      let chatData;
      try {
        chatData = await response.json();
      } catch (jsonError) {
        if (import.meta.env.DEV) {
          setIsLoadingQuestion(false);
          setStatusMessage('');
          return;
        }
        throw new Error('Invalid response format from server');
      }

      if (!response.ok) {
        if (response.status === 401) {
          setSocketError(!authToken ? 'Please complete the signup process to start the chat.' : 'Session expired. Please sign in again.');
          setTimeout(() => navigate(!authToken ? '/signup' : '/signin', { replace: true }), 2000);
          return;
        }
        throw new Error(chatData.error_message || `HTTP ${response.status}: Failed to initialize chat`);
      }

      if (chat_type === 'client_assistant' && chatData.message_history && Array.isArray(chatData.message_history)) {
        const currentUserId = own_id || localStorage.getItem('user_id');
        
        const formattedMessages = chatData.message_history.map((msg, index) => {
          const { type: messageType, sender: senderName } = determineMessageType({
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id,
            sender_tag: msg.sender_tag,
            own_id: msg.own_id,
            message_content: msg.message_content
          }, currentUserId);
          
          return {
            id: msg.id || `history-${index}`,
            type: messageType,
            content: msg.message_content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            sender: senderName,
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id,
            sender_tag: msg.sender_tag,
            isStatus: false
          };
        });
        
        formattedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        console.log('Processed message history:', formattedMessages.map(m => ({ 
          type: m.type, 
          sender: m.sender, 
          sender_tag: m.sender_tag, 
          content_preview: m.content.substring(0, 50) 
        })));
        
        setMessages(formattedMessages);
      }

      if (chatData.user_id && !localStorage.getItem('user_id')) {
        localStorage.setItem('user_id', chatData.user_id.toString());
      }

      setIsLoadingQuestion(false);
      setStatusMessage('');

    } catch (error) {
      console.error('Chat initialization error:', error);
      
      let errorMessage = 'Failed to initialize chat';
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection or try again later.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication failed. Please sign in again.';
      } else {
        errorMessage = error.message;
      }

      setIsLoadingQuestion(false);
      setStatusMessage('');
      throw new Error(errorMessage);
    }
  };

  // ✅ UPDATED: Setup socket listeners with status completion
  const setupSocketListeners = () => {
    console.log('Setting up socket listeners...');
    
    setIsConnected(socket.connected);
    
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setSocketError('');
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      clearLoadingStates();
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      clearLoadingStates();
      setSocketError('Connection error. Please try refreshing the page.');
    });

    socket.on('new_message', (data, callback) => {
      console.log('Received new message:', data);
      
      const userId = own_id || localStorage.getItem('user_id');
      const messageFilter = createClientAssistantMessageFilter(userId, 'client_assistant');
      
      if (!messageFilter(data)) {
        console.log('Message filtered out - not for this chat');
        if (callback && typeof callback === 'function') callback();
        return;
      }
      
      // ✅ NEW: Mark last status as complete before adding new message
      markLastStatusComplete();
      
      const { message_content, sender_tag, own_id: socket_sender_id, recipient_id } = data;
      
      const { type: messageType, sender: senderName } = determineMessageType({
        sender_id: socket_sender_id,
        recipient_id: recipient_id,
        sender_tag: sender_tag
      }, userId);

      const newMessage = {
        id: Date.now(),
        type: messageType,
        content: message_content,
        timestamp: serverTimestamp ? new Date(serverTimestamp) : new Date(),
        sender: senderName,
        sender_id: socket_sender_id,
        recipient_id: recipient_id,
        sender_tag: sender_tag,
        isStatus: false
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      if (messageType === 'ai') {
        clearLoadingStates();
      }

      if (callback && typeof callback === 'function') callback();
    });

    socket.on('control_instruction', (data, callback) => {
      console.log('Received control instruction:', data);
      const { command, data: instructionData } = data;
      
      switch (command) {
        case 'interview_complete':
          setInterviewComplete(true);
          clearLoadingStates();
          markLastStatusComplete();
          setStatusMessage('Chat session completed!');
          break;
        case 'next_question':
          setIsWaitingForResponse(true);
          break;
        case 'error':
          setSocketError(instructionData?.message || 'An error occurred');
          clearLoadingStates();
          markLastStatusComplete();
          break;
        case 'redirect':
          if (instructionData?.url) {
            navigate(instructionData.url);
          }
          break;
      }
      
      if (callback && typeof callback === 'function') callback();
    });

    // ✅ UPDATED: status_update listener with isComplete handling
    socket.on('status_update', (data, callback) => {
      console.log('Received status update:', data);
      if (data.update) {
        // ✅ NEW: Mark previous status as complete before adding new one
        markLastStatusComplete();
        
        const customMessage = STATUS_MESSAGE_MAP[data.update]

      if (!customMessage) {
      console.log('Ignoring unmapped status:', data.update);
      if (callback && typeof callback === 'function') callback();
      return;
    }
    
        setStatusMessage(customMessage);
        
        const statusMessage = {
          id: `status-${Date.now()}`,
          type: 'status',
          content: customMessage,
          timestamp: new Date().toISOString(),
          sender: 'System',
          sender_id: 'status', 
          isStatus: true,
          isComplete: false,
          startedAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, statusMessage]);
      }
      if (callback && typeof callback === 'function') callback();
    });

    socket.on('notification', (data, callback) => {
      console.log('Received notification:', data);
      const { message, type } = data;
      if (type === 'error') {
        setSocketError(message);
        clearLoadingStates();
        markLastStatusComplete();
      }
      if (callback && typeof callback === 'function') callback();
    });
  };

  const cleanupSocketListeners = () => {
    console.log('Cleaning up socket listeners...');
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');
    socket.off('new_message');
    socket.off('control_instruction');
    socket.off('status_update');
    socket.off('notification');
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Default behavior: navigate back or close window
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        window.close();
      }
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (onMinimize) {
      onMinimize(!isMinimized);
    }
  };

  useEffect(() => {
    return () => {

    };
  }, []);

  useEffect(() => {
    console.log('Component initialized. Starting initialization process...');
    
    const initializeWithRetry = async (attempt = 1) => {
      try {
        console.log(`Initialization attempt ${attempt}`);
        
        if (!checkAuthentication()) return;

        setupSocketListeners();

        let waitCount = 0;
        const waitForSocket = () => {
          return new Promise((resolve, reject) => {
            const checkConnection = () => {
              if (socket.connected) {
                console.log('Socket is connected');
                setIsConnected(true);
                resolve();
              } else if (waitCount < 50) {
                waitCount++;
                setTimeout(checkConnection, 100);
              } else {
                reject(new Error('Socket connection timeout'));
              }
            };
            checkConnection();
          });
        };

        try {
          await waitForSocket();
        } catch (socketError) {
          if (attempt < 3) {
            console.log(`Socket not ready, retrying... (attempt ${attempt + 1}/3)`);
            setTimeout(() => initializeWithRetry(attempt + 1), 2000);
            return;
          } else {
            throw new Error(`Socket connection failed after ${attempt} attempts`);
          }
        }

        await initializeChat();
        await fetchUserProfile();

        console.log('Initialization completed successfully');
        
      } catch (error) {
        console.error('Initialization failed:', error);
        
        let errorMessage = 'Failed to initialize chat';
        if (error.message.includes('Socket connection')) {
          errorMessage = 'Cannot connect to chat server. Please refresh the page.';
        } else if (error.message.includes('Authentication')) {
          errorMessage = 'Authentication failed. Please sign in again.';
        } else {
          errorMessage = error.message;
        }
        
        setSocketError(errorMessage);
        setIsLoadingAuth(false);
        setIsLoadingQuestion(false);
      }
    };

    initializeWithRetry();
    
    return () => {
      cleanupSocketListeners();
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // ✅ UPDATED: Send message function with status completion
  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConnected) return;

    // ✅ NEW: Mark last status as complete when user sends a message
    markLastStatusComplete();

    const userId = own_id || localStorage.getItem('user_id');

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      sender: userName, 
      sender_id: userId,
      recipient_id: 'client_assistant',
      sender_tag: 'user',
      isStatus: false
    };

    setMessages(prev => [...prev, userMessage]);

    socket.emit('send_message', {
      message_content: inputValue.trim(),
      own_id: parseInt(userId),
      recipient_id: 'client_assistant',
    });

    if (onMessageSent) {
      onMessageSent(userMessage);
    }

    setInputValue('');
    setAttachments([]);
    setIsWaitingForResponse(true);
    setIsLoadingAnswer(true);
    
    setTimeout(() => setIsTyping(true), 500);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

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

  if (isLoadingAuth) {
    return (
      <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className} third-font pt-12 ${isMinimized ? 'hidden' : ''}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <CirclePlus className='text-light size-7' />
          </div>
          <div>
            <h3 className="font-semibold text-white">{assistantName}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleMinimize}
            className="p-2 text-white hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            title="Minimize"
          >
            <Minimize size={20} />
          </button>
          <button 
            onClick={handleClose}
            className="p-2 text-white hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

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
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => {
            const isFromCurrentUser = message.type === 'user';
            const isAIMessage = message.type === 'ai';

            {/* Status message with spinner/checkmark */}
            if (message.isStatus) {
              return (
                <div key={message.id} className="flex items-start gap-3 px-2 py-2 my-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {!message.isComplete ? (
                      <div className="relative">
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                        <div className="absolute inset-0 h-5 w-5 rounded-full bg-blue-100 opacity-50 animate-ping"></div>
                      </div>
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm leading-relaxed font-medium transition-all duration-500 ${
                      message.isComplete 
                        ? 'text-gray-500 line-through decoration-gray-400 opacity-70' 
                        : 'text-gray-700'
                    }`}>
                      {message.content}
                    </p>
                    {!message.isComplete && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full animate-progress"></div>
                      </div>
                    )}
                    {message.timestamp && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(message.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div key={message.id} className={`flex gap-3 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                {!isFromCurrentUser && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-semibold text-xs">{assistantAvatar}</span>
                  </div>
                )}

                <div className={`flex flex-col ${isFromCurrentUser ? 'items-end' : 'items-start'} max-w-[70%] lg:max-w-[60%]`}>
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    isFromCurrentUser
                      ? 'bg-primary text-white rounded-lg'
                      : 'bg-[#F3F4F6] text-primary rounded-lg'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {isFromCurrentUser && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-semibold text-xs">{userAvatar}</span>
                  </div>
                )}
              </div>
            );
          })}

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
      <div className="p-6 bg-white border-t border-gray-200">
        <div className="flex flex-col gap-3 max-w-5xl mx-auto">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <Paperclip size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-600 max-w-[150px] truncate">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <TextareaAutosize
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                disabled={!isConnected || isLoadingAnswer}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-sm resize-none"
                minRows={3}
                maxRows={6}
              />
              
              {/* Icons inside input */}
              <div className="absolute left-3 top-1/2 transform translate-y-1/2 flex items-center gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isConnected || isLoadingAnswer}
                  className="flex items-center justify-center hover:text-gray-700 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed text-gray-500"
                  title="Attach file"
                >
                  <Paperclip size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*"
                />
                
                <button 
                  className="flex items-center justify-center hover:text-gray-700 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed text-gray-500"
                  title="Add emoji"
                  disabled={!isConnected || isLoadingAnswer}
                >
                  <Smile size={16} />
                </button>
              </div>

              {inputValue && (
                <button 
                  onClick={() => setInputValue('')}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              )}
            </div>

            {/* Send Button */}
            <button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !isConnected || isLoadingAnswer}
              className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
            >
              {isLoadingAnswer ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={18} className="text-white" />
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-4 h-4 flex items-center justify-center text-blue-500">
              ⚡
            </div>
            <p>The AI will help you define your project scope, required assets, and suggest tasks.</p>
          </div>
        </div>
        
        {/* Connection Status */}
        {!isConnected && (
          <div className="flex justify-center mt-3">
            <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
              Connection lost. Trying to reconnect...
            </div>
          </div>
        )}
      </div>

      {/* CSS for progress bar animation */}
      <style>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AIAssistantChat;