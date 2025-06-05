import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Phone, Video, MoreHorizontal, Send, Bot, User } from 'lucide-react';
import io from 'socket.io-client'; // Import Socket.IO client

// IMPORTANT: Replace with the actual authenticated user's ID
const OWN_ID = 'your_current_user_id'; // e.g., 'freelancer-besamad' or 'user123'
// IMPORTANT: Replace with your backend's base URL for API and Socket.IO
const API_BASE_URL = 'http://127.0.0.1:5000'; // Your backend API base URL
const SOCKET_IO_SERVER_URL = 'http://localhost:8080'; // Your Socket.IO server URL

let socket; // Declare socket outside to persist connection or manage it in a context

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(''); // Start with no chat selected or a default one
  const [selectedChatType, setSelectedChatType] = useState('hiring'); // Default chat type for fetching past messages
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set()); // Still useful for real-time typing indicators
  const messagesEndRef = useRef(null);

  const [allMessages, setAllMessages] = useState({}); // Stores fetched and real-time messages
  const [conversations, setConversations] = useState([]); // List of conversations

  // --- Socket.IO Connection and Event Handling ---
  useEffect(() => {
    if (!OWN_ID) {
      console.warn('OWN_ID is not set. Cannot establish Socket.IO connection.');
      return;
    }

    // Connect to Socket.IO server
    const token = localStorage.getItem('jwt_token'); // Get JWT token

    if (!token) {
      console.error('No JWT token found. Socket.IO connection aborted.');
      return;
    }

    // Connect with JWT for authentication
    socket = io(SOCKET_IO_SERVER_URL, {
      query: { token: token }, // Pass JWT as query parameter
      // You might also need to add transports: ['websocket'] depending on your server setup
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
      // Once connected, you might want to join a user-specific room
      socket.emit('joinUserRoom', OWN_ID);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected.');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err.message);
      // Handle connection errors (e.g., token invalid, server down)
    });

    // Listen for incoming messages
    socket.on('receiveMessage', (message) => {
      console.log('Received real-time message:', message);
      // Ensure the message format from Socket.IO matches the frontend's needs
      // Backend message structure example: { sender_id, recipient_id, message_content, timestamp }
      const formattedMsg = {
        id: message.id || Date.now(), // Use backend ID if available, fallback to timestamp
        sender: message.sender_id,
        content: message.message_content,
        time: new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: message.sender_id === OWN_ID,
      };

      // Update messages for the relevant chat
      setAllMessages(prev => {
        const chatKey = formattedMsg.isOwn ? message.recipient_id : message.sender_id;
        return {
          ...prev,
          [chatKey]: [...(prev[chatKey] || []), formattedMsg]
        };
      });

      // Update conversation list for the last message
      setConversations(prev =>
        prev.map(conv => {
          if (conv.id === formattedMsg.sender || conv.id === formattedMsg.recipient_id) { // Check both sender/recipient
            return { ...conv, lastMessage: formattedMsg.content, time: 'now', unread: conv.id !== selectedChat ? (conv.unread || 0) + 1 : 0 };
          }
          return conv;
        })
      );
    });

    // You can also listen for typing indicators
    socket.on('typing', ({ userId, chatId }) => {
      if (chatId === selectedChat && userId !== OWN_ID) {
        setTypingUsers(prev => new Set([...prev, userId]));
        // Clear typing indicator after a short delay
        setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        }, 3000); // Adjust duration as needed
      }
    });

    // Clean up on component unmount
    return () => {
      if (socket) {
        console.log('Disconnecting Socket.IO');
        socket.disconnect();
      }
    };
  }, [OWN_ID, selectedChat]); // Re-run if OWN_ID changes or selectedChat (though less common for re-connect)


  // --- API Integration: Fetch Past Messages ---
  const fetchMessages = useCallback(async (chatType, ownId, recipientId) => {
    if (!chatType || !ownId || !recipientId) return;

    try {
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        console.error('No JWT token found. User might not be authenticated.');
        alert('Session expired or unauthorized. Please log in again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/${chatType}/${ownId}/${recipientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error fetching messages for ${recipientId} (${chatType}):`, response.status, errorData);
        if (response.status === 401) {
          alert('Session expired or unauthorized. Please log in again.');
        } else if (response.status === 400) {
          alert(`Error: ${errorData.message || 'Unrecognized chat type.'}`);
        }
        setAllMessages(prev => ({ ...prev, [recipientId]: [] }));
        return;
      }

      const data = await response.json();
      console.log(`Fetched data for ${recipientId} (${chatType}):`, data);

      if (chatType === 'platform') {
        // For platform chat, the GET might just indicate success and not return messages
        if (data.well_recieved) {
          console.log('Platform chat initiated successfully. No past messages returned.');
          setAllMessages(prev => ({ ...prev, [recipientId]: [] })); // Ensure empty array if no messages
        }
      } else { // 'hiring' or 'custom' chat types
        // Backend returns an array of messages based on schema "$ref": "#/definitions/message"
        // Based on your example, assuming: { message_content, sender_tag }
        const formattedMessages = data.map(msg => ({
          id: msg.id || Date.now() + Math.random(), // Assuming backend sends an ID, or generate one
          sender: msg.sender_tag, // Use sender_tag as sender ID
          content: msg.message_content,
          time: new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Backend should provide timestamp
          isOwn: msg.sender_tag === ownId, // Check if sender_tag matches ownId
        }));
        setAllMessages(prev => ({
          ...prev,
          [recipientId]: formattedMessages,
        }));
      }

      // Update or add this chat to conversations list
      setConversations(prevConversations => {
        const chatExists = prevConversations.some(conv => conv.id === recipientId);
        if (!chatExists) {
          const newConv = {
            id: recipientId,
            name: `User ${recipientId}`, // Placeholder: You'll need real names/avatars from another API
            avatar: recipientId.charAt(0).toUpperCase(),
            avatarBg: 'bg-gray-500', // Placeholder color
            lastMessage: chatType !== 'platform' && data.length > 0 ? data[data.length - 1].message_content : (chatType === 'platform' ? 'Platform chat' : 'No messages yet.'),
            time: chatType !== 'platform' && data.length > 0 ? new Date(data[data.length - 1].timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            unread: 0,
            isOnline: false, // Placeholder, will come from real-time status or user profiles
            isBot: recipientId.includes('ai'),
            chatType: chatType // Store chat type for future use
          };
          return [...prevConversations, newConv];
        }
        // Update last message and time for existing chat, if messages were returned
        return prevConversations.map(conv =>
          conv.id === recipientId
            ? {
                ...conv,
                lastMessage: chatType !== 'platform' && data.length > 0 ? data[data.length - 1].message_content : conv.lastMessage,
                time: chatType !== 'platform' && data.length > 0 ? new Date(data[data.length - 1].timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : conv.time,
                unread: 0, // Mark as read when selected
                chatType: chatType // Ensure chat type is updated
              }
            : conv
        );
      });

    } catch (error) {
      console.error('Network or parsing error:', error);
      setAllMessages(prev => ({ ...prev, [recipientId]: [] }));
    }
  }, [OWN_ID]);

  // Effect to fetch messages when selected chat or chat type changes
  useEffect(() => {
    if (selectedChat && selectedChatType) {
      fetchMessages(selectedChatType, OWN_ID, selectedChat);
    }
  }, [selectedChat, selectedChatType, fetchMessages]);

  // Initial load: Set a default selected chat and type (e.g., 'deandre' with 'hiring')
  useEffect(() => {
    // This is a dummy example. In a real app, you'd load conversation history
    // or select a default chat from a user's settings.
    if (OWN_ID && conversations.length === 0) { // If no conversations loaded yet, add some initial dummy ones
      // This part is for initial UI population and should be replaced by actual data fetch
      // if you have an API that returns a list of *all* user's conversations.
      setConversations([
        { id: 'lancer-ai', name: 'Lancer AI', avatar: 'AI', avatarBg: 'bg-blue-500', lastMessage: 'Ask me anything!', time: 'now', unread: 0, isOnline: true, isBot: true, chatType: 'platform' },
        { id: 'deandre', name: 'DeAndre', avatar: 'D', avatarBg: 'bg-purple-500', lastMessage: 'Waiting for your reply...', time: '1m', unread: 0, isOnline: true, isBot: false, chatType: 'hiring' },
        { id: 'peter', name: 'Peter Roseline', avatar: 'P', avatarBg: 'bg-green-500', lastMessage: 'Last msg here.', time: '2h', unread: 0, isOnline: false, isBot: false, chatType: 'custom' },
      ]);
    }
    if (conversations.length > 0 && !selectedChat) {
        setSelectedChat(conversations[0].id); // Select the first one
        setSelectedChatType(conversations[0].chatType); // Set its type
    }
  }, [OWN_ID, conversations, selectedChat]);


  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, selectedChat]);

  // --- Send Message via Socket.IO ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && OWN_ID && selectedChat && socket) {
      const messagePayload = {
        recipientId: selectedChat,
        chatType: selectedChatType, // Send the current chat type with the message
        messageContent: newMessage.trim(),
        // Other fields like timestamp can be added by the backend
      };

      console.log('Emitting sendMessage:', messagePayload);
      socket.emit('sendMessage', messagePayload); // Emit the message via Socket.IO

      // Optimistically add the message to the UI
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newMsgForUI = {
        id: Date.now(), // Client-side ID, will be replaced by backend ID once confirmed
        sender: OWN_ID, // 'me' or OWN_ID
        content: newMessage.trim(),
        time: timestamp,
        isOwn: true,
      };

      setAllMessages(prev => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), newMsgForUI]
      }));

      // Update last message in conversations list
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedChat
            ? { ...conv, lastMessage: newMessage.trim(), time: 'now' }
            : conv
        )
      );

      setNewMessage('');

      // Optionally, emit a typing stop event if you have one
      // socket.emit('typingStop', { userId: OWN_ID, chatId: selectedChat });
    }
  };

  // --- Typing Indicator Logic (optional, for real-time) ---
  const handleTyping = () => {
    if (socket && OWN_ID && selectedChat) {
      // You might want to debounce this or only send it if user actually types after a pause
      socket.emit('typing', { userId: OWN_ID, chatId: selectedChat });
    }
  };


  const handleChatSelect = (chatId, chatType) => {
    setSelectedChat(chatId);
    setSelectedChatType(chatType); // Update the chat type when selecting
    // Mark messages as read
    setConversations(prev =>
      prev.map(conv =>
        conv.id === chatId ? { ...conv, unread: 0 } : conv
      )
    );
  };

  const activeChat = conversations.find(conv => conv.id === selectedChat);
  const messages = allMessages[selectedChat] || [];
  const isTyping = typingUsers.has(selectedChat);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
   <div className="flex h-full bg-white basic-font">
    {/* Mobile overlay */}
    {isMobileMenuOpen && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
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
              handleTyping();
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