import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, User } from 'lucide-react';
import socket from '../../Components/socket'; // Adjust path to your socket

const MessageList = ({ onOpenChat }) => {
  const [conversations, setConversations] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  // Get current user ID from localStorage
  const getCurrentUserId = useCallback(() => {
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId) : null;
  }, []);

  // Handle incoming messages from socket
  const handleNewMessage = useCallback((messageData) => {
    console.log('Raw socket data:', messageData); // Debug log
    const { message_content, own_id, recipient_id, timestamp } = messageData;
    const currentUserId = getCurrentUserId();
    
    // Only process messages sent TO current user (not from current user)
    if (recipient_id === currentUserId && own_id !== currentUserId) {
      const newMessage = {
        id: Date.now() + Math.random(),
        message_content,
        sender_id: own_id, // Use own_id as the sender
        recipient_id,
        timestamp: timestamp || new Date().toISOString()
      };

      setConversations(prev => {
        // Find if we already have a conversation with this sender
        const existingIndex = prev.findIndex(conv => conv.senderId === own_id);
        
        if (existingIndex >= 0) {
          // Update existing conversation
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: message_content,
            timestamp: newMessage.timestamp,
            unreadCount: updated[existingIndex].unreadCount + 1
          };
          
          // Sort by most recent
          return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else {
          // Create new conversation
          const newConversation = {
            senderId: own_id, // Use own_id as senderId
            senderName: null, // We don't have names, will show as "User {id}"
            lastMessage: message_content,
            timestamp: newMessage.timestamp,
            unreadCount: 1
          };
          
          return [newConversation, ...prev];
        }
      });
    }
  }, [getCurrentUserId]);

  // Handle connection status
  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  // Set up socket listener for new messages
  useEffect(() => {
    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [handleNewMessage]);

  // Format time for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Handle clicking on a conversation
  const handleConversationClick = (conversation) => {
    // Mark as read (reset unread count)
    setConversations(prev => 
      prev.map(conv => 
        conv.senderId === conversation.senderId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );

    // Open chat modal with this sender
    onOpenChat(conversation.senderId, conversation.senderName);
  };

  // Get total unread count for badge
  const totalUnreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  return (
    <div className="w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <MessageCircle size={24} className="text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Message Requests</h3>
            <p className="text-sm text-gray-600">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              {totalUnreadCount > 0 && ` • ${totalUnreadCount} unread`}
            </p>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-center text-gray-500">
            <div>
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle size={24} className="text-gray-400" />
              </div>
              <p className="font-medium">No messages yet</p>
              <p className="text-sm">New message requests will appear here</p>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => (
              <div
                key={conversation.senderId}
                onClick={() => handleConversationClick(conversation)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {conversation.senderName ? 
                      conversation.senderName.charAt(0).toUpperCase() : 
                      <User size={18} />
                    }
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {conversation.senderName || `User ${conversation.senderId}`}
                      </h4>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(conversation.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {conversation.lastMessage}
                      </p>
                      
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center flex-shrink-0">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;