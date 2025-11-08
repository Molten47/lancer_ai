import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import socket, { isSocketConnected, isSocketConnecting } from '../../../Components/socket';

const STATUS_MESSAGE_MAP = {
  'initializing': 'Setting up your project manager...',
  'connecting': 'Connecting to AI services...',
  'processing': 'Processing your request...',
  'generating': 'Generating response...',
};

const ProjectManagerSidebar = ({
  userId,
  projectId,
  clientId,
  chat_type = 'project_manager',
  assistantName = 'Project Manager',
  assistantAvatar = 'PM',
  onClose,
  className = ''
}) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(isSocketConnected());
  const [isConnecting, setIsConnecting] = useState(isSocketConnecting());
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const [socketError, setSocketError] = useState('');
  const [userName, setUserName] = useState('You');
  const [userAvatar, setUserAvatar] = useState('U');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketListenersRef = useRef(false);
  const processedMessageIds = useRef(new Set());
  const messageSequenceRef = useRef(0);
  const pendingStatusRef = useRef(false);
  const initializingRef = useRef(false);
  const dynamicRecipientIdRef = useRef(null);
  const ownIdRef = useRef(userId || localStorage.getItem('user_id'));
  const [dynamicRecipientId, setDynamicRecipientIdState] = useState(null);
  // NEW: Track optimistic messages waiting for server confirmation
  const optimisticMessagesRef = useRef(new Map());

  const own_id = userId || localStorage.getItem('user_id');

  const setDynamicRecipientId = (value) => {
    dynamicRecipientIdRef.current = value;
    setDynamicRecipientIdState(value);
  };

  const generateMessageId = (prefix = 'msg') => {
    return `${prefix}-${Date.now()}-${++messageSequenceRef.current}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const markLastStatusComplete = () => {
    if (pendingStatusRef.current) return;
    pendingStatusRef.current = true;
    
    setMessages(prev => {
      const statusIndices = prev
        .map((msg, idx) => msg.isStatus && !msg.isComplete ? idx : -1)
        .filter(idx => idx !== -1);
      
      if (statusIndices.length === 0) {
        pendingStatusRef.current = false;
        return prev;
      }
      
      const lastStatusIndex = statusIndices[statusIndices.length - 1];
      const updated = [...prev];
      updated[lastStatusIndex] = { 
        ...updated[lastStatusIndex], 
        isComplete: true,
        completedAt: new Date().toISOString()
      };
      
      queueMicrotask(() => {
        pendingStatusRef.current = false;
      });
      
      return updated;
    });
  };

  const clearLoadingStates = () => {
    setIsTyping(false);
    setIsLoadingAnswer(false);
  };

  const determineMessageType = (messageData, currentUserId) => {
    const currentUserStr = String(currentUserId);
    const senderStr = String(messageData.sender_id || messageData.own_id);
    const senderTag = messageData.sender_tag;

    if (senderTag === 'ai' || senderTag === 'sender_b') {
      return { type: 'ai', sender: assistantName };
    }

    if (senderTag === 'user' || senderTag === 'sender_a') {
      return { type: 'user', sender: userName };
    }

    if (senderStr !== 'undefined' && (senderStr === dynamicRecipientIdRef.current || senderStr.includes('project_manager'))) {
      return { type: 'ai', sender: assistantName };
    }

    if (senderStr === currentUserStr && senderStr !== 'undefined') {
      return { type: 'user', sender: userName };
    }

    return { type: 'ai', sender: assistantName };
  };

  // ✅ FIXED: Better timestamp handling with fallback
  const sortMessages = (messagesArray) => {
    return messagesArray.sort((a, b) => {
      let timeA, timeB;
      
      try {
        timeA = a.timestamp instanceof Date 
          ? a.timestamp.getTime() 
          : new Date(a.timestamp).getTime();
      } catch {
        timeA = 0;
      }
      
      try {
        timeB = b.timestamp instanceof Date 
          ? b.timestamp.getTime() 
          : new Date(b.timestamp).getTime();
      } catch {
        timeB = 0;
      }

      if (timeA !== timeB) return timeA - timeB;

      const seqA = a.sequence || 0;
      const seqB = b.sequence || 0;
      if (seqA !== seqB) return seqA - seqB;

      return a.id > b.id ? 1 : a.id < b.id ? -1 : 0;
    });
  };

  const fetchUserProfile = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      if (!API_URL || !authToken) return;

      const response = await fetch(`${API_URL}/api/profile`, {
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${authToken}` 
        },
      });

      if (!response.ok) return;

      const profileResponse = await response.json();
      if (profileResponse.well_received && profileResponse.profile_data) {
        const profile = profileResponse.profile_data;
        const firstInitial = profile.firstname ? profile.firstname.charAt(0).toUpperCase() : '';
        const lastInitial = profile.lastname ? profile.lastname.charAt(0).toUpperCase() : '';
        setUserAvatar(firstInitial + lastInitial || 'U');
        setUserName(profile.username || profile.firstname || 'You');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const initializeChat = async (recipientId) => {
    if (initializingRef.current) return false;
    initializingRef.current = true;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) throw new Error('API URL not configured.');

      const userId = own_id || localStorage.getItem('user_id');
      const queryParams = new URLSearchParams({
        chat_type: chat_type,
        own_id: userId,
        recipient_id: recipientId
      });

      const headers = { 'Content-Type': 'application/json' };
      const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const response = await fetch(`${API_URL}/api/chat?${queryParams}`, {
        method: 'GET',
        headers: headers,
      });

      let chatData = await response.json();

      if (!response.ok) {
        throw new Error(chatData.error_message || `Failed to initialize chat`);
      }

      if (chatData.message_history && Array.isArray(chatData.message_history)) {
        const currentUserId = own_id || localStorage.getItem('user_id');
        processedMessageIds.current.clear();
        optimisticMessagesRef.current.clear(); // Clear optimistic messages on init
        
        const formattedMessages = chatData.message_history.map((msg) => {
          const { type: messageType, sender: senderName } = determineMessageType({
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id,
            sender_tag: msg.sender_tag,
            own_id: msg.own_id,
            message_content: msg.message_content
          }, currentUserId);
          
          const messageId = msg.id || generateMessageId('history');
          processedMessageIds.current.add(messageId);
          
          return {
            id: messageId,
            type: messageType,
            content: msg.message_content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            sender: senderName,
            sequence: ++messageSequenceRef.current,
            isStatus: false,
            serverId: msg.id // Store server ID for reference
          };
        });
        
        setMessages(sortMessages(formattedMessages));
      }

      return true;
    } catch (error) {
      console.error('Chat initialization error:', error);
      setSocketError(error.message);
      return false;
    } finally {
      setIsLoadingChat(false);
      initializingRef.current = false;
    }
  };

  const setupSocketListeners = () => {
    if (socketListenersRef.current) return;

    socket.on('connect', () => {
      setIsConnected(true);
      setSocketError('');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      clearLoadingStates();
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
      clearLoadingStates();
      setSocketError('Connection error. Please try refreshing the page.');
    });

    socket.on('reconnecting', (attemptNumber) => {
      setIsConnecting(true);
      setSocketError(`Reconnecting... Attempt ${attemptNumber}`);
    });
    
    // ✅ FIXED: Use ref instead of undefined variable
    socket.on('reconnect', async (attemptNumber) => {
      setIsConnecting(false);
      setSocketError('');
      const currentRecipientId = dynamicRecipientIdRef.current;
      if (currentRecipientId) {
        await initializeChat(currentRecipientId);
      }
    });

    // ✅ FIXED: Better handling of optimistic messages
    socket.on('new_message', (data, callback) => {
      const userId = ownIdRef.current || localStorage.getItem('user_id');
      const currentRecipientId = dynamicRecipientIdRef.current;
      const userStr = String(userId);

      const isRelevant = 
        (String(data.sender_id) === currentRecipientId || 
         String(data.recipient_id) === currentRecipientId ||
         data.sender_tag === 'ai' || 
         data.sender_tag === 'sender_b' || 
         String(data.sender_id).includes('project_manager') ||
         String(data.recipient_id).includes('project_manager')
        ) &&
        (String(data.sender_id) === userStr || 
         String(data.recipient_id) === userStr); 
      
      if (!isRelevant) {
        if (callback) callback();
        return;
      }
      
      const serverMessageId = data.id || data.message_id;
      
      // Check if this is a confirmation of an optimistic message
      let optimisticMessageId = null;
      for (const [optId, optData] of optimisticMessagesRef.current.entries()) {
        // Match by content and timestamp proximity (within 5 seconds)
        const timeDiff = data.timestamp 
          ? Math.abs(new Date(data.timestamp).getTime() - optData.timestamp.getTime())
          : Infinity;
        
        if (optData.content === data.message_content && timeDiff < 5000) {
          optimisticMessageId = optId;
          break;
        }
      }
      
      markLastStatusComplete();
      
      const { type: messageType, sender: senderName } = determineMessageType({
        sender_id: data.sender_id,
        recipient_id: data.recipient_id,
        sender_tag: data.sender_tag,
        message_content: data.message_content
      }, userId);

      setMessages(prev => {
        // If this confirms an optimistic message, replace it
        if (optimisticMessageId) {
          optimisticMessagesRef.current.delete(optimisticMessageId);
          
          const updatedMessages = prev.map(msg => 
            msg.id === optimisticMessageId
              ? {
                  ...msg,
                  id: serverMessageId ? `server-${serverMessageId}` : msg.id,
                  timestamp: data.timestamp ? new Date(data.timestamp) : msg.timestamp,
                  serverId: serverMessageId,
                  isOptimistic: false
                }
              : msg
          );
          
          processedMessageIds.current.add(serverMessageId ? `server-${serverMessageId}` : optimisticMessageId);
          return sortMessages(updatedMessages);
        }
        
        // Otherwise, add as new message
        const messageId = serverMessageId 
          ? `server-${serverMessageId}`
          : generateMessageId('incoming');
        
        if (processedMessageIds.current.has(messageId)) {
          return prev;
        }

        const newMessage = {
          id: messageId,
          type: messageType,
          content: data.message_content,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
          sender: senderName,
          sequence: ++messageSequenceRef.current,
          isStatus: false,
          serverId: serverMessageId
        };
        
        processedMessageIds.current.add(messageId);
        
        if (messageType === 'ai') clearLoadingStates();
        
        return sortMessages([...prev, newMessage]);
      });
      
      if (callback) callback();
    });

    socket.on('status_update', (data, callback) => {
      if (data.update) {
        const customMessage = STATUS_MESSAGE_MAP[data.update];
        if (!customMessage) {
          if (callback) callback();
          return;
        }
        
        markLastStatusComplete();
        
        const statusMessage = {
          id: generateMessageId('status'),
          type: 'status',
          content: customMessage,
          timestamp: new Date(),
          sender: 'System',
          sequence: ++messageSequenceRef.current,
          isStatus: true,
          isComplete: false,
          startedAt: new Date().toISOString()
        };
        
        setMessages(prev => sortMessages([...prev, statusMessage]));
      }
      if (callback) callback();
    });

    socket.on('control_instruction', (data, callback) => {
      if (data.command === 'redirect' && data.data?.url) navigate(data.data.url);
      if (data.command === 'error') { 
        setSocketError(data.data?.message || 'An error occurred'); 
        clearLoadingStates();
      }
      if (callback) callback();
    });

    socketListenersRef.current = true;
  };

  const cleanupSocketListeners = () => {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');
    socket.off('reconnecting');
    socket.off('reconnect');
    socket.off('new_message');
    socket.off('status_update');
    socket.off('control_instruction');
    socketListenersRef.current = false;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(isSocketConnected());
      setIsConnecting(isSocketConnecting());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!projectId) return;

    const init = async () => {
      const recipientId = `project_manager_${projectId}`;
      setDynamicRecipientId(recipientId);
      ownIdRef.current = own_id;
      
      await Promise.all([
        fetchUserProfile(),
        initializeChat(recipientId)
      ]);
    };
    
    init();
  }, [projectId]);

  useEffect(() => {
    if (!dynamicRecipientId) return;
    
    setupSocketListeners();
    
    return () => cleanupSocketListeners();
  }, [dynamicRecipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ✅ FIXED: Better optimistic message handling
  const handleSendMessage = () => {
    if (!inputValue.trim() || (!isConnected && !isConnecting) || !dynamicRecipientId) return;

    markLastStatusComplete();

    const userId = own_id || localStorage.getItem('user_id');
    const messageContent = inputValue.trim();
    const messageId = generateMessageId('optimistic');
    const timestamp = new Date();

    const userMessage = {
      id: messageId,
      type: 'user',
      content: messageContent,
      timestamp: timestamp,
      sender: userName,
      sequence: ++messageSequenceRef.current,
      isStatus: false,
      isOptimistic: true // Mark as optimistic
    };

    // Store optimistic message for matching with server confirmation
    optimisticMessagesRef.current.set(messageId, {
      content: messageContent,
      timestamp: timestamp
    });

    const messagePayload = {
      message_content: messageContent,
      own_id: parseInt(userId),
      recipient_id: dynamicRecipientId,
      chat_type: chat_type,
      timestamp: timestamp.toISOString()
    };

    // Add message optimistically
    setMessages(prev => sortMessages([...prev, userMessage]));

    // Emit to server
    if (socket.connected) {
      socket.emit('send_message', messagePayload);
    } else {
      console.warn('Socket not connected, message will be queued by socket.io');
    }

    setInputValue('');
    setIsLoadingAnswer(true);
    setTimeout(() => setIsTyping(true), 500);
    
    // Cleanup optimistic message after timeout if not confirmed
    setTimeout(() => {
      if (optimisticMessagesRef.current.has(messageId)) {
        console.warn('Optimistic message not confirmed by server:', messageId);
        optimisticMessagesRef.current.delete(messageId);
      }
    }, 10000); // 10 second timeout
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

  if (isLoadingChat) {
    return (
      <div className={`flex flex-col h-full bg-white ${className} border-l border-gray-200`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Loading chat history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white shadow-xl border-l border-gray-200 ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-xs">{assistantAvatar}</span>
          </div>
          <h3 className="font-semibold text-gray-800 text-base">{assistantName}</h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
            title="Close Chat"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => {
          const isFromCurrentUser = message.type === 'user';
          
          if (message.isStatus) {
            return (
              <div key={message.id} className="flex items-start gap-2 justify-center my-3">
                <div className="flex-shrink-0 mt-0.5">
                  {!message.isComplete ? (
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <p className={`text-xs font-medium transition-all text-center ${
                  message.isComplete ? 'text-gray-400 line-through' : 'text-gray-600'
                }`}>
                  {message.content}
                </p>
              </div>
            );
          }

          return (
            <div key={message.id} className={`flex gap-3 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
              {!isFromCurrentUser && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-xs">{assistantAvatar}</span>
                </div>
              )}
              
              <div className={`flex flex-col ${isFromCurrentUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className={`px-3 py-2 text-sm rounded-xl shadow-sm ${
                    isFromCurrentUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                } ${message.isOptimistic ? 'opacity-70' : ''}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTime(message.timestamp)}
                  {message.isOptimistic && ' (sending...)'}
                </p>
              </div>

              {isFromCurrentUser && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-xs">{userAvatar}</span>
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">{assistantAvatar}</span>
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg rounded-tl-none p-3 inline-block">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <TextareaAutosize
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="What do you want to get done? (Shift+Enter for new line)"
              disabled={(!isConnected && !isConnecting) || isLoadingAnswer || !dynamicRecipientId}
              minRows={1}
              maxRows={6}
              className="w-full resize-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm overflow-hidden"
            />
          </div>

          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !isConnected || isLoadingAnswer || !dynamicRecipientId}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoadingAnswer ? (
              <Loader2 size={18} className="text-white animate-spin" />
            ) : (
              <Send size={18} className="text-white" />
            )}
          </button>
        </div>

        <div className="flex justify-between items-center mt-2 px-2">
          <div className="flex items-center gap-1">
            <span className="text-blue-600 text-xs">⚡</span>
            <p className="text-xs text-gray-500">
              {assistantName} helps manage your project scope and tasks.
            </p>
          </div>
          {!isConnected && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${isConnecting ? 'text-yellow-700 bg-yellow-100' : 'text-red-600 bg-red-50'}`}>
              {isConnecting ? 'Reconnecting...' : 'Disconnected'}
            </span>
          )}
        </div>

        {socketError && (
          <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600">{socketError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManagerSidebar;