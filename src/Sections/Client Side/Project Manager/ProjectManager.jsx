import React, { useState } from 'react';
import { 
  Send, Users, Phone, Video, Paperclip, MoreVertical,
  Circle, CheckCircle2, Clock
} from 'lucide-react';

// Chat Bubble Component
const ChatBubble = ({ message, isCurrentUser, timestamp, sender }) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3 max-w-xs lg:max-w-md`}>
        {!isCurrentUser && (
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-xs">
              {sender?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <div className="flex flex-col">
          {!isCurrentUser && (
            <div className="flex items-center gap-2 mb-1 px-3">
              <span className="text-xs text-gray-600 font-medium">{sender?.name}</span>
              <span className="text-xs text-gray-400">• {sender?.role}</span>
            </div>
          )}
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm ${
              isCurrentUser
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
            }`}
          >
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
          <span className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'} px-3`}>
            {timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

// Chat Container Component
const ChatContainer = ({ children }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 scroll-smooth">
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

// Chat Input Component
const ChatInput = ({ onSendMessage, typingUsers }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      {/* Typing indicator */}
      {typingUsers && typingUsers.length > 0 && (
        <div className="mb-3 text-xs text-gray-500 flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <span>
            {typingUsers.length === 1 
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.slice(0, -1).join(', ')} and ${typingUsers[typingUsers.length - 1]} are typing...`
            }
          </span>
        </div>
      )}
      
      <div className="flex gap-2 items-end">
        <button
          onClick={() => {}}
          className="p-3 hover:bg-gray-50 rounded-full transition-colors"
        >
          <Paperclip size={18} className="text-gray-500" />
        </button>
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to the team..."
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={1}
            style={{minHeight: '48px', maxHeight: '120px'}}
          />
        </div>
        <button 
          onClick={handleSubmit}
          disabled={!message.trim()}
          className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Send size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
};

// Chat Indicator Component
const ChatIndicator = ({ onlineUsers, totalUsers }) => {
  return (
    <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700 font-medium">
              {onlineUsers} of {totalUsers} team members online
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white hover:bg-opacity-60 rounded-lg transition-colors">
            <Phone size={16} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-white hover:bg-opacity-60 rounded-lg transition-colors">
            <Video size={16} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-white hover:bg-opacity-60 rounded-lg transition-colors">
            <MoreVertical size={16} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Chat Head Component
const ChatHead = ({ projectName, members, onToggleMembers, showMembers }) => {
  const getProjectStatus = () => {
    // Mock status based on online members
    const onlineCount = members.filter(m => m.online).length;
    if (onlineCount >= members.length * 0.7) return { text: "Active", color: "text-green-600", icon: CheckCircle2 };
    if (onlineCount >= members.length * 0.4) return { text: "In Progress", color: "text-blue-600", icon: Clock };
    return { text: "Pending", color: "text-yellow-600", icon: Circle };
  };

  const status = getProjectStatus();
  const StatusIcon = status.icon;

  return (
    <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">
              {projectName?.charAt(0).toUpperCase() || 'P'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{projectName}</h3>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500">{members?.length || 0} team members</p>
              <div className="flex items-center gap-1">
                <StatusIcon size={14} className={status.color} />
                <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onToggleMembers}
          className={`p-3 rounded-xl transition-all ${
            showMembers 
              ? 'bg-blue-50 text-blue-600 shadow-sm' 
              : 'hover:bg-gray-50 text-gray-600'
          }`}
        >
          <Users size={20} />
        </button>
      </div>
    </div>
  );
};

// Main Project Manager Component (Group Chat)
const ProjectManager = ({ 
  projectName = "E-commerce Website Development", 
  onSendMessage = () => {},
  messages = [],
  members = [],
  typingUsers = [],
  currentUserId = "manager1"
}) => {
  const [showMembers, setShowMembers] = useState(true);

  // Mock project data with realistic freelancer/remote worker scenario
  const mockMessages = messages.length ? messages : [
    {
      id: 1,
      message: "Good morning team! I've reviewed the wireframes you sent yesterday. Overall looking great, but I have a few suggestions for the checkout flow. Can we discuss?",
      sender: { name: "Michael Johnson", id: "manager1", role: "Project Manager" },
      timestamp: "9:15 AM",
      isCurrentUser: true
    },
    {
      id: 2,
      message: "Morning Michael! I'd love to hear your feedback. I was actually wondering about the payment gateway integration timeline as well.",
      sender: { name: "Sarah Chen", id: "designer1", role: "UI/UX Designer" },
      timestamp: "9:18 AM",
      isCurrentUser: false
    },
    {
      id: 3,
      message: "Hi everyone! The API endpoints for user authentication are ready for testing. Sarah, I can integrate the payment gateway by next week if that works for the timeline.",
      sender: { name: "Alex Rivera", id: "dev1", role: "Backend Developer" },
      timestamp: "9:22 AM",
      isCurrentUser: false
    },
    {
      id: 4,
      message: "Perfect timing Alex! Sarah, let's schedule a 30-min call today at 2 PM to go over the checkout flow. I'll send the calendar invite.",
      sender: { name: "Michael Johnson", id: "manager1", role: "Project Manager" },
      timestamp: "9:25 AM",
      isCurrentUser: true
    },
    {
      id: 5,
      message: "Sounds good! I'll prepare the updated mockups. Also, should I start working on the mobile responsive version of the product pages?",
      sender: { name: "Sarah Chen", id: "designer1", role: "UI/UX Designer" },
      timestamp: "9:27 AM",
      isCurrentUser: false
    },
    {
      id: 6,
      message: "Yes, let's prioritize mobile responsiveness. David, how's the frontend integration coming along?",
      sender: { name: "Michael Johnson", id: "manager1", role: "Project Manager" },
      timestamp: "9:30 AM",
      isCurrentUser: true
    },
    {
      id: 7,
      message: "Frontend is about 70% done. I'll have the product catalog fully integrated by tomorrow. Just waiting on a few API endpoints from Alex.",
      sender: { name: "David Kim", id: "dev2", role: "Frontend Developer" },
      timestamp: "9:35 AM",
      isCurrentUser: false
    }
  ];

  const mockMembers = members.length ? members : [
    { 
      id: "manager1", 
      name: "Michael Johnson", 
      role: "Project Manager", 
      online: true,
      location: "New York, USA",
      lastSeen: "Active now"
    },
    { 
      id: "designer1", 
      name: "Sarah Chen", 
      role: "UI/UX Designer", 
      online: true,
      location: "Toronto, Canada",
      lastSeen: "Active now"
    },
    { 
      id: "dev1", 
      name: "Alex Rivera", 
      role: "Backend Developer", 
      online: true,
      location: "Mexico City, Mexico",
      lastSeen: "Active now"
    },
    { 
      id: "dev2", 
      name: "David Kim", 
      role: "Frontend Developer", 
      online: false,
      location: "Seoul, South Korea",
      lastSeen: "2 hours ago"
    },
    { 
      id: "qa1", 
      name: "Emma Wilson", 
      role: "QA Tester", 
      online: false,
      location: "London, UK",
      lastSeen: "5 hours ago"
    }
  ];

  const onlineCount = mockMembers.filter(member => member.online).length;

  const handleSendMessage = (message) => {
    const newMessage = {
      id: Date.now(),
      message,
      sender: { 
        name: "Michael Johnson", 
        id: currentUserId, 
        role: "Project Manager" 
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true
    };
    
    console.log("Sending message:", newMessage);
    onSendMessage(newMessage);
  };

  return (
    <div className="flex h-full bg-white">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatHead 
          projectName={projectName}
          members={mockMembers}
          onToggleMembers={() => setShowMembers(!showMembers)}
          showMembers={showMembers}
        />
        
        <ChatIndicator 
          onlineUsers={onlineCount}
          totalUsers={mockMembers.length}
        />
        
        <ChatContainer>
          {mockMessages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.message}
              isCurrentUser={msg.sender.id === currentUserId}
              timestamp={msg.timestamp}
              sender={msg.sender}
            />
          ))}
        </ChatContainer>
        
        <ChatInput 
          onSendMessage={handleSendMessage}
          typingUsers={typingUsers}
        />
      </div>

      {/* Team Members Panel */}
      {showMembers && (
        <div className="w-80 border-l border-gray-200 bg-gray-50">
          <div className="p-4 bg-white border-b border-gray-200">
            <h4 className="font-bold text-gray-900 text-lg">Project Team</h4>
            <p className="text-sm text-gray-600 mt-1">Remote freelancers & workers</p>
          </div>
          
          <div className="p-4 space-y-4">
            {mockMembers.map((member) => (
              <div key={member.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      member.online ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{member.name}</p>
                    <p className="text-sm text-blue-600 font-medium">{member.role}</p>
                    <p className="text-xs text-gray-500 mt-1">{member.location}</p>
                    <p className={`text-xs mt-1 ${member.online ? 'text-green-600' : 'text-gray-500'}`}>
                      {member.lastSeen}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-white">
            <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
              Invite New Member
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;