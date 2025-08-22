import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, MessageSquare, Send, XCircle, ArrowRight, Clock, CheckCircle, Brain, User, FileText } from 'lucide-react';
import socket from '../../Components/socket';

const Interview = ({ chat_type = 'platform_interviewer'}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const own_id = localStorage.getItem('user_id');
  
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [interviewId, setInterviewId] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showRedirectPrompt, setShowRedirectPrompt] = useState(false);
  const [awaitingAck, setAwaitingAck] = useState(false);
  
  // New states for streamlined profile creation flow
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [profileCreationStage, setProfileCreationStage] = useState(''); // 'username', 'bio', 'finalizing'
  const [hasTriggeredProfileCreation, setHasTriggeredProfileCreation] = useState(false);
  
  // Status state - simplified for the new flow
  const [interviewStatus, setInterviewStatus] = useState('connecting');
  
  // NEW: Timer-based header message states
  const [headerMessage, setHeaderMessage] = useState('');
  const [headerMessageType, setHeaderMessageType] = useState(''); // 'processing', 'success', 'info'
  const [messageTimer, setMessageTimer] = useState(null);
  const [headerProgress, setHeaderProgress] = useState(0);
  
  const messagesEndRef = useRef(null);

  // NEW: Header message progression after user sends message
  const headerMessageSequence = [
    { message: "Your answer has been received", type: "success", duration: 2000, progress: 20 },
    { message: "AI is analyzing your response", type: "processing", duration: 3000, progress: 40 },
    { message: "Creating your profile bio", type: "processing", duration: 4000, progress: 60 },
    { message: "AI is saving your data", type: "processing", duration: 3000, progress: 80 },
    { message: "You will soon be directed to carry out your first task", type: "info", duration: 2000, progress: 100 },
    { message: "Profile creation complete!", type: "success", duration: 1500, progress: 100 }
  ];

  // NEW: Function to start header message progression
  const startHeaderMessageProgression = () => {
    let currentIndex = 0;
    setHeaderProgress(0);
    
    const showNextMessage = () => {
      if (currentIndex < headerMessageSequence.length) {
        const currentMsg = headerMessageSequence[currentIndex];
        setHeaderMessage(currentMsg.message);
        setHeaderMessageType(currentMsg.type);
        setHeaderProgress(currentMsg.progress);
        
        const timer = setTimeout(() => {
          currentIndex++;
          showNextMessage();
        }, currentMsg.duration);
        
        setMessageTimer(timer);
        
        // If this is the last message, trigger profile creation completion
        if (currentIndex === headerMessageSequence.length - 1) {
          setTimeout(() => {
            setInterviewComplete(true);
            setShowRedirectPrompt(true);
            setInterviewStatus('completed');
            setIsCreatingProfile(false);
            setHeaderMessage('');
          }, currentMsg.duration);
        }
      }
    };
    
    showNextMessage();
  };

  // NEW: Clear header message timer
  const clearHeaderMessageTimer = () => {
    if (messageTimer) {
      clearTimeout(messageTimer);
      setMessageTimer(null);
    }
  };

  // Function to get status display info - updated for streamlined flow
  const getStatusInfo = () => {
    // NEW: Show header message if active
    if (headerMessage) {
      const icons = {
        processing: <Brain className="h-4 w-4 animate-pulse" />,
        success: <CheckCircle className="h-4 w-4" />,
        info: <Clock className="h-4 w-4" />
      };
      
      const colors = {
        processing: 'text-yellow-200',
        success: 'text-green-200',
        info: 'text-blue-200'
      };
      
      return {
        icon: icons[headerMessageType] || <Brain className="h-4 w-4" />,
        text: headerMessage,
        color: colors[headerMessageType] || 'text-white'
      };
    }

    if (isCreatingProfile) {
      switch (profileCreationStage) {
        case 'username':
          return {
            icon: <User className="h-4 w-4 animate-pulse" />,
            text: 'AI is creating your username...',
            color: 'text-blue-200'
          };
        case 'bio':
          return {
            icon: <FileText className="h-4 w-4 animate-pulse" />,
            text: 'AI is generating your bio...',
            color: 'text-purple-200'
          };
        case 'finalizing':
          return {
            icon: <CheckCircle className="h-4 w-4 animate-pulse" />,
            text: 'Finalizing your profile...',
            color: 'text-green-200'
          };
        default:
          return {
            icon: <Brain className="h-4 w-4 animate-pulse" />,
            text: 'AI is creating your profile...',
            color: 'text-yellow-200'
          };
      }
    }

    switch (interviewStatus) {
      case 'connecting':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Connecting to interview server...',
          color: 'text-blue-200'
        };
      case 'preparing_question':
        return {
          icon: <Brain className="h-4 w-4 animate-pulse" />,
          text: 'AI is preparing your question...',
          color: 'text-yellow-200'
        };
      case 'waiting_response':
        return {
          icon: <Clock className="h-4 w-4" />,
          text: 'Waiting for your response...',
          color: 'text-green-200'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Interview completed successfully!',
          color: 'text-green-300'
        };
      default:
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Processing...',
          color: 'text-white'
        };
    }
  };

  // Function to simulate profile creation stages
  const simulateProfileCreation = async () => {
    setIsCreatingProfile(true);
    
    // Stage 1: Creating username
    setProfileCreationStage('username');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Stage 2: Generating bio
    setProfileCreationStage('bio');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Stage 3: Finalizing
    setProfileCreationStage('finalizing');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Complete profile creation
    setIsCreatingProfile(false);
    setProfileCreationStage('');
    setInterviewComplete(true);
    setShowRedirectPrompt(true);
    setInterviewStatus('completed');
  };

  // Check if message is a trigger message (auto-generated message that signals profile creation)
  const isTriggerMessage = (messageContent) => {
    // You can customize this logic based on your trigger message format
    const triggerKeywords = [
      'start profile creation',
      'begin interview',
      'create my profile',
      'proceed with setup'
    ];
    
    return triggerKeywords.some(keyword => 
      messageContent.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Socket connection management (same as before but with profile creation trigger)
  useEffect(() => {
    console.log('Interview component mounted, localStorage:', {
      user_id: localStorage.getItem('user_id'),
      userRole: localStorage.getItem('userRole'),
      access_jwt: localStorage.getItem('access_jwt'),
      refresh_jwt: localStorage.getItem('refresh_jwt'),
      access_token: localStorage.getItem('access_token'),
      refresh_token: localStorage.getItem('refresh_token'),
    });

    // Authentication check (same as before)
    const token = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('userRole');
    
    if (!userId && !userRole) {
      console.log('No user data found, redirecting to signup');
      setSocketError('Please complete the signup process first.');
      setTimeout(() => {
        navigate('/signup', { replace: true });
      }, 1500);
      return;
    }

    if (!token && userRole) {
      console.log('User in signup flow, checking if they need to complete profile setup');
      const fromProfileSetup = location.state?.fromProfileSetup;
      
      if (!fromProfileSetup) {
        setSocketError('Please complete your profile setup first.');
        setTimeout(() => {
          navigate('/profile_setup', { 
            replace: true, 
            state: { role: userRole } 
          });
        }, 1500);
        return;
      }
    }

    if (!userId && userRole) {
      console.log('Missing user ID, redirecting to signin');
      setSocketError('Session data incomplete. Please sign in again.');
      setIsLoadingAuth(false);
      setTimeout(() => {
        navigate('/signin', { replace: true });
      }, 1500);
      return;
    }

    setIsLoadingAuth(false);

    // Initialize chat (same as before)
    const initializeChat = async () => {
      try {
        setIsLoadingQuestion(true);
        setInterviewStatus('preparing_question');
        
        const API_URL = import.meta.env.VITE_API_URL;
        
        console.log('Initializing chat with API_URL:', API_URL);
        
        const queryParams = new URLSearchParams({
          chat_type: chat_type,
          own_id: own_id || localStorage.getItem('user_id') || 'temp_user',
          recipient_id: 'platform_interviewer' 
        });
        
        const headers = {
          'Content-Type': 'application/json',
        };

        const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_URL}/api/chat?${queryParams}`, {
          method: 'GET',
          headers: headers,
          mode: 'cors',
          credentials: 'include'
        });

        let chatData;
        try {
          chatData = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          if (import.meta.env.DEV) {
            console.warn('JSON parsing failed, attempting socket connection anyway...');
            if (!socket.connected) {
              socket.connect();
            }
            return;
          }
          throw new Error('Invalid response format from server');
        }

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Server error text:' , errorText);
          
          if (response.status === 401) {
            if (!authToken) {
              setSocketError('Please complete the signup process to start the interview.');
              setTimeout(() => {
                navigate('/signup', { replace: true });
              }, 2000);
            } else {
              setSocketError('Session expired. Please sign in again.');
              setTimeout(() => {
                navigate('/signin', { replace: true });
              }, 1000);
            }
            return;
          } else if (response.status === 500) {
            console.error('500 SERVER ERROR - error cause:', errorText);
          }
          throw new Error(chatData.error_message || `HTTP ${response.status}: Failed to initialize chat`);
        }

        if (chat_type === 'platform_interviewer') {
          if (!chatData.well_received) {
            throw new Error('Platform interview was not accepted by server');
          }
          console.log('Platform interview initialized successfully');
        }
        
        if (!socket.connected) {
          socket.connect();
        }
        
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        
        let errorMessage = 'Failed to initialize interview';
        
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
          if (error.message.includes('CORS') || error.toString().includes('CORS')) {
            errorMessage = 'Connection blocked by CORS policy. Please contact support or try again later.';
            
            if (import.meta.env.DEV) {
              console.warn('CORS error detected, but attempting socket connection for development...');
              setTimeout(() => {
                if (!socket.connected) {
                  socket.connect();
                }
              }, 2000);
              errorMessage += ' (Attempting socket connection anyway for development)';
            }
          } else {
            errorMessage = 'Cannot connect to server. Please check your internet connection or try again later.';
          }
        } else if (error.message.includes('401') || error.message.includes('unrecognized')) {
          errorMessage = 'Authentication failed. Please sign in again.';
        } else if (error.message.includes('well_received')) {
          errorMessage = 'Server rejected the interview request';
        } else if (error.message.includes('API URL')) {
          errorMessage = 'Server configuration error. Please contact support.';
        } else {
          errorMessage = error.message;
        }
        
        setSocketError(errorMessage);
        setIsLoadingQuestion(false);
        
        if (errorMessage.includes('sign in') || errorMessage.includes('Authentication')) {
          setTimeout(() => {
            navigate('/signin', { replace: true });
          }, 2000);
        }
        return;
      }
    };

    initializeChat();

    // Setup socket event listeners - UPDATED FOR STREAMLINED FLOW
    const setupSocketListeners = () => {
      socket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        setSocketError('');
        setIsLoadingQuestion(false);
        
        const userId = own_id || localStorage.getItem('user_id');
        socket.emit('join', {
          room_name: String(userId),
          user: parseInt(userId)
        });
        
        console.log('Joined socket room with:', {
          room_name: String(userId),
          user: parseInt(userId)
        });
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
        setInterviewStatus('connecting');
        // NEW: Clear header messages on disconnect
        clearHeaderMessageTimer();
        setHeaderMessage('');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setSocketError('Failed to connect to interview server');
        setIsConnected(false);
        setIsLoadingQuestion(false);
        // NEW: Clear header messages on error
        clearHeaderMessageTimer();
        setHeaderMessage('');
      });

      // UPDATED: Message listener with trigger detection
      socket.on('new_message', (data) => {
        console.log('Received new message:', data);
        
        const { message_content, sender_tag, own_id: senderOwnId, recipient_id } = data;
        
        const messageId = `${senderOwnId}_${Date.now()}_${message_content.slice(0, 20)}`;
        
        setMessages(prev => {
          const isDuplicate = prev.some(msg => 
            msg.sender_id === senderOwnId && 
            msg.message_content === message_content && 
            Math.abs(new Date(msg.timestamp).getTime() - Date.now()) < 5000
          );
          
          if (isDuplicate) {
            console.log('Duplicate message detected, skipping');
            return prev;
          }
          
          const newMessage = {
            id: messageId,
            sender_id: senderOwnId || 'ai',
            message_content: message_content,
            sender_tag: sender_tag || 'ai',
            recipient_id: recipient_id,
            timestamp: new Date().toISOString(),
            questionNumber: data.questionNumber,
            totalQuestions: data.totalQuestions
          };
          
          return [...prev, newMessage];
        });
        
        setIsWaitingForResponse(true);
        setIsLoadingQuestion(false);
        setAwaitingAck(false);
        
        if (sender_tag === 'ai' || senderOwnId === 'platform_interviewer') {
          setInterviewStatus('waiting_response');
        }
      });

      // UPDATED: Control instruction listener for profile creation trigger
      socket.on('control_instruction', (data) => {
        console.log('Received control instruction:', data);
        
        const { command, data: instructionData } = data;
        
        switch(command) {
          case 'start_profile_creation':
            console.log('Profile creation triggered by server');
            if (!hasTriggeredProfileCreation) {
              setHasTriggeredProfileCreation(true);
              // NEW: Start header message progression instead of profile creation simulation
              startHeaderMessageProgression();
            }
            break;
          case 'start_header_progression':
            console.log('Header message progression triggered by server');
            startHeaderMessageProgression();
            break;
          case 'interview_complete':
            setInterviewComplete(true);
            setIsWaitingForResponse(false);
            setShowRedirectPrompt(true);
            setInterviewStatus('completed');
            clearHeaderMessageTimer();
            setHeaderMessage('');
            break;
          case 'redirect':
            console.log('Interview redirect triggered');
            setShowRedirectPrompt(true);
            setInterviewStatus('completed');
            clearHeaderMessageTimer();
            setHeaderMessage('');
            break;
          case 'error':
            setSocketError(instructionData?.message || 'An error occurred');
            clearHeaderMessageTimer();
            setHeaderMessage('');
            break;
          default:
            console.log('Unknown command:', command);
        }
      });

      socket.on('status_update', (data) => {
        console.log('Received status update:', data);
        if (data.update) {
          console.log('Status:', data.update);
        }
      });

      socket.on('notification', (data) => {
        console.log('Received notification:', data);
        
        const { message, sender, type, anc } = data;
        
        if (type === 'error') {
          setSocketError(message);
          clearHeaderMessageTimer();
          setHeaderMessage('');
        } else if (type === 'warning') {
          console.warn('Notification warning:', message);
        } else if (type === 'info') {
          console.info('Notification info:', message);
        }
        
        if (anc) {
          console.log('Additional notification context:', anc);
        }
      });

      socket.on('message_acknowledged', (data) => {
        console.log('Message acknowledged:', data);
        setAwaitingAck(false);
        setIsSending(false);
      });
    };

    setupSocketListeners();

    // NEW: Cleanup function to clear timers
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('new_message');
      socket.off('control_instruction');
      socket.off('status_update');
      socket.off('notification');
      socket.off('message_acknowledged');
      clearHeaderMessageTimer();
    };
  }, [navigate, own_id, chat_type, location.state]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setCurrentInput(e.target.value);
  };

  // UPDATED: Handle submit with trigger detection and header message progression
  const handleSubmit = (e) => {
    e.preventDefault();

    if (currentInput.trim() === '' || !isWaitingForResponse || !isConnected || isSending || awaitingAck) {
      return;
    }

    setIsSending(true);
    setAwaitingAck(true);

    const userMessage = {
      id: `user_${Date.now()}`,
      sender_id: parseInt(own_id),
      message_content: currentInput.trim(),
      sender_tag: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // NEW: Start header message progression after user sends ANY message
    // This gives immediate feedback regardless of message content
    setTimeout(() => {
      startHeaderMessageProgression();
    }, 1000); // Small delay to show the user message first
    
    // Send message to server
    socket.emit('send_message', {
      message_content: currentInput.trim(),
      own_id: parseInt(own_id || localStorage.getItem('user_id')),
      recipient_id: 'platform_interviewer'
    }, (acknowledgment) => {
      if (acknowledgment === "Acknowledged" || acknowledgment?.status === 'success') {
        setAwaitingAck(false);
        setIsSending(false);
        console.log('Message successfully acknowledged');
      }
    });

    setCurrentInput('');
    setIsWaitingForResponse(false);
    setIsLoadingQuestion(true);
  };

  const handleContinueToDashboard = () => {
    clearHeaderMessageTimer();
    setShowRedirectPrompt(false);
    navigate('/task', { replace: true });
  };

  const handleDismissRedirect = () => {
    setShowRedirectPrompt(false);
  };

  // Show loading while checking authentication
  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <Loader2 className="h-16 w-16 text-blue-600 mb-4 animate-spin" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Setting Up Interview</h2>
        <p className="text-gray-600">Please wait while we prepare your interview...</p>
      </div>
    );
  }

  // Error state (same as before)
  if (socketError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {socketError.includes('Authentication') || socketError.includes('sign in') 
            ? 'Authentication Required' 
            : 'Connection Error'}
        </h2>
        <p className="text-gray-600 mb-4 max-w-md">{socketError}</p>
        
        {import.meta.env.DEV && (
          <div className="mb-4 p-3 bg-yellow-100 rounded-lg text-sm text-left max-w-md">
            <strong>Debug Info:</strong><br/>
            User ID: {own_id || localStorage.getItem('user_id') || 'null'}<br/>
            Has Token: {localStorage.getItem('access_jwt') ? 'Yes' : 'No'}<br/>
            API URL: {import.meta.env.VITE_API_URL || 'Not set'}<br/>
            User Role: {localStorage.getItem('userRole') || 'Not set'}<br/>
            From Profile Setup: {location.state?.fromProfileSetup ? 'Yes' : 'No'}
          </div>
        )}
        
        <div className="space-y-2">
          {!socketError.includes('Authentication') && !socketError.includes('sign in') && (
            <button
              onClick={() => {
                setSocketError('');
                window.location.reload();
              }}
              className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-all mr-2"
            >
              Try Again
            </button>
          )}
          
          <button
            onClick={() => navigate('/signin', { replace: true })}
            className="py-2 px-6 bg-gray-500 hover:bg-gray-600 text-white rounded-md shadow-md transition-all"
          >
            Go to Sign In
          </button>
          
          {localStorage.getItem('userRole') && (
            <button
              onClick={() => navigate('/profile_setup', { replace: true })}
              className="mt-2 py-2 px-6 bg-green-500 hover:bg-green-600 text-white rounded-md shadow-md transition-all block mx-auto"
            >
              Go to Profile Setup
            </button>
          )}
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white flex justify-center py-4 md:py-12 px-2 md:px-0">
      <div className="w-full max-w-6xl flex flex-col rounded-none md:rounded-xl overflow-hidden shadow-none md:shadow-xl">
        {/* Header - UPDATED with enhanced header message display */}
        <div className="bg-blue-600 text-white rounded-none md:rounded-t-xl px-4 md:px-8 py-4 md:py-6 border-b border-gray-200">
          <h2 className="text-xl md:text-3xl text-white font-bold flex items-center">
            <MessageSquare className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
            {headerMessage ? 'AI Processing' : isCreatingProfile ? 'AI Profile Creation' : 'AI Interview'}
          </h2>
          <p className="mt-1 md:mt-2 text-sm md:text-lg opacity-90">
            {headerMessage 
              ? "AI is working on your profile in the background"
              : isCreatingProfile 
                ? "AI is setting up your personalized profile"
                : !interviewComplete
                  ? "Our AI will ask you questions to understand your skills better"
                  : 'Interview complete! Your profile is ready.'}
          </p>
          
          {/* Status indicators - UPDATED for header messages */}
          <div className="mt-3 md:mt-4 space-y-1 md:space-y-2">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-1 md:space-y-0">
              {/* Connection status */}
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-xs md:text-sm opacity-75">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
                {awaitingAck && (
                  <span className="text-xs ml-2 opacity-60">
                    • Sending...
                  </span>
                )}
              </div>
              
              {/* Header Message/Profile Creation/Interview Status Indicator */}
              <div className={`flex items-center ${statusInfo.color}`}>
                <span className="flex items-center">
                  {statusInfo.icon}
                </span>
                <span className="text-xs md:text-sm ml-2 font-medium">
                  {statusInfo.text}
                </span>
              </div>
            </div>
          </div>

          {/* NEW: Header message progress bar */}
          {headerMessage && (
            <div className="mt-3 md:mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-2.5">
                <div
                  className="bg-white h-2 md:h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${headerProgress}%` }}
                ></div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-white opacity-75">
                <span>Analyzing</span>
                <span>Creating Bio</span>
                <span>Saving Data</span>
                <span>Complete</span>
              </div>
            </div>
          )}

          {/* Profile Creation Progress - only show if not using header messages */}
          {isCreatingProfile && !headerMessage && (
            <div className="mt-3 md:mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-2.5">
                <div
                  className="bg-white h-2 md:h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: profileCreationStage === 'username' ? '33%' : 
                           profileCreationStage === 'bio' ? '66%' : 
                           profileCreationStage === 'finalizing' ? '100%' : '10%'
                  }}
                ></div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-white opacity-75">
                <span className={profileCreationStage === 'username' ? 'font-semibold' : ''}>Username</span>
                <span className={profileCreationStage === 'bio' ? 'font-semibold' : ''}>Bio</span>
                <span className={profileCreationStage === 'finalizing' ? 'font-semibold' : ''}>Complete</span>
              </div>
            </div>
          )}

          {/* Original progress bar for regular interview - only show if no header messages */}
          {!isCreatingProfile && !headerMessage && messages.some(m => m.questionNumber) && (
            <div className="mt-3 md:mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-2.5">
                <div
                  className="bg-white h-2 md:h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${Math.max(0, messages.filter(m => m.questionNumber).length / 
                      (messages.find(m => m.totalQuestions)?.totalQuestions || 6) * 100)}%` 
                  }}
                ></div>
              </div>
              <p className="mt-1 text-xs md:text-sm text-white">
                {messages.filter(m => m.questionNumber).length} questions answered
              </p>
            </div>
          )}
        </div>

        {/* Redirect Prompt Modal - UPDATED messaging */}
        {showRedirectPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Profile Created!</h3>
                <p className="text-sm md:text-base text-gray-600 mb-6">
                  Congratulations! AI has successfully created your personalized profile with username and bio. You're now ready to explore available tasks.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleContinueToDashboard}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                  >
                    Continue to Tasks
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDismissRedirect}
                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    Stay Here
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages - SAME AS BEFORE */}
        <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {!isConnected && (
              <div className="text-center text-blue-600 p-2 bg-blue-100 rounded-md">
                <Loader2 className="inline-block h-4 w-4 animate-spin mr-1" /> 
                Connecting to interview server...
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === parseInt(own_id) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-xl shadow-sm ${
                    message.sender_id === parseInt(own_id)
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                  }`}
                >
                  <p className="text-sm md:text-base">{message.message_content}</p>
                  {message.questionNumber && (
                    <p className="text-xs mt-1 opacity-75">
                      Question {message.questionNumber} of {message.totalQuestions}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Profile Creation Status Message - only show if not using header messages */}
            {isCreatingProfile && !headerMessage && (
              <div className="flex justify-center">
                <div className="max-w-[75%] p-4 rounded-xl shadow-sm bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 border border-blue-200">
                  <div className="flex items-center justify-center">
                    {statusInfo.icon}
                    <p className="text-sm md:text-base ml-2 font-medium">{statusInfo.text}</p>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: profileCreationStage === 'username' ? '33%' : 
                               profileCreationStage === 'bio' ? '66%' : 
                               profileCreationStage === 'finalizing' ? '100%' : '10%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* NEW: Header message status display in chat area */}
            {headerMessage && (
              <div className="flex justify-center">
                <div className="max-w-[75%] p-4 rounded-xl shadow-sm bg-gradient-to-r from-green-100 to-blue-100 text-gray-800 border border-green-200">
                  <div className="flex items-center justify-center">
                    {statusInfo.icon}
                    <p className="text-sm md:text-base ml-2 font-medium">{headerMessage}</p>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-green-500 h-1 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${headerProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {isLoadingQuestion && !isCreatingProfile && !headerMessage && (
              <div className="flex justify-start">
                <div className="max-w-[75%] p-4 rounded-xl shadow-sm bg-white text-gray-800 rounded-bl-none border border-gray-200">
                  <p className="text-sm md:text-base animate-pulse">AI is thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area - UPDATED to disable during header message progression */}
          {!interviewComplete && !isCreatingProfile && !headerMessage ? (
            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center">
                <textarea
                  value={currentInput}
                  onChange={handleInputChange}
                  disabled={!isConnected || !isWaitingForResponse || isLoadingQuestion || awaitingAck}
                  className="flex-1 resize-none border border-gray-300 rounded-l-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 overflow-hidden"
                  placeholder={
                    !isConnected
                      ? 'Connecting...'
                      : awaitingAck
                        ? 'Sending message...'
                        : isLoadingQuestion
                          ? 'AI is thinking...'
                          : isWaitingForResponse
                            ? 'Type your response...'
                            : 'Please wait...'
                  }
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!isConnected || !isWaitingForResponse || currentInput.trim() === '' || isLoadingQuestion || isSending || awaitingAck}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 m-4 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {(isSending || awaitingAck) ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>
          ) : (isCreatingProfile || headerMessage) ? (
            <div className="border-t border-gray-200 p-6 flex flex-col items-center bg-white">
              <div className="flex items-center mb-4">
                {statusInfo.icon}
                <p className="text-center text-gray-700 ml-2 font-medium">
                  {headerMessage || statusInfo.text}
                </p>
              </div>
              <p className="text-center text-gray-500 text-sm">
                {headerMessage 
                  ? "AI is processing your information and creating your profile..."
                  : "Please wait while AI creates your personalized profile..."}
              </p>
            </div>
          ) : (
            <div className="border-t border-gray-200 p-6 flex flex-col items-center bg-white">
              <p className="text-center text-gray-700 mb-4">
                Your AI-generated profile is now ready!
              </p>
              <button
                onClick={handleContinueToDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium"
              >
                Continue to Tasks
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;