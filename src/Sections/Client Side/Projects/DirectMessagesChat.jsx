// P2PChatComponent.js - FIXED: Users join their own room, not P2P room

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Circle, Phone, Video, MoreVertical, Smile , Paperclip} from 'lucide-react';
import socket, { 
  isSocketConnected, 
  getConnectionStatus, 
  getAPIUrl
} from '../../../Components/socket';
import TextareaAutosize from 'react-textarea-autosize'
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

     const currentOwnId = parseInt(ownId);
     const currentRecipientId = parseInt(recipientId);
      
      // FIXED: Check if message is for this conversation
      // Message should be FROM recipientId TO ownId
  const isForThisChat = (
// Message FROM recipientId TO ownId
(messageData.own_id == recipientId && messageData.recipient_id == ownId)
) || (
// Message FROM ownId TO recipientId (echo back)
(messageData.own_id == ownId && messageData.recipient_id == recipientId)
);

console.log('🎯 Message routing check:', {
  messageFrom: messageData.own_id,
  messageTo: messageData.recipient_id,
  expectedFrom: currentRecipientId, // Changed from 'recipientId' (string)
  expectedTo: currentOwnId,
  isForThisChat
});

      
  if (isForThisChat) {
    
  const newMsg = {
  id: messageData.id || messageData.message_id || Date.now(),
  text: messageData.message_content,
  sender: messageData.own_id,
  recipient: messageData.recipient_id,
  timestamp: messageData.timestamp || new Date().toISOString(),
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
  <div className="flex flex-col h-screen w-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E5E7EB] flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
              <User size={20} className="text-white" />
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${onlineStatus ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base">{recipientName}</h3>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className='text-gray-600' size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video className='text-gray-600' size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className='text-gray-600' size={20} />
          </button>
        </div>
      </div>

      {/* New Message Label */}
      <div className="py-3 text-center border-b border-[#E5E7EB] bg-white flex-shrink-0">
        <span className="text-sm text-gray-500 font-medium">New Message</span>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full mb-4 flex items-center justify-center">
              <User size={28} className="text-gray-400" />
            </div>
            <h3 className="text-base font-medium mb-1 text-gray-700">No messages yet</h3>
            <p className="text-center max-w-md text-sm text-gray-500">
              Start your conversation with {recipientName}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === ownId || message.sender == ownId ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-end space-x-2 max-w-xs sm:max-w-sm md:max-w-md">
                  {(message.sender !== ownId && message.sender != ownId) && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      (message.sender === ownId || message.sender == ownId)
                        ? 'bg-[#2255D7] text-white rounded-lg'
                        : 'bg-[#F3F4F6] text-[#151B25] rounded-lg'
                    } ${message.failed ? 'opacity-50 border border-red-300' : ''}`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <div className="flex items-center justify-end mt-1">
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
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
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
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
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
      <div className="p-4 border-t border-[#E5E7EB] bg-white flex-shrink-0">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <TextareaAutosize
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              disabled={!isConnected}
              className="w-full px-4 py-3 pl-16 pr-4 border-none bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all text-sm resize-none placeholder-gray-400"
              minRows={3}
              maxRows={4}
            />
            
            {/* Icons inside input */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button 
                disabled={!isConnected}
                className="flex items-center justify-center hover:text-gray-700 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed text-gray-500"
                title="Attach file"
              >
                <Paperclip size={20} />
              </button>
              
              <button 
                className="flex items-center justify-center hover:text-gray-700 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed text-gray-500"
                title="Add emoji"
                disabled={!isConnected}
              >
                <Smile size={20} />
              </button>
            </div>
          </div>

          {/* Send Button */}
          <button 
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
          >
            <Send size={18} className="text-white ml-0.5" />
          </button>
        </div>
        
        {!isConnected && (
          <p className="text-sm text-red-500 mt-2 text-center">
            Connecting to chat...
          </p>
        )}
      </div>
    </div>
  );
};

export default P2PChatComponent;