import React, { useState, useEffect, useRef } from 'react';
import socket from '../../../Components/socket';

// GroupChat component for project/job dashboards
const GroupChat = ({ userId, isClient }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [groupChatTag, setGroupChatTag] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [clientId, setClientId] = useState(null); // Add clientId state
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
          setClientId(targetProject.client_id); // Set the clientId
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
    if (!projectId || !clientId) return; // Wait for both IDs
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_jwt');
      const API_URL = import.meta.env.VITE_API_URL
      // Construct the dynamic recipient ID for the API call
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
        // The group chat room name is now the groupChatTag
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
      // The recipient_id in the message now needs to match the new format
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
  }, [userId, groupChatTag, projectId, clientId]); // Add clientId to dependency array

  // Trigger fetchChat when projectId or clientId is set
  useEffect(() => {
    if (projectId && clientId) {
      fetchChat();
    }
  }, [projectId, clientId]); // Dependency on both IDs

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

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-gray-100 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">
        {groupChatTag ? `Group Chat: ${groupChatTag}` : 'Group Chat (Not Active)'}
      </h2>
      {isLoading ? (
        <p className="text-gray-500">Loading group chat...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : groupChatTag ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 bg-white rounded-lg mb-4 max-h-96">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 ${
                  msg.sender === String(userId) ? 'text-right' : 'text-left'
                }`}
              >
                <span className="text-xs text-gray-500">{msg.sender}:</span>
                <p
                  className={`inline-block p-2 rounded-lg ${
                    msg.sender === String(userId)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {msg.content}
                </p>
                <span className="text-xs text-gray-400">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
            />
            <button
              onClick={handleSendMessage}
              disabled={!isConnected || !groupChatTag}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">
          Waiting for group chat to be created. Onboard freelancers to start chatting.
        </p>
      )}
      <div className="mt-2 text-sm text-gray-600">
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </div>
    </div>
  );
};

export default GroupChat;