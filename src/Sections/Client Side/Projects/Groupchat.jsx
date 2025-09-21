import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Circle, Settings, UserPlus, Smile } from 'lucide-react';
import socket from '../../../Components/socket';

// GroupChat component for project/job dashboards
const GroupChat = ({ userId, isClient, className = '' }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [groupChatTag, setGroupChatTag] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dynamicRecipientId, setDynamicRecipientId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch projects to get dynamic project_id and client_id
  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_jwt');
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.well_received) {
        const projects = data.projects || [];
        if (projects.length > 0) {
          let targetProject = null;
          for (const projectObj of projects) {
            const projectKey = Object.keys(projectObj)[0];
            const projectData = projectObj[projectKey];
            if (projectData.status === 'ongoing') {
              targetProject = projectData;
              break;
            }
          }
          if (!targetProject) {
            const firstProjectObj = projects[0];
            const projectKey = Object.keys(firstProjectObj)[0];
            targetProject = firstProjectObj[projectKey];
          }
          
          const fetchedProjectId = targetProject.id;
          const fetchedClientId = targetProject.client_id;
          setProjectId(fetchedProjectId);
          setClientId(fetchedClientId);
          
          // Create dynamic recipient ID
          const recipientId = `group_chat_tag_${fetchedProjectId}_${fetchedClientId}`;
          setDynamicRecipientId(recipientId);
          console.log(`✅ Group Chat initialized with ID: ${recipientId}`);
          
          return { projectId: fetchedProjectId, clientId: fetchedClientId, recipientId };
        } else {
          setError('No projects found');
          return null;
        }
      } else {
        setError('Failed to fetch projects');
        return null;
      }
    } catch (err) {
      setError('Error fetching projects: ' + err.message);
      console.error('Error fetching projects:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch chat details using dynamic project_id and client_id
  const fetchChat = async (recipientId) => {
    if (!recipientId) return false;
    
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_jwt');
      const API_URL = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${API_URL}/api/chat?chat_type=group&recipient_id=${recipientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setGroupChatTag(data.group_chat_tag || null);
        const formattedMessages = (data.messages || []).map((msg, index) => ({
          id: msg.id || `history-${index}`,
          content: msg.message_content,
          sender: msg.sender_tag,
          timestamp: msg.timestamp || new Date().toISOString(),
          sender_id: msg.sender_id,
          recipient_id: msg.recipient_id
        }));
        setMessages(formattedMessages);
        setIsInitialized(true);
        return true;
      } else {
        setError('Failed to fetch chat details');
        return false;
      }
    } catch (err) {
      setError('Error fetching chat: ' + err.message);
      console.error('Error fetching chat:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to create message filter for group chat
  const createGroupChatMessageFilter = (currentUserId, recipientId) => {
    return (messageData) => {
      if (!messageData || !currentUserId || !recipientId) return false;
      const { recipient_id } = messageData;
      return String(recipient_id) === String(recipientId);
    };
  };

  // Join group chat room
  const joinGroupChatRoom = (recipientId, chatTag = null) => {
    if (!userId || !recipientId || !socket.connected) return;
    
    // Join using the recipient ID as room name
    socket.emit('join', { 
      room_name: recipientId, 
      user: parseInt(userId) 
    });
    console.log(`✅ Joined group chat room: ${recipientId}`);
    
    // Also join using chat tag if available
    if (chatTag) {
      socket.emit('join', { 
        room_name: chatTag, 
        user: parseInt(userId) 
      });
      console.log(`✅ Joined group chat tag room: ${chatTag}`);
    }
  };

  // Main initialization effect
  useEffect(() => {
    const init = async () => {
      const projectData = await fetchProjects();
      if (projectData) {
        const success = await fetchChat(projectData.recipientId);
        if (success && socket.connected) {
          joinGroupChatRoom(projectData.recipientId, groupChatTag);
        }
      }
    };
    init();
  }, []);

  // Socket event listeners - separate effect
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      console.log('✅ Socket connected in GroupChat');
      // Join group chat room if data is available
      if (dynamicRecipientId) {
        joinGroupChatRoom(dynamicRecipientId, groupChatTag);
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('❌ Socket disconnected in GroupChat');
    };

    const handleConnectError = (error) => {
      console.error('Socket connection error:', error);
      setError('Socket connection failed');
      setIsConnected(false);
    };

    const handleNewMessage = (data, callback) => {
      const messageFilter = createGroupChatMessageFilter(userId, dynamicRecipientId);
      
      if (!messageFilter(data)) {
        console.log('Message filtered out - not for this group chat:', data);
        if (callback && typeof callback === 'function') callback();
        return;
      }

      const newMessage = {
        id: Date.now(),
        content: data.message_content,
        sender: data.sender_tag,
        timestamp: new Date().toISOString(),
        sender_id: data.sender_id || data.own_id,
        recipient_id: data.recipient_id
      };

      setMessages(prev => [...prev, newMessage]);
      
      if (callback && typeof callback === 'function') callback();
    };

    const handleNotification = (data, callback) => {
      if (data.type === 'group_chat_created' && data.message.project_id === projectId) {
        const newGroupChatTag = data.message.group_chat_tag;
        setGroupChatTag(newGroupChatTag);
        joinGroupChatRoom(dynamicRecipientId, newGroupChatTag);
      }
      if (callback && typeof callback === 'function') callback();
    };

    const handleStatusUpdate = (data, callback) => {
      console.log('Status update:', data.update);
      if (data.update && data.update.includes('job_activated')) {
        if (dynamicRecipientId) {
          fetchChat(dynamicRecipientId);
        }
      }
      if (callback && typeof callback === 'function') callback();
    };

    const handleControlInstruction = (data, callback) => {
      console.log('AI instruction:', data.command, data.data);
      if (callback && typeof callback === 'function') callback();
    };

    // Set up socket listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('new_message', handleNewMessage);
    socket.on('notification', handleNotification);
    socket.on('status_update', handleStatusUpdate);
    socket.on('control_instruction', handleControlInstruction);

    // Set initial connection state
    setIsConnected(socket.connected);

    // Cleanup function
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('new_message', handleNewMessage);
      socket.off('notification', handleNotification);
      socket.off('status_update', handleStatusUpdate);
      socket.off('control_instruction', handleControlInstruction);
    };
  }, [userId, dynamicRecipientId, projectId, groupChatTag]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to group chat
  const handleSendMessage = () => {
    if (!messageInput.trim() || !dynamicRecipientId || !isConnected) return;

    const userMessage = {
      id: Date.now(),
      content: messageInput.trim(),
      sender: String(userId),
      timestamp: new Date().toISOString(),
      sender_id: userId,
      recipient_id: dynamicRecipientId
    };

    setMessages(prev => [...prev, userMessage]);
    
    socket.emit('send_message', {
      message_content: messageInput.trim(),
      own_id: parseInt(userId),
      recipient_id: dynamicRecipientId,
    });
    
    setMessageInput('');
  };

  // Handle Enter key for sending message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get sender initials for avatar
  const getSenderInitials = (sender) => {
    if (!sender) return '?';
    const parts = String(sender).split('_');
    if (parts.length >= 2) {
      return parts.slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase();
    }
    return String(sender).charAt(0).toUpperCase();
  };

  if (!isInitialized && isLoading) {
    return (
      <div className={`flex flex-col h-screen bg-gray-50 ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading group chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen bg-white basic-font ${className}`}>
      {/* Group Chat Header */}
      <div className="flex items-center justify-between p-6 bg-green-600 text-white border-b flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Users size={24} />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {groupChatTag ? `Project Group Chat` : 'Group Chat (Not Active)'}
            </h3>
            <div className="flex items-center space-x-2">
              <Circle size={8} className={`${isConnected ? 'text-green-300' : 'text-red-300'} fill-current`} />
              <span className="text-sm opacity-90">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              {projectId && (
                <span className="text-xs opacity-75 ml-2">
                  Project {projectId}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-3 hover:bg-green-700 rounded-full transition-colors">
            <UserPlus size={20} />
          </button>
          <button className="p-3 hover:bg-green-700 rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {!groupChatTag ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full mb-6 flex items-center justify-center">
              <Users size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Group Chat Not Active</h3>
            <p className="text-gray-500 max-w-md">
              Waiting for group chat to be created. Onboard freelancers to start chatting.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full mb-6 flex items-center justify-center">
              <Users size={32} className="text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No messages yet</h3>
            <p className="text-gray-500 max-w-md">
              Start the conversation! Send the first message to get everyone talking.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isFromCurrentUser = String(msg.sender) === String(userId) || String(msg.sender_id) === String(userId);
              return (
                <div
                  key={msg.id}
                  className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-end space-x-2 max-w-lg">
                    {!isFromCurrentUser && (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                        <span className="text-white text-xs font-semibold">
                          {getSenderInitials(msg.sender)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl max-w-sm lg:max-w-md ${
                        isFromCurrentUser
                          ? 'bg-green-600 text-white rounded-br-md'
                          : 'bg-white text-gray-800 border rounded-bl-md shadow-sm'
                      }`}
                    >
                      {!isFromCurrentUser && (
                        <p className={`text-xs font-medium mb-1 ${
                          isFromCurrentUser ? 'text-green-100' : 'text-green-600'
                        }`}>
                          {msg.sender}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${
                          isFromCurrentUser ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                    {isFromCurrentUser && (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                        <span className="text-white text-xs font-semibold">
                          {getSenderInitials(msg.sender)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-6 border-t bg-white flex-shrink-0">
        {groupChatTag && dynamicRecipientId ? (
          <div className="flex items-center space-x-3">
            <button className="p-3 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
              <Smile size={24} />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message to the group..."
                className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
                rows="1"
                style={{ minHeight: '56px', maxHeight: '120px' }}
                disabled={!isConnected || !dynamicRecipientId}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || !isConnected || !dynamicRecipientId}
              className={`p-3 rounded-full transition-colors ${
                messageInput.trim() && isConnected && dynamicRecipientId
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={24} />
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">
              Group chat is not active yet. Please wait for the chat to be initialized.
            </p>
          </div>
        )}
        
        {!isConnected && groupChatTag && (
          <div className="flex justify-center mt-3">
            <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
              Connection lost. Trying to reconnect...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChat;