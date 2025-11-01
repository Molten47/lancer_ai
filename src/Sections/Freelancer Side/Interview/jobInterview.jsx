import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, MessageSquare, Send, XCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import socket from '../../../Components/socket';
import TextareaAutosize from 'react-textarea-autosize';

const STATUS_MESSAGE_MAP = {
  'Recording provisional chat performance for freelancer 100': 'Recording chat performance...',
  'Updating user_profile with generated username and robust profile bio after interview termination.': 'Updating your profile...',
  'Recording chat performance score and review for freelancer 100.': 'Calculating test score...',
  'Updating freelancer username and profile bio after interview': 'Finalizing your profile...',
  'Evaluating freelancer responses': 'Evaluating your answers...',
  'Preparing next question': 'Preparing next question...',
  'Analyzing job requirements': 'Analyzing job requirements...',
};

const JobInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const own_id = localStorage.getItem('user_id');
  const messagesEndRef = useRef(null);

  console.log('🚀 JobInterview component initialized (Agent Mode)');
  console.log('📍 Location state:', location.state);
  console.log('👤 Own ID from localStorage:', own_id);

  const { recipient_id, chat_type } = location.state || {};
  console.log('🎯 Interview details - recipient_id:', recipient_id, 'chat_type:', chat_type);
 
  // If no interview data, redirect
  useEffect(() => {
    if (!recipient_id || !chat_type) {
      navigate('/notifications', { replace: true });
    }
  }, [recipient_id, chat_type, navigate]);

  if (!recipient_id || !chat_type) {
    return null;
  }

  // --- State declarations ---
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  //const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [socketError, setSocketError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

  console.log('📊 Initial state setup complete');

  // Helper function to mark last status message as complete
  const markLastStatusComplete = () => {
    setMessages(prev => {
      const lastStatusIndex = prev.map((msg, idx) => msg.isStatus ? idx : -1)
        .filter(idx => idx !== -1)
        .pop();
      
      if (lastStatusIndex !== undefined && lastStatusIndex >= 0) {
        const updated = [...prev];
        updated[lastStatusIndex] = { ...updated[lastStatusIndex], isComplete: true };
        return updated;
      }
      return prev;
    });
  };

  useEffect(() => {
    console.log('🔄 Main useEffect triggered (Agent Mode)');
    let isMounted = true;

    const checkAuthentication = () => {
      console.log('🔐 Checking authentication...');
      const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id');
      console.log('🔑 Auth token exists:', !!authToken);
      console.log('👤 User ID exists:', !!userId);
      
      if (!authToken || !userId) {
        console.log('❌ Authentication failed - missing token or user ID');
        if (isMounted) {
          setSocketError('Authentication failed. Please sign in again.');
          setIsLoading(false);
          setTimeout(() => {
            console.log('↪️ Redirecting to signin due to auth failure');
            navigate('/signin', { replace: true });
          }, 2000);
        }
        return false;
      }
      console.log('✅ Authentication check passed');
      return true;
    };

    const initializeInterview = async () => {
      console.log('🔧 Initializing interview (Agent Mode)...');
      if (!checkAuthentication()) {
        return;
      }

      try {
        if (isMounted) {
          console.log('⏳ Setting loading state and status');
          setIsLoading(true);
          setStatusMessage('Connecting to interview agent...');
        }

        const API_URL = import.meta.env.VITE_API_URL;
        const queryParams = new URLSearchParams({
          chat_type: chat_type,
          own_id: own_id,
          recipient_id: recipient_id
        });
        
        console.log('🌐 API URL:', API_URL);
        console.log('📋 Query params:', queryParams.toString());
       
        const authToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        };

        console.log('📡 Making API request to initialize interview...');
        const response = await fetch(`${API_URL}/api/chat?${queryParams}`, {
          method: 'GET',
          headers: headers,
          mode: 'cors',
          credentials: 'include'
        });

        console.log('📥 API response status:', response.status);
        const chatData = await response.json();
        console.log('📄 Chat data received:', chatData);

        if (!response.ok) {
          console.log('❌ API request failed:', chatData.error_message);
          if (isMounted) {
            setSocketError(chatData.error_message || `HTTP ${response.status}: Failed to initialize interview`);
            setIsLoading(false);
          }
          return;
        }

        if (chat_type === 'interview' && !chatData.well_received) {
          console.log('❌ Interview not accepted by server');
          if (isMounted) {
            setSocketError('Job interview was not accepted by server');
            setIsLoading(false);
          }
          return;
        }
       
        // After successful API call, just mark as ready (no room joining)
        if (isMounted) {
          console.log('✅ API call successful, interview ready');
          setIsLoading(false);
          setStatusMessage('Connected. Awaiting first question...');
          
       
        }

      } catch (error) {
        console.log('❌ Error in initializeInterview:', error);
        if (isMounted) {
          let errorMessage = 'Failed to initialize job interview';
          if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to server. Check your internet connection.';
          } else if (error.message.includes('401')) {
            errorMessage = 'Authentication failed. Please sign in again.';
          } else {
            errorMessage = error.message;
          }
          console.log('💥 Setting error message:', errorMessage);
          setSocketError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    // Socket listeners setup (simplified for agent mode)
    const setupSocketListeners = () => {
      console.log('🔌 Setting up socket listeners (Agent Mode)...');
      
      // Connection status listeners
      socket.on('connect', () => {
        console.log('🟢 Socket connected (Agent Mode)');
        if (isMounted) {
          setIsConnected(true);
          setSocketError('');
          setStatusMessage('Connected to interview agent...');
          
          if (recipient_id && own_id) {
            // 🔑 Join room using own_id first (standard pattern)
            const userId = parseInt(own_id);
            console.log('🚪 Joining user room:', userId);
            socket.emit('join', {
              room_name: String(userId),
              user: userId
            });
            
            // 🔑 ALSO join the interview-specific room
            console.log('🚪 Joining interview room:', recipient_id);
            socket.emit('join', {
              room_name: String(recipient_id),
              user: userId
            });
            
            // 📤 Notify server about interview session start
            console.log('📤 Notifying server about interview session');
            socket.emit('interview_session_start', {
              recipient_id: recipient_id,
              own_id: userId,
              chat_type: chat_type
            });
          }
        }
      });

      socket.on('disconnect', () => {
        console.log('🔴 Socket disconnected');
        if (isMounted) {
          setIsConnected(false);
          setStatusMessage('Disconnected. Reconnecting...');
        }
      });

      socket.on('connect_error', (error) => {
        console.log('💥 Socket connection error:', error);
        if (isMounted) {
          setSocketError('Failed to connect to interview server.');
          setIsConnected(false);
          setIsLoading(false);
        }
      });
     
      // Interview session confirmation (replaces room joined)
      socket.on('interview_session_ready', (data) => {
        console.log('🎉 Interview session ready event received:', data);
        if (isMounted && data.recipient_id === recipient_id) {
          console.log('✅ Interview session confirmed ready:', data);
          setStatusMessage('Connected. Awaiting first question...');
          setIsLoading(false);
        }
      });

      // Interview-specific listeners
      socket.on('new_message', (data, callback) => {
        console.log('💬 New message received:', data);
        if (isMounted) {
          // Mark the last status message as complete before adding new message
          markLastStatusComplete();

          const { message_content, sender_tag, own_id: senderOwnId, recipient_id } = data;
          const newMessage = {
            id: Date.now(),
            sender_id: senderOwnId || 'interviewer',
            message_content: message_content,
            sender_tag: sender_tag || 'interviewer',
            recipient_id: recipient_id,
            timestamp: new Date().toISOString(),
            questionNumber: data.questionNumber,
            totalQuestions: data.totalQuestions,
            isStatus: false
          };
          console.log('📝 Adding new message to state:', newMessage);
          setMessages(prev => {
            console.log('📚 Previous messages count:', prev.length);
            const updated = [...prev, newMessage];
            console.log('📚 Updated messages count:', updated.length);
            return updated;
          });
          //setIsWaitingForResponse(true);
          setIsLoading(false);
          setIsLoadingQuestion(false);
          setStatusMessage('');
          console.log('✅ Message state updated, waiting for user response');
        }
        if (callback && typeof callback === 'function') {
          console.log('🔄 Calling message callback');
          callback();
        }
      });

      socket.on('control_instruction', (data, callback) => {
        console.log('🎮 Control instruction received:', data);
        if (isMounted) {
          const { command, data: instructionData } = data;
          console.log('📋 Processing command:', command, 'with data:', instructionData);
          
          switch (command) {
            case 'interview_complete':
              console.log('🏁 Interview completed');
              markLastStatusComplete(); // Mark any pending status as complete
              setInterviewComplete(true);
              //setIsWaitingForResponse(false);
              setIsLoading(false);
              setIsLoadingQuestion(false);
              setStatusMessage('Interview finished!');
              break;
            case 'next_question':
              console.log('❓ Next question command received');
              //setIsWaitingForResponse(true);
              setIsLoading(false);
              setIsLoadingQuestion(false);
              break;
            case 'error':
              console.log('❌ Error command received:', instructionData?.message);
              setSocketError(instructionData?.message || 'An error occurred');
              setIsLoading(false);
              setIsLoadingQuestion(false);
              setStatusMessage('');
              break;
            case 'redirect':
              const redirectPath = instructionData.content === '/freelancer-dashboard'
                ? '/freelancer-dashboard'
                : instructionData.content;
              console.log('↪️ Redirect command received, navigating to:', redirectPath);
              navigate(redirectPath);
              break;
            default:
              console.log('❓ Unknown command received:', command);
          }
        }
        if (callback && typeof callback === 'function') {
          console.log('🔄 Calling control instruction callback');
          callback();
        }
      });

      socket.on('status_update', (data, callback) => {
        console.log('📊 Status update received:', data);
        if (isMounted && data.update) {
          // Mark the previous status message as complete before adding new one
          markLastStatusComplete();

          const customMessage = STATUS_MESSAGE_MAP[data.update] || data.update;
          console.log('📢 Custom status message:', customMessage);
          const statusMessage = {
            id: Date.now(),
            sender_id: 'status',
            message_content: customMessage,
            timestamp: new Date().toISOString(),
            isStatus: true,
            isComplete: false  // New status starts as incomplete
          };
          console.log('📝 Adding status message to state:', statusMessage);
          setMessages(prev => [...prev, statusMessage]);
          setIsLoadingQuestion(true);
          setStatusMessage(customMessage);
        }
        if (callback && typeof callback === 'function') {
          console.log('🔄 Calling status update callback');
          callback();
        }
      });

      socket.on('notification', (data, callback) => {
        console.log('🔔 Notification received:', data);
        if (isMounted) {
          if (data.type === 'error') {
            console.log('❌ Error notification:', data.message);
            setSocketError(data.message);
          }
          console.log(`📢 Notification ${data.type}: ${data.message}`);
        }
        if (callback && typeof callback === 'function') {
          console.log('🔄 Calling notification callback');
          callback();
        }
      });

      console.log('✅ Socket listeners setup complete (Agent Mode)');
    };

    const cleanupSocketListeners = () => {
      console.log('🧹 Cleaning up socket listeners...');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('interview_session_ready');
      socket.off('new_message');
      socket.off('control_instruction');
      socket.off('status_update');
      socket.off('notification');
      console.log('✅ Socket listeners cleanup complete');
    };

    // Initial setup
    console.log('🚀 Starting initialization process (Agent Mode)...');
    initializeInterview();
    setupSocketListeners();
   
    // Cleanup function
    return () => {
      console.log('🔄 Component unmounting, running cleanup...');
      isMounted = false;
      cleanupSocketListeners();
      
      // Notify server about session end (no room leaving needed)
      if (socket.connected) {
        console.log('👋 Notifying server about interview session end');
        socket.emit('interview_session_end', {
          recipient_id: recipient_id,
          own_id: parseInt(own_id),
          chat_type: chat_type
        });
      }
      console.log('✅ Component cleanup complete');
    };
  }, [navigate, own_id, chat_type, recipient_id]);

  // Scroll to bottom effect
  useEffect(() => {
    console.log('📜 Scroll effect triggered, messages count:', messages.length);
    scrollToBottom();
  }, [messages]);

  // Utility and handler functions
  const scrollToBottom = () => {
    console.log('📜 Scrolling to bottom');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    console.log('✏️ Input changed, new value length:', e.target.value.length);
    setCurrentInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📤 Form submission attempted');
    console.log('📤 Current input:', currentInput.trim());
    //console.log('📤 Is waiting for response:', isWaitingForResponse);
    console.log('📤 Is connected:', isConnected);
    console.log('📤 Is loading question:', isLoadingQuestion);
    
    if (currentInput.trim() === '' || isLoadingQuestion || !isConnected) {
      console.log('❌ Form submission blocked - conditions not met');
      console.log('   - Empty input:', currentInput.trim() === '');
      //console.log('   - Not waiting for response:', !isWaitingForResponse);
      console.log('   - Not connected:', !isConnected);
      return;
    }

    // Mark last status as complete when user sends a message
    markLastStatusComplete();
    
    const userMessage = {
      id: Date.now(),
      sender_id: parseInt(own_id),
      message_content: currentInput.trim(),
      sender_tag: 'user',
      timestamp: new Date().toISOString(),
      isStatus: false
    };
    
    console.log('📝 Adding user message to state:', userMessage);
    setMessages(prev => {
      console.log('📝 Previous messages before user input:', prev.length);
      const updated = [...prev, userMessage];
      console.log('📝 Messages after adding user input:', updated.length);
      return updated;
    });
    
    const messagePayload = {
      message_content: currentInput.trim(),
      own_id: parseInt(own_id || localStorage.getItem('user_id')),
      recipient_id: recipient_id,
      chat_type: chat_type
    };
    
    console.log('📤 Emitting interview_response with payload:', messagePayload);
    console.log('🔌 Socket connected before emit:', socket.connected);
    console.log('🔌 Socket ID:', socket.id);
    
    // Use specific event for interview responses (not generic send_message)
    socket.emit('send_message', messagePayload);
    
    console.log('✅ Response emitted, updating UI state');
    setCurrentInput('');
    //setIsWaitingForResponse(false);
    setIsLoadingQuestion(true);
    setStatusMessage('Processing your answer...');
    console.log('🔄 UI state updated after response send');
  };

  const handleBackToNotifications = () => {
    console.log('↪️ Navigating back to notifications');
    navigate('/notifications');
  };
  
  const handleContinueToDashboard = () => {
    console.log('↪️ Navigating to task dashboard');
    navigate('/task');
  };
 
  // Log current state for debugging
  console.log('📊 Current component state:', {
    messagesCount: messages.length,
    isLoading,
    isConnected,
    //isWaitingForResponse,
    interviewComplete,
    isLoadingQuestion,
    socketError,
    statusMessage,
    currentInputLength: currentInput.length
  });

  // --- Render logic ---
  if (isLoading && !socketError) {
    console.log('🔄 Rendering loading state');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <Loader2 className="h-16 w-16 text-green-600 mb-4 animate-spin" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connecting</h2>
        <p className="text-gray-600">{statusMessage}</p>
      </div>
    );
  }

  // Error state
  if (socketError) {
    console.log('❌ Rendering error state:', socketError);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
        <p className="text-gray-600 mb-4 max-w-md">{socketError}</p>
        <button
          onClick={() => {
            console.log('🔄 Reloading page due to error');
            window.location.reload();
          }}
          className="py-2 px-6 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-md transition-all mr-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  console.log('🎨 Rendering main interview interface (Agent Mode)');

  // Main interface
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-green-50 to-white flex justify-center py-12 third-font">
      <div className="w-full max-w-6xl flex flex-col rounded-xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-green-600 text-white rounded-t-xl px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl text-white font-bold flex items-center">
              <MessageSquare className="mr-3" />
              Job Interview
            </h2>
            <button
              onClick={handleBackToNotifications}
              className="flex items-center text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Notifications
            </button>
          </div>
          <p className="mt-2 text-lg opacity-90">
            {!interviewComplete
              ? "You're being interviewed by our AI agent for a specific job opportunity"
              : 'Interview complete! The client will review your responses.'}
          </p>
          <div className="mt-2 flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm opacity-75">
              {isConnected ? 'Connected to interview agent' : 'Connecting...'}
            </span>
          </div>
          <div className="mt-2 text-sm opacity-75">
            Interview ID: {recipient_id}
          </div>
          {messages.some(m => m.questionNumber) && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-white h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.max(0, messages.filter(m => m.questionNumber).length /
                      (messages.find(m => m.totalQuestions)?.totalQuestions || 6) * 100)}%`
                  }}
                ></div>
              </div>
              <p className="mt-1 text-sm text-white">
                {messages.filter(m => m.questionNumber).length} questions answered
              </p>
            </div>
          )}
        </div>

        {/* Chat content */}
        <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {!isConnected && messages.length === 0 && (
              <div className="text-center text-green-600 p-2 bg-green-100 rounded-md">
                <Loader2 className="inline-block h-4 w-4 animate-spin mr-1" />
                Connecting to interview agent...
              </div>
            )}
            
            {/* Messages */}
            {messages.map((message) => (
              <div key={message.id}>
                {message.isStatus ? (
                  // Status message with conditional spinner/checkmark
                  <div className="flex items-start gap-3 px-2 py-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {!message.isComplete ? (
                        <Loader2 className="h-4 w-4 text-green-600 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm leading-relaxed ${message.isComplete ? 'text-gray-500' : 'text-gray-600'}`}>
                        {message.message_content}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Regular chat message bubble
                  <div
                    className={`flex ${message.sender_id === parseInt(own_id) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-4 rounded-xl shadow-sm ${message.sender_id === parseInt(own_id)
                        ? 'bg-green-600 text-white rounded-br-none'
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
                )}
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoadingQuestion && (
              <div className="flex items-start gap-3 px-2 py-1">
                <div className="flex-shrink-0 mt-0.5">
                  <Loader2 className="h-4 w-4 text-green-600 animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {STATUS_MESSAGE_MAP[statusMessage] || statusMessage || 'Interview agent is preparing...'}
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form or completion message */}
          {!interviewComplete ? (
            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center">
                <TextareaAutosize
                  value={currentInput}
                  onChange={handleInputChange}
                  disabled={!isConnected ||isLoadingQuestion}
                  className="flex-1 resize-none border border-gray-300 rounded-l-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 h-12 overflow-hidden"
                  placeholder={
                    !isConnected
                      ? 'Connecting...'
                      : isLoadingQuestion
                        ? STATUS_MESSAGE_MAP[statusMessage] || statusMessage || 'Interview agent is working...'
                        : 'Type your response...' // <-- SIMPLIFIED: No longer needs isWaitingForResponse
                  }
                  rows={1}
                  minRows={1}
                  maxRows={6}
                />
                <button
                  type="submit"
                  disabled={!isConnected || currentInput.trim() === '' || isLoadingQuestion}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 m-4 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          ) : (
            <div className="border-t border-gray-200 p-6 flex flex-col items-center bg-white">
              <p className="text-center text-gray-700 mb-4">
                You've successfully completed the job interview! The client will review your responses and get back to you.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleBackToNotifications}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium"
                >
                  Back to Notifications
                </button>
                <button
                  onClick={handleContinueToDashboard}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium"
                >
                  Continue to Tasks
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobInterview;