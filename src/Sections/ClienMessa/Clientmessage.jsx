import React, { useState, useRef, useEffect } from 'react';
import { Search, Phone, Video, MoreHorizontal, Send, Bot, User } from 'lucide-react';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState('deandre');
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([
    {
      id: 'lancer-ai',
      name: 'Lancer AI',
      avatar: 'AI',
      avatarBg: 'bg-blue-500',
      lastMessage: 'I can help you optimize your task workflow and provide suggestions for better productivity.',
      time: '14m',
      unread: 1,
      isOnline: true,
      isBot: true
    },
    {
      id: 'deandre',
      name: 'DeAndre',
      avatar: 'D',
      avatarBg: 'bg-purple-500',
      lastMessage: 'The graphics look amazing! Can we schedule a call to discuss the next phase?',
      time: '2h',
      unread: 2,
      isOnline: true,
      isBot: false
    },
    {
      id: 'peter',
      name: 'Peter Roseline',
      avatar: 'P',
      avatarBg: 'bg-green-500',
      lastMessage: 'Perfect! The blog content is exactly what I was looking for. Great work!',
      time: '1d',
      unread: 0,
      isOnline: false,
      isBot: false
    },
    {
      id: 'sarah',
      name: 'Sarah Mitchell',
      avatar: 'S',
      avatarBg: 'bg-pink-500',
      lastMessage: 'Can you send me the updated wireframes for the mobile app?',
      time: '2d',
      unread: 0,
      isOnline: true,
      isBot: false
    },
    {
      id: 'mike',
      name: 'Mike Johnson',
      avatar: 'M',
      avatarBg: 'bg-indigo-500',
      lastMessage: 'Thanks for the quick turnaround on the logo designs!',
      time: '3d',
      unread: 0,
      isOnline: false,
      isBot: false
    }
  ]);

  const [allMessages, setAllMessages] = useState({
    'deandre': [
      {
        id: 1,
        sender: 'deandre',
        content: 'Hi Besamad! I wanted to check on the progress of the website graphics.',
        time: '03:41 PM',
        isOwn: false
      },
      {
        id: 2,
        sender: 'me',
        content: 'Hi DeAndre! The graphics are coming along great. I should have the first draft ready by tomorrow.',
        time: '04:41 PM',
        isOwn: true
      },
      {
        id: 3,
        sender: 'deandre',
        content: 'The graphics look amazing! Can we schedule a call to discuss the next phase?',
        time: '05:41 PM',
        isOwn: false
      },
      {
        id: 4,
        sender: 'me',
        content: 'Absolutely! I\'m available tomorrow afternoon. What time works best for you?',
        time: '05:45 PM',
        isOwn: true
      },
      {
        id: 5,
        sender: 'deandre',
        content: 'How about 2 PM EST? We can discuss the color schemes and final revisions.',
        time: '05:47 PM',
        isOwn: false
      }
    ],
    'lancer-ai': [
      {
        id: 1,
        sender: 'lancer-ai',
        content: 'Hello Besamad! I\'m here to help you optimize your workflow. How can I assist you today?',
        time: '12:30 PM',
        isOwn: false
      },
      {
        id: 2,
        sender: 'me',
        content: 'Hi! I need help organizing my tasks better. Any suggestions?',
        time: '12:35 PM',
        isOwn: true
      },
      {
        id: 3,
        sender: 'lancer-ai',
        content: 'I can help you optimize your task workflow and provide suggestions for better productivity. Try prioritizing by deadline and client importance!',
        time: '12:36 PM',
        isOwn: false
      }
    ],
    'peter': [
      {
        id: 1,
        sender: 'peter',
        content: 'Hey Besamad, I reviewed the blog content you sent yesterday.',
        time: '10:15 AM',
        isOwn: false
      },
      {
        id: 2,
        sender: 'me',
        content: 'Great! What did you think? Any revisions needed?',
        time: '10:20 AM',
        isOwn: true
      },
      {
        id: 3,
        sender: 'peter',
        content: 'Perfect! The blog content is exactly what I was looking for. Great work!',
        time: '10:25 AM',
        isOwn: false
      },
      {
        id: 4,
        sender: 'me',
        content: 'Awesome! I\'ll have the next batch ready by Friday.',
        time: '10:30 AM',
        isOwn: true
      }
    ],
    'sarah': [
      {
        id: 1,
        sender: 'sarah',
        content: 'Hi Besamad! Hope you\'re doing well. I have a quick question about the mobile app project.',
        time: '09:00 AM',
        isOwn: false
      },
      {
        id: 2,
        sender: 'me',
        content: 'Hi Sarah! I\'m doing great, thanks. What\'s your question?',
        time: '09:15 AM',
        isOwn: true
      },
      {
        id: 3,
        sender: 'sarah',
        content: 'Can you send me the updated wireframes for the mobile app? I want to review them with my team.',
        time: '09:20 AM',
        isOwn: false
      },
      {
        id: 4,
        sender: 'me',
        content: 'Of course! I\'ll email them to you within the hour.',
        time: '09:25 AM',
        isOwn: true
      }
    ],
    'mike': [
      {
        id: 1,
        sender: 'mike',
        content: 'Besamad, the logo designs you sent are fantastic!',
        time: '02:30 PM',
        isOwn: false
      },
      {
        id: 2,
        sender: 'me',
        content: 'Thank you Mike! I\'m glad you like them. Which version is your favorite?',
        time: '02:45 PM',
        isOwn: true
      },
      {
        id: 3,
        sender: 'mike',
        content: 'Thanks for the quick turnaround on the logo designs! I love the blue and gold version.',
        time: '03:00 PM',
        isOwn: false
      }
    ]
  });

  // Response templates for each contact
  const responseTemplates = {
    'lancer-ai': [
      "That's a great question! I can help you with that. Let me provide some suggestions.",
      "I understand your concern. Here are some ways to improve your workflow efficiency.",
      "Based on your current tasks, I recommend focusing on high-priority items first.",
      "That's an excellent approach! You might also consider using time-blocking techniques.",
      "I can help you optimize that process. Would you like me to create a task template?",
      "Perfect! I'll analyze your workflow and suggest improvements.",
      "That sounds like a smart strategy. Have you considered using automation tools?",
      "Great thinking! Let me break down the best practices for you.",
      "I'm here to help! What specific area would you like to focus on first?",
      "Excellent question! Here's what I recommend based on industry best practices."
    ],
    'deandre': [
      "Sounds good to me! When can we get started?",
      "That looks perfect! Really impressed with your work.",
      "Thanks for the update! Can we schedule a quick call?",
      "Love the direction you're taking with this project.",
      "Great work as always! The client is going to love this.",
      "Perfect timing! I was just about to ask about that.",
      "Awesome! Can you walk me through the next steps?",
      "This is exactly what I had in mind. Well done!",
      "Thanks for being so responsive. Really appreciate it!",
      "Looking forward to seeing the final version!"
    ],
    'peter': [
      "Thanks for keeping me updated! This looks great.",
      "Perfect! I'll review this and get back to you soon.",
      "Really happy with how this is turning out.",
      "Thanks for the quick turnaround on this!",
      "This is exactly what we needed. Great job!",
      "Looks good! Just a few minor tweaks and we're done.",
      "Appreciate your attention to detail on this project.",
      "This exceeded my expectations. Well done!",
      "Thanks for being so thorough with the revisions.",
      "Perfect! I'll share this with the team right away."
    ],
    'sarah': [
      "Thanks for the update! This is looking really good.",
      "Perfect! I'll review these with my team today.",
      "Great work! Can we discuss the next phase?",
      "This is exactly what we were looking for.",
      "Thanks for being so responsive to our feedback.",
      "Love the changes you made! Much better now.",
      "This looks professional and clean. Great job!",
      "Perfect timing! We needed this for tomorrow's meeting.",
      "Really impressed with your attention to detail.",
      "Thanks for making those revisions so quickly!"
    ],
    'mike': [
      "This looks fantastic! Really happy with the results.",
      "Thanks for the great work! The team loves it.",
      "Perfect! This is exactly what we needed.",
      "Really impressed with your creativity on this one.",
      "Thanks for going above and beyond on this project.",
      "This exceeded our expectations. Awesome work!",
      "Love the attention to detail! Professional quality.",
      "Thanks for being so easy to work with.",
      "This is going to work perfectly for our campaign.",
      "Great job! Looking forward to the next project."
    ]
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, selectedChat]);

  const simulateTyping = (chatId) => {
    setTypingUsers(prev => new Set([...prev, chatId]));
    
    // Random typing duration between 1-3 seconds
    const typingDuration = Math.random() * 2000 + 1000;
    
    setTimeout(() => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
      });
    }, typingDuration);

    return typingDuration;
  };

  const getRandomResponse = (chatId) => {
    const templates = responseTemplates[chatId] || responseTemplates['deandre'];
    return templates[Math.floor(Math.random() * templates.length)];
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newMsg = {
        id: Date.now(),
        sender: 'me',
        content: newMessage.trim(),
        time: timestamp,
        isOwn: true
      };

      // Add message to current conversation
      setAllMessages(prev => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), newMsg]
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

      // Simulate response with typing indicator
      const typingDuration = simulateTyping(selectedChat);
      
      // Random response delay (including typing time)
      const responseDelay = typingDuration + Math.random() * 2000 + 500;
      
      setTimeout(() => {
        const response = getRandomResponse(selectedChat);
        const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const responseMsg = {
          id: Date.now() + 1,
          sender: selectedChat,
          content: response,
          time: responseTime,
          isOwn: false
        };

        setAllMessages(prev => ({
          ...prev,
          [selectedChat]: [...(prev[selectedChat] || []), responseMsg]
        }));

        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedChat 
              ? { ...conv, lastMessage: response, time: 'now', unread: conv.id === selectedChat ? 0 : (conv.unread || 0) + 1 }
              : conv
          )
        );
      }, responseDelay);
    }
  };

  const handleChatSelect = (chatId) => {
    setSelectedChat(chatId);
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
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleChatSelect(conv.id)}
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
                    {typingUsers.has(conv.id) && selectedChat !== conv.id ? (
                      <span className="italic text-blue-600">typing...</span>
                    ) : (
                      conv.lastMessage
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
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
                <h3 className="font-medium text-gray-900">{activeChat?.name}</h3>
                <p className="text-sm text-green-600">
                  {isTyping ? 'typing...' : 'Online'}
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
          {messages.map((message) => (
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
          
          {/* Typing indicator */}
          {isTyping && (
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
              onChange={(e) => setNewMessage(e.target.value)}
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