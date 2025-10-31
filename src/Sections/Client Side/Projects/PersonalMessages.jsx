// MessageView.js - The main chat interface integrating P2PChatComponent

import React, { useState, useMemo } from 'react';
import { Search, Plus, MessageCircle } from 'lucide-react'; // Added MessageCircle icon

// NOTE: You must ensure the path to your P2PChatComponent is correct
//import P2PChatComponent from './DirectMessagesChat'; // Adjust path as needed

// --- LOGGED IN USER ID (Placeholder for the client's ID) ---
const own_id = localStorage.getItem('own_id'); 

// Sample data to populate the conversation list
// NOTE: I've made this an EMPTY array for demonstration purposes. 
// Set it back to initialConversationsData if you want to see the list.
const initialConversationsData = [
//   {
//     id: 1, 
//     recipientId: 401, 
//     name: 'Victoria James',
//     lastMessage: 'Can you review the support guidelines?',
//     time: 'Yesterday',
//     unread: 1,
//     avatarColor: 'bg-red-500',
//     initials: 'VJ',
//     chatType: 'human',
//   },
];

// Component for a single conversation item in the list
const ConversationItem = ({ name, lastMessage, time, unread, avatarColor, initials, active, onClick }) => (
  <div
    className={`flex items-center p-3 cursor-pointer border-l-4 ${
      active 
        ? 'bg-blue-50 border-blue-600' 
        : 'hover:bg-gray-50 border-transparent'
    } transition-colors duration-150`}
    onClick={onClick}
  >
    <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
    <div className="ml-3 flex-1 min-w-0 hidden sm:block">
      <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
      <p className="text-xs text-gray-500 truncate">{lastMessage}</p>
    </div>
    <div className="flex flex-col items-end ml-auto">
      <p className="text-xs text-gray-500 mb-1 hidden sm:block">{time}</p>
      {unread > 0 && (
        <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-blue-600 rounded-full">
          {unread}
        </span>
      )}
    </div>
  </div>
);

const MessageView = () => {
  const [conversations, setConversations] = useState(initialConversationsData);
  
  const [selectedRecipient, setSelectedRecipient] = useState(
    initialConversationsData[0] || null
  );

  const handleConversationClick = (conv) => {
    setSelectedRecipient(conv);

    setConversations(prevConversations => prevConversations.map(c => ({
      ...c,
      active: c.id === conv.id,
      unread: c.id === conv.id ? 0 : c.unread,
    })));
  };
  
  const activeConversations = useMemo(() => {
    const selectedId = selectedRecipient?.id;
    return conversations.map(c => ({
      ...c,
      active: c.id === selectedId,
    }));
  }, [conversations, selectedRecipient]);

  // Check if the conversation list is empty
  const isConversationListEmpty = conversations.length === 0;

  return (
    <div className="flex h-full w-full bg-white overflow-y-auto">
      
      {/* Conversation List Sidebar (Left Pane) */}
      <div className="w-full sm:w-1/3 min-w-[280px] border-r border-gray-200 flex flex-col h-full overflow-hidden">
        
        {/* Header: Message & Add Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Message</h2>
          <button className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
            <Plus size={20} />
          </button>
        </div>
        
        {/* Search Input */}
        <div className="p-4 flex-shrink-0">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search Conversation" 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isConversationListEmpty} // Disable search if empty
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        {/* Conversation Items / Empty State */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-100">
          {isConversationListEmpty ? (
            <div className="flex flex-col items-center justify-center p-6 text-gray-500 h-full text-center">
              <MessageCircle size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No messages yet</h3>
              <p className="text-sm">
                Start a new chat by using the <span className="font-medium text-gray-600">+</span> button.
              </p>
            </div>
          ) : (
            activeConversations.map(conv => (
              <ConversationItem 
                key={conv.id}
                {...conv}
                onClick={() => handleConversationClick(conv)}
              />
            ))
          )}
        </div>
      </div>

      {/* Active Chat Window (Right Pane) */}
      <div className="flex-1 hidden sm:flex flex-col h-full bg-white overflow-hidden">
        {selectedRecipient ? (
          <P2PChatComponent 
            ownId={OWN_ID} 
            recipientId={selectedRecipient.recipientId}
            recipientName={selectedRecipient.name}
            chatType={selectedRecipient.chatType}
          />
        ) : (
          // Placeholder for when no conversation is selected
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <h3 className="text-xl font-medium mb-2">Select a Conversation</h3>
            <p className="text-center max-w-md">
              Choose a user from the left pane to start chatting.
            </p>
          </div>
        )}
      </div>
      
      {/* Mobile/Small Screen Fallback: Display the chat if selected */}
      {selectedRecipient && (
        <div className="flex-1 sm:hidden flex flex-col h-full absolute inset-0 bg-white z-10">
          {/* NOTE: You'd need a back button here */}
          <P2PChatComponent 
            ownId={OWN_ID} 
            recipientId={selectedRecipient.recipientId}
            recipientName={selectedRecipient.name}
            chatType={selectedRecipient.chatType}
          />
        </div>
      )}
      {!selectedRecipient && (
        <div className="flex-1 flex sm:hidden items-center justify-center text-gray-500">
          Select a conversation
        </div>
      )}

    </div>
  );
};

export default MessageView;