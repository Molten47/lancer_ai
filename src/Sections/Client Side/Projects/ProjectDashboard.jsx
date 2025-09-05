import React, { useState } from 'react';
import { MessageCircle, Send, User, Settings, Users, ArrowLeft } from 'lucide-react';

const ThreePanelWorkspace = ({ task, onBack }) => {
  const [activeWorkerTab, setActiveWorkerTab] = useState('team');
  const [messages, setMessages] = useState([
  ]);
  const [newMessage, setNewMessage] = useState('');

  const workers = [
   
  ];

  const projectManager = {
   
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        sender: 'You',
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Projects
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{task.title}</h1>
            <p className="text-gray-600">Project Workspace</p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-100px)]">
        {/* Left Panel - Associated Jobs */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        </div>

        {/* Middle Panel - Group Chat this place should have socket-io integration for live chat */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        </div>

        {/* Right Panel - which would have its own socket.io and API which is unique */}
        <div className="w-1/3 bg-white flex flex-col">
        </div>
      </div>
    </div>
  )};

export default ThreePanelWorkspace;