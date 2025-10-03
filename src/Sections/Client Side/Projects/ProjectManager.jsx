import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socket from '../../../Components/socket';
import TextareaAutosize from 'react-textarea-autosize';

const STATUS_MESSAGE_MAP = {
  'initializing': 'Setting up your AI assistant...',
  'connecting': 'Connecting to AI services...',
  'processing': 'Processing your request...',
  'generating': 'Generating response...',
};

const ProjectManager = ({
  chat_type = 'project_manager',
  assistantName = 'Project Manager',
  assistantAvatar = 'PM',
  className = '',
  onMessageSent
}) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const own_id = localStorage.getItem('user_id');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [socketError, setSocketError] = useState('');
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const dynamicRecipientIdRef = useRef(null);
 const ownIdRef = useRef(own_id);
  // New state variables for dynamic ID
  const [projectId, setProjectId] = useState(null);
  const [dynamicRecipientId, setDynamicRecipientId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userName, setUserName] = useState('You');

  const responseTimeoutRef = useRef(null);

  // Consistent message type detection function
  const determineMessageType = (messageData, currentUserId) => {
    const currentUserStr = String(currentUserId);
    const senderStr = String(messageData.sender_id || messageData.own_id);
    const recipientStr = String(messageData.recipient_id);
    const senderTag = messageData.sender_tag;

    // Priority 1: Handle specific sender_tag patterns from message history
    if (senderTag === 'ai') {
      return {
        type: 'ai',
        sender: assistantName
      };
    }

    // Priority 2: Handle sender_a and sender_b patterns (common in message history)
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

    // Priority 3: Check if sender is the assistant (project manager)
    if (senderStr !== 'undefined' && (senderStr === dynamicRecipientId || senderStr.includes('project_manager'))) {
      return {
        type: 'ai',
        sender: assistantName
      };
    }

    // Priority 4: Check if sender is current user
    if (senderStr === currentUserStr && senderStr !== 'undefined') {
      return {
        type: 'user',
        sender: userName
      };
    }

    // Priority 5: Check recipient to infer type (when sender/recipient IDs are available)
    if (recipientStr !== 'undefined' && senderStr !== 'undefined') {
      if (recipientStr === currentUserStr && (senderStr === dynamicRecipientId || senderStr.includes('project_manager'))) {
        return {
          type: 'ai',
          sender: assistantName
        };
      }

      if ((recipientStr === dynamicRecipientId || recipientStr.includes('project_manager')) && senderStr === currentUserStr) {
        return {
          type: 'user',
          sender: userName
        };
      }
    }

    // Default fallback with better logging
    console.warn('Could not determine message type, using content-based fallback', {
      messageData,
      currentUserId,
      senderTag,
      senderStr,
      recipientStr,
      dynamicRecipientId
    });

    // Content-based fallback for edge cases
    const content = messageData.message_content || messageData.content || '';
    const contentLength = content.length;
    
    // If it's a very long message or contains AI-like responses, assume it's from AI
    if (contentLength > 100 || 
        content.includes('I can help') || 
        content.includes('Let me assist') ||
        content.includes('I understand') ||
        content.includes('Based on') ||
        content.includes('project') ||
        content.match(/^(Sure|Certainly|Of course|I'll|Let me)/)) {
      return {
        type: 'ai',
        sender: assistantName
      };
    }

    // Default to user for short messages
    return {
      type: 'user',
      sender: userName
    };
  };

  // Clear loading states function
  const clearLoadingStates = () => {
    setIsTyping(false);
    setIsLoadingAnswer(false);
    setIsWaitingForResponse(false);
    setStatusMessage('');
    
    // Clear any pending timeout
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }
  };

  // Set response timeout
  const setResponseTimeout = () => {
    // Clear any existing timeout
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }
    
    // Set new timeout (30 seconds)
    responseTimeoutRef.current = setTimeout(() => {
      console.warn('Response timeout - clearing loading states');
      clearLoadingStates();
      setSocketError('Response timeout. The Project Manager may be experiencing issues. Please try again.');
    }, 30000);
  };

  // Fetch projects to get dynamic project_id
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('access_jwt');
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.well_received && data.projects.length > 0) {
        let targetProject = null;
        for (const projectObj of data.projects) {
          const projectKey = Object.keys(projectObj)[0];
          const projectData = projectObj[projectKey];
          if (projectData.status === 'ongoing') {
            targetProject = projectData;
            break;
          }
        }
        if (!targetProject) {
          const firstProjectObj = data.projects[0];
          const projectKey = Object.keys(firstProjectObj)[0];
          targetProject = firstProjectObj[projectKey];
        }
        
        const fetchedProjectId = targetProject.id;
        setProjectId(fetchedProjectId);
        const recipientId = `project_manager_${fetchedProjectId}`;
        setDynamicRecipientId(recipientId);
        dynamicRecipientIdRef.current = recipientId;
         ownIdRef.current = own_id; 
        console.log(`✅ Project Manager initialized with ID: ${recipientId}`);
        return recipientId;
      } else {
        setSocketError('No projects found. Cannot initialize project manager chat.');
        return null;
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setSocketError('Failed to load project data. Please try again.');
      return null;
    }
  };

  // Chat Initialization with proper message type detection
  const initializeChat = async (recipientId) => {
    try {
      setIsLoadingQuestion(true);
      setStatusMessage('Loading chat history...');
      
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) {
        throw new Error('API URL not configured.');
      }

      const userId = own_id || localStorage.getItem('user_id') || 'temp_user';
      const queryParams = new URLSearchParams({
        chat_type: chat_type,
        own_id: userId,
        recipient_id: recipientId
      });

      const headers = { 'Content-Type': 'application/json' };
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

      let chatData;
      try {
        chatData = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error('Invalid response format from server');
      }

      if (!response.ok) {
        const errorMsg = chatData.error_message || `HTTP ${response.status}: Failed to initialize chat`;
        if (response.status === 401) {
          setSocketError('Authentication failed. Please sign in again.');
        } else {
          throw new Error(errorMsg);
        }
      }

      // Load message history with consistent type detection
      if (chatData.message_history && Array.isArray(chatData.message_history)) {
        const currentUserId = own_id || localStorage.getItem('user_id');
        
        const formattedMessages = chatData.message_history.map((msg, index) => {
          // Use the consistent message type detection with the full message object
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
            isStatus: false
          };
        });
        
        // Sort messages by timestamp to ensure correct order
        formattedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        console.log('Processed PM message history:', formattedMessages.map(m => ({ 
          type: m.type, 
          sender: m.sender, 
          content_preview: m.content.substring(0, 50) 
        })));
        
        setMessages(formattedMessages);
      }

      setIsLoadingQuestion(false);
      setStatusMessage('');
      setIsInitialized(true);
      return true;
    } catch (error) {
      console.error('Chat initialization error:', error);
      let errorMessage = 'Failed to initialize chat';
      if (error.message.includes('CORS')) {
        errorMessage = 'Connection blocked by CORS policy. Please contact support or try again later.';
      } else if (error.message.includes('API URL')) {
        errorMessage = 'Server configuration error. Please contact support.';
      } else {
        errorMessage = error.message;
      }
      setSocketError(errorMessage);
      setIsLoadingQuestion(false);
      setStatusMessage('');
      if (errorMessage.includes('sign in') || errorMessage.includes('Authentication')) {
        setTimeout(() => navigate('/signin', { replace: true }), 2000);
      }
      return false;
    }
  };

  // Authorization Checker
  const handleAuthError = (message, route, delay = 1500) => {
    setSocketError(message);
    setIsLoadingAuth(false);
    setTimeout(() => {
      navigate(route, { replace: true });
    }, delay);
  };

  const checkAuthentication = () => {
    const token = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('userRole');
    if (!userId && !userRole) {
      handleAuthError('Please complete the signup process first.', '/signup');
      return false;
    }
    if (!token && userRole) {
      const fromProfileSetup = location.state?.fromProfileSetup;
      if (!fromProfileSetup) {
        handleAuthError('Please complete your profile setup first.', '/profile_setup', { state: { role: userRole } });
        return false;
      }
    }
    if (!userId && userRole) {
      handleAuthError('Session data incomplete. Please sign in again.', '/signin');
      return false;
    }
    setIsLoadingAuth(false);
    return true;
  };

  // REMOVED: Join project manager room - agents don't use rooms

  // Setup socket listeners function
  const setupSocketListeners = () => {
    console.log('Setting up socket listeners...');
    setIsConnected(socket.connected);
    
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setSocketError('');
      // REMOVED: No room joining for agents
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

  // ✅ SINGLE new_message handler - DELETE any other new_message handlers
  socket.on('new_message', (data, callback) => {
    const userId = ownIdRef.current || localStorage.getItem('user_id');
    const currentRecipientId = dynamicRecipientIdRef.current;
    
    console.log('🔔 new_message received:', {
      sender_id: data.sender_id,
      recipient_id: data.recipient_id,
      sender_tag: data.sender_tag,
      own_id: data.own_id,
      currentRecipientId,
      userId,
      preview: data.message_content?.substring(0, 50)
    });
    
    // Simple filter - accept if any of these conditions are true
    const isRelevant = 
      data.sender_tag === 'ai' || 
      String(data.sender_id) === String(currentRecipientId) || 
      String(data.recipient_id) === String(currentRecipientId) ||
      String(data.sender_id).includes('project_manager') ||
      String(data.recipient_id).includes('project_manager');
    
    if (!isRelevant) {
      console.log('❌ Filtered: Not relevant to PM chat');
      if (callback) callback();
      return;
    }
    
    console.log('✅ Message accepted');
    
    // Determine message type
    const { type: messageType, sender: senderName } = determineMessageType({
      sender_id: data.sender_id,
      recipient_id: data.recipient_id,
      sender_tag: data.sender_tag,
      message_content: data.message_content
    }, userId);

    const newMessage = {
      id: Date.now() + Math.random(), // Ensure unique ID
      type: messageType,
      content: data.message_content,
      timestamp: new Date(),
      sender: senderName,
      sender_id: data.sender_id,
      recipient_id: data.recipient_id,
      isStatus: false
    };
    
    console.log('📝 Adding message:', {
      type: newMessage.type,
      sender: newMessage.sender,
      preview: newMessage.content.substring(0, 30)
    });
    
    setMessages(prev => {
      // Prevent duplicates
      const isDuplicate = prev.some(msg => 
        msg.content === newMessage.content && 
        Math.abs(new Date(msg.timestamp) - new Date(newMessage.timestamp)) < 2000
      );
      
      if (isDuplicate) {
        console.log('⚠️ Duplicate detected, skipping');
        return prev;
      }
      
      return [...prev, newMessage];
    });
    
    if (messageType === 'ai') {
      console.log('🤖 AI response - clearing loading');
      clearLoadingStates();
    }

    if (callback) callback();
  });

    socket.on('control_instruction', (data, callback) => {
      console.log('Received control instruction:', data);
      const { command, data: instructionData } = data;
      
      switch (command) {
        case 'interview_complete':
          clearLoadingStates();
          setStatusMessage('Chat session completed!');
          break;
        case 'next_question':
          setIsWaitingForResponse(true);
          break;
        case 'error':
          setSocketError(instructionData?.message || 'An error occurred');
          clearLoadingStates();
          break;
        case 'redirect':
          if (instructionData?.url) {
            navigate(instructionData.url);
          }
          break;
      }
      
      if (callback && typeof callback === 'function') callback();
    });

    socket.on('status_update', (data, callback) => {
      console.log('Received status update:', data);
      if (data.update) {
        const customMessage = STATUS_MESSAGE_MAP[data.update] || data.update;
        setStatusMessage(customMessage);
        
        const statusMessage = {
          id: Date.now(),
          type: 'status',
          content: customMessage,
          timestamp: new Date().toISOString(),
          sender: 'System',
          sender_id: 'status', 
          isStatus: true 
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

  // Cleanup timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
    };
  }, []);

  // Main initialization effect
  useEffect(() => {
    const init = async () => {
      if (checkAuthentication()) {
        const recipientId = await fetchProjects();
        if (recipientId) {
          await initializeChat(recipientId);
          // REMOVED: No room joining for agents - they work directly via socket connection
        }
      }
    };
    init();
  }, []);

// socket listeners effect:
useEffect(() => {
  if (!dynamicRecipientId) {
    console.log('⏸️ Skipping socket setup - no recipient ID yet');
    return;
  }
  
  console.log('🔌 Setting up socket listeners for:', dynamicRecipientId);
  
  // ADD THIS: Clean up existing listeners BEFORE setting up new ones
  cleanupSocketListeners();
  
  // Then set up fresh listeners
  setupSocketListeners();
  
  return () => {
    console.log('🧹 Cleaning up socket listeners');
    cleanupSocketListeners();
  };
}, [dynamicRecipientId]); //Only re-run when dynamicRecipientId changes

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Add after your other useEffects
useEffect(() => {
  const logAllEvents = (eventName, ...args) => {
    console.log(`🔔 [SOCKET EVENT] ${eventName}:`, args);
  };
  
  socket.onAny(logAllEvents);
  
  return () => socket.offAny(logAllEvents);
}, []);

  // Send message function
const handleSendMessage = () => {
  if (!inputValue.trim() || !isConnected || !dynamicRecipientId) {
    console.warn('Cannot send - missing requirements:', {
      hasInput: !!inputValue.trim(),
      isConnected,
      hasDynamicRecipientId: !!dynamicRecipientId
    });
    return;
  }

  const userId = own_id || localStorage.getItem('user_id');
  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: inputValue.trim(),
    timestamp: new Date(),
    sender: 'You',
    sender_id: userId,
    recipient_id: dynamicRecipientId,
    isStatus: false
  };

  setMessages(prev => [...prev, userMessage]);

  const messagePayload = {
    message_content: inputValue.trim(),
    own_id: parseInt(userId),
    recipient_id: dynamicRecipientId,
    chat_type: chat_type,
    timestamp: new Date().toISOString()
  };

  console.log('📤 Sending message:', messagePayload);

  // Emit without callback - backend doesn't send acknowledgments
  socket.emit('send_message', messagePayload);
  console.log('✅ Message emitted to backend');
  
  if (onMessageSent) {
    onMessageSent(userMessage);
  }

  setInputValue('');
  setIsWaitingForResponse(true);
  setIsLoadingAnswer(true);
  setTimeout(() => setIsTyping(true), 500);
  setTimeout(() => inputRef.current?.focus(), 100);
  setResponseTimeout();
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

  if (isLoadingAuth || !isInitialized) {
    return (
      <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your project data...</p>
            {statusMessage && (
              <p className="text-sm text-gray-500 mt-2">{statusMessage}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full pt-6 bg-gray-50 ${className}`}>
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
              {projectId && <span>• Project {projectId}</span>}
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
      {isLoadingAnswer && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
            <p className="text-sm text-blue-800">{statusMessage || 'The PM is processing...'}</p>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6">
          {messages.map((message) => {
            // Use message type for positioning instead of sender_id comparison
            const isFromCurrentUser = message.type === 'user';
            
            return (
              <div key={message.id} className={`flex gap-3 ${
                message.isStatus ? 'justify-center' :
                isFromCurrentUser ? 'justify-end' : 'justify-start'
              }`}>
                {message.isStatus && (
                  <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    {message.content}
                  </div>
                )}
                {!message.isStatus && (
                  <>
                    {!isFromCurrentUser && (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-semibold text-xs">{assistantAvatar}</span>
                      </div>
                    )}
                    <div className={`flex flex-col ${
                      isFromCurrentUser ? 'items-end' : 'items-start'
                    } ${
                      isFromCurrentUser ? 'max-w-[75%] sm:max-w-[70%] md:max-w-[65%] lg:max-w-[60%]' :
                      'max-w-[80%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-[65%]'
                    }`}>
                      <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                        isFromCurrentUser
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 px-1 ${
                        isFromCurrentUser ? 'text-right' : 'text-left'
                      }`}>
                        {formatTime(message.timestamp)} • {message.sender}
                      </p>
                    </div>
                    {isFromCurrentUser && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-semibold text-xs">U</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
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
        <div className="flex gap-3 max-w-5xl mx-auto items-end">
          <div className="flex-1 relative">
            <TextareaAutosize
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="What do you want to get done?"
              disabled={!isConnected || isLoadingAnswer || !dynamicRecipientId}
              className="w-full px-6 py-4 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-sm resize-none"
              minRows={1}
              maxRows={6}
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
            disabled={!inputValue.trim() || !isConnected || isLoadingAnswer || !dynamicRecipientId}
            className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md flex-shrink-0"
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
      </div>
    </div>
  );
};

export default ProjectManager;