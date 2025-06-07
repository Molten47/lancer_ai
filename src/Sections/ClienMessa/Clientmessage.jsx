import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Phone, Video, MoreHorizontal, Send, Bot, User, Menu, ArrowLeft, X } from 'lucide-react';

// Frontend simulation: A dummy ID for the current "client" user
const OWN_ID = 'client-johndoe'; // This will represent the currently logged-in user

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState('');
  const [selectedChatType, setSelectedChatType] = useState('hiring'); // Default chat type
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set()); // This will now be simulated or manually controlled
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
  const messagesEndRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [allMessages, setAllMessages] = useState({}); // Stores dummy fetched and simulated real-time messages

  // --- Frontend Simulation: Initial Conversations and Messages ---
  useEffect(() => {
    // Dummy data for initial client view of conversations.
    // In a real frontend-only scenario, these would be hardcoded or loaded from a local JSON/context.
    const initialConversations = [
      { id: 'lancer-ai', name: 'Lancer AI', avatar: 'AI', avatarBg: 'bg-blue-500', lastMessage: 'Ask me anything!', time: 'now', unread: 0, isOnline: true, isBot: true, chatType: 'platform' },
      { id: 'deandre', name: 'DeAndre', avatar: 'D', avatarBg: 'bg-purple-500', lastMessage: 'The graphics look amazing!', time: '2h', unread: 0, isOnline: true, isBot: false, chatType: 'hiring' },
      { id: 'peter', name: 'Peter Roseline', avatar: 'P', avatarBg: 'bg-green-500', lastMessage: 'Perfect!', time: '1d', unread: 0, isOnline: false, isBot: false, chatType: 'custom' },
      { id: 'sarah', name: 'Sarah Mitchell', avatar: 'S', avatarBg: 'bg-pink-500', lastMessage: 'Can you send me the updated wireframes?', time: '2d', unread: 0, isOnline: true, isBot: false, chatType: 'hiring' },
      { id: 'mike', name: 'Mike Johnson', avatar: 'M', avatarBg: 'bg-indigo-500', lastMessage: 'Thanks for the quick turnaround!', time: '3d', unread: 0, isOnline: false, isBot: false, chatType: 'custom' }
    ];

    setConversations(initialConversations);

    // Dummy messages for each initial conversation
    const dummyMessages = {
      'lancer-ai': [
        { id: 'msg1_ai', sender: 'lancer-ai', content: 'Hello! How can I assist you today?', time: '09:00 AM', isOwn: false },
        { id: 'msg2_ai', sender: OWN_ID, content: 'Hi AI, I need some help with project management.', time: '09:01 AM', isOwn: true },
        { id: 'msg3_ai', sender: 'lancer-ai', content: 'Certainly! What specifically would you like to know about project management?', time: '09:02 AM', isOwn: false },
      ],
      'deandre': [
        { id: 'msg1_d', sender: 'deandre', content: 'Hey, just finished the first draft of the designs!', time: '10:00 AM', isOwn: false },
        { id: 'msg2_d', sender: OWN_ID, content: 'Awesome! Can you send them over?', time: '10:01 AM', isOwn: true },
        { id: 'msg3_d', sender: 'deandre', content: 'Sure, attaching them now. Let me know your thoughts.', time: '10:02 AM', isOwn: false },
        { id: 'msg4_d', sender: 'deandre', content: 'The graphics look amazing!', time: '10:03 AM', isOwn: false },
      ],
      'peter': [
        { id: 'msg1_p', sender: OWN_ID, content: 'Hope you are doing well with the project.', time: 'yesterday', isOwn: true },
        { id: 'msg2_p', sender: 'peter', content: 'Perfect!', time: 'yesterday', isOwn: false },
      ],
      'sarah': [
        { id: 'msg1_s', sender: 'sarah', content: 'Can you send me the updated wireframes?', time: '2 days ago', isOwn: false },
      ],
      'mike': [
        { id: 'msg1_m', sender: OWN_ID, content: 'Just received the final report. Looks great!', time: '3 days ago', isOwn: true },
        { id: 'msg2_m', sender: 'mike', content: 'Thanks for the quick turnaround!', time: '3 days ago', isOwn: false },
      ],
    };
    setAllMessages(dummyMessages);

    // Set the first conversation as active if none is selected
    if (initialConversations.length > 0 && !selectedChat) {
      setSelectedChat(initialConversations[0].id);
      setSelectedChatType(initialConversations[0].chatType);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Scroll to bottom when new messages arrive or chat changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, selectedChat]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && !event.target.closest('.sidebar-container') && !event.target.closest('.sidebar-toggle')) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  // Frontend-only: Simulate sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && OWN_ID && selectedChat) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newMsgForUI = {
        id: Date.now(), // Unique ID for frontend
        sender: OWN_ID,
        content: newMessage.trim(),
        time: timestamp,
        isOwn: true,
      };

      setAllMessages(prev => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), newMsgForUI]
      }));

      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedChat
            ? { ...conv, lastMessage: newMessage.trim(), time: 'now' }
            : conv
        )
      );

      setNewMessage('');

      // Optional: Simulate a response from the "other" user (e.g., AI or another freelancer)
      if (selectedChat === 'lancer-ai') {
        setTimeout(() => {
          const aiResponse = {
            id: Date.now() + 1,
            sender: 'lancer-ai',
            content: `Thanks for your message: "${newMsgForUI.content}". I'm a frontend AI, so I'll process this mentally!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: false,
          };
          setAllMessages(prev => ({
            ...prev,
            [selectedChat]: [...(prev[selectedChat] || []), aiResponse]
          }));
          setConversations(prev =>
            prev.map(conv =>
              conv.id === selectedChat
                ? { ...conv, lastMessage: aiResponse.content, time: 'now' }
                : conv
            )
          );
        }, 1000); // Simulate AI response after 1 second
      }
    }
  };

  // Frontend-only: Simulate typing status
  const handleTyping = () => {
    // This function can be used to visually show a typing indicator if desired,
    // but it won't communicate with a backend for real-time updates.
    // For a basic frontend, we can just clear it after a short delay to simulate "stopped typing".
    if (newMessage.length > 0) {
      setTypingUsers(prev => new Set([...prev, activeChat?.id])); // Simulate other user typing
      setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(activeChat?.id);
          return newSet;
        });
      }, 3000); // Typing indicator disappears after 3 seconds
    }
  };

  const handleChatSelect = (chatId, chatType) => {
    setSelectedChat(chatId);
    setSelectedChatType(chatType); // Update the chat type when selecting
    setIsSidebarOpen(false); // Close sidebar on mobile when chat is selected
    // Mark messages as read
    setConversations(prev =>
      prev.map(conv =>
        conv.id === chatId ? { ...conv, unread: 0 } : conv
      )
    );
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const activeChat = conversations.find(conv => conv.id === selectedChat);
  const messages = allMessages[selectedChat] || [];
  // `isTyping` now checks if the OTHER person in the active chat is typing (simulated)
  const isTyping = typingUsers.has(activeChat?.id);

  return (
    <div className="flex h-full bg-white basic-font relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />
      )}

      {/* Left sidebar - Conversations list */}
      <div className={`sidebar-container w-80 lg:w-80 border-r border-gray-200 flex flex-col bg-white z-50 fixed lg:relative inset-y-0 left-0 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 mt-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Messages (Client)</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex space-x-6">
            <button className="flex items-center space-x-2 text-blue-600 border-b-2 border-blue-600 pb-1">
              <span className="text-sm font-medium">All</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
              <Bot size={16} />
              <span className="text-sm">AI</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
              <User size={16} />
              <span className="text-sm">Freelancer</span>
            </button>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">No conversations yet.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleChatSelect(conv.id, conv.chatType)}
                className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                  selectedChat === conv.id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    {conv.isBot ? (
                      <div className={`w-10 h-10 ${conv.avatarBg} rounded-full flex items-center justify-center`}>
                        <Bot size={16} className="text-white" />
                      </div>
                    ) : (
                      <div className={`w-10 h-10 ${conv.avatarBg} rounded-full flex items-center justify-center`}>
                        <span className="text-white text-sm font-medium">
                          {conv.avatar}
                        </span>
                      </div>
                    )}
                    {conv.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conv.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{conv.time}</span>
                        {conv.unread > 0 && (
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">{conv.unread}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {isTyping && selectedChat === conv.id ? (
                        <span className="italic text-blue-600">typing...</span>
                      ) : (
                        conv.lastMessage
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right side - Chat area */}
      <div className="flex-1 flex flex-col lg:ml-0 w-full">
        {/* Chat header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className="sidebar-toggle lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu size={20} className="text-gray-600" />
              </button>

              <div className="relative">
                {activeChat?.isBot ? (
                  <div className={`w-10 h-10 ${activeChat.avatarBg} rounded-full flex items-center justify-center`}>
                    <Bot size={16} className="text-white" />
                  </div>
                ) : (
                  <div className={`w-10 h-10 ${activeChat?.avatarBg} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-sm font-medium">
                      {activeChat?.avatar}
                    </span>
                  </div>
                )}
                {activeChat?.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">{activeChat?.name || 'Select a chat'}</h3>
                <p className="text-xs sm:text-sm text-green-600">
                  {isTyping ? 'typing...' : (activeChat?.isOnline ? 'Online' : 'Offline')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Phone size={16} className="text-gray-600 sm:w-5 sm:h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Video size={16} className="text-gray-600 sm:w-5 sm:h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal size={16} className="text-gray-600 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-[#F9FAFB]">
          {!selectedChat ? (
            <p className="text-center text-gray-500">Please select a chat to view messages.</p>
          ) : messages.length === 0 && selectedChatType !== 'platform' ? (
            <p className="text-center text-gray-500">No messages in this chat yet. Start a conversation!</p>
          ) : messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] sm:max-w-md ${message.isOwn ? 'order-2' : 'order-1'}`}>
                {!message.isOwn && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-6 h-6 ${activeChat?.avatarBg || 'bg-gray-400'} rounded-full flex items-center justify-center`}>
                      {activeChat?.isBot ? (
                        <Bot size={12} className="text-white" />
                      ) : (
                        <span className="text-white text-xs">{activeChat?.avatar}</span>
                      )}
                    </div>
                  </div>
                )}
                <div
                  className={`px-3 sm:px-4 py-4 sm:py-6 rounded-2xl ${
                    message.isOwn
                      ? 'bg-[#4F46E5] text-white rounded-br-md'
                      : 'bg-[#F3F4F6] text-[#111827] border border-gray-200 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator (only for active chat) */}
          {isTyping && activeChat && (
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-md">
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-6 h-6 ${activeChat?.avatarBg || 'bg-gray-400'} rounded-full flex items-center justify-center`}>
                    {activeChat?.isBot ? (
                      <Bot size={12} className="text-white" />
                    ) : (
                      <span className="text-white text-xs">{activeChat?.avatar}</span>
                    )}
                  </div>
                </div>
                <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping(); // Emit typing event on change (frontend only)
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(e);
                }
              }}
              placeholder="Send a Message..."
              className="flex-1 px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <button
              onClick={handleSendMessage}
              className="p-2.5 sm:p-3 bg-cyan-500 hover:bg-cyan-600 rounded-full transition-colors"
            >
              <Send size={16} className="text-white sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;