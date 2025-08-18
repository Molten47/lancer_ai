import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, MessageSquare } from 'lucide-react';
import {Link} from 'react-router-dom'

// Mock socket.io for demonstration - replace with actual socket.io import
const mockSocket = {
  emit: (event, data) => console.log('Emitting:', event, data),
  on: (event, callback) => console.log('Listening for:', event),
  off: (event, callback) => console.log('Removing listener for:', event),
};

const AIAssistantChat = ({ 
  socket = mockSocket, 
  userId = 'user-123',
  assistantName = 'Lancer AI',
  assistantAvatar = 'LA',
  initialMessage = "Welcome to Lancer AI! I'm your personal assistant to help you find the perfect freelancers for your projects. What do you want to get done today?",
  onMessageSent,
  className = ''
}) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'ai',
      content: initialMessage,
      timestamp: new Date(),
      avatar: assistantAvatar,
      sender: assistantName
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Socket connection management
  useEffect(() => {
    if (!socket) return;

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to chat server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from chat server');
    });

    // Message events
    socket.on('ai_message', (data) => {
      const newMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.content,
        timestamp: new Date(data.timestamp),
        avatar: assistantAvatar,
        sender: assistantName
      };
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    });

    socket.on('typing_status', (data) => {
      if (data.sender === 'ai') {
        setIsTyping(data.isTyping);
      }
    });

    socket.on('connection_error', (error) => {
      console.error('Socket error:', error);
      setIsConnected(false);
    });

    // Join user room for personalized responses
    socket.emit('join_room', { userId });

    // Cleanup listeners
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('ai_message');
      socket.off('typing_status');
      socket.off('connection_error');
    };
  }, [socket, userId, assistantName, assistantAvatar]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      sender: 'You'
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);

    // Emit message via socket
    socket.emit('user_message', {
      userId,
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
      type: 'user',
      room: `user_${userId}`
    });

    // Call optional callback
    if (onMessageSent) {
      onMessageSent(userMessage);
    }

    // Clear input and show typing indicator
    setInputValue('');
    
    // Simulate AI typing response
    setTimeout(() => {
      setIsTyping(true);
    }, 500);

    // Focus back to input
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

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {/* Avatar - only show for AI messages on left */}
              {message.type === 'ai' && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-semibold text-xs">{message.avatar}</span>
                </div>
              )}
              
              {/* Message bubble container - now takes up more width */}
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
              disabled={!isConnected}
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
            disabled={!inputValue.trim() || !isConnected}
            className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
          >
            <Send size={20} className="text-white ml-0.5" />
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
        <div className="flex justify-center mt-4">
          <div className="flex flex-wrap justify-center gap-2">
            <button 
              onClick={() => setInputValue("Help me find a web developer")}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              Find Developer
            </button>
            <button 
              onClick={() => setInputValue("Show me my active projects")}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              My Projects
            </button>
            <button 
              onClick={() => setInputValue("What can you help me with?")}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              How it works
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantChat;