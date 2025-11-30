import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, CheckCircle, X, Paperclip, File, Download, Image, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { 
  getSocket, 
  initializeSocket, 
  getConnectionStatus,
  sendFileToUser,
  setupFileTransferHandlers,
  removeFileTransferHandlers,
  downloadFileFromUrl
} from '../../../Components/socket';

const STATUS_MESSAGE_MAP = {
  'initializing': 'Setting up your project manager...',
  'connecting': 'Connecting to AI services...',
  'processing': 'Processing your request...',
  'generating': 'Generating response...',
};

const ProjectManagerSidebar = ({
  userId,
  projectId,
  clientId,
  chat_type = 'project_manager',
  assistantName = 'Project Manager',
  assistantAvatar = 'PM',
  onClose,
  className = ''
}) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const [socketError, setSocketError] = useState('');
  const [userName, setUserName] = useState('You');
  const [userAvatar, setUserAvatar] = useState('U');
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const socketListenersRef = useRef(false);
  const processedMessageIds = useRef(new Set());
  const messageSequenceRef = useRef(0);
  const pendingStatusRef = useRef(false);
  const initializingRef = useRef(false);
  const dynamicRecipientIdRef = useRef(null);
  const ownIdRef = useRef(userId || localStorage.getItem('user_id'));
  const [dynamicRecipientId, setDynamicRecipientIdState] = useState(null);
  const initializationAttempted = useRef(false);

  const own_id = userId || localStorage.getItem('user_id');

  const setDynamicRecipientId = (value) => {
    dynamicRecipientIdRef.current = value;
    setDynamicRecipientIdState(value);
  };

  const generateMessageId = (prefix = 'msg') => {
    return `${prefix}-${Date.now()}-${++messageSequenceRef.current}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const markLastStatusComplete = () => {
    if (pendingStatusRef.current) return;
    pendingStatusRef.current = true;
    
    setMessages(prev => {
      const statusIndices = prev
        .map((msg, idx) => msg.isStatus && !msg.isComplete ? idx : -1)
        .filter(idx => idx !== -1);
      
      if (statusIndices.length === 0) {
        pendingStatusRef.current = false;
        return prev;
      }
      
      const lastStatusIndex = statusIndices[statusIndices.length - 1];
      const updated = [...prev];
      updated[lastStatusIndex] = { 
        ...updated[lastStatusIndex], 
        isComplete: true,
        completedAt: new Date().toISOString()
      };
      
      queueMicrotask(() => {
        pendingStatusRef.current = false;
      });
      
      return updated;
    });
  };

  const clearLoadingStates = () => {
    setIsTyping(false);
    setIsLoadingAnswer(false);
    setIsUploadingFile(false);
    setUploadProgress(0);
  };

  const determineMessageType = (messageData, currentUserId) => {
    const currentUserStr = String(currentUserId);
    const senderStr = String(messageData.sender_id || messageData.own_id);
    const senderTag = messageData.sender_tag;

    if (senderTag === 'ai' || senderTag === 'sender_b') {
      return { type: 'ai', sender: assistantName };
    }

    if (senderTag === 'user' || senderTag === 'sender_a') {
      return { type: 'user', sender: userName };
    }

    if (senderStr !== 'undefined' && (senderStr === dynamicRecipientIdRef.current || senderStr.includes('project_manager'))) {
      return { type: 'ai', sender: assistantName };
    }

    if (senderStr === currentUserStr && senderStr !== 'undefined') {
      return { type: 'user', sender: userName };
    }

    return { type: 'ai', sender: assistantName };
  };

  const sortMessages = (messagesArray) => {
    return messagesArray.sort((a, b) => {
      let timeA, timeB;
      
      try {
        timeA = a.timestamp instanceof Date 
          ? a.timestamp.getTime() 
          : new Date(a.timestamp).getTime();
      } catch {
        timeA = 0;
      }
      
      try {
        timeB = b.timestamp instanceof Date 
          ? b.timestamp.getTime() 
          : new Date(b.timestamp).getTime();
      } catch {
        timeB = 0;
      }

      if (timeA !== timeB) return timeA - timeB;

      const seqA = a.sequence || 0;
      const seqB = b.sequence || 0;
      if (seqA !== seqB) return seqA - seqB;

      return a.id > b.id ? 1 : a.id < b.id ? -1 : 0;
    });
  };

  const fetchUserProfile = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      if (!API_URL || !authToken) return;

      const response = await fetch(`${API_URL}/api/profile`, {
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${authToken}` 
        },
      });

      if (!response.ok) return;

      const profileResponse = await response.json();
      if (profileResponse.well_received && profileResponse.profile_data) {
        const profile = profileResponse.profile_data;
        const firstInitial = profile.firstname ? profile.firstname.charAt(0).toUpperCase() : '';
        const lastInitial = profile.lastname ? profile.lastname.charAt(0).toUpperCase() : '';
        setUserAvatar(firstInitial + lastInitial || 'U');
        setUserName(profile.username || profile.firstname || 'You');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const initializeChat = async (recipientId) => {
    if (initializingRef.current) return false;
    initializingRef.current = true;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) throw new Error('API URL not configured.');

      const userId = own_id || localStorage.getItem('user_id');
      const queryParams = new URLSearchParams({
        chat_type: chat_type,
        own_id: userId,
        recipient_id: recipientId
      });

      const headers = { 'Content-Type': 'application/json' };
      const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const response = await fetch(`${API_URL}/api/chat?${queryParams}`, {
        method: 'GET',
        headers: headers,
      });

      let chatData = await response.json();

      if (!response.ok) {
        throw new Error(chatData.error_message || `Failed to initialize chat`);
      }

      if (chatData.message_history && Array.isArray(chatData.message_history)) {
        const currentUserId = own_id || localStorage.getItem('user_id');
        processedMessageIds.current.clear();
        
        const formattedMessages = chatData.message_history.map((msg) => {
          const { type: messageType, sender: senderName } = determineMessageType({
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id,
            sender_tag: msg.sender_tag,
            own_id: msg.own_id,
            message_content: msg.message_content
          }, currentUserId);
          
          const messageId = msg.id || generateMessageId('history');
          processedMessageIds.current.add(messageId);
          
          return {
            id: messageId,
            type: messageType,
            content: msg.message_content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            sender: senderName,
            sequence: ++messageSequenceRef.current,
            isStatus: false,
            serverId: msg.id,
            file: msg.file_url ? {
              url: msg.file_url,
              filename: msg.filename,
              filetype: msg.filetype,
              ext: msg.ext,
              size_bytes: msg.size_bytes
            } : null
          };
        });
        
        setMessages(sortMessages(formattedMessages));
      }

      return true;
    } catch (error) {
      console.error('Chat initialization error:', error);
      setSocketError(error.message);
      return false;
    } finally {
      setIsLoadingChat(false);
      initializingRef.current = false;
    }
  };

  const initializeSocketConnection = async () => {
    try {
      console.log('🔌 Starting socket initialization for ProjectManager...');
      
      await initializeSocket();
      socketRef.current = getSocket();
      
      const status = getConnectionStatus();
      console.log('📊 Socket status:', status);
      
      if (status.isConnected && status.userJoined) {
        console.log('✅ Socket ready for ProjectManager');
        setIsConnected(true);
        setSocketError('');
        return true;
      } else {
        throw new Error('Socket initialization incomplete');
      }
    } catch (error) {
      console.error('❌ Socket initialization failed:', error);
      setSocketError('Failed to connect. Please refresh.');
      return false;
    }
  };

  const setupSocketListeners = () => {
    if (socketListenersRef.current || !socketRef.current) return;

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ ProjectManager socket connected');
      setIsConnected(true);
      setSocketError('');
    });

    socket.on('disconnect', () => {
      console.log('❌ ProjectManager socket disconnected');
      setIsConnected(false);
      clearLoadingStates();
    });

    socket.on('connect_error', () => {
      console.error('❌ ProjectManager connection error');
      setIsConnected(false);
      clearLoadingStates();
      setSocketError('Connection error. Please try refreshing the page.');
    });
    
    socket.on('reconnect', async () => {
      console.log('🔄 ProjectManager reconnected');
      setIsConnected(true);
      setSocketError('');
      const currentRecipientId = dynamicRecipientIdRef.current;
      if (currentRecipientId) {
        await initializeChat(currentRecipientId);
      }
    });

    socket.on('new_message', (data, callback) => {
      console.log('📨 ProjectManager received message:', data);
      
      const userId = ownIdRef.current || localStorage.getItem('user_id');
      const currentRecipientId = dynamicRecipientIdRef.current;
      const userStr = String(userId);

      const isRelevant = 
        (String(data.sender_id) === currentRecipientId || 
         String(data.recipient_id) === currentRecipientId ||
         data.sender_tag === 'ai' || 
         data.sender_tag === 'sender_b' || 
         String(data.sender_id).includes('project_manager') ||
         String(data.recipient_id).includes('project_manager')
        ) &&
        (String(data.sender_id) === userStr || 
         String(data.recipient_id) === userStr); 
      
      if (!isRelevant) {
        if (callback) callback();
        return;
      }
      
      const serverMessageId = data.id || data.message_id;
      const messageId = serverMessageId 
        ? `server-${serverMessageId}`
        : generateMessageId('incoming');
      
      if (processedMessageIds.current.has(messageId)) {
        if (callback) callback();
        return;
      }

      markLastStatusComplete();
      
      const { type: messageType, sender: senderName } = determineMessageType({
        sender_id: data.sender_id,
        recipient_id: data.recipient_id,
        sender_tag: data.sender_tag,
        message_content: data.message_content
      }, userId);

      const newMessage = {
        id: messageId,
        type: messageType,
        content: data.message_content,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        sender: senderName,
        sequence: ++messageSequenceRef.current,
        isStatus: false,
        serverId: serverMessageId,
        file: data.file_url ? {
          url: data.file_url,
          filename: data.filename,
          filetype: data.filetype,
          ext: data.ext,
          size_bytes: data.size_bytes
        } : null
      };
      
      processedMessageIds.current.add(messageId);
      
      setMessages(prev => sortMessages([...prev, newMessage]));
      
      if (messageType === 'ai') {
        clearLoadingStates();
      }
      
      if (callback) callback();
    });

    socket.on('status_update', (data, callback) => {
      console.log('📊 Status update:', data);
      if (data.update) {
        const customMessage = STATUS_MESSAGE_MAP[data.update];
        if (!customMessage) {
          if (callback) callback();
          return;
        }
        
        markLastStatusComplete();
        
        const statusMessage = {
          id: generateMessageId('status'),
          type: 'status',
          content: customMessage,
          timestamp: new Date(),
          sender: 'System',
          sequence: ++messageSequenceRef.current,
          isStatus: true,
          isComplete: false,
          startedAt: new Date().toISOString()
        };
        
        setMessages(prev => sortMessages([...prev, statusMessage]));
      }
      if (callback) callback();
    });

    socket.on('control_instruction', (data, callback) => {
      console.log('🎮 Control instruction:', data);
      if (data.command === 'redirect' && data.data?.url) navigate(data.data.url);
      if (data.command === 'error') { 
        setSocketError(data.data?.message || 'An error occurred'); 
        clearLoadingStates();
      }
      if (callback) callback();
    });

    // Setup file transfer handlers
    setupFileTransferHandlers((fileData) => {
      console.log('📥 File received:', fileData);
      
      const userId = ownIdRef.current || localStorage.getItem('user_id');
      const currentRecipientId = dynamicRecipientIdRef.current;
      
      // Check if file is relevant to this chat
      if (String(fileData.sender_id) !== currentRecipientId) {
        return;
      }
      
      const messageId = generateMessageId('file');
      processedMessageIds.current.add(messageId);
      
      const fileMessage = {
        id: messageId,
        type: 'ai',
        content: `Shared a file: ${fileData.filename}`,
        timestamp: new Date(fileData.timestamp),
        sender: assistantName,
        sequence: ++messageSequenceRef.current,
        isStatus: false,
        file: {
          url: fileData.file_url,
          filename: fileData.filename,
          filetype: fileData.filetype,
          ext: fileData.ext,
          size_bytes: fileData.size_bytes
        }
      };
      
      setMessages(prev => sortMessages([...prev, fileMessage]));
    });

    socketListenersRef.current = true;
  };

  const cleanupSocketListeners = () => {
    if (!socketRef.current) return;

    const socket = socketRef.current;
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');
    socket.off('reconnect');
    socket.off('new_message');
    socket.off('status_update');
    socket.off('control_instruction');
    
    removeFileTransferHandlers();
    
    socketListenersRef.current = false;
  };

  useEffect(() => {
    if (initializationAttempted.current || !projectId) return;
    initializationAttempted.current = true;

    const init = async () => {
      console.log('🚀 Initializing ProjectManager sidebar');
      
      const recipientId = `project_manager_${projectId}`;
      setDynamicRecipientId(recipientId);
      ownIdRef.current = own_id;

      const socketReady = await initializeSocketConnection();
      if (!socketReady) {
        console.error('❌ Socket not ready, aborting');
        return;
      }

      setupSocketListeners();

      await Promise.all([
        fetchUserProfile(),
        initializeChat(recipientId)
      ]);
    };
    
    init();

    return () => {
      console.log('🧹 Cleaning up ProjectManager');
      cleanupSocketListeners();
    };
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // File handling functions
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSocketError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setSocketError('');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile || !isConnected || !dynamicRecipientId) {
      console.warn('Cannot send file: conditions not met');
      return;
    }

    try {
      setIsUploadingFile(true);
      setUploadProgress(0);

      console.log('📤 Sending file:', selectedFile.name);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await sendFileToUser(
        dynamicRecipientId,
        selectedFile,
        ['project_document'], // tags
        { 
          chat_type: chat_type,
          project_id: projectId 
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Clear file after successful upload
      setTimeout(() => {
        handleRemoveFile();
        setIsUploadingFile(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      console.error('❌ Error sending file:', error);
      setSocketError(error.message || 'Failed to send file');
      setIsUploadingFile(false);
      setUploadProgress(0);
    }
  };

const handleSendMessage = async () => {
  // Allow sending if either there's text OR a file
  if ((!inputValue.trim() && !selectedFile) || !isConnected || !dynamicRecipientId) {
    console.warn('Cannot send: conditions not met');
    return;
  }

  const userId = own_id || localStorage.getItem('user_id');
  const messageContent = inputValue.trim() || (selectedFile ? `Sent file: ${selectedFile.name}` : '');

  markLastStatusComplete();

  // ✅ CREATE MESSAGE IMMEDIATELY
  const tempMessageId = generateMessageId('user');
  const userMessage = {
    id: tempMessageId,
    type: 'user',
    content: messageContent,
    timestamp: new Date(),
    sender: userName,
    sequence: ++messageSequenceRef.current,
    isStatus: false,
    isPending: true,
    serverId: null,
    file: selectedFile ? {
      filename: selectedFile.name,
      size_bytes: selectedFile.size,
      filetype: selectedFile.type,
      ext: `.${selectedFile.name.split('.').pop()}`
    } : null
  };

  // ✅ ADD TO UI IMMEDIATELY
  processedMessageIds.current.add(tempMessageId);
  setMessages(prev => sortMessages([...prev, userMessage]));

  try {
    // If there's a file, send it first
    if (selectedFile) {
      setIsUploadingFile(true);
      setUploadProgress(0);

      console.log('📤 Sending file:', selectedFile.name);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Send file using the file transfer function
      const fileResult = await sendFileToUser(
        dynamicRecipientId,
        selectedFile,
        ['project_document'],
        { 
          chat_type: chat_type,
          project_id: projectId,
          message_content: messageContent // Include any text message with the file
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('✅ File sent successfully:', fileResult);

      // Update message with server response
      if (fileResult?.file_url) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessageId 
            ? { 
                ...msg, 
                isPending: false, 
                serverId: fileResult.message_id,
                file: {
                  url: fileResult.file_url,
                  filename: fileResult.filename,
                  filetype: fileResult.filetype,
                  ext: fileResult.ext,
                  size_bytes: fileResult.size_bytes
                }
              }
            : msg
        ));
      }

      // Clear file after successful upload
      setTimeout(() => {
        handleRemoveFile();
        setIsUploadingFile(false);
        setUploadProgress(0);
      }, 1000);

    } else {
      // No file, just send text message
      const messagePayload = {
        message_content: messageContent,
        own_id: parseInt(userId),
        recipient_id: dynamicRecipientId,
        chat_type: chat_type
      };

      console.log('📤 Sending message:', messagePayload);

      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('send_message', messagePayload, (ack) => {
          console.log('✅ Message acknowledged by server', ack);
          
          if (ack?.success || ack?.message_id) {
            setMessages(prev => prev.map(msg => 
              msg.id === tempMessageId 
                ? { ...msg, isPending: false, serverId: ack.message_id }
                : msg
            ));
          }
        });
      } else {
        console.error('❌ Socket not connected');
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessageId 
            ? { ...msg, isPending: false, isFailed: true }
            : msg
        ));
        setSocketError('Not connected. Please wait...');
        return;
      }
    }

    setInputValue('');
    setIsLoadingAnswer(true);
    setTimeout(() => setIsTyping(true), 500);

  } catch (error) {
    console.error('❌ Error sending message/file:', error);
    setSocketError(error.message || 'Failed to send');
    setIsUploadingFile(false);
    setUploadProgress(0);
    
    // Mark message as failed
    setMessages(prev => prev.map(msg => 
      msg.id === tempMessageId 
        ? { ...msg, isPending: false, isFailed: true }
        : msg
    ));
  }
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (ext) => {
    const extension = ext?.toLowerCase() || '';
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
      return <Image size={16} />;
    }
    if (['.pdf', '.doc', '.docx', '.txt'].includes(extension)) {
      return <FileText size={16} />;
    }
    return <File size={16} />;
  };

  if (isLoadingChat) {
    return (
      <div className={`flex flex-col h-full bg-white ${className} border-l border-gray-200`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Loading chat history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white shadow-xl border-l border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-xs">{assistantAvatar}</span>
          </div>
          <h3 className="font-semibold text-gray-800 text-base">{assistantName}</h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
            title="Close Chat"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => {
          const isFromCurrentUser = message.type === 'user';
          
          if (message.isStatus) {
            return (
              <div key={message.id} className="flex items-start gap-2 justify-center my-3">
                <div className="flex-shrink-0 mt-0.5">
                  {!message.isComplete ? (
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <p className={`text-xs font-medium transition-all text-center ${
                  message.isComplete ? 'text-gray-400 line-through' : 'text-gray-600'
                }`}>
                  {message.content}
                </p>
              </div>
            );
          }

          return (
            <div key={message.id} className={`flex gap-3 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
              {!isFromCurrentUser && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-xs">{assistantAvatar}</span>
                </div>
              )}
              
              <div className={`flex flex-col ${isFromCurrentUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className={`px-3 py-2 text-sm rounded-xl shadow-sm ${
                    isFromCurrentUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  
                  {/* File attachment */}
                  {message.file && (
                    <div className={`mt-2 pt-2 border-t ${isFromCurrentUser ? 'border-blue-500' : 'border-gray-300'}`}>
                      <div className="flex items-center gap-2">
                        <div className={isFromCurrentUser ? 'text-blue-100' : 'text-gray-600'}>
                          {getFileIcon(message.file.ext)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isFromCurrentUser ? 'text-white' : 'text-gray-800'}`}>
                            {message.file.filename}
                          </p>
                          <p className={`text-xs ${isFromCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                            {formatFileSize(message.file.size_bytes)}
                          </p>
                        </div>
                        <button
                          onClick={() => downloadFileFromUrl(message.file.url, message.file.filename)}
                          className={`p-1 rounded hover:bg-opacity-20 hover:bg-black transition-colors ${
                            isFromCurrentUser ? 'text-white' : 'text-blue-600'
                          }`}
                          title="Download file"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTime(message.timestamp)}
                </p>
              </div>

              {isFromCurrentUser && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-xs">{userAvatar}</span>
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">{assistantAvatar}</span>
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg rounded-tl-none p-3 inline-block">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {/* File upload progress */}
        {isUploadingFile && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-900">Uploading file...</span>
              <span className="text-sm font-medium text-blue-900">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Selected file preview */}
        {selectedFile && !isUploadingFile && (
          <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="text-gray-600">
                  {getFileIcon(`.${selectedFile.name.split('.').pop()}`)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="flex items-center gap-2">
          {/* File upload button */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="*/*"
            disabled={!isConnected || isLoadingAnswer || isUploadingFile}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected || isLoadingAnswer || isUploadingFile || selectedFile}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>

          {/* Text input */}
          <div className="flex-1">
            <TextareaAutosize
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                selectedFile
                  ? 'Press send to upload file...'
                  : !isConnected
                  ? 'Connecting...'
                  : isLoadingAnswer
                  ? 'AI is thinking...'
                  : 'What do you want to get done? (Shift+Enter for new line)'
              }
              disabled={!isConnected || isLoadingAnswer || isUploadingFile || !dynamicRecipientId || selectedFile}
              minRows={1}
              maxRows={6}
              className="w-full resize-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm overflow-hidden"
            />
          </div>

          {/* Send button */}
          <button 
            onClick={handleSendMessage}
            disabled={(!inputValue.trim() && !selectedFile) || !isConnected || isLoadingAnswer || isUploadingFile || !dynamicRecipientId}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {(isLoadingAnswer || isUploadingFile) ? (
              <Loader2 size={18} className="text-white animate-spin" />
            ) : (
              <Send size={18} className="text-white" />
            )}
          </button>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center mt-2 px-2">
          <div className="flex items-center gap-1">
            <span className="text-blue-600 text-xs">⚡</span>
            <p className="text-xs text-gray-500">
              {assistantName} helps manage your project scope and tasks.
            </p>
          </div>
          {!isConnected && (
            <span className="text-xs px-2 py-0.5 rounded-full text-red-600 bg-red-50">
              Disconnected
            </span>
          )}
        </div>

        {/* Error message */}
        {socketError && (
          <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600">{socketError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManagerSidebar;