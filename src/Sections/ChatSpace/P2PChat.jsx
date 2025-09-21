// hooks/useP2PChat.js
import { useState, useEffect, useCallback, useRef } from 'react';
import socket, { getAPIUrl } from '../../Components/socket';

const useP2PChat = (recipientId) => {
    
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  
  // Use ref to track if we've already fetched history for this recipient
  const hasFetchedHistory = useRef(false);
  const currentRecipientId = useRef(recipientId);

  // Get current user ID from localStorage
  const getCurrentUserId = useCallback(() => {
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId) : null;
  }, []);

  // Fetch chat history from API
  const fetchChatHistory = useCallback(async () => {
    if (!recipientId || hasFetchedHistory.current) return;
    
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const API_URL = getAPIUrl();
      const response = await fetch(`${API_URL}/api/chat?chat_type=human&own_id=${currentUserId}&recipient_id=${recipientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_jwt')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle successful response - expecting message_history
        if (data.message_history && Array.isArray(data.message_history)) {
          setMessages(data.message_history);
        } else {
          // If no message history or empty array, start with empty messages
          setMessages([]);
        }
        hasFetchedHistory.current = true;
      } else {
        // Handle error response
        const errorData = await response.json();
        setError(errorData.error_message || 'Failed to fetch chat history');
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setError('Network error while fetching chat history');
    } finally {
      setIsLoading(false);
    }
  }, [recipientId, getCurrentUserId]);

  // Handle incoming messages from socket
  const handleNewMessage = useCallback((messageData) => {
    const { message_content, sender_tag, own_id, recipient_id } = messageData;
    const currentUserId = getCurrentUserId();
    
    // Only add message if it's relevant to current chat
    // Check if message is either from recipient to us, or from us to recipient
    if (
     (own_id === recipientId && recipient_id === currentUserId) ||
     (own_id === currentUserId && recipient_id === recipientId)
    ) {
      const newMessage = {
        id: Date.now() + Math.random(), // Generate unique ID
        message_content,
        sender_tag,
        own_id,
        recipient_id,
        timestamp: new Date().toISOString(),
        isOwn: own_id === currentUserId
      };

      setMessages(prev => {
        // Avoid duplicates by checking if message already exists
        const exists = prev.some(msg => 
          msg.message_content === message_content && 
          msg.sender_tag === sender_tag && 
          Math.abs(new Date(msg.timestamp) - new Date(newMessage.timestamp)) < 1000
        );
        
        if (!exists) {
          return [...prev, newMessage];
        }
        return prev;
      });
    }
  }, [recipientId, getCurrentUserId]);

  // Send message function
  const sendMessage = useCallback((messageContent) => {
    const currentUserId = getCurrentUserId();
    
    if (!currentUserId) {
      setError('User not authenticated');
      return false;
    }

    if (!recipientId) {
      setError('No recipient specified');
      return false;
    }

    if (!messageContent.trim()) {
      setError('Message cannot be empty');
      return false;
    }

    if (!socket.connected) {
      setError('Not connected to chat server');
      return false;
    }

    try {
      // Prepare message data according to documentation
      const messageData = {
        message_content: messageContent.trim(),
        own_id: currentUserId, // Integer format as required
        recipient_id: recipientId // Integer for human-to-human chat
      };

      // Emit message to server
      socket.emit('send_message', messageData);
      // After socket.emit('send_message', messageData);
setTimeout(() => {
  setMessages(prev => prev.map(msg => 
    msg.isPending ? { ...msg, isPending: false } : msg
  ));
}, 500); // Clear all pending after 500ms

      // Add message to local state immediately for instant feedback
      const localMessage = {
        id: Date.now() + Math.random(),
        message_content: messageContent.trim(),
        sender_tag: currentUserId,
        own_id: currentUserId,
        recipient_id: recipientId,
        timestamp: new Date().toISOString(),
        isOwn: true,
        isPending: true // Mark as pending until confirmed by server
      };

      setMessages(prev => [...prev, localMessage]);
      setError(null);
      return true;

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return false;
    }
  }, [recipientId, getCurrentUserId]);

  // Handle connection status changes
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

  // Set up socket listeners and fetch history when recipient changes
  useEffect(() => {
    if (!recipientId) return;

    // Reset state when recipient changes
    if (currentRecipientId.current !== recipientId) {
      setMessages([]);
      setError(null);
      hasFetchedHistory.current = false;
      currentRecipientId.current = recipientId;
    }

    // Fetch chat history
    fetchChatHistory();

    // Set up socket listener for new messages
    socket.on('new_message', handleNewMessage);

    // Cleanup function
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [recipientId, fetchChatHistory, handleNewMessage]);

  // Retry fetch function for error recovery
  const retryFetchHistory = useCallback(() => {
    hasFetchedHistory.current = false;
    fetchChatHistory();
  }, [fetchChatHistory]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Core data
    messages,
    recipientId,
    
    // States
    isLoading,
    error,
    isConnected,
    
    // Actions
    sendMessage,
    retryFetchHistory,
    clearError,
    
    // Computed values
    messageCount: messages.length,
    hasMessages: messages.length > 0,
  };
};

export default useP2PChat;