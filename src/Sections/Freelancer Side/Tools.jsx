import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import socket, { isSocketConnected } from '../../../Components/socket';
import TextareaAutosize from 'react-textarea-autosize';

const STATUS_MESSAGE_MAP = {
  'initializing': 'Setting up your AI assistant...',
  'connecting': 'Connecting to AI services...',
  'processing': 'Processing your request...',
  'generating': 'Generating response...',
};

const AIAssistantChat = ({
  chat_type = 'client_assistant',
  assistantName = 'AI Assistant',
  assistantAvatar = 'AI',
  className = '',
  onMessageSent
}) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(isSocketConnected());
  const own_id = localStorage.getItem('user_id');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [socketError, setSocketError] = useState('');
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [userAvatar, setUserAvatar] = useState('U');
  const [userName, setSenderName] = useState('You');

  const fetchUserProfile = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) return;

      const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      if (!authToken) return;

      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        mode: 'cors',
        credentials: 'include'
      });

      if (!response.ok) return;

      const profileResponse = await response.json();
      if (profileResponse.well_received && profileResponse.profile_data) {
        const profile = profileResponse.profile_data;
        setUserProfile(profile);

        const firstInitial = profile.firstname ? profile.firstname.charAt(0).toUpperCase() : '';
        const lastInitial = profile.lastname ? profile.lastname.charAt(0).toUpperCase() : '';
        const avatarInitials = firstInitial + lastInitial || 'U';
        setUserAvatar(avatarInitials);

        const displayName = profile.username || profile.firstname || 'You';
        setSenderName(displayName);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

 
  const checkAuthentication = () => {
    const token = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('userRole');

    if (!userId && !userRole) {
      setSocketError('Please complete the signup process first.');
      setTimeout(() => navigate('/signup', { replace: true }), 1500);
      return false;
    }

    if (!token && userRole && !location.state?.fromProfileSetup) {
      setSocketError('Please complete your profile setup first.');
      setTimeout(() => navigate('/profile_setup', { replace: true, state: { role: userRole } }), 1500);
      return false;
    }

    if (!userId && userRole) {
      setSocketError('Session data incomplete. Please sign in again.');
      setTimeout(() => navigate('/signin', { replace: true }), 1500);
      return false;
    }

    setIsLoadingAuth(false);
    return true;
  };

  // FIX 1: Corrected logic for initializing chat and processing history
  const initializeChat = async () => {
    try {
      setIsLoadingQuestion(true);
      setStatusMessage('Initializing chat...');
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) throw new Error('API URL not configured');

      let currentUserId = own_id || localStorage.getItem('user_id');

      const queryParams = new URLSearchParams({
        chat_type: chat_type,
        own_id: currentUserId || 'temp_user',
        recipient_id: 'client_assistant'
      });
      
      const headers = { 'Content-Type': 'application/json' };
      const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${API_URL}/api/chat?${queryParams}`, {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        credentials: 'include',
      });
      
      const chatData = await response.json();

      if (!response.ok) {
        throw new Error(chatData.error_message || `HTTP ${response.status}: Failed to initialize chat`);
      }

      // The server response is the source of truth.
      const authoritativeUserId = chatData.user_id ? String(chatData.user_id) : currentUserId;
      if (chatData.user_id && !localStorage.getItem('user_id')) {
        localStorage.setItem('user_id', authoritativeUserId);
      }

      if (chatData.message_history && Array.isArray(chatData.message_history)) {
        const formattedMessages = chatData.message_history.map((msg, index) => {
          const senderStr = String(msg.sender_id);
          const isUserMessage = senderStr === authoritativeUserId;

          let messageType = 'other';
          if (msg.sender_tag === 'ai' || senderStr === 'client_assistant') {
            messageType = 'ai';
          } else if (isUserMessage) {
            messageType = 'user';
          }

          return {
            id: msg.id || `history-${index}`,
            type: messageType,
            content: msg.message_content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            sender: isUserMessage ? userName : assistantName,
            status: 'sent', // Historical messages are always 'sent'
            isStatus: false
          };
        });
        setMessages(formattedMessages);
      }
      
      setIsLoadingQuestion(false);
      setStatusMessage('');

    } catch (error) {
        console.error('Chat initialization error:', error);
        setSocketError(error.message || 'Failed to connect to chat.');
        setIsLoadingQuestion(false);
        setStatusMessage('');
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (!checkAuthentication()) return;
      await fetchUserProfile(); // Fetch profile early to have `userName` ready
      await initializeChat();
    };

    initialize();

    const setupSocketListeners = () => {
      const handleConnect = () => {
        setIsConnected(true);
        setSocketError('');
      };

      const handleDisconnect = () => setIsConnected(false);
      const handleConnectError = () => {
        setIsConnected(false);
        setSocketError('Connection error. Please try refreshing.');
      };

      const handleNewMessage = (data) => {
        // Simple check to prevent duplicates from history
        if (messages.some(m => m.id === data.id)) return;
        
        const currentUserId = localStorage.getItem('user_id');
        const isUserMessage = String(data.own_id) === currentUserId;

        const newMessage = {
            id: data.id || Date.now(),
            type: isUserMessage ? 'user' : 'ai',
            content: data.message_content,
            timestamp: new Date(data.timestamp || Date.now()),
            sender: isUserMessage ? userName : assistantName,
            status: 'sent',
            isStatus: false
        };

        // Replace the "sending" message with the final "sent" one from the server
        setMessages(prev => {
            const optimisticMessageIndex = prev.findIndex(m => m.status === 'sending' && m.content === data.message_content);
            if (optimisticMessageIndex > -1) {
                const updatedMessages = [...prev];
                updatedMessages[optimisticMessageIndex] = newMessage;
                return updatedMessages;
            }
            return [...prev, newMessage];
        });

        if (newMessage.type === 'ai') {
          setIsTyping(false);
          setIsLoadingAnswer(false);
          setIsWaitingForResponse(false);
        }
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleConnectError);
      socket.on('new_message', handleNewMessage);
      // ... your other listeners like 'control_instruction'

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('connect_error', handleConnectError);
        socket.off('new_message', handleNewMessage);
      };
    };

    const cleanup = setupSocketListeners();
    setIsLoadingAuth(false);

    return cleanup;
  }, []); // The empty dependency array ensures this runs only once

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);


  // FIX 2: More reliable message sending with optimistic UI and acknowledgements
  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConnected) return;

    const userId = localStorage.getItem('user_id');
    const tempId = `temp_${Date.now()}`;
    
    // Optimistic UI: Show message as "sending" immediately
    const userMessage = {
      id: tempId,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      sender: userName,
      status: 'sending' // <-- New status property
    };
    setMessages(prev => [...prev, userMessage]);
    
    const messagePayload = {
        message_content: inputValue.trim(),
        own_id: parseInt(userId),
        recipient_id: 'client_assistant',
    };

    // Emit with a timeout and acknowledgement callback
    socket.timeout(10000).emit('send_message', messagePayload, (err) => {
        if (err) {
            // If server doesn't acknowledge in 10s, mark as failed
            setMessages(prev => prev.map(msg => 
                msg.id === tempId ? { ...msg, status: 'failed' } : msg
            ));
        }
        // Note: The message status is updated to 'sent' when the 'new_message' event is received from the server.
    });

    if (onMessageSent) onMessageSent(userMessage);

    setInputValue('');
    setIsWaitingForResponse(true);
    setIsLoadingAnswer(true);
    setTimeout(() => setIsTyping(true), 500);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  // ... (Your existing loading JSX - no changes needed)
  if (isLoadingAuth) {
    return (
      <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
        {/* ... (Your header, error display, etc. - no changes needed) ... */}

        {/* Chat Messages - Updated to show message status */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-6">
            {messages.map((message) => {
                const isFromCurrentUser = message.type === 'user';
                // ... (Your logic for status messages)
                if (message.isStatus) {    
                  return (
                <div key={message.id} className="flex justify-center my-2">
                  <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    {message.content}
                  </div>
                </div>
              ); }

                return (
                <div key={message.id} className={`flex gap-3 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      {!isFromCurrentUser && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-semibold text-xs">{assistantAvatar}</span>
                  </div>
                )}
                    
                    <div className={`flex flex-col ${isFromCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                        isFromCurrentUser 
                        ? 'bg-blue-500 text-white rounded-br-md' 
                        : 'bg-white text-gray-800 border rounded-bl-md'
                    }`}>
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-2 text-xs text-gray-500 mt-1 px-1 ${isFromCurrentUser ? 'flex-row-reverse' : ''}`}>
                        <span>{formatTime(message.timestamp)} • {message.sender}</span>
                        {isFromCurrentUser && message.status === 'sending' && <Clock size={12} className="text-gray-400" />}
                        {isFromCurrentUser && message.status === 'failed' && <AlertCircle size={12} className="text-red-400" />}
                    </div>
                    </div>

                    {isFromCurrentUser && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-semibold text-xs">{assistantAvatar}</span>
                  </div>)}
                </div>
                );
            })}
            
            {/* ... (Your typing indicator) ... */}
            <div ref={messagesEndRef} />
            </div>
        </div>

        {/* ... (Your chat input section - no changes needed) ... */}
    </div>
  );
};

export default AIAssistantChat;