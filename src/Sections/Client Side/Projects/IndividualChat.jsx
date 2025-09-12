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
    socket.on('message', handleNewMessage);
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
    <div className="flex flex-col h-full w-full bg-white basic-font">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-6 bg-blue-600 text-white border-b flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <User size={24} />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${onlineStatus ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{recipientName}</h3>
            <div className="flex items-center space-x-2">
              <Circle size={8} className={`${isConnected ? 'text-green-300' : 'text-red-300'} fill-current`} />
              <span className="text-sm opacity-90">
                {isConnected ? (onlineStatus ? 'Online' : 'Connected') : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-3 hover:bg-blue-700 rounded-full transition-colors">
            <Phone size={20} />
          </button>
          <button className="p-3 hover:bg-blue-700 rounded-full transition-colors">
            <Video size={20} />
          </button>
          <button className="p-3 hover:bg-blue-700 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-20 h-20 bg-gray-200 rounded-full mb-6 flex items-center justify-center">
              <User size={32} />
            </div>
            <h3 className="text-lg font-medium mb-2">No messages yet</h3>
            <p className="text-center max-w-md">
              Start your conversation with {recipientName}. Send a message to get things started!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === ownId ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-end space-x-2 max-w-lg">
                  {message.sender !== ownId && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                      <User size={16} />
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-sm lg:max-w-md ${
                      message.sender === ownId
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 border rounded-bl-md shadow-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${message.sender === ownId ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender === ownId && (
                        <span className="text-xs text-blue-100 ml-2">
                          {message.delivered ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                  {message.sender === ownId && (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={16} />
                  </div>
                  <div className="bg-white text-gray-800 border px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-6 border-t bg-white flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button className="p-3 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
            <Smile size={24} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-6 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={!isConnected}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className={`p-3 rounded-full transition-colors ${
              newMessage.trim() && isConnected
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send size={24} />
          </button>
        </div>
        {!isConnected && (
          <p className="text-sm text-red-500 mt-3 text-center">
            Connecting to chat...
          </p>
        )}
      </div>
    </div>
  );
};

export default P2PChatComponent;