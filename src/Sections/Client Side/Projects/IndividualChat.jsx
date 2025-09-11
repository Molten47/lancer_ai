import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Circle, Phone, Video, MoreVertical, Smile } from 'lucide-react';
import socket from '../../../Components/socket';

const P2PChatComponent = ({ 
  ownId, 
  recipientId, 
  recipientName = "Chat User",
  chatType = "human" 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat and socket connection
  useEffect(() => {
    if (!ownId || !recipientId) return;

    const initializeChat = async () => {
      try {
        // Fetch existing messages from the /chat endpoint
        const token = localStorage.getItem('access_jwt');
        const API_URL = import.meta.env.VITE_API_URL

        const response = await fetch(
          `${API_URL}/chat?chat_type=${chatType}&own_id=${ownId}&recipient_id=${recipientId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const chatData = await response.json();
          if (chatData.messages) {
            setMessages(chatData.messages);
          }
        }

        // Connect socket and join room
        if (!socket.connected) {
          socket.connect();
        }

        // Join the chat room (format: smaller_id-larger_id for consistency)
        const roomId = [ownId, recipientId].sort().join('-');
        socket.emit('join_room', { room: roomId, userId: ownId });

        setIsConnected(true);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();

    // Socket event listeners
    const handleConnect = () => {
      setIsConnected(true);
      console.log('Chat connected');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Chat disconnected');
    };

    const handleNewMessage = (messageData) => {
      setMessages(prev => [...prev, {
        id: messageData.id || Date.now(),
        text: messageData.text || messageData.message,
        sender: messageData.sender || messageData.from,
        timestamp: messageData.timestamp || new Date().toISOString(),
        delivered: true
      }]);
    };

    const handleTyping = (data) => {
      if (data.userId !== ownId) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    };

    const handleStopTyping = () => {
      setIsTyping(false);
      clearTimeout(typingTimeoutRef.current);
    };

    const handleUserOnline = (data) => {
      if (data.userId === recipientId) {
        setOnlineStatus(true);
      }
    };

    const handleUserOffline = (data) => {
      if (data.userId === recipientId) {
        setOnlineStatus(false);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('new_message', handleNewMessage);
    socket.on('message', handleNewMessage); // Alternative event name
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    // Cleanup function
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new_message', handleNewMessage);
      socket.off('message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [ownId, recipientId, chatType]);

  // Handle sending messages
  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    const messageData = {
      id: Date.now(),
      text: newMessage,
      sender: ownId,
      recipient: recipientId,
      timestamp: new Date().toISOString(),
      room: [ownId, recipientId].sort().join('-'),
      chatType: chatType
    };

    // Add message to local state immediately
    setMessages(prev => [...prev, {
      ...messageData,
      delivered: false
    }]);

    // Emit to socket
    socket.emit('send_message', messageData);
    socket.emit('stop_typing', { room: messageData.room, userId: ownId });

    setNewMessage('');
  };

  // Handle typing indicators
  const handleTyping = () => {
    if (isConnected) {
      const roomId = [ownId, recipientId].sort().join('-');
      socket.emit('typing', { room: roomId, userId: ownId });
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (e.key !== 'Enter') {
      handleTyping();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-96 max-w-md mx-auto bg-white border border-gray-200 rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${onlineStatus ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
          <div>
            <h3 className="font-semibold">{recipientName}</h3>
            <div className="flex items-center space-x-1">
              <Circle size={6} className={`${isConnected ? 'text-green-300' : 'text-red-300'} fill-current`} />
              <span className="text-xs">
                {isConnected ? (onlineStatus ? 'Online' : 'Connected') : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-blue-700 rounded-full transition-colors">
            <Phone size={16} />
          </button>
          <button className="p-2 hover:bg-blue-700 rounded-full transition-colors">
            <Video size={16} />
          </button>
          <button className="p-2 hover:bg-blue-700 rounded-full transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User size={24} />
            </div>
            <p>Start your conversation with {recipientName}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === ownId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === ownId
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 border'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-75">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.sender === ownId && (
                    <span className="text-xs opacity-75">
                      {message.delivered ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border px-4 py-2 rounded-lg max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Smile size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className={`p-2 rounded-full transition-colors ${
              newMessage.trim() && isConnected
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2">Connecting to chat...</p>
        )}
      </div>
    </div>
  );
};

export default P2PChatComponent

// Usage example component
