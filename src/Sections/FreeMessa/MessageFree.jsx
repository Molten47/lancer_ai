import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Phone, Video, MoreHorizontal, Send, Bot, User } from 'lucide-react';
// import io from 'socket.io-client'; 

// IMPORTANT: For frontend presentation, define a static OWN_ID
const OWN_ID = 'your_current_user_id'; // e.g., 'freelancer-besamad' or 'user123'

// Backend URLs are no longer needed
// const API_BASE_URL = 'http://127.0.0.1:5000';
// const SOCKET_IO_SERVER_URL = 'http://localhost:8080';

// let socket; // Socket declared outside, but now effectively removed

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState('');
  const [selectedChatType, setSelectedChatType] = useState('hiring');
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set()); // Still useful for simulated typing indicators
  const messagesEndRef = useRef(null);

  const [allMessages, setAllMessages] = useState({}); // Stores dummy messages
  const [conversations, setConversations] = useState([]); // List of dummy conversations

  // --- REPLACED: Socket.IO Connection and Event Handling (now dummy) ---
  useEffect(() => {
    // In a no-backend scenario, we don't connect to Socket.IO.
    // We'll simulate typing indicators for active chats.
    const simulateTyping = () => {
        if (selectedChat && selectedChat !== OWN_ID && Math.random() > 0.5) { // Simulate 50% chance of typing
            setTypingUsers(prev => new Set([...prev, selectedChat]));
            setTimeout(() => {
                setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(selectedChat);
                    return newSet;
                });
            }, 3000); // Typing for 3 seconds
        }
    };

    // Simulate an incoming message after a delay for non-AI chats
    const simulateIncomingMessage = (chatId, type, originalMessage) => {
        if (type !== 'platform') { // Only simulate for non-AI chats
            setTimeout(() => {
                const simulatedSender = conversations.find(conv => conv.id === chatId)?.name || 'Someone';
                const dummyMessage = {
                    id: Date.now() + 1, // Unique ID
                    sender: chatId, // The other person
                    content: `Thanks for your message: "${originalMessage.substring(0, 30)}${originalMessage.length > 30 ? '...' : ''}"`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isOwn: false,
                };

                setAllMessages(prev => ({
                    ...prev,
                    [chatId]: [...(prev[chatId] || []), dummyMessage]
                }));

                setConversations(prev =>
                    prev.map(conv =>
                        conv.id === chatId
                            ? { ...conv, lastMessage: dummyMessage.content, time: 'now', unread: conv.id !== selectedChat ? (conv.unread || 0) + 1 : 0 }
                            : conv
                    )
                );
            }, 1500); // Simulate a delay for response
        } else { // For AI chat, provide a more AI-like response
            setTimeout(() => {
                const aiResponses = [
                    "Hello! How can I assist you today?",
                    "I received your message. What do you need help with regarding freelancers or projects?",
                    "That's an interesting question! What would you like to know?",
                    "I'm here to help you navigate the platform. What's on your mind?",
                ];
                const dummyMessage = {
                    id: Date.now() + 1,
                    sender: 'lancer-ai',
                    content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isOwn: false,
                };
                setAllMessages(prev => ({
                    ...prev,
                    [chatId]: [...(prev[chatId] || []), dummyMessage]
                }));
                setConversations(prev =>
                    prev.map(conv =>
                        conv.id === chatId
                            ? { ...conv, lastMessage: dummyMessage.content, time: 'now', unread: conv.id !== selectedChat ? (conv.unread || 0) + 1 : 0 }
                            : conv
                    )
                );
            }, 1000);
        }
    };


    // Clean up function for effects - removed socket disconnect
    return () => {
      // No socket to disconnect
    };
  }, [selectedChat, conversations]); // Dependencies remain to update effects

  // --- REPLACED: API Integration: Fetch Past Messages (now dummy data) ---
  const fetchMessages = useCallback(async (chatType, ownId, recipientId) => {
    // Dummy messages for demonstration
    const dummyMessages = {
      'lancer-ai': [
        { id: 1, sender: 'lancer-ai', content: 'Welcome! How can I help you with your projects?', time: '10:00 AM', isOwn: false },
        { id: 2, sender: OWN_ID, content: 'Hi AI, I need some help finding a designer.', time: '10:05 AM', isOwn: true },
        { id: 3, sender: 'lancer-ai', content: 'Great! What kind of design are you looking for?', time: '10:06 AM', isOwn: false },
      ],
      'deandre': [
        { id: 1, sender: 'deandre', content: 'Hey, are you free for a quick call?', time: '09:30 AM', isOwn: false },
        { id: 2, sender: OWN_ID, content: 'Yes, I am! What did you want to discuss?', time: '09:35 AM', isOwn: true },
        { id: 3, sender: 'deandre', content: 'About the new project scope.', time: '09:36 AM', isOwn: false },
        { id: 4, sender: OWN_ID, content: 'Sounds good. Send me the details.', time: '09:37 AM', isOwn: true },
      ],
      'peter': [
        { id: 1, sender: 'peter', content: 'Thanks for the update!', time: 'Yesterday', isOwn: false },
        { id: 2, sender: OWN_ID, content: 'No problem, glad to help.', time: 'Yesterday', isOwn: true },
      ],
      'sarah': [
        { id: 1, sender: 'sarah', content: 'Could you review the latest draft?', time: '2 days ago', isOwn: false },
      ],
      'mike': [
        { id: 1, sender: 'mike', content: 'Looking forward to seeing the final product!', time: '3 days ago', isOwn: false },
      ],
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Update allMessages with dummy data for the selected chat
    setAllMessages(prev => ({
      ...prev,
      [recipientId]: dummyMessages[recipientId] || [],
    }));

    // Update or add this chat to conversations list if not already there
    setConversations(prevConversations => {
        const chatExists = prevConversations.some(conv => conv.id === recipientId);
        if (!chatExists) {
            const newConv = {
                id: recipientId,
                name: `User ${recipientId.charAt(0).toUpperCase() + recipientId.slice(1)}`, // Simple capitalization
                avatar: recipientId.charAt(0).toUpperCase(),
                avatarBg: 'bg-gray-500',
                lastMessage: 'No messages yet.',
                time: '',
                unread: 0,
                isOnline: true, // Assume online for demo
                isBot: recipientId.includes('ai'),
                chatType: chatType
            };
            return [...prevConversations, newConv];
        }
        // If chat exists, just ensure unread is 0 and chatType is correct
        return prevConversations.map(conv =>
            conv.id === recipientId
                ? { ...conv, unread: 0, chatType: chatType }
                : conv
        );
    });

  }, []); // No dependencies for this dummy version

  // Effect to "fetch" messages when selected chat or chat type changes
  useEffect(() => {
    if (selectedChat && selectedChatType) {
      fetchMessages(selectedChatType, OWN_ID, selectedChat);
    }
  }, [selectedChat, selectedChatType, fetchMessages]);

  // Initial load: Set a default selected chat and type
  useEffect(() => {
    if (OWN_ID && conversations.length === 0) {
      setConversations([
        { id: 'lancer-ai', name: 'Lancer AI', avatar: 'AI', avatarBg: 'bg-blue-500', lastMessage: 'Ask me anything!', time: 'now', unread: 0, isOnline: true, isBot: true, chatType: 'platform' },
        { id: 'deandre', name: 'DeAndre', avatar: 'D', avatarBg: 'bg-purple-500', lastMessage: 'Waiting for your reply...', time: '1m', unread: 0, isOnline: true, isBot: false, chatType: 'hiring' },
        { id: 'peter', name: 'Peter Roseline', avatar: 'P', avatarBg: 'bg-green-500', lastMessage: 'Last msg here.', time: '2h', unread: 0, isOnline: false, isBot: false, chatType: 'custom' },
        { id: 'sarah', name: 'Sarah Mitchell', avatar: 'S', avatarBg: 'bg-pink-500', lastMessage: 'Can you send me the updated wireframes?', time: '2d', unread: 0, isOnline: true, isBot: false, chatType: 'hiring' },
        { id: 'mike', name: 'Mike Johnson', avatar: 'M', avatarBg: 'bg-indigo-500', lastMessage: 'Thanks for the quick turnaround!', time: '3d', unread: 0, isOnline: false, isBot: false, chatType: 'custom' }
      ]);
    }
    if (conversations.length > 0 && !selectedChat) {
      setSelectedChat(conversations[0].id);
      setSelectedChatType(conversations[0].chatType);
    }
  }, [OWN_ID, conversations, selectedChat]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, selectedChat]);

  // --- Send Message (now client-side only) ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && OWN_ID && selectedChat) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newMsgForUI = {
        id: Date.now(),
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

      // Simulate a response from the "other" side
      const simulateIncomingMessage = (chatId, type, originalMessage) => {
          if (type !== 'platform') { // Only simulate for non-AI chats
              setTimeout(() => {
                  const simulatedSender = conversations.find(conv => conv.id === chatId)?.name || 'Someone';
                  const dummyMessage = {
                      id: Date.now() + 1, // Unique ID
                      sender: chatId, // The other person
                      content: `Thanks for your message: "${originalMessage.substring(0, 30)}${originalMessage.length > 30 ? '...' : ''}"`,
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      isOwn: false,
                  };

                  setAllMessages(prev => ({
                      ...prev,
                      [chatId]: [...(prev[chatId] || []), dummyMessage]
                  }));

                  setConversations(prev =>
                      prev.map(conv =>
                          conv.id === chatId
                              ? { ...conv, lastMessage: dummyMessage.content, time: 'now', unread: conv.id !== selectedChat ? (conv.unread || 0) + 1 : 0 }
                              : conv
                      )
                  );
              }, 1500); // Simulate a delay for response
          } else { // For AI chat, provide a more AI-like response
              setTimeout(() => {
                  const aiResponses = [
                      "Hello! How can I assist you today?",
                      "I received your message. What do you need help with regarding freelancers or projects?",
                      "That's an interesting question! What would you like to know?",
                      "I'm here to help you navigate the platform. What's on your mind?",
                  ];
                  const dummyMessage = {
                      id: Date.now() + 1,
                      sender: 'lancer-ai',
                      content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      isOwn: false,
                  };
                  setAllMessages(prev => ({
                      ...prev,
                      [chatId]: [...(prev[chatId] || []), dummyMessage]
                  }));
                  setConversations(prev =>
                      prev.map(conv =>
                          conv.id === chatId
                              ? { ...conv, lastMessage: dummyMessage.content, time: 'now', unread: conv.id !== selectedChat ? (conv.unread || 0) + 1 : 0 }
                              : conv
                      )
                  );
              }, 1000);
          }
      };

      simulateIncomingMessage(selectedChat, selectedChatType, newMessage.trim());

      setNewMessage('');
    }
  };

  // --- Typing Indicator Logic (now client-side simulated) ---
  const handleTyping = () => {
    // We don't emit to a backend anymore.
    // The typing indicator will be handled by the simulated incoming messages.
    // For a more advanced demo, you could simulate typing based on user input length.
  };

  const handleChatSelect = (chatId, chatType) => {
    setSelectedChat(chatId);
    setSelectedChatType(chatType);
    setConversations(prev =>
      prev.map(conv =>
        conv.id === chatId ? { ...conv, unread: 0 } : conv
      )
    );
  };

  const activeChat = conversations.find(conv => conv.id === selectedChat);
  const messages = allMessages[selectedChat] || [];
  // `isTyping` now relies only on the local state, which is updated by our simulation
  const isTyping = typingUsers.has(activeChat?.id);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-full bg-white basic-font">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left sidebar - Conversations list */}
      <div className={`
        w-80 border-r border-gray-200 flex flex-col
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        bg-white lg:bg-transparent
        ${isMobileMenuOpen ? 'w-full sm:w-80' : 'w-80'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 mt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Messages (Freelancer)</h2>
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
              <span className="text-sm">Clients</span>
            </button>
          </div>
        </div>

        {/* Conversations - same as before but with responsive padding */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-gray-500 text-center text-sm">No conversations yet.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  handleChatSelect(conv.id, conv.chatType);
                  setIsMobileMenuOpen(false); // Close mobile menu on selection
                }}
                className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                  selectedChat === conv.id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
                }`}
              >
                {/* Your existing conversation item content remains the same */}
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
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Chat header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="relative">
                {activeChat?.isBot ? (
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${activeChat.avatarBg} rounded-full flex items-center justify-center`}>
                    <Bot size={14} className="text-white sm:w-4 sm:h-4" />
                  </div>
                ) : (
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${activeChat?.avatarBg} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs sm:text-sm font-medium">
                      {activeChat?.avatar}
                    </span>
                  </div>
                )}
                {activeChat?.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                  {activeChat?.name || 'Select a chat'}
                </h3>
                <p className="text-xs sm:text-sm text-green-600">
                  {isTyping ? 'typing...' : (activeChat?.isOnline ? 'Online' : 'Offline')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Phone size={16} className="text-gray-600 sm:w-5 sm:h-5" />
              </button>
              <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Video size={16} className="text-gray-600 sm:w-5 sm:h-5" />
              </button>
              <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal size={16} className="text-gray-600 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-[#F9FAFB]">
          {!selectedChat ? (
            <p className="text-center text-gray-500 text-sm">Please select a chat to view messages.</p>
          ) : messages.length === 0 && selectedChatType !== 'platform' ? (
            <p className="text-center text-gray-500 text-sm">No messages in this chat yet. Start a conversation!</p>
          ) : messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] sm:max-w-md ${message.isOwn ? 'order-2' : 'order-1'}`}>
                {!message.isOwn && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 ${activeChat?.avatarBg || 'bg-gray-400'} rounded-full flex items-center justify-center`}>
                      {activeChat?.isBot ? (
                        <Bot size={10} className="text-white sm:w-3 sm:h-3" />
                      ) : (
                        <span className="text-white text-xs">{activeChat?.avatar}</span>
                      )}
                    </div>
                  </div>
                )}
                <div
                  className={`px-3 py-3 sm:px-4 sm:py-6 rounded-2xl ${
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

          {/* Typing indicator remains the same but with responsive sizing */}
          {isTyping && activeChat && (
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-md">
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 ${activeChat?.avatarBg || 'bg-gray-400'} rounded-full flex items-center justify-center`}>
                    {activeChat?.isBot ? (
                      <Bot size={10} className="text-white sm:w-3 sm:h-3" />
                    ) : (
                      <span className="text-white text-xs">{activeChat?.avatar}</span>
                    )}
                  </div>
                </div>
                <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-bl-md px-3 py-2 sm:px-4">
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
                // handleTyping(); // No longer needed for backend interaction, but could be used for local animation
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(e);
                }
              }}
              placeholder="Send a Message..."
              className="flex-1 px-3 py-3 sm:px-4 sm:py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 sm:p-2 bg-cyan-500 hover:bg-cta rounded-full transition-colors flex-shrink-0"
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