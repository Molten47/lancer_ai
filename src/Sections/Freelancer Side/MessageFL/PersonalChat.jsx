// P2PChatComponent.js - FIXED: Users join their own room, not P2P room

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Circle, Phone, Video, MoreVertical, Smile } from 'lucide-react';
import socket, { 
  isSocketConnected, 
  getConnectionStatus, 
  getAPIUrl
} from '../../../Components/socket';

const P2PChatComponent = ({ 
  ownId, 
  recipientId, 
  recipientName,
  chatType = "human" 
}) => {

  console.log('🚀 P2PChatComponent loaded with props:', {
    ownId, recipientId, recipientName, chatType
  });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // FIXED: No need to join P2P rooms - users are already in their own rooms
  useEffect(() => {
    if (!ownId || !recipientId) return;

    console.log('🏠 Chat initialized:', {
      ownId: ownId,
      recipientId: recipientId,
      chatType: chatType,
      note: "Users communicate through their individual rooms"
    });

    const initializeChat = async () => {
      try {
        // Fetch existing messages from the /chat endpoint
        const token = localStorage.getItem('access_jwt');
        const API_URL = getAPIUrl();

        const response = await fetch(
          `${API_URL}/api/chat?chat_type=${chatType}&own_id=${ownId}&recipient_id=${recipientId}`,
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
        } else {
          console.warn('Failed to fetch chat history:', response.status);
        }

        // Use existing socket connection
        const connectionStatus = getConnectionStatus();
        setIsConnected(connectionStatus.isConnected);

        setIsInitialized(true);

      } catch (error) {
        console.error('Error initializing chat:', error);
        setIsInitialized(true);
      }
    };

    initializeChat();

    // Socket event listeners
    const handleConnect = () => {
      console.log('🔗 Chat using existing socket connection');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('❌ Chat disconnected from existing socket');
    };

    const handleNewMessage = (messageData) => {
      console.log('📨 Received message:', messageData);
      
      // FIXED: Check if message is for this conversation
      // Message should be FROM recipientId TO ownId
      const isForThisChat = (
        (messageData.sender === recipientId || messageData.from === recipientId) &&
        (messageData.recipient === ownId || messageData.to === ownId)
      ) || (
        // Or FROM ownId TO recipientId (echo back from server)
        (messageData.sender === ownId || messageData.from === ownId) &&
        (messageData.recipient === recipientId || messageData.to === recipientId)
      );

      console.log('🎯 Message routing check:', {
        messageFrom: messageData.sender || messageData.from,
        messageTo: messageData.recipient || messageData.to,
        expectedFrom: recipientId,
        expectedTo: ownId,
        isForThisChat
      });
      
      if (isForThisChat) {
        const newMsg = {
          id: messageData.id || messageData.message_id || Date.now(),
          text: messageData.text || messageData.message || messageData.content || messageData.message_content,
          sender: messageData.sender || messageData.from || messageData.own_id,
          recipient: messageData.recipient || messageData.to || messageData.recipient_id,
          timestamp: messageData.timestamp || messageData.created_at || new Date().toISOString(),
          delivered: true
        };
        
        console.log('✅ Adding message to chat:', newMsg);
        
        setMessages(prev => {
          // Avoid duplicate messages
          const exists = prev.some(msg => 
            msg.id === newMsg.id || 
            (msg.text === newMsg.text && 
             msg.sender === newMsg.sender && 
             Math.abs(new Date(msg.timestamp) - new Date(newMsg.timestamp)) < 1000)
          );
          
          if (!exists) {
            return [...prev, newMsg];
          }
          console.log('⚠️ Duplicate message detected, skipping');
          return prev;
        });
      } else {
        console.log('🚫 Message not for this chat, ignoring');
      }
    };

    const handleTyping = (data) => {
      console.log('⌨️ Typing event:', data);
      // Show typing indicator if it's from the recipient
      if (data.userId === recipientId || data.user_id === recipientId) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    };

    const handleStopTyping = (data) => {
      console.log('⏹️ Stop typing event:', data);
      if (data.userId === recipientId || data.user_id === recipientId) {
        setIsTyping(false);
        clearTimeout(typingTimeoutRef.current);
      }
    };

    const handleUserOnline = (data) => {
      console.log('🟢 User online:', data);
      if (data.userId === recipientId || data.user_id === recipientId) {
        setOnlineStatus(true);
      }
    };

    const handleUserOffline = (data) => {
      console.log('🔴 User offline:', data);
      if (data.userId === recipientId || data.user_id === recipientId) {
        setOnlineStatus(false);
      }
    };

    const handleMessageDelivered = (data) => {
      console.log('✅ Message delivered:', data);
      if (data.messageId) {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId ? { ...msg, delivered: true } : msg
        ));
      }
    };

    const handleRoomJoined = (data) => {
      console.log('🎯 Room joined confirmation:', data);
    };

    const handleRoomJoinError = (data) => {
      console.error('❌ Room join error:', data);
    };

    // Check if socket is already connected
    if (isSocketConnected()) {
      handleConnect();
    }

    // Add event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('new_message', handleNewMessage);
    socket.on('message', handleNewMessage);
    socket.on('chat_message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('message_delivered', handleMessageDelivered);
    socket.on('joined', handleRoomJoined);
    socket.on('join_error', handleRoomJoinError);

    // Cleanup function
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new_message', handleNewMessage);
      socket.off('message', handleNewMessage);
      socket.off('chat_message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('message_delivered', handleMessageDelivered);
      socket.off('joined', handleRoomJoined);
      socket.off('join_error', handleRoomJoinError);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [ownId, recipientId, chatType, isInitialized]);

  // FIXED: Simplified message sending - no room management needed
  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected) {
      console.log('❌ Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        isConnected 
      });
      return;
    }

    const tempId = Date.now();
    
    // FIXED: Clean message data according to API docs
    const messageData = {
      message_content: newMessage.trim(),
      own_id: parseInt(ownId), 
      recipient_id: chatType === "human" ? parseInt(recipientId) : recipientId
    };

    console.log('📤 Sending message:', {
      messageData,
      note: "Message will be routed through user rooms by backend"
    });

    // Add message to local state immediately
    const localMessage = {
      id: tempId,
      text: newMessage.trim(),
      sender: ownId,
      recipient: recipientId,
      timestamp: new Date().toISOString(),
      delivered: false,
      pending: true,
    };
    
    setMessages(prev => [...prev, localMessage]);
    setNewMessage('');

    try {
      // Send message via socket - backend handles room routing
      socket.emit('send_message', messageData);
      console.log('✅ Message emitted via socket');
      
      // Update message status after a delay
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? { ...msg, pending: false, delivered: true } : msg
        ));
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error sending message via socket:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, failed: true, pending: false } : msg
      ));
    }

    // FIXED: Simplified typing indicator (no room needed)
    socket.emit('stop_typing', { userId: ownId });
  };

  // FIXED: Simplified typing indicators
  const handleTypingIndicator = () => {
    if (isConnected) {
      socket.emit('typing', { userId: ownId, targetUserId: recipientId });
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { userId: ownId, targetUserId: recipientId });
      }, 1000);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (e.key !== 'Enter' && newMessage.trim()) {
      handleTypingIndicator();
    }
  };

  // Handle input change with typing indicator
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    if (value.trim()) {
      handleTypingIndicator();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
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
            {/* Debug info - remove in production */}
            <div className="text-xs opacity-70">
              My Room: {ownId} | Chatting with: {recipientId}
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
                className={`flex ${message.sender === ownId || message.sender == ownId ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-end space-x-2 max-w-lg">
                  {(message.sender !== ownId && message.sender != ownId) && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                      <User size={16} />
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-sm lg:max-w-md ${
                      (message.sender === ownId || message.sender == ownId)
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 border rounded-bl-md shadow-sm'
                    } ${message.failed ? 'opacity-50 border-red-300' : ''}`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${(message.sender === ownId || message.sender == ownId) ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </span>
                      {(message.sender === ownId || message.sender == ownId) && (
                        <span className="text-xs text-blue-100 ml-2">
                          {message.pending ? '⏳' : message.failed ? '❌' : message.delivered ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                  {(message.sender === ownId || message.sender == ownId) && (
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
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
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