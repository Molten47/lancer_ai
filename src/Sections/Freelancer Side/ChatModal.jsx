import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import useP2PChat from '../ChatSpace/P2PChat'

const ChatModal = ({ isOpen, onClose, recipientId, recipientName = null }) => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  
  const {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    clearError,
    hasMessages
  } = useP2PChat(recipientId);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (hasMessages) {
      scrollToBottom();
    }
  }, [messages, hasMessages]);

  // Handle send message
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    const success = sendMessage(messageInput);
    if (success) {
      setMessageInput('');
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date for day separators
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-semibold">
              {recipientName ? recipientName.charAt(0).toUpperCase() : `#${recipientId}`}
            </div>
            <div>
              <h3 className="font-semibold">
                {recipientName || `User ${recipientId}`}
              </h3>
              <div className="flex items-center gap-1 text-sm opacity-90">
                {isConnected ? (
                  <>
                    <Wifi size={12} />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={12} />
                    <span>Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 size={20} className="animate-spin" />
                <span>Loading messages...</span>
              </div>
            </div>
          ) : !hasMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  💬
                </div>
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start a conversation!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const showDate = index === 0 || 
                  new Date(message.timestamp).toDateString() !== 
                  new Date(messages[index - 1].timestamp).toDateString();

                return (
                  <div key={message.id}>
                    {/* Date separator */}
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                    )}
                    
                    {/* Message */}
                    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.isOwn 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white border shadow-sm'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.message_content}</p>
                        <p className={`text-xs mt-1 ${
                          message.isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                          {message.isPending && (
                            <span className="ml-2 opacity-70">Sending...</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border-t border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
              <button
                onClick={clearError}
                className="ml-auto text-red-600 hover:text-red-800 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="w-full resize-none border rounded-2xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none max-h-32"
                rows="1"
                style={{
                  minHeight: '44px',
                  height: 'auto'
                }}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || !isConnected}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl p-3 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
          
          {!isConnected && (
            <p className="text-xs text-red-500 mt-2">
              Disconnected - messages cannot be sent
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatModal;