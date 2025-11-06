import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Loader2, CheckCircle, Clock, Bot } from 'lucide-react';
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
  userName = 'You',
  userAvatar = 'U'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [attachments, setAttachments] = useState([]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketListenersRef = useRef(false);
  const processedMessageIds = useRef(new Set());
  
  const own_id = localStorage.getItem('user_id');

  // Helper: Mark last status message as complete
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

  // Clear loading states
  const clearLoadingStates = () => {
    setIsTyping(false);
    setIsLoadingAnswer(false);
  };

  // Determine message type
  const determineMessageType = (messageData, currentUserId) => {
    const currentUserStr = String(currentUserId);
    const senderStr = String(messageData.sender_id || messageData.own_id || 'unknown');
    const senderTag = messageData.sender_tag;

    if (senderTag === 'ai' || senderTag === 'sender_b') {
      return { type: 'ai', sender: assistantName };
    }
    
    if (senderTag === 'user' || senderTag === 'sender_a') {
      return { type: 'user', sender: userName };
    }

    if (senderStr === ASSISTANT_ID) {
      return { type: 'ai', sender: assistantName };
    }
    
    if (senderStr === currentUserStr) {
      return { type: 'user', sender: userName };
    }

    return { type: 'ai', sender: assistantName };
  };

  // Message filter
  const createMessageFilter = (currentUserId) => {
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
  };

  // Setup socket listeners
  const setupSocketListeners = () => {
    if (socketListenersRef.current) {
      console.log('Socket listeners already attached');
      return;
    }

    console.log('Setting up sidebar chat socket listeners...');
    
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Sidebar chat socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      clearLoadingStates();
    });

    socket.on('new_message', (data, callback) => {
      const userId = own_id || localStorage.getItem('user_id');
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
      
      // Check for duplicates using message ID
      const messageId = data.id || `${actualSenderId}-${data.timestamp}-${data.message_content.substring(0, 20)}`;
      if (processedMessageIds.current.has(messageId)) {
        if (callback) callback();
        return;
      }
      
      processedMessageIds.current.add(messageId);
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
      
      setMessages(prev => [...prev, newMessage]);
      
      if (messageType === 'ai') {
        clearLoadingStates();
      }

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
      if (callback) callback();
    });

    socketListenersRef.current = true;
  };

  const cleanupSocketListeners = () => {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('new_message');
    socket.off('status_update');
    socketListenersRef.current = false;
  };

  // Initialize
  useEffect(() => {
    setIsConnected(socket.connected);
    setupSocketListeners();
    
    // Cleanup processed IDs periodically
    const cleanupInterval = setInterval(() => {
      const arr = Array.from(processedMessageIds.current);
      processedMessageIds.current = new Set(arr.slice(-100));
    }, 60000);
    
    return () => {
      cleanupSocketListeners();
      clearInterval(cleanupInterval);
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Send message
  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConnected) return;

    markLastStatusComplete();

    const userId = own_id || localStorage.getItem('user_id');
    const userMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      sender: userName,
      sender_id: userId,
      recipient_id: ASSISTANT_ID,
      sender_tag: 'user',
      isStatus: false
    };

    setMessages(prev => [...prev, userMessage]);

    socket.emit('send_message', {
      message_content: inputValue.trim(),
      own_id: parseInt(userId),
      recipient_id: ASSISTANT_ID,
    });

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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => {
          // Status Message
          if (message.isStatus) {
            return (
              <div key={message.id} className="flex items-start gap-2 px-2 py-2">
                <div className="flex-shrink-0 mt-0.5">
                  {!message.isComplete ? (
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <p className={`text-xs font-medium transition-all ${
                  message.isComplete 
                    ? 'text-gray-400 line-through' 
                    : 'text-gray-600'
                }`}>
                  {message.content}
                </p>
              </div>
            );
          }

          // AI Message
          if (message.type === 'ai') {
            return (
              <div key={message.id} className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{assistantName}</span>
                    <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg rounded-tl-none p-3">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {/* Action Buttons (only on first AI message if needed) */}
                  {message.id === messages.find(m => m.type === 'ai')?.id && onActionClick && (
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => onActionClick('start')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Start project
                      </button>
                      <button 
                        onClick={() => onActionClick('demo')}
                        className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        Watch Demo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // User Message
          return (
            <div key={message.id} className="flex gap-3 justify-end">
              <div className="flex-1 max-w-[80%]">
                <div className="flex items-center gap-2 mb-1 justify-end">
                  <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                  <span className="text-sm font-semibold text-gray-900">{userName}</span>
                </div>
                <div className="bg-blue-600 text-white rounded-lg rounded-tr-none p-3 ml-auto">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-xs">{userAvatar}</span>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg rounded-tl-none p-3 inline-block">
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
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="How can LancerAI help?"
              disabled={!isConnected || isLoadingAnswer}
              className="w-full px-4 py-2.5 pr-12 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-sm"
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

        {/* Help Text */}
        <div className="flex items-center gap-1 mt-2 px-2">
          <span className="text-blue-600 text-xs">⚡</span>
          <p className="text-xs text-gray-500">
            The AI will help you define your project scope, required assets, and suggest tasks.
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mt-2 text-center">
            <span className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full">
              Reconnecting...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISidebarChat;