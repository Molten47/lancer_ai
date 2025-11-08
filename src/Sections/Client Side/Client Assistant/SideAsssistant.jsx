import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, Loader2, CheckCircle, Bot, X } from 'lucide-react';
import socket from '../../../Components/socket';

const STATUS_MESSAGE_MAP = {
  'initializing': 'Setting up your AI assistant...',
  'connecting': 'Connecting to AI services...',
  'processing': 'Processing your request...',
  'generating': 'Generating response...',
};

const ASSISTANT_ID = 'client_assistant';

const AISidebarChat = ({ 
  assistantName = 'Client Assistant',
  onActionClick,
  onClose,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const [socketError, setSocketError] = useState('');
  const [userName, setSenderName] = useState('You');
  const [userAvatar, setUserAvatar] = useState('U');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const processedMessageIds = useRef(new Set());
  const own_id = useRef(localStorage.getItem('user_id'));

  // Use ref to track if we're currently processing to prevent race conditions
  const isProcessingMessage = useRef(false);

  // Mark last status complete using functional update
  const markLastStatusComplete = useCallback(() => {
    setMessages(prev => {
      const lastStatusIndex = prev.reduceRight((acc, msg, idx) => {
        if (acc === -1 && msg.isStatus && !msg.isComplete) return idx;
        return acc;
      }, -1);
      
      if (lastStatusIndex === -1) return prev;
      
      const updated = [...prev];
      updated[lastStatusIndex] = { 
        ...updated[lastStatusIndex], 
        isComplete: true, 
        completedAt: new Date().toISOString() 
      };
      return updated;
    });
  }, []);

  const clearLoadingStates = useCallback(() => {
    setIsTyping(false);
    setIsLoadingAnswer(false);
    isProcessingMessage.current = false;
  }, []);

  const determineMessageType = useCallback((messageData, currentUserId) => {
    const currentUserStr = String(currentUserId);
    const senderStr = String(messageData.sender_id || messageData.own_id || 'unknown');
    const senderTag = messageData.sender_tag;

    if (senderTag === 'ai' || senderTag === 'sender_b') return { type: 'ai', sender: assistantName };
    if (senderTag === 'user' || senderTag === 'sender_a') return { type: 'user', sender: userName };
    if (senderStr === ASSISTANT_ID) return { type: 'ai', sender: assistantName };
    if (senderStr === currentUserStr) return { type: 'user', sender: userName };

    return { type: 'ai', sender: assistantName };
  }, [assistantName, userName]);

  const createMessageFilter = useCallback((currentUserId) => {
    return (messageData) => {
      if (!messageData || !currentUserId) return false;
      const { own_id: msgOwnId, recipient_id, sender_tag, sender_id } = messageData;
      const currentUserStr = String(currentUserId);
      const senderStr = String(sender_id || msgOwnId);
      const recipientStr = String(recipient_id);
      
      const isUserToAssistant = senderStr === currentUserStr && recipientStr === ASSISTANT_ID;
      const isAssistantToUser = senderStr === ASSISTANT_ID && recipientStr === currentUserStr;
      const isAIFromAssistant = sender_tag === 'ai' && (senderStr === ASSISTANT_ID || recipientStr === currentUserStr);
      
      return isUserToAssistant || isAssistantToUser || isAIFromAssistant;
    };
  }, []);

  const fetchUserProfile = useCallback(async () => {
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
        setSenderName(profile.username || profile.firstname || 'You');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, []);

  const initializeChat = useCallback(async (currentUserId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) throw new Error('API URL not configured');

      const queryParams = new URLSearchParams({
        chat_type: 'client_assistant',
        own_id: currentUserId,
        recipient_id: ASSISTANT_ID
      });
      
      const headers = { 'Content-Type': 'application/json' };
      const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const response = await fetch(`${API_URL}/api/chat?${queryParams}`, { 
        method: 'GET', 
        headers 
      });
      
      let chatData = await response.json();

      if (!response.ok) {
        throw new Error(chatData.error_message || `HTTP ${response.status}: Failed to initialize chat`);
      }
      
      if (chatData.message_history && Array.isArray(chatData.message_history)) {
        const formattedMessages = chatData.message_history.map((msg, index) => {
          const { type: messageType, sender: senderName } = determineMessageType({
            sender_id: msg.sender_id, 
            recipient_id: msg.recipient_id, 
            sender_tag: msg.sender_tag, 
            own_id: msg.own_id
          }, currentUserId);
          
          return {
            id: msg.id || `history-${index}`, 
            type: messageType, 
            content: msg.message_content, 
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(), 
            sender: senderName, 
            isStatus: false
          };
        }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        setMessages(formattedMessages);
        
        // Clear processed IDs and repopulate with history
        processedMessageIds.current.clear();
        formattedMessages.forEach(msg => {
          if (msg.id) processedMessageIds.current.add(msg.id);
        });
      }

    } catch (error) {
      console.error('Chat initialization error:', error);
      setSocketError(error.message);
    } finally {
      setIsLoadingChat(false);
    }
  }, [determineMessageType]);

  // FIXED: Handle new messages with better race condition handling
  const handleNewMessage = useCallback((data, callback) => {
    const userId = own_id.current;
    if (!userId) {
      if (callback) callback();
      return;
    }

    const actualSenderId = data.sender_id || data.own_id;
    const messageFilter = createMessageFilter(userId);
    const messageDataForFilter = { 
      ...data, 
      sender_id: actualSenderId, 
      own_id: data.own_id, 
      recipient_id: data.recipient_id, 
      sender_tag: data.sender_tag 
    };

    if (!messageFilter(messageDataForFilter)) {
      if (callback) callback();
      return;
    }
    
    const messageId = data.id || `${actualSenderId}-${data.timestamp}-${Date.now()}`;
    
    // Check if already processed
    if (processedMessageIds.current.has(messageId)) {
      if (callback) callback();
      return;
    }
    
    // Mark as processing
    processedMessageIds.current.add(messageId);
    
    // Mark last status complete
    markLastStatusComplete();
    
    const { type: messageType, sender: senderName } = determineMessageType({ 
      sender_id: actualSenderId, 
      recipient_id: data.recipient_id, 
      sender_tag: data.sender_tag 
    }, userId);

    const newMessage = {
      id: messageId, 
      type: messageType, 
      content: data.message_content, 
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(), 
      sender: senderName, 
      sender_id: actualSenderId, 
      recipient_id: data.recipient_id, 
      sender_tag: data.sender_tag, 
      isStatus: false
    };
    
    // Use functional update to avoid race conditions
    setMessages(prev => {
      // Double-check message doesn't already exist in state
      const exists = prev.some(msg => msg.id === messageId);
      if (exists) return prev;
      return [...prev, newMessage];
    });
    
    // Clear loading states if this is an AI message
    if (messageType === 'ai') {
      setTimeout(() => clearLoadingStates(), 100);
    }
    
    if (callback) callback();
  }, [createMessageFilter, determineMessageType, markLastStatusComplete, clearLoadingStates]);

  // FIXED: Handle status updates
  const handleStatusUpdate = useCallback((data, callback) => {
    if (data.update) {
      const customMessage = STATUS_MESSAGE_MAP[data.update];
      if (customMessage) {
        markLastStatusComplete();
        
        const statusMessage = {
          id: `status-${Date.now()}-${Math.random()}`, 
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
    }
    if (callback) callback();
  }, [markLastStatusComplete]);

  // FIXED: Handle control instructions
  const handleControlInstruction = useCallback((data, callback) => {
    if (data.command === 'redirect' && data.data?.url) {
      window.location.href = data.data.url;
    }
    if (data.command === 'error') { 
      setSocketError(data.data?.message || 'An error occurred'); 
      clearLoadingStates();
    }
    if (callback) callback();
  }, [clearLoadingStates]);

  // FIXED: Setup socket listeners with proper cleanup and dependencies
  useEffect(() => {
    const handleConnect = () => { 
      setIsConnected(true); 
      setSocketError(''); 
    };
    
    const handleDisconnect = () => { 
      setIsConnected(false); 
      clearLoadingStates(); 
    };
    
    const handleConnectError = () => { 
      setIsConnected(false); 
      clearLoadingStates(); 
      setSocketError('Connection error. Please try refreshing the page.'); 
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('new_message', handleNewMessage);
    socket.on('status_update', handleStatusUpdate);
    socket.on('control_instruction', handleControlInstruction);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('new_message', handleNewMessage);
      socket.off('status_update', handleStatusUpdate);
      socket.off('control_instruction', handleControlInstruction);
    };
  }, [handleNewMessage, handleStatusUpdate, handleControlInstruction, clearLoadingStates]);

  // Initialize chat on mount
  useEffect(() => {
    const currentUserId = own_id.current;
    if (currentUserId) {
      fetchUserProfile();
      initializeChat(currentUserId);
    } else {
      setIsLoadingChat(false);
    }
  }, [fetchUserProfile, initializeChat]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConnected) return;
    
    markLastStatusComplete();

    const userId = own_id.current;
    const messageId = `msg-${Date.now()}-${Math.random()}`;
    
    const userMessage = {
      id: messageId, 
      type: 'user', 
      content: inputValue.trim(), 
      timestamp: new Date(), 
      sender: userName, 
      sender_id: userId, 
      recipient_id: ASSISTANT_ID, 
      sender_tag: 'user', 
      isStatus: false
    };

    // Add to processed IDs immediately
    processedMessageIds.current.add(messageId);
    
    setMessages(prev => [...prev, userMessage]);
    
    socket.emit('send_message', { 
      message_content: inputValue.trim(), 
      own_id: parseInt(userId), 
      recipient_id: ASSISTANT_ID 
    });

    setInputValue('');
    setAttachments([]);
    setIsLoadingAnswer(true);
    
    // Set typing indicator with slight delay
    setTimeout(() => setIsTyping(true), 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
          <Bot size={20} className='text-blue-600' />
          <h3 className="font-semibold text-gray-800 text-base">{assistantName}</h3>
        </div>
        <div className="flex items-center gap-1">
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
                  <Bot size={16} className="text-white" />
                </div>
              )}
              
              <div className={`flex flex-col ${isFromCurrentUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className={`px-3 py-2 text-sm rounded-xl shadow-sm ${
                    isFromCurrentUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTime(message.timestamp)}
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
              <Bot size={16} className="text-white" />
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
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                <Paperclip size={12} className="text-gray-400" />
                <span className="text-xs text-gray-600 max-w-[100px] truncate">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <Paperclip size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="How can LancerAI help?"
              disabled={!isConnected || isLoadingAnswer}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
            />
          </div>

          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !isConnected || isLoadingAnswer}
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
              Define your project scope and suggested tasks.
            </p>
          </div>
          {!isConnected && (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              Reconnecting
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISidebarChat;