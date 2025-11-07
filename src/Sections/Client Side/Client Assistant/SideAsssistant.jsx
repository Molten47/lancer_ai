import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, Loader2, CheckCircle, Bot, X, Minimize } from 'lucide-react';
import socket from '../../../Components/socket';
import { useNavigate } from 'react-router-dom'; // Added for navigation/redirect logic

const STATUS_MESSAGE_MAP = {
  'initializing': 'Setting up your AI assistant...',
  'connecting': 'Connecting to AI services...',
  'processing': 'Processing your request...',
  'generating': 'Generating response...',
};

const ASSISTANT_ID = 'client_assistant';

const AISidebarChat = ({ 
  assistantName = 'Client Assistant',
  onActionClick, // Callback for action buttons (e.g., 'start project')
  onClose, // Optional: for closing the sidebar (controlled by parent)
  className = '' // For parent to pass width/position styling
}) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isLoadingChat, setIsLoadingChat] = useState(true); // Tracks initial load
  const [socketError, setSocketError] = useState('');
  
  // User State (fetched on init)
  const [userName, setSenderName] = useState('You');
  const [userAvatar, setUserAvatar] = useState('U');


  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketListenersRef = useRef(false);
  const processedMessageIds = useRef(new Set());
  
  const own_id = localStorage.getItem('user_id');

  // --- Core Logic Functions (Retained from previous working code) ---

  const markLastStatusComplete = useCallback(() => {
    setMessages(prev => {
      const statusIndices = prev
        .map((msg, idx) => msg.isStatus && !msg.isComplete ? idx : -1)
        .filter(idx => idx !== -1);
      if (statusIndices.length === 0) return prev;
      const lastStatusIndex = statusIndices[statusIndices.length - 1];
      const updated = [...prev];
      updated[lastStatusIndex] = { ...updated[lastStatusIndex], isComplete: true, completedAt: new Date().toISOString() };
      return updated;
    });
  }, []);

  const clearLoadingStates = useCallback(() => {
    setIsTyping(false);
    setIsLoadingAnswer(false);
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
      const { own_id, recipient_id, sender_tag, sender_id } = messageData;
      const currentUserStr = String(currentUserId);
      const senderStr = String(sender_id || own_id);
      const recipientStr = String(recipient_id);
      
      const isUserToAssistant = senderStr === currentUserStr && recipientStr === ASSISTANT_ID;
      const isAssistantToUser = senderStr === ASSISTANT_ID && recipientStr === currentUserStr;
      const isAIFromAssistant = sender_tag === 'ai' && (senderStr === ASSISTANT_ID || recipientStr === currentUserStr);
      
      return isUserToAssistant || isAssistantToUser || isAIFromAssistant;
    };
  }, []);

  // 1. Initial Data Fetch (PROFILE)
  const fetchUserProfile = useCallback(async () => {
    // --- (Profile fetching logic from your previous component) ---
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      if (!API_URL || !authToken) return;

      const response = await fetch(`${API_URL}/api/profile`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
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

  // 2. Initial Data Fetch (HISTORY)
  const initializeChat = useCallback(async (currentUserId) => {
    // --- (History fetching logic from your previous component) ---
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

      const response = await fetch(`${API_URL}/api/chat?${queryParams}`, { method: 'GET', headers });
      let chatData = await response.json();

      if (!response.ok) throw new Error(chatData.error_message || `HTTP ${response.status}: Failed to initialize chat`);
      
      if (chatData.message_history && Array.isArray(chatData.message_history)) {
        const formattedMessages = chatData.message_history.map((msg, index) => {
          const { type: messageType, sender: senderName } = determineMessageType({
            sender_id: msg.sender_id, recipient_id: msg.recipient_id, sender_tag: msg.sender_tag, own_id: msg.own_id
          }, currentUserId);
          return {
            id: msg.id || `history-${index}`, type: messageType, content: msg.message_content, 
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(), sender: senderName, isStatus: false
          };
        }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        setMessages(formattedMessages);
      }

    } catch (error) {
      console.error('Chat initialization error:', error);
      setSocketError(error.message);
    } finally {
      setIsLoadingChat(false);
    }
  }, [determineMessageType]);


  // Setup socket listeners (simplified, using logic from original code)
  const setupSocketListeners = useCallback(() => {
    if (socketListenersRef.current) return;

    socket.on('connect', () => { setIsConnected(true); setSocketError(''); });
    socket.on('disconnect', () => { setIsConnected(false); clearLoadingStates(); });
    socket.on('connect_error', (error) => { setIsConnected(false); clearLoadingStates(); setSocketError('Connection error. Please try refreshing the page.'); });

    socket.on('new_message', (data, callback) => {
      const userId = own_id || localStorage.getItem('user_id');
      const actualSenderId = data.sender_id || data.own_id;
      const messageFilter = createMessageFilter(userId);
      const messageDataForFilter = { ...data, sender_id: actualSenderId, own_id: data.own_id, recipient_id: data.recipient_id, sender_tag: data.sender_tag };

      if (!messageFilter(messageDataForFilter)) { if (callback) callback(); return; }
      
      const messageId = data.id || `${actualSenderId}-${data.timestamp}-${data.message_content.substring(0, 20)}`;
      if (processedMessageIds.current.has(messageId)) { if (callback) callback(); return; }
      processedMessageIds.current.add(messageId);
      markLastStatusComplete();
      
      const { type: messageType, sender: senderName } = determineMessageType({ sender_id: actualSenderId, recipient_id: data.recipient_id, sender_tag: data.sender_tag }, userId);

      const newMessage = {
        id: messageId, type: messageType, content: data.message_content, timestamp: data.timestamp ? new Date(data.timestamp) : new Date(), 
        sender: senderName, sender_id: actualSenderId, recipient_id: data.recipient_id, sender_tag: data.sender_tag, isStatus: false
      };
      
      setMessages(prev => [...prev, newMessage]);
      if (messageType === 'ai') clearLoadingStates();
      if (callback) callback();
    }, [clearLoadingStates, createMessageFilter, determineMessageType, markLastStatusComplete, own_id]);

    socket.on('status_update', (data, callback) => {
      if (data.update) {
        const customMessage = STATUS_MESSAGE_MAP[data.update];
        if (customMessage) {
          markLastStatusComplete();
          const statusMessage = {
            id: `status-${Date.now()}`, type: 'status', content: customMessage, timestamp: new Date().toISOString(), 
            sender: 'System', sender_id: 'status', isStatus: true, isComplete: false, startedAt: new Date().toISOString()
          };
          setMessages(prev => [...prev, statusMessage]);
        }
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
  }, [clearLoadingStates, createMessageFilter, determineMessageType, markLastStatusComplete, navigate, own_id]);

  const cleanupSocketListeners = useCallback(() => {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');
    socket.off('new_message');
    socket.off('status_update');
    socket.off('control_instruction');
    socketListenersRef.current = false;
  }, []);


  // --- Component Lifecycle ---
  useEffect(() => {
    const currentUserId = own_id || localStorage.getItem('user_id');
    if (currentUserId) {
      fetchUserProfile();
      initializeChat(currentUserId);
    } else {
      setIsLoadingChat(false);
    }
    
    setIsConnected(socket.connected);
    setupSocketListeners();
    
    return () => {
      cleanupSocketListeners();
    };
  }, [own_id, fetchUserProfile, initializeChat, setupSocketListeners, cleanupSocketListeners]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);


  // --- Handlers ---
  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConnected) return;
    markLastStatusComplete();

    const userId = own_id || localStorage.getItem('user_id');
    const userMessage = {
      id: `msg-${Date.now()}`, type: 'user', content: inputValue.trim(), timestamp: new Date(), 
      sender: userName, sender_id: userId, recipient_id: ASSISTANT_ID, sender_tag: 'user', isStatus: false
    };

    setMessages(prev => [...prev, userMessage]);
    socket.emit('send_message', { message_content: inputValue.trim(), own_id: parseInt(userId), recipient_id: ASSISTANT_ID });

    setInputValue('');
    setAttachments([]);
    setIsLoadingAnswer(true);
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
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };


  // --- UI Components ---

  // Initial Loading State
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
      {/* Header (Minimal for Sidebar) */}
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

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => {
          const isFromCurrentUser = message.type === 'user';
          
          // Status Message
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

        {/* Typing Indicator */}
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

      {/* Input Area - Fixed at Bottom */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {/* Attachments Preview */}
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

        {/* Help Text & Status */}
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