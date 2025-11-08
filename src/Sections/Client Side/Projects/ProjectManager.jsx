import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socket, { isSocketConnected, hasJoinedRoom, isSocketConnecting } from '../../../Components/socket';
import TextareaAutosize from 'react-textarea-autosize';

const STATUS_MESSAGE_MAP = {
  'initializing': 'Setting up your AI assistant...',
  'connecting': 'Connecting to AI services...',
  'processing': 'Processing your request...',
  'generating': 'Generating response...',
};

const ProjectManager = ({
  userId,
  projectId,
  clientId,  
  chat_type = 'project_manager',
  assistantName = 'Project Manager',
  assistantAvatar = 'PM',
  className = '',
  onMessageSent
}) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(isSocketConnected());
  const [isConnecting, setIsConnecting] = useState(isSocketConnecting());
  const own_id = userId || localStorage.getItem('user_id');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [socketError, setSocketError] = useState('');
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const dynamicRecipientIdRef = useRef(null);
  const ownIdRef = useRef(own_id);
  const [dynamicRecipientId, setDynamicRecipientIdState] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userName, setUserName] = useState('You');
  
  // 🔧 FIX: Race condition prevention refs
  const messageSequenceRef = useRef(0);
  const pendingStatusRef = useRef(false);
  const initializingRef = useRef(false);
  const processedMessageIdsRef = useRef(new Set());

  // 🔧 FIX: Synchronized state setter for dynamicRecipientId
  const setDynamicRecipientId = (value) => {
    dynamicRecipientIdRef.current = value;
    setDynamicRecipientIdState(value);
  };

  // 🔧 FIX: Improved message ID generation
  const generateMessageId = (prefix = 'msg') => {
    return `${prefix}-${Date.now()}-${++messageSequenceRef.current}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // 🔧 FIX: Enhanced status completion with race prevention
  const markLastStatusComplete = () => {
    if (pendingStatusRef.current) {
      console.log('⚠️ Status completion already in progress, skipping');
      return;
    }
    
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
      
      // Reset flag after state update is queued
      queueMicrotask(() => {
        pendingStatusRef.current = false;
      });
      
      return updated;
    });
  };

  // Consistent message type detection function
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

    if (senderStr !== 'undefined' && (senderStr === dynamicRecipientIdRef.current || senderStr.includes('project_manager'))) {
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
      if (recipientStr === currentUserStr && (senderStr === dynamicRecipientIdRef.current || senderStr.includes('project_manager'))) {
        return {
          type: 'ai',
          sender: assistantName
        };
      }

      if ((recipientStr === dynamicRecipientIdRef.current || recipientStr.includes('project_manager')) && senderStr === currentUserStr) {
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
      recipientStr,
      dynamicRecipientId: dynamicRecipientIdRef.current
    });

    const content = messageData.message_content || messageData.content || '';
    const contentLength = content.length;
    
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
  };

  // 🔧 FIX: Enhanced sorting with sequence numbers for stability
  const sortMessages = (messagesArray) => {
    return messagesArray.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      
      // Sort by timestamp first
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      
      // If timestamps are equal, sort by sequence number for stability
      const seqA = a.sequence || 0;
      const seqB = b.sequence || 0;
      if (seqA !== seqB) {
        return seqA - seqB;
      }
      
      // Fallback to ID comparison for absolute stability
      return a.id > b.id ? 1 : a.id < b.id ? -1 : 0;
    });
  };

  // 🔧 FIX: Protected chat initialization with race prevention
  const initializeChat = async (recipientId) => {
    if (initializingRef.current) {
      console.log('⚠️ Chat initialization already in progress');
      return false;
    }
    
    initializingRef.current = true;
    
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

      if (chatData.message_history && Array.isArray(chatData.message_history)) {
        const currentUserId = own_id || localStorage.getItem('user_id');
        
        // 🔧 FIX: Clear processed message IDs when loading history
        processedMessageIdsRef.current.clear();
        
        const formattedMessages = chatData.message_history.map((msg, index) => {
          const { type: messageType, sender: senderName } = determineMessageType({
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id,
            sender_tag: msg.sender_tag,
            own_id: msg.own_id,
            message_content: msg.message_content
          }, currentUserId);
          
          const messageId = msg.id || generateMessageId('history');
          
          // 🔧 FIX: Track processed messages
          processedMessageIdsRef.current.add(messageId);
          
          return {
            id: messageId,
            type: messageType,
            content: msg.message_content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            sender: senderName,
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id,
            sequence: ++messageSequenceRef.current,
            isStatus: false
          };
        });
        
        const sortedMessages = sortMessages(formattedMessages);
        
        console.log('Processed PM message history:', sortedMessages.map(m => ({ 
          type: m.type, 
          sender: m.sender, 
          content_preview: m.content.substring(0, 50) 
        })));
        
        setMessages(sortedMessages);
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
    } finally {
      initializingRef.current = false;
    }
  };

  // Setup socket listeners function
  const setupSocketListeners = () => {
    console.log('Setting up socket listeners...');
    setIsConnected(socket.connected);
    
    socket.on('connect', () => {
      console.log('Socket connected (Initial)');
      setIsConnected(true);
      setIsConnecting(false);
      setSocketError('');
    });

    // 🔧 FIX: Protected reconnect handler with async/await
    socket.on('reconnect', async (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts!`);
      setIsConnected(true);
      setIsConnecting(false);
      setSocketError('');
      
      const recipientId = dynamicRecipientIdRef.current;
      if (recipientId && !initializingRef.current) {
        console.log('Re-initializing chat history after reconnect...');
        try {
          await initializeChat(recipientId);
        } catch (error) {
          console.error('Reconnect initialization failed:', error);
          setSocketError('Failed to reload chat history after reconnection');
        }
      }
    });

    socket.on('reconnecting', (attemptNumber) => {
      console.log(`Socket trying to reconnect (Attempt ${attemptNumber})...`);
      setIsConnected(false);
      setIsConnecting(true);
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
      setIsConnecting(false);
      clearLoadingStates();
      setSocketError('Connection Error. Please check your network and refresh.');
    });

    // 🔧 FIX: Enhanced duplicate detection and message processing
    socket.on('new_message', (data, callback) => {
      const userId = ownIdRef.current || localStorage.getItem('user_id');
      const currentRecipientId = dynamicRecipientIdRef.current;
      const userStr = String(userId);

      console.log('🔔 new_message received:', {
        sender_id: data.sender_id,
        recipient_id: data.recipient_id,
        sender_tag: data.sender_tag,
        own_id: data.own_id,
        currentRecipientId,
        userId,
        preview: data.message_content?.substring(0, 50)
      });
      
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
        console.log('❌ Filtered: Not relevant to PM chat');
        if (callback) callback();
        return;
      }
      
      console.log('✅ Message accepted');
      
      // 🔧 FIX: Create robust message ID from server data or generate unique one
      const serverMessageId = data.id || data.message_id;
      const messageId = serverMessageId 
        ? `server-${serverMessageId}`
        : generateMessageId('incoming');
      
      // 🔧 FIX: Check if we've already processed this exact message
      if (processedMessageIdsRef.current.has(messageId)) {
        console.log('⚠️ Already processed message ID:', messageId);
        if (callback) callback();
        return;
      }
      
      markLastStatusComplete();
      
      const { type: messageType, sender: senderName } = determineMessageType({
        sender_id: data.sender_id,
        recipient_id: data.recipient_id,
        sender_tag: data.sender_tag,
        message_content: data.message_content
      }, userId);

      const incomingTimestamp = data.timestamp ? new Date(data.timestamp) : new Date();

      const newMessage = {
        id: messageId,
        type: messageType,
        content: data.message_content,
        timestamp: incomingTimestamp,
        sender: senderName,
        sender_id: data.sender_id,
        recipient_id: data.recipient_id,
        sequence: ++messageSequenceRef.current,
        isStatus: false
      };
      
      console.log('📝 Adding message:', {
        id: messageId,
        type: newMessage.type,
        sender: newMessage.sender,
        sequence: newMessage.sequence,
        preview: newMessage.content.substring(0, 30)
      });
      
      // 🔧 FIX: Mark as processed before adding to state
      processedMessageIdsRef.current.add(messageId);
      
      setMessages(prev => {
        // 🔧 FIX: Enhanced duplicate check using processed IDs
        const isDuplicate = prev.some(msg => msg.id === messageId);
        
        if (isDuplicate) {
          console.log('⚠️ Duplicate detected in state, skipping');
          return prev;
        }

        const updatedMessages = [...prev, newMessage];
        return sortMessages(updatedMessages);
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

    // 🔧 FIX: Protected status update handler
    socket.on('status_update', (data, callback) => {
      console.log('Received status update:', data);
      if (data.update) {
        const customMessage = STATUS_MESSAGE_MAP[data.update];

        if (!customMessage) {
          console.log('Ignoring unmapped status:', data.update);
          if (callback && typeof callback === 'function') callback();
          return;
        }
        
        markLastStatusComplete();
        
        const statusMessage = {
          id: generateMessageId('status'),
          type: 'status',
          content: customMessage,
          timestamp: new Date(),
          sender: 'System',
          sender_id: 'status',
          sequence: ++messageSequenceRef.current,
          isStatus: true,
          isComplete: false,
          startedAt: new Date().toISOString()
        };
        
        setMessages(prev => {
          const updatedMessages = [...prev, statusMessage];
          return sortMessages(updatedMessages);
        });
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
    socket.off('reconnect');
    socket.off('reconnecting');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(isSocketConnected());
      setIsConnecting(isSocketConnecting());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!projectId) {
      console.log('⏸️ Waiting for projectId from parent...');
      return;
    }

    const init = async () => {
      console.log('✅ Received projectId from parent:', projectId);
      const recipientId = `project_manager_${projectId}`;
      setDynamicRecipientId(recipientId);
      ownIdRef.current = own_id;
      console.log(`✅ Project Manager initialized with ID: ${recipientId}`);
      
      await initializeChat(recipientId);
    };
    
    init();
  }, [projectId]);

  useEffect(() => {
    if (!dynamicRecipientId) {
      console.log('⏸️ Skipping socket setup - no recipient ID yet');
      return;
    }
    
    console.log('🔌 Setting up socket listeners for:', dynamicRecipientId);
    cleanupSocketListeners();
    setupSocketListeners();
    
    return () => {
      console.log('🧹 Cleaning up socket listeners');
      cleanupSocketListeners();
    };
  }, [dynamicRecipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 🔧 FIX: Protected message sending with proper sequencing
  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConnected || !dynamicRecipientId) {
      console.warn('Cannot send - missing requirements:', {
        hasInput: !!inputValue.trim(),
        isConnected,
        hasDynamicRecipientId: !!dynamicRecipientId
      });
      return;
    }

    markLastStatusComplete();

    const userId = own_id || localStorage.getItem('user_id');
    const messageContent = inputValue.trim();
    const messageId = generateMessageId('user');

    const userMessage = {
      id: messageId,
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
      sender: 'You',
      sender_id: userId,
      recipient_id: dynamicRecipientId,
      sequence: ++messageSequenceRef.current,
      isStatus: false
    };

    // 🔧 FIX: Mark as processed immediately
    processedMessageIdsRef.current.add(messageId);

    const messagePayload = {
      message_content: messageContent,
      own_id: parseInt(userId),
      recipient_id: dynamicRecipientId,
      chat_type: chat_type,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Preparing to send message:', messagePayload);

    // 🔧 FIX: Add message to state and emit in microtask for proper ordering
    setMessages(prev => {
      const updated = sortMessages([...prev, userMessage]);
      
      // Emit after state update is queued
      queueMicrotask(() => {
        console.log('✅ Emitting message to backend');
        socket.emit('send_message', messagePayload);
      });
      
      return updated;
    });
    
    if (onMessageSent) {
      onMessageSent(userMessage);
    }

    setInputValue('');
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

  if (!isInitialized) {
    return (
      <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chat history...</p>
            {statusMessage && (
              <p className="text-sm text-gray-500 mt-2">{statusMessage}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
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
            const isFromCurrentUser = message.type === 'user';
            
            return (
              <div key={message.id} className={`flex gap-3 ${
                message.isStatus ? 'justify-start' :
                isFromCurrentUser ? 'justify-end' : 'justify-start'
              }`}>
                {message.isStatus && (
                  <div className="flex items-start gap-3 px-2 py-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {!message.isComplete ? (
                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                        message.isComplete ? 'text-gray-500' : 'text-gray-600 font-medium'
                      }`}>
                        {message.content}
                      </p>
                    </div>
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
                          ? 'bg-primary text-white rounded-lg'
                          : 'bg-[#F3F4F6] text-gray-800 border border-gray-200 rounded-bl-md'
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
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <TextareaAutosize
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="What do you want to get done?"
              disabled={!isConnected || isLoadingAnswer || !dynamicRecipientId || !!socketError}
              className="w-full px-6 py-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-sm resize-none"
              minRows={1}
              maxRows={6}
            />
            {inputValue && (
              <button
                onClick={() => setInputValue('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                
              </button>
            )}
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !isConnected || isLoadingAnswer || !dynamicRecipientId || !!socketError}
            className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md flex-shrink-0"
          >
            {isLoadingAnswer ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={20} className="text-white ml-0.5" />
            )}
          </button>
        </div>
    
        {socketError && (
          <div className="mt-3 flex justify-center">
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
              {socketError}
            </div>
          </div>
        )}

        {!socketError && !isConnected && isConnecting && (
          <div className="mt-3 flex justify-center">
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
              Connection lost. Trying to reconnect...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManager;