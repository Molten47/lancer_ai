import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Circle, Settings, UserPlus, Smile } from 'lucide-react';
import socket from '../../../Components/socket';

// GroupChat component for project/job dashboards
const GroupChat = ({ userId, isClient }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [groupChatTag, setGroupChatTag] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch projects to get dynamic project_id and client_id
  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_jwt');
      const API_URL = import.meta.env.VITE_API_URL
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
          setProjectId(targetProject.id);
          setClientId(targetProject.client_id);
        } else {
          setError('No projects found');
        }
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      setError('Error fetching projects: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch chat details using dynamic project_id and client_id
  const fetchChat = async () => {
    if (!projectId || !clientId) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_jwt');
      const API_URL = import.meta.env.VITE_API_URL
      const recipientId = `group_chat_tag_${projectId}_${clientId}`; 
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
        setMessages((data.messages || []).map(msg => ({
          content: msg.message_content,
          sender: msg.sender_tag,
          timestamp: msg.timestamp || new Date().toISOString(),
        })));
      } else {
        setError('Failed to fetch chat details');
      }
    } catch (err) {
      setError('Error fetching chat: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to Socket.IO and join rooms
  useEffect(() => {
    fetchProjects();

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to Socket.IO server');
      socket.emit('join', { room_name: String(userId), user: userId });
      if (groupChatTag) {
        socket.emit('join', { room_name: groupChatTag, user: userId });
      }
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Socket connection failed');
    });

    socket.on('new_message', (data) => {
      const dynamicRecipientId = `group_chat_tag_${projectId}_${clientId}`;
      if (data.recipient_id === dynamicRecipientId) { 
        setMessages((prev) => [
          ...prev,
          {
            content: data.message_content,
            sender: data.sender_tag,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    });

    socket.on('notification', (data) => {
      if (data.type === 'group_chat_created' && data.message.project_id === projectId) {
        const newGroupChatTag = data.message.group_chat_tag;
        setGroupChatTag(newGroupChatTag);
        socket.emit('join', { room_name: newGroupChatTag, user: userId });
      }
    });

    socket.on('status_update', (data) => {
      console.log('Status update:', data.update);
      if (data.update.includes('job_activated')) {
        fetchChat();
      }
    });

    socket.on('control_instruction', (data) => {
      console.log('AI instruction:', data.command, data.data);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('new_message');
      socket.off('notification');
      socket.off('status_update');
      socket.off('control_instruction');
    };
  }, [userId, groupChatTag, projectId, clientId]);

  // Trigger fetchChat when projectId or clientId is set
  useEffect(() => {
    if (projectId && clientId) {
      fetchChat();
    }
  }, [projectId, clientId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to group chat
  const handleSendMessage = () => {
    if (!messageInput.trim() || !groupChatTag || !projectId || !clientId) return;
    const recipientId = `group_chat_tag_${projectId}_${clientId}`;
    socket.emit('send_message', {
      message_content: messageInput,
      own_id: userId,
      recipient_id: recipientId,
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
    const parts = sender.split('_');
    if (parts.length >= 2) {
      return parts.slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase();
    }
    return sender.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full w-full bg-white basic-font">
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
              {groupChatTag && (
                <span className="text-xs opacity-75 ml-2">
                  {groupChatTag}
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

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading group chat...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full mb-6 flex items-center justify-center">
              <Users size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-red-600 mb-2">Connection Error</h3>
            <p className="text-red-500 max-w-md">{error}</p>
          </div>
        ) : !groupChatTag ? (
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
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === String(userId) ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="flex items-end space-x-2 max-w-lg">
                  {msg.sender !== String(userId) && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                      <span className="text-white text-xs font-semibold">
                        {getSenderInitials(msg.sender)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-sm lg:max-w-md ${
                      msg.sender === String(userId)
                        ? 'bg-green-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 border rounded-bl-md shadow-sm'
                    }`}
                  >
                    {msg.sender !== String(userId) && (
                      <p className={`text-xs font-medium mb-1 ${
                        msg.sender === String(userId) ? 'text-green-100' : 'text-green-600'
                      }`}>
                        {msg.sender}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${
                        msg.sender === String(userId) ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                  {msg.sender === String(userId) && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                      <span className="text-white text-xs font-semibold">
                        {getSenderInitials(msg.sender)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-6 border-t bg-white flex-shrink-0">
        {groupChatTag ? (
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
                disabled={!isConnected || !groupChatTag}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || !isConnected || !groupChatTag}
              className={`p-3 rounded-full transition-colors ${
                messageInput.trim() && isConnected && groupChatTag
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
          <p className="text-sm text-red-500 mt-3 text-center">
            Connecting to group chat...
          </p>
        )}
      </div>
    </div>
  );
};

export default GroupChat;