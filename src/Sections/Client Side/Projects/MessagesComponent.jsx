import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Plus, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Hash,
  User, // Added User icon for generic avatar fallback
  Users // 
} from 'lucide-react';

// Lazy load chat components
const GroupChat = lazy(() => import('./GroupChatMessage'));
const ProjectManager = lazy(() => import('./ProjectManager'));
const DirectMessageChat = lazy(() => import('./DirectMessageChat')); 

const MessagesComponent = ({ project = null, userId = null, projectId: propProjectId = null, clientId: propClientId = null }) => {
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [dynamicProjectId, setDynamicProjectId] = useState(propProjectId);
  const [dynamicClientId, setDynamicClientId] = useState(propClientId);
  const [isLoadingProjectInfo, setIsLoadingProjectInfo] = useState(true);

  // Get the current user's ID
  const currentUserId = userId || localStorage.getItem('user_id');

  // Fetch project info from API if not provided via props (UNCHANGED)
  useEffect(() => {
    const fetchProjectInfo = async () => {
      // If we already have projectId and clientId from props, use them
      if (propProjectId && propClientId) {
        setDynamicProjectId(propProjectId);
        setDynamicClientId(propClientId);
        setIsLoadingProjectInfo(false);
        return;
      }

      try {
        setIsLoadingProjectInfo(true);
        const token = localStorage.getItem('access_jwt');
        const API_URL = import.meta.env.VITE_API_URL;
        
        const response = await fetch(`${API_URL}/api/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        
        if (data.well_received && data.projects.length > 0) {
          // Find an ongoing project, or fallback to first project
          let targetProject = null;
          
          for (const projectObj of data.projects) {
            const projectKey = Object.keys(projectObj)[0];
            const project = projectObj[projectKey];
            
            if (project.status === 'ongoing') {
              targetProject = project;
              break;
            }
          }
          
          // If no ongoing project, use the first one
          if (!targetProject) {
            const firstProjectObj = data.projects[0];
            const projectKey = Object.keys(firstProjectObj)[0];
            targetProject = firstProjectObj[projectKey];
          }
          
          setDynamicProjectId(targetProject.id);
          setDynamicClientId(targetProject.client_id);
        }
      } catch (error) {
        console.error('Error fetching project info:', error);
        setError('Failed to load project information');
      } finally {
        setIsLoadingProjectInfo(false);
      }
    };
    
    fetchProjectInfo();
  }, [propProjectId, propClientId]);

  useEffect(() => {
    if (project) {
      setProjectData(project);
      setError(null);
      processMessagesData(project);
    } else {
      setError('No project data provided');
    }
  }, [project]);

  const processMessagesData = (data) => {
    if (!data || !data.jobs) return;

    const conversationsData = [
      {
        id: 'general',
        type: 'channel',
        name: 'General',
        icon: '#',
        isGroupChat: true,
        isProjectManager: false,
        lastMessage: "Team collaboration space...",
        timestamp: '10:45 AM',
        unreadCount: 3,
        messages: []
      },
      {
        id: 'project-manager-ai',
        type: 'channel',
        name: 'Project Manager AI',
        icon: '#',
        isGroupChat: false,
        isProjectManager: true,
        lastMessage: "Alex: Let's review the latest for review",
        timestamp: 'Yesterday',
        unreadCount: 0,
        messages: []
      }
    ];

    const workers = [];

    // Helper function to add a worker/potential hire to the list
    const addWorker = (worker, isPotential = false) => {
        // Prevent duplicates based on ID
        if (workers.some(w => w.id === `dm-${worker.id}`)) return;

        workers.push({
            id: `dm-${worker.id}`,
            type: 'direct',
            name: `${worker.firstname} ${worker.lastname}`,
            avatar: `${worker.firstname[0]}${worker.lastname[0]}`,
            isGroupChat: false,
            isProjectManager: false,
            // REQUIRED PROPS FOR DirectMessageChat
            recipientId: worker.id, 
            recipientName: `${worker.firstname} ${worker.lastname}`,
            // NEW FLAG
            isPotentialHire: isPotential,
            // Mock data
            lastMessage: isPotential ? `Potential Hire for ${worker.skill}` : 'Can you review the support guidelines?',
            timestamp: worker.id % 2 === 0 ? 'Yesterday' : 'Monday',
            unreadCount: worker.id % 3 === 0 ? 1 : 0,
            messages: [
                { id: 1, sender: `${worker.firstname} ${worker.lastname}`, avatar: `${worker.firstname[0]}${worker.lastname[0]}`, message: 'Hello, I received the interview request.', timestamp: '...', isOwn: false },
                { id: 2, sender: 'You', avatar: 'YO', message: 'I see you are interested!', timestamp: '...', isOwn: true }
            ]
        });
    }

    data.jobs?.forEach(job => {
        // 1. Add Employed Workers (Existing Logic)
        job.employed_worker_info?.forEach(worker => {
            addWorker(worker, false);
        });
        
        // 2. Add Potential Hires (NEW LOGIC)
        job.potential_hire_info?.forEach(worker => {
            addWorker(worker, true);
        });
    });

    // Combine channels and worker DMs
    setConversations([...conversationsData, ...workers]);
    if ([...conversationsData, ...workers].length > 0) {
      setSelectedConversation(conversationsData[0]); // Select 'General' by default
    }
  };

  const handleSendMessage = () => {
    // Static mock message logic is now largely redundant for dynamic chats
    if (!messageInput.trim() || !selectedConversation || selectedConversation.type !== 'direct') return;

    const newMessage = {
      id: Date.now(),
      sender: 'You',
      avatar: 'YO',
      message: messageInput,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      isOwn: true
    };

    // This part is only for the *mock* messages display, the actual
    // DirectMessageChat component will handle real sending via its own props/internal state.
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageInput,
          timestamp: 'Just now'
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    // Update selected conversation state only if it's the static DM view
    if (selectedConversation.messages) {
      setSelectedConversation({
        ...selectedConversation,
        messages: [...selectedConversation.messages, newMessage]
      });
    }
    setMessageInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'channels') return conv.type === 'channel';
    if (activeTab === 'direct') return conv.type === 'direct';
    if (searchQuery) {
      return conv.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (error || !projectData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">{error || 'No messages available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-5">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Team Messages</h2>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Plus size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search conversation"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200">
              {['all', 'channels', 'direct'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${
                    selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                  }`}
                >
                  {conv.type === 'channel' ? (
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Hash size={20} className="text-purple-600" />
                    </div>
                  ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                            conv.isPotentialHire ? 'bg-yellow-500' : 'bg-gradient-to-br from-blue-400 to-purple-500'
                        }`}>
                            {conv.avatar || <User size={20} />}
                        </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {conv.name}
                        {conv.isPotentialHire && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                                Potential
                            </span>
                        )}
                      </p>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {conv.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600 truncate">
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Chat Area */}
          {selectedConversation ? (
            selectedConversation.isGroupChat ? (
              // Group Chat Component (Project Chat)
              <div className="flex-1 flex flex-col">
                {isLoadingProjectInfo || !dynamicProjectId || !dynamicClientId ? (
                  // Loading/Error UI (Simplified)
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      {isLoadingProjectInfo ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      ) : null}
                      <p className="text-gray-600">{isLoadingProjectInfo ? 'Loading project information...' : 'No active projects found'}</p>
                    </div>
                  </div>
                ) : (
                  <Suspense fallback=''>
                    <GroupChat 
                      userId={currentUserId} 
                      projectId={dynamicProjectId} 
                      clientId={dynamicClientId}
                      className="h-full"
                    />
                  </Suspense>
                )}
              </div>
            ) : selectedConversation.isProjectManager ? (
              // Project Manager AI Component
              <div className="flex-1 flex flex-col">
                {isLoadingProjectInfo || !dynamicProjectId || !dynamicClientId ? (
                  // Loading/Error UI (Simplified)
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-600">Loading Project Manager AI...</p>
                    </div>
                  </div>
                ) : (
                  <Suspense fallback=''>
                    <ProjectManager 
                      userId={currentUserId} 
                      projectId={dynamicProjectId} 
                      clientId={dynamicClientId}
                      chat_type="project_manager"
                      assistantName="Project Manager AI"
                      assistantAvatar="PM"
                      className="h-full"
                    />
                  </Suspense>
                )}
              </div>
            ) : (
              // === DIRECT MESSAGE (P2P) COMPONENT (Dynamic) ===
              <div className="flex-1 flex flex-col">
                <Suspense fallback={
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading direct chat with {selectedConversation.name}...</p>
                    </div>
                  </div>
                }>
                  <DirectMessageChat
                    ownId={currentUserId}
                    recipientId={selectedConversation.recipientId}
                    recipientName={selectedConversation.recipientName}
                    chatType="human" // Differentiate chat type if needed
                    className="h-full"
                  />
                </Suspense>
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesComponent;