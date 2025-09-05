import React, { useState, useEffect, useRef } from 'react';
import socket, { getAPIUrl } from './socket';

// GroupChat component for project/job dashboards
const GroupChat = ({ userId, isClient }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [groupChatTag, setGroupChatTag] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch projects to get dynamic project_id (taking the first ongoing project)
  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_jwt');
      const API_URL = import.meta.env.VITE_API_URL
      const response = await fetch(`${API_URL}/projects`, {
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
          // Take the first project; if multiple, prefer 'ongoing' (can be enhanced later)
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
            // Fallback to first if no ongoing
            const firstProjectObj = projects[0];
            const projectKey = Object.keys(firstProjectObj)[0];
            targetProject = firstProjectObj[projectKey];
          }
          setProjectId(targetProject.id);
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

  // Fetch chat details using dynamic project_id
  const fetchChat = async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_jwt');
      const API_URL = import.meta.env.VITE_API_URL
      const response = await fetch(`${API_URL}/chat?chat_type=group&project_id=${projectId}`, {
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
        // Assume API returns historical messages
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
    // Fetch projects on mount
    fetchProjects();

    // Connect to socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Handle connection status
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to Socket.IO server');
      // Join default user room
      socket.emit('join', { room_name: String(userId), user: userId });
      // Join group chat room if tag exists
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

    // Listen for new messages
    socket.on('new_message', (data) => {
      if (data.recipient_id === groupChatTag) {
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

    // Listen for notifications (e.g., group chat created)
    socket.on('notification', (data) => {
      if (data.type === 'group_chat_created' && data.message.project_id === projectId) {
        setGroupChatTag(data.message.group_chat_tag);
        socket.emit('join', { room_name: data.message.group_chat_tag, user: userId });
      }
    });

    // Listen for status updates
    socket.on('status_update', (data) => {
      console.log('Status update:', data.update);
      // Refetch chat if job status changes
      if (data.update.includes('job_activated')) {
        fetchChat();
      }
    });

    // Listen for AI instructions
    socket.on('control_instruction', (data) => {
      console.log('AI instruction:', data.command, data.data);
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('new_message');
      socket.off('notification');
      socket.off('status_update');
      socket.off('control_instruction');
    };
  }, [userId, groupChatTag, projectId]);

  // Fetch chat when projectId is set
  useEffect(() => {
    fetchChat();
  }, [projectId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to group chat
  const handleSendMessage = () => {
    if (!messageInput.trim() || !groupChatTag) return;
    socket.emit('send_message', {
      message_content: messageInput,
      own_id: userId,
      recipient_id: groupChatTag,
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