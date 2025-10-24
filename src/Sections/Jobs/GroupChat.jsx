import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Circle, Settings, RefreshCw, Smile } from 'lucide-react';
import socket from '../../Components/socket';

const GroupChat = ({ userId, projectId, clientId, className = '' }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [projectData, setProjectData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState(null);
  const [userMap, setUserMap] = useState(new Map());
  const [senderProfile, setSenderProfile] = useState(null);
  const messagesEndRef = useRef(null);

  const recipientId = projectId && clientId ? `group_chat_${projectId}_${clientId}` : null;
  const groupChatTag = projectData?.group_chat || null;

  // Calculate stats
  const activeJobs = projectData?.jobs?.filter(job => job.status === 'active') || [];
  const employedWorkers = new Set();
  activeJobs.forEach(job => {
    job.employed_worker_info?.forEach(worker => employedWorkers.add(worker.id));
  });

  // Get initials from name
  const getInitials = (firstname, lastname) => {
    const first = firstname?.charAt(0)?.toUpperCase() || '';
    const last = lastname?.charAt(0)?.toUpperCase() || '';
    return first + last || '??';
  };

  // Build user map from project data and sender profile
  const buildUserMap = (project, senderProfileData) => {
    const map = new Map();
    
    // Add sender's profile (the logged-in user)
    if (senderProfileData) {
      map.set(String(senderProfileData.id), {
        id: senderProfileData.id,
        username: senderProfileData.username || `${senderProfileData.firstname}${senderProfileData.lastname}`,
        firstname: senderProfileData.firstname,
        lastname: senderProfileData.lastname,
        initials: getInitials(senderProfileData.firstname, senderProfileData.lastname),
        skill: senderProfileData.skill,
        email: senderProfileData.email
      });
    }
    
    // Add all employed workers from all jobs
    project?.jobs?.forEach(job => {
      job.employed_worker_info?.forEach(worker => {
        if (!map.has(String(worker.id))) {
          map.set(String(worker.id), {
            id: worker.id,
            username: worker.username,
            firstname: worker.firstname,
            lastname: worker.lastname,
            initials: getInitials(worker.firstname, worker.lastname),
            skill: worker.skill
          });
        }
      });
    });
    
    console.log('User map built with', map.size, 'members');
    return map;
  };

  // Get user info from map
  const getUserInfo = (senderId) => {
    const user = userMap.get(String(senderId));
    if (user) return user;
    
    // Fallback for unknown users
    return {
      id: senderId,
      username: `User ${senderId}`,
      initials: 'U' + String(senderId).charAt(0)
    };
  };

  // Get avatar color based on user ID
  const getAvatarColor = (senderId) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-cyan-500'
    ];
    const index = parseInt(senderId) % colors.length;
    return colors[index];
  };

  const fetchSenderProfile = async () => {
    if (!userId) return null;
    
    try {
      const token = localStorage.getItem('access_jwt');
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (data.well_received && data.profile_data) {
        setSenderProfile(data.profile_data);
        console.log('Sender profile loaded:', data.profile_data.firstname, data.profile_data.lastname);
        return data.profile_data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching sender profile:', err);
      return null;
    }
  };

  const fetchProjectData = async () => {
    if (!projectId) return null;
    
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_jwt');
      const API_URL = import.meta.env.VITE_API_URL;
      
      // Check if user is client or freelancer to determine endpoint
      const endpoint = isClient ? '/api/projects' : '/api/jobs';
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (data.well_received) {
        let targetProject = null;
        
        if (isClient) {
          // Client: search in projects array
          const projects = data.projects || [];
          for (const projectObj of projects) {
            const projectKey = Object.keys(projectObj)[0];
            const project = projectObj[projectKey];
            if (String(project.id) === String(projectId)) {
              targetProject = project;
              break;
            }
          }
        } else {
          // Freelancer: find job matching projectId, then construct project-like object
          const jobs = data.jobs || [];
          const matchingJob = jobs.find(job => String(job.project_id) === String(projectId));
          
          if (matchingJob) {
            // Construct a project-like structure from job data
            targetProject = {
              id: matchingJob.project_id,
              client_id: matchingJob.client_id,
              project_title: `Project ${matchingJob.project_id}`,
              group_chat: matchingJob.project_group_chat,
              status: 'active',
              jobs: [matchingJob] // Include just this job
            };
          }
        }
        
        if (!targetProject) {
          setError(`Project ${projectId} not found`);
          return null;
        }
        
        setProjectData(targetProject);
        
        // Build user map from the project data and sender profile
        const newUserMap = buildUserMap(targetProject, senderProfile);
        setUserMap(newUserMap);
        
        console.log(`Project: ${targetProject.project_title || `Project ${projectId}`} (ID: ${projectId})`);
        console.log(`Group Chat: ${targetProject.group_chat || 'Not created'}`);
        console.log(`Room: ${recipientId}`);
        console.log('Team members mapped:', newUserMap.size);
        
        return targetProject;
      }
      return null;
    } catch (err) {
      setError('Error loading project: ' + err.message);
      console.error('Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!recipientId) return;
    
    try {
      const token = localStorage.getItem('access_jwt');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(
        `${API_URL}/api/chat?chat_type=group&recipient_id=${recipientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.status === 404) {
        setMessages([]);
        return;
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.success && data.messages) {
        const formattedMessages = data.messages.map((msg, idx) => ({
          id: msg.id || `msg-${idx}`,
          content: msg.message_content,
          sender: msg.sender_tag,
          timestamp: msg.timestamp || new Date().toISOString(),
          sender_id: msg.sender_id,
          recipient_id: msg.recipient_id
        }));
        setMessages(formattedMessages);
        console.log(`Loaded ${formattedMessages.length} messages`);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const joinRoom = () => {
    if (!recipientId || !userId || !socket.connected) {
      console.log('Cannot join room');
      return;
    }
    
    socket.emit('join', { 
      room_name: recipientId,
      user: parseInt(userId) 
    });
    
    console.log(`Joined room: ${recipientId}`);
  };

  useEffect(() => {
    if (!projectId || !clientId) {
      setError('Missing project or client ID');
      return;
    }

    const init = async () => {
      const profile = await fetchSenderProfile();
      await fetchProjectData();
      await fetchMessages();
      if (socket.connected) joinRoom();
    };
    
    init();
  }, [projectId, clientId]);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      console.log('Socket connected');
      joinRoom();
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    };

    const handleNewMessage = (data) => {
      console.log('Message received:', {
        from: data.sender_tag,
        sender_id: data.sender_id,
        to: data.recipient_id,
        expected: recipientId
      });
      
      if (String(data.recipient_id) !== String(recipientId)) {
        console.log('Wrong room - ignored');
        return;
      }

      const newMessage = {
        id: data.id || `msg-${Date.now()}`,
        content: data.message_content,
        sender: data.sender_tag,
        timestamp: data.timestamp || new Date().toISOString(),
        sender_id: data.sender_id || data.own_id,
        recipient_id: data.recipient_id
      };

      setMessages(prev => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    };

    const handleNotification = (data) => {
      if (data.type === 'group_chat_created' && String(data.message?.project_id) === String(projectId)) {
        setTimeout(() => {
          fetchProjectData();
          fetchMessages();
        }, 1000);
      }
    };

    const handleStatusUpdate = (data) => {
      if (data.update && (data.update.includes('job_activated') || data.update.includes('worker_hired'))) {
        setTimeout(() => {
          fetchProjectData(); // This will rebuild the user map with new workers
        }, 1000);
      }
    };

    // Initial profile fetch if not loaded
    if (!senderProfile) {
      fetchSenderProfile();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('new_message', handleNewMessage);
    socket.on('notification', handleNotification);
    socket.on('status_update', handleStatusUpdate);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new_message', handleNewMessage);
      socket.off('notification', handleNotification);
      socket.off('status_update', handleStatusUpdate);
    };
  }, [recipientId, projectId, userId, senderProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !recipientId || !isConnected) return;

    console.log('Sending to room:', recipientId);
    
    socket.emit('send_message', {
      message_content: messageInput.trim(),
      own_id: parseInt(userId),
      recipient_id: recipientId,
    });
    
    setMessageInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading && !projectData) {
    return (
      <div className={`flex flex-col h-screen bg-gray-50 ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen bg-white p-14 third-font ${className}`}>
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
              {projectData?.project_title || 'Project Group Chat'}
            </h3>
            <div className="flex items-center space-x-2 text-sm flex-wrap">
              <div className="flex items-center">
                <Circle size={8} className={`${isConnected ? 'text-green-300' : 'text-red-300'} fill-current mr-1`} />
                <span className="opacity-90">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <span className="opacity-75">
                • Project {projectId} • {activeJobs.length} jobs • {employedWorkers.size} members
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => {
              fetchSenderProfile();
              fetchProjectData();
              fetchMessages();
            }}
            className="p-3 hover:bg-green-700 rounded-full transition-colors"
          >
            <RefreshCw size={20} />
          </button>
          <button className="p-3 hover:bg-green-700 rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {!groupChatTag ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full mb-6 flex items-center justify-center">
              <Users size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Group Chat Not Active</h3>
            <p className="text-gray-500 max-w-md mb-4">
              Activate jobs and onboard freelancers to enable group chat.
            </p>
            <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl text-left shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Current Status</h4>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Active Jobs ({activeJobs.length}):</p>
                {activeJobs.length > 0 ? (
                  <div className="space-y-2">
                    {activeJobs.map((job) => (
                      <div key={job.id} className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-sm font-medium text-blue-900">
                          Job #{job.id}: {job.title}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          {job.metrics}
                        </p>
                        {job.employed_worker_info && job.employed_worker_info.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            <p className="text-xs text-blue-600 mb-1">Assigned Workers:</p>
                            {job.employed_worker_info.map((worker) => (
                              <div key={worker.id} className="text-xs text-blue-800 ml-2">
                                • {worker.firstname} {worker.lastname} (@{worker.username}) - ID: {worker.id}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No active jobs</p>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Team Members ({employedWorkers.size}):
                </p>
                {employedWorkers.size > 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    {Array.from(employedWorkers).map((workerId) => {
                      let workerInfo = null;
                      activeJobs.forEach(job => {
                        const found = job.employed_worker_info?.find(w => w.id === workerId);
                        if (found) workerInfo = found;
                      });
                      
                      return workerInfo ? (
                        <div key={workerId} className="text-sm text-green-800 mb-1">
                          • {workerInfo.firstname} {workerInfo.lastname} ({workerInfo.skill}) - ID: {workerInfo.id}
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No team members yet</p>
                )}
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  <strong>Room:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{recipientId}</code>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Group Chat Status:</strong> {groupChatTag || 'Not created'}
                </p>
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full mb-6 flex items-center justify-center">
              <Users size={32} className="text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No messages yet</h3>
            <p className="text-gray-500 text-sm">
              Room: <code className="bg-gray-100 px-2 py-1 rounded">{recipientId}</code>
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isFromUser = String(msg.sender_id) === String(userId);
            const userInfo = getUserInfo(msg.sender_id);
            const avatarColor = getAvatarColor(msg.sender_id);
            
            return (
              <div key={msg.id} className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}>
                <div className="flex items-end space-x-2 max-w-lg">
                  {!isFromUser && (
                    <div className={`w-8 h-8 ${avatarColor} rounded-full flex items-center justify-center flex-shrink-0 mb-1`}>
                      <span className="text-white text-xs font-semibold">
                        {userInfo.initials}
                      </span>
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl max-w-sm lg:max-w-md ${
                    isFromUser
                      ? 'bg-green-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 border rounded-bl-md shadow-sm'
                  }`}>
                    {!isFromUser && (
                      <p className="text-xs font-medium mb-1 text-green-600">
                        {userInfo.username}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <span className={`text-xs mt-2 block ${isFromUser ? 'text-green-100' : 'text-gray-500'}`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  {isFromUser && (
                    <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                      <span className="text-white text-xs font-semibold">
                        {userInfo.initials}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t bg-white flex-shrink-0">
        {groupChatTag ? (
          <div className="flex items-center space-x-3">
            <button className="p-3 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
              <Smile size={24} />
            </button>
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows="1"
              style={{ minHeight: '56px', maxHeight: '120px' }}
              disabled={!isConnected}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || !isConnected}
              className={`p-3 rounded-full transition-colors ${
                messageInput.trim() && isConnected
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
              Chat will be available once the group is active.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChat;