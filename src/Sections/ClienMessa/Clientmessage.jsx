import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Phone, Video, MoreHorizontal, Send, Bot, User } from 'lucide-react';
import io from 'socket.io-client'; // Import Socket.IO client

// IMPORTANT: Replace with the actual authenticated client's ID
const own_id = 'your_current_client_id'; // e.g., 'client-johndoe' or 'user456'
// IMPORTANT: Replace with your backend's base URL for API and Socket.IO
const API_BASE_URL = 'http://127.0.0.1:5000'; // Your backend API base URL
const SOCKET_IO_SERVER_URL = 'http://localhost:8080'; // Your Socket.IO server URL

let socket; // Declare socket outside to persist connection or manage it in a context

const Messages = () => {
  // We'll set a default selected chat in useEffect based on initial conversations
  const [selectedChat, setSelectedChat] = useState('');
  // Client side will likely initiate 'hiring' or 'custom' chats with freelancers
  // And 'platform' chats with AI.
  const [selectedChatType, setSelectedChatType] = useState('hiring'); // Default chat type
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const [conversations, setConversations] = useState([]); // Will be populated by API or initial dummy data
  const [allMessages, setAllMessages] = useState({}); // Stores fetched and real-time messages

  // --- Socket.IO Connection and Event Handling ---
  useEffect(() => {
    if (!OWN_ID) {
      console.warn('OWN_ID is not set. Cannot establish Socket.IO connection.');
      return;
    }

    const token = localStorage.getItem('jwt_token'); // Get JWT token

    if (!token) {
      console.error('No JWT token found. Socket.IO connection aborted.');
      return;
    }

    socket = io(SOCKET_IO_SERVER_URL, {
      query: { token: token }, // Pass JWT as query parameter
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected as Client:', socket.id);
      socket.emit('joinUserRoom', own_id); // Join a user-specific room
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected as Client.');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error for Client:', err.message);
    });

    socket.on('receiveMessage', (message) => {
      console.log('Client received real-time message:', message);
      // Backend message structure example: { sender_id, recipient_id, message_content, timestamp, chat_type }
      const formattedMsg = {
        id: message.id || Date.now(),
        sender: message.sender_id,
        content: message.message_content,
        time: new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: message.sender_id === OWN_ID, // Determine if it's the client's own message
      };

      setAllMessages(prev => {
        // The chatKey needs to be the ID of the OTHER party in the conversation
        const chatKey = formattedMsg.isOwn ? message.recipient_id : message.sender_id;
        return {
          ...prev,
          [chatKey]: [...(prev[chatKey] || []), formattedMsg]
        };
      });

      // Update conversation list for the last message received
      setConversations(prev =>
        prev.map(conv => {
          // Find the conversation related to the sender/recipient of the incoming message
          if (conv.id === formattedMsg.sender || conv.id === formattedMsg.recipient_id) {
            return {
              ...conv,
              lastMessage: formattedMsg.content,
              time: 'now',
              unread: conv.id !== selectedChat ? (conv.unread || 0) + 1 : 0, // Increment unread if not selected
            };
          }
          return conv;
        })
      );
    });

    socket.on('typing', ({ userId, chatId }) => {
      // Only show typing if the other user is typing in the currently selected chat
      if (chatId === selectedChat && userId !== OWN_ID) {
        setTypingUsers(prev => new Set([...prev, userId]));
        setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        }, 3000); // Adjust duration as needed
      }
    });

    return () => {
      if (socket) {
        console.log('Disconnecting Socket.IO Client');
        socket.disconnect();
      }
    };
  }, [OWN_ID, selectedChat]); // selectedChat dependency ensures typing indicators are current

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
      console.log(`Client fetched data for ${recipientId} (${chatType}):`, data);

      if (chatType === 'platform') {
        if (data.well_recieved) {
          console.log('Platform chat initiated successfully for client. No past messages returned.');
          setAllMessages(prev => ({ ...prev, [recipientId]: [] }));
        }
      } else { // 'hiring' or 'custom' chat types
        const formattedMessages = data.map(msg => ({
          id: msg.id || Date.now() + Math.random(),
          sender: msg.sender_tag, // Use sender_tag from backend
          content: msg.message_content,
          time: new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: msg.sender_tag === ownId, // Check if sender_tag matches client's ownId
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
            name: `User ${recipientId}`, // Placeholder: Needs actual user names/avatars
            avatar: recipientId.charAt(0).toUpperCase(),
            avatarBg: 'bg-gray-500',
            lastMessage: chatType !== 'platform' && data.length > 0 ? data[data.length - 1].message_content : (chatType === 'platform' ? 'Platform chat' : 'No messages yet.'),
            time: chatType !== 'platform' && data.length > 0 ? new Date(data[data.length - 1].timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            unread: 0,
            isOnline: false, // Placeholder
            isBot: recipientId.includes('ai'),
            chatType: chatType // Store chat type
          };
          return [...prevConversations, newConv];
        }
        return prevConversations.map(conv =>
          conv.id === recipientId
            ? {
                ...conv,
                lastMessage: chatType !== 'platform' && data.length > 0 ? data[data.length - 1].message_content : conv.lastMessage,
                time: chatType !== 'platform' && data.length > 0 ? new Date(data[data.length - 1].timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : conv.time,
                unread: 0, // Mark as read when selected
                chatType: chatType
              }
            : conv
        );
      });

    } catch (error) {
      console.error('Network or parsing error for client:', error);
      setAllMessages(prev => ({ ...prev, [recipientId]: [] }));
    }
  }, [OWN_ID]);

  // Effect to fetch messages when selected chat or chat type changes
  useEffect(() => {
    if (selectedChat && selectedChatType) {
      fetchMessages(selectedChatType, OWN_ID, selectedChat);
    }
  }, [selectedChat, selectedChatType, fetchMessages]);


  // Initial load: Set a default selected chat and type if conversations are empty
  useEffect(() => {
    if (OWN_ID && conversations.length === 0) {
      // Dummy data for initial client view.
      // In a real app, this would be fetched from an API endpoint for user's conversations.
      setConversations([
        { id: 'lancer-ai', name: 'Lancer AI', avatar: 'AI', avatarBg: 'bg-blue-500', lastMessage: 'Ask me anything!', time: 'now', unread: 0, isOnline: true, isBot: true, chatType: 'platform' },
        { id: 'deandre', name: 'DeAndre', avatar: 'D', avatarBg: 'bg-purple-500', lastMessage: 'The graphics look amazing!', time: '2h', unread: 0, isOnline: true, isBot: false, chatType: 'hiring' },
        { id: 'peter', name: 'Peter Roseline', avatar: 'P', avatarBg: 'bg-green-500', lastMessage: 'Perfect!', time: '1d', unread: 0, isOnline: false, isBot: false, chatType: 'custom' },
        { id: 'sarah', name: 'Sarah Mitchell', avatar: 'S', avatarBg: 'bg-pink-500', lastMessage: 'Can you send me the updated wireframes?', time: '2d', unread: 0, isOnline: true, isBot: false, chatType: 'hiring' },
        { id: 'mike', name: 'Mike Johnson', avatar: 'M', avatarBg: 'bg-indigo-500', lastMessage: 'Thanks for the quick turnaround!', time: '3d', unread: 0, isOnline: false, isBot: false, chatType: 'custom' }
      ]);
    }
    // Set the first conversation as active if none is selected
    if (conversations.length > 0 && !selectedChat) {
      setSelectedChat(conversations[0].id);
      setSelectedChatType(conversations[0].chatType);
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
        recipientId: selectedChat, // The person receiving the message
        chatType: selectedChatType, // The type of chat
        messageContent: newMessage.trim(),
        // Backend will add sender_id (OWN_ID), timestamp, etc.
      };

      console.log('Client emitting sendMessage:', messagePayload);
      socket.emit('sendMessage', messagePayload);

      // Optimistically add the message to the UI
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

      setNewMessage('');
    }
  };

  // --- Typing Indicator Logic (for real-time) ---
  const handleTyping = () => {
    if (socket && OWN_ID && selectedChat) {
      // Emit typing event to the server
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
  // `isTyping` now checks if the OTHER person in the active chat is typing
  const isTyping = typingUsers.has(activeChat?.id);


  return (
    <div className="flex h-full bg-white basic-font">
      {/* Left sidebar - Conversations list */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 mt-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Messages (Client)</h2>

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
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
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
                <h3 className="font-medium text-gray-900">{activeChat?.name || 'Select a chat'}</h3>
                <p className="text-sm text-green-600">
                  {isTyping ? 'typing...' : (activeChat?.isOnline ? 'Online' : 'Offline')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Phone size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Video size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9FAFB]">
          {!selectedChat ? (
            <p className="text-center text-gray-500">Please select a chat to view messages.</p>
          ) : messages.length === 0 && selectedChatType !== 'platform' ? (
            <p className="text-center text-gray-500">No messages in this chat yet. Start a conversation!</p>
          ) : messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-md ${message.isOwn ? 'order-2' : 'order-1'}`}>
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
                  className={`px-4 py-6 rounded-2xl ${
                    message.isOwn
                      ? 'bg-[#4F46E5] text-white rounded-br-md'
                      : 'bg-[#F3F4F6] text-[#111827] border border-gray-200 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
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
              <div className="max-w-md">
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
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping(); // Emit typing event on change
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(e);
                }
              }}
              placeholder="Send a Message..."
              className="flex-1 px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-cyan-500 hover:bg-cta rounded-full transition-colors"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;