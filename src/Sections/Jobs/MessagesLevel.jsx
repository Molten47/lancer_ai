import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { 
  Plus, 
  Search, 
  Hash,
  User,
  Users,
  Clock,
  CheckCircle,
  X,
  Wifi,
  WifiOff
} from 'lucide-react';
import socket from '../../Components/socket';

// Lazy load chat component
const DirectMessageChat = lazy(() => import('./PersonalChat')); 

const MessagesComponent = ({ userId = null }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messageRequests, setMessageRequests] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  // Get the current user's ID
  const currentUserId = userId || localStorage.getItem('user_id');

  // Get current user ID helper
  const getCurrentUserId = useCallback(() => {
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId) : null;
  }, []);

  // Initialize with mock accepted conversations and channels
  useEffect(() => {
    // Mock accepted conversations (employed workers)
    const mockConversations = [
      {
        id: 'dm-1',
        type: 'direct',
        name: 'John Smith',
        avatar: 'JS',
        isGroupChat: false,
        isProjectManager: false,
        recipientId: '101',
        recipientName: 'John Smith',
        isPotentialHire: false,
        skill: 'Frontend Developer',
        lastMessage: 'Thanks for the update!',
        timestamp: '2:30 PM',
        unreadCount: 0,
        messages: []
      },
      {
        id: 'dm-2',
        type: 'direct',
        name: 'Sarah Johnson',
        avatar: 'SJ',
        isGroupChat: false,
        isProjectManager: false,
        recipientId: '102',
        recipientName: 'Sarah Johnson',
        isPotentialHire: false,
        skill: 'UI/UX Designer',
        lastMessage: 'Can you review the designs?',
        timestamp: 'Yesterday',
        unreadCount: 2,
        messages: []
      }
    ];

    // Mock channels (non-functional, just for display)
    const mockChannels = [
      {
        id: 'general',
        type: 'channel',
        name: 'General',
        icon: '#',
        isGroupChat: true,
        isProjectManager: false,
        lastMessage: 'Team collaboration space...',
        timestamp: '10:45 AM',
        unreadCount: 3,
        isMockChannel: true,
        messages: []
      },
      {
        id: 'project-manager-ai',
        type: 'channel',
        name: 'Project Manager AI',
        icon: '#',
        isGroupChat: false,
        isProjectManager: true,
        lastMessage: "Let's review the latest updates",
        timestamp: 'Yesterday',
        unreadCount: 0,
        isMockChannel: true,
        messages: []
      }
    ];

    setConversations([...mockChannels, ...mockConversations]);
    
    // Start with first channel selected
    if (mockChannels.length > 0) {
      setSelectedConversation(mockChannels[0]);
    }
  }, []);

  // Handle incoming messages from socket for message requests
  const handleNewMessage = useCallback((messageData) => {
    console.log('📨 Incoming message in main component:', messageData);
    const { message_content, own_id, recipient_id, timestamp, sender_tag } = messageData;
    const currentUserId = getCurrentUserId();
    
    // Process messages TO current user OR FROM current user (for echo/confirmation)
    const isIncomingMessage = recipient_id === currentUserId && own_id !== currentUserId;
    const isOutgoingMessage = own_id === currentUserId && recipient_id !== currentUserId;
    
    if (isIncomingMessage) {
      const senderId = own_id;
      
      setConversations(prevConvs => {
        const existsInConversations = prevConvs.some(conv => 
          conv.recipientId === String(senderId) && !conv.isMockChannel
        );

        if (existsInConversations) {
          // Update existing conversation - only increment unread if not currently viewing
          return prevConvs.map(conv => 
            conv.recipientId === String(senderId)
              ? {
                  ...conv,
                  lastMessage: message_content,
                  timestamp: 'Just now',
                  unreadCount: selectedConversation?.recipientId === String(senderId) 
                    ? 0 
                    : (conv.unreadCount || 0) + 1
                }
              : conv
          );
        }
        return prevConvs;
      });

      setMessageRequests(prevReqs => {
        const existsInRequests = prevReqs.some(req => 
          req.recipientId === String(senderId)
        );

        if (existsInRequests) {
          // Update existing request
          return prevReqs.map(req => 
            req.recipientId === String(senderId)
              ? {
                  ...req,
                  lastMessage: message_content,
                  timestamp: 'Just now',
                  unreadCount: (req.unreadCount || 0) + 1
                }
              : req
          );
        }

        // Check again in conversations to avoid duplicate
        const alreadyAccepted = conversations.some(conv => 
          conv.recipientId === String(senderId) && !conv.isMockChannel
        );

        if (!alreadyAccepted) {
          // New message request from unknown sender
          const newRequest = {
            id: `dm-req-${senderId}`,
            type: 'direct',
            name: `User ${senderId}`,
            avatar: `U${senderId.toString().slice(-1)}`,
            isGroupChat: false,
            isProjectManager: false,
            recipientId: String(senderId),
            recipientName: `User ${senderId}`,
            isPotentialHire: true,
            skill: 'New Contact',
            lastMessage: message_content,
            timestamp: 'Just now',
            unreadCount: 1,
            hasUnreadRequest: true,
            messages: []
          };

          console.log('✅ New message request created:', newRequest);
          return [newRequest, ...prevReqs];
        }

        return prevReqs;
      });
    } else if (isOutgoingMessage) {
      // Update conversation list when we send a message
      const recipientIdStr = String(recipient_id);
      
      setConversations(prevConvs => 
        prevConvs.map(conv => 
          conv.recipientId === recipientIdStr
            ? {
                ...conv,
                lastMessage: message_content,
                timestamp: 'Just now'
              }
            : conv
        )
      );
    }
  }, [conversations, selectedConversation, getCurrentUserId]);

  // Socket connection management
  useEffect(() => {
    const handleConnect = () => {
      console.log('🔗 Connected to socket');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('❌ Disconnected from socket');
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('new_message', handleNewMessage);

    // Set initial connection state
    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new_message', handleNewMessage);
    };
  }, [handleNewMessage]);

  const handleAcceptRequest = (request) => {
    // Move from requests to conversations
    setMessageRequests(prev => prev.filter(r => r.id !== request.id));
    const acceptedConversation = { 
      ...request, 
      isPotentialHire: false, 
      hasUnreadRequest: false, 
      unreadCount: 0,
      timestamp: 'Just now',
      initialMessage: request.lastMessage 
    };
    setConversations(prev => [...prev, acceptedConversation]);
    setSelectedConversation(acceptedConversation);
    setActiveTab('direct');
  };

  const handleDeclineRequest = (request) => {
    setMessageRequests(prev => prev.filter(r => r.id !== request.id));
    if (selectedConversation?.id === request.id) {
      setSelectedConversation(null);
    }
  };

  // Format time for display
  const formatTime = (timestamp) => {
    if (timestamp === 'Just now') return timestamp;
    
    try {
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
    } catch {
      return timestamp;
    }
  };

  const filteredConversations = (() => {
    let items = [];
    
    if (activeTab === 'all') {
      items = conversations;
    } else if (activeTab === 'channels') {
      items = conversations.filter(conv => conv.type === 'channel');
    } else if (activeTab === 'direct') {
      items = conversations.filter(conv => conv.type === 'direct');
    } else if (activeTab === 'requests') {
      items = messageRequests;
    }

    if (searchQuery) {
      return items.filter(conv => 
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return items;
  })();

  return (
    <div className="space-y-6 pt-5">
      <div className="bg-white rounded-xl third-font shadow-sm overflow-y-auto" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">Team Messages</h2>
                  {isConnected ? (
                    <Wifi size={14} className="text-green-500" title="Connected" />
                  ) : (
                    <WifiOff size={14} className="text-red-500" title="Disconnected" />
                  )}
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Plus size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search conversations"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 px-2 py-2 border-b border-gray-200 overflow-x-auto scrollbar-hide flex-shrink-0">
              {['all', 'channels', 'direct'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors relative whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'requests'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Requests
                {messageRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {messageRequests.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                  <Clock size={48} className="mb-4 text-gray-300" />
                  <p className="text-sm text-center">
                    {activeTab === 'requests' 
                      ? 'No pending message requests'
                      : 'No conversations found'}
                  </p>
                  {activeTab === 'requests' && (
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      New message requests will appear here
                    </p>
                  )}
                </div>
              ) : (
                filteredConversations.map((conv) => (
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
                              New
                            </span>
                          )}
                        </p>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTime(conv.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600 truncate">
                          {conv.lastMessage}
                        </p>
                        {(conv.unreadCount > 0 || conv.hasUnreadRequest) && (
                          <span className="ml-2 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                            {conv.unreadCount || '!'}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Side - Chat Area */}
          {selectedConversation ? (
            // Check if it's a mock channel (non-functional)
            selectedConversation.isMockChannel ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-8">
                  <div className="w-20 h-20 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Hash size={32} className="text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedConversation.name}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {selectedConversation.isProjectManager 
                      ? 'AI-powered project management assistant'
                      : 'Team collaboration channel'}
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      🚧 This is a mock channel for display purposes. Real-time functionality coming soon!
                    </p>
                  </div>
                </div>
              </div>
            ) : activeTab === 'requests' ? (
              // Message Request View - Accept/Decline UI
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-2xl">
                    {selectedConversation.avatar}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedConversation.name}
                  </h3>
                  <p className="text-gray-600 mb-2 font-medium">
                    {selectedConversation.skill}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Wants to connect with you
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm text-gray-700 font-medium mb-1">First message:</p>
                    <p className="text-sm text-gray-600 italic">"{selectedConversation.lastMessage}"</p>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => handleAcceptRequest(selectedConversation)}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Accept & Start Chat
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(selectedConversation)}
                      className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <X size={20} />
                      Decline Request
                    </button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      💡 Accepting will move this conversation to your direct messages where you can chat in real-time.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Direct Message Chat (Real-time - FUNCTIONAL)
              <div className="flex-1 flex flex-col">
                <Suspense fallback={
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading chat with {selectedConversation.name}...</p>
                    </div>
                  </div>
                }>
                <DirectMessageChat
                  ownId={currentUserId}
                  recipientId={selectedConversation.recipientId}
                  recipientName={selectedConversation.recipientName}
                  chatType="human"
                  className="h-full"
                  initialMessage={selectedConversation.lastMessage} // ✅ Pass the initial message
                />
                </Suspense>
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium mb-2">
                  {activeTab === 'requests' ? 'Select a Request' : 'Your Messages'}
                </p>
                <p className="text-gray-400 text-sm">
                  {activeTab === 'requests' 
                    ? 'Choose a message request to review'
                    : 'Select a conversation to start messaging'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesComponent;