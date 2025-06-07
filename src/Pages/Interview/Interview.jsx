import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import io from 'socket.io-client'; // Import the socket.io-client library
import { Loader2, MessageSquare, CornerDownLeft, XCircle } from 'lucide-react'; // Added Loader2 for loading states

// Define your backend Socket.IO URL
const SOCKET_SERVER_URL = '/'; // Use your Vite proxy, or 'http://127.0.0.1:5000' if direct

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve user_id. This is crucial for room joining.
  // Assuming it's stored in localStorage after successful authentication/profile setup.
  const userId = localStorage.getItem('user_id');
  const room = String(userId); // Room ID is user_id stringified

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [isConnected, setIsConnected] = useState(false); // To show connection status
  const [socketError, setSocketError] = useState(''); // To display socket connection errors
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false); // For AI typing indicator
  const messagesEndRef = useRef(null);

  // --- Socket.IO Connection and Event Handling ---
  useEffect(() => {
    if (!userId) {
      setSocketError('User ID is missing. Cannot start interview. Please log in.');
      // Optionally redirect to login/setup if userId is critical for this page
      // navigate('/setup'); // or '/signin'
      return;
    }

    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      auth: {
        token: localStorage.getItem('jwtToken') // Send JWT for authentication if your backend requires it
      },
      query: {
        userId: userId // Send userId in query for initial server-side identification if needed
      }
    });

    setSocket(newSocket);

    // Socket Event Listeners
    newSocket.on('connect', () => {
      console.log('Socket Connected:', newSocket.id);
      setIsConnected(true);
      setSocketError(''); // Clear any previous errors

      // Emit 'join' event to join the specific room
      console.log(`Attempting to join room: ${room} with user_id: ${userId}`);
      newSocket.emit('join', { user_id: parseInt(userId), room: room }); // user_id as int, room as string

      // Initial greeting from the AI (emitted by backend or hardcoded here after join success)
      // If the backend sends an 'initial_greeting' event, listen for that instead.
      setTimeout(() => {
        setMessages([
          {
            sender_id: 'ai',
            message_content: 'Welcome to the interview! This will help us understand your experience and working style better. I\'ll ask you 6 questions - please answer them one at a time.',
            sender_tag: 'sender_a' // AI is sender_a
          }
        ]);
        // Signal backend to send the first question after initial greeting
        newSocket.emit('request_next_question', { own_id: room });
        setIsLoadingQuestion(true); // Show typing indicator while waiting for first question
      }, 500);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket Disconnected');
      setIsConnected(false);
      setSocketError('Disconnected from chat. Please check your network.');
      setIsLoadingQuestion(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket Connection Error:', err.message);
      setSocketError(`Connection failed: ${err.message}. Retrying...`);
      setIsConnected(false);
      setIsLoadingQuestion(false);
    });

    // Listen for incoming messages/questions from the AI
    // The backend should emit a 'message' event for AI responses/questions
    newSocket.on('message', (message) => {
      console.log('Received message:', message);
      // Expected structure: { sender_id: 'ai', message_content: 'Question?', sender_tag: 'sender_a', is_question: true/false, interview_complete: true/false }
      setMessages((prevMessages) => [...prevMessages, message]);

      if (message.interview_complete) {
        setInterviewComplete(true);
        setIsWaitingForResponse(false); // No more input
      } else {
        setIsWaitingForResponse(true); // Ready for user input after receiving a question
      }
      setIsLoadingQuestion(false); // Hide typing indicator
    });

    // Cleanup on component unmount
    return () => {
      console.log('Disconnecting socket...');
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.off('message');
      newSocket.off('join'); // Ensure all listeners are cleaned up
      newSocket.off('request_next_question');
      newSocket.disconnect();
    };
  }, [userId, room]); // Dependencies for useEffect

  // Auto-scroll to bottom of chat when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setCurrentInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (currentInput.trim() === '' || !isWaitingForResponse || !socket || !isConnected) {
      if (!isConnected) setSocketError('Not connected to chat server. Please wait.');
      return;
    }

    // Add user's answer to chat optimistically
    const userMessage = {
      sender_id: userId,
      message_content: currentInput.trim(),
      sender_tag: 'sender_b', // Freelancer is sender_b
    };
    setMessages(prev => [...prev, userMessage]);

    // Emit the message to the AI via Socket.IO
    const messageDataForAI = {
      message_content: currentInput.trim(),
      own_id: room, // freelancer's user_id stringified
      recipient_id: 'ai', // AI's ID
      sender_tag: 'sender_b', // Freelancer is sender_b
    };
    console.log('Emitting send_message to AI:', messageDataForAI);
    socket.emit('send_message', messageDataForAI);

    setCurrentInput('');
    setIsWaitingForResponse(false); // Wait for AI's next question
    setIsLoadingQuestion(true); // Show typing indicator for AI response
  };

  const handleContinueToDashboard = () => {
    navigate('/dashboard'); // Assuming '/dashboard' is the freelancer's main dashboard
  };

  // Render warning if userId is not found
  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required!</h2>
        <p className="text-gray-600 mb-4">Your user ID is missing. Please ensure you are logged in or complete your profile setup.</p>
        <button
          onClick={() => navigate('/signin')}
          className="py-2 px-6 bg-cta hover:bg-[#00b5b5] text-white rounded-md shadow-md transition-all"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white flex justify-center py-12">
      <div className="w-full max-w-2xl flex flex-col rounded-xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-white rounded-t-xl px-8 py-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold basic-font primary flex items-center">
            <MessageSquare className="mr-2 h-7 w-7 text-primary" /> AI Interview
          </h2>
          <p className="mt-2 text-lg opacity-90 basic-font primary">
            {!interviewComplete
              ? "Answer the AI's questions to complete your profile"
              : "Interview complete! Your profile is ready."}
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-cta h-2.5 rounded-full transition-all duration-500 ease-out"
              // Progress bar logic will now be driven by backend (number of questions answered vs total)
              // For now, we'll make it static or remove it if backend doesn't send progress.
              // For demonstration, a placeholder might be used, or removed entirely.
              // The original component used `currentQuestionIndex` which is removed now.
              // We'll approximate progress based on message count or remove if backend doesn't send total questions.
              // Let's assume for now the backend will eventually provide total questions/current question count.
              // For a simple progress bar, we'd need to know total questions from backend.
              // If not, progress bar might be removed or simplified.
              style={{ width: `0%` }} // Placeholder, will update based on backend data
            ></div>
          </div>
          {/* <p className="mt-1 text-sm text-gray-500 basic-font">
            Progress will be shown here (based on backend feedback)
          </p> */}
        </div>

        {/* Chat area */}
        <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {!isConnected && socketError && (
              <div className="text-center text-red-600 p-2 bg-red-100 rounded-md">
                <XCircle className="inline-block h-4 w-4 mr-1" /> {socketError}
              </div>
            )}
            {!isConnected && !socketError && (
                 <div className="text-center text-blue-600 p-2 bg-blue-100 rounded-md">
                    <Loader2 className="inline-block h-4 w-4 animate-spin mr-1" /> Connecting to chat server...
                 </div>
            )}
            {messages.length === 0 && isConnected && !isLoadingQuestion && (
              <div className="text-center text-gray-500 mt-10">
                Waiting for the AI to start the interview...
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-xl shadow-sm ${
                    message.sender_id === userId
                      ? 'bg-cta text-white rounded-br-none'
                      : 'bg-light text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm md:text-base basic-font">{message.message_content}</p>
                </div>
              </div>
            ))}
            {isLoadingQuestion && (
              <div className="flex justify-start">
                <div className="max-w-[75%] p-4 rounded-xl shadow-sm bg-light text-gray-800 rounded-bl-none">
                  <p className="text-sm md:text-base basic-font animate-pulse">AI is typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area or CTA button for completion */}
          {!interviewComplete ? (
            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center">
                <textarea
                  value={currentInput}
                  onChange={handleInputChange}
                  // Disable if not connected, or not waiting for response, or AI is typing
                  disabled={!isConnected || !isWaitingForResponse || isLoadingQuestion}
                  className="flex-1 resize-none border border-gray-300 rounded-l-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-light basic-font h-12 overflow-hidden"
                  placeholder={
                    !isConnected
                      ? "Connecting..."
                      : isLoadingQuestion
                        ? "AI is thinking..."
                        : isWaitingForResponse
                          ? "Type your answer..."
                          : "Please wait..."
                  }
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!isConnected || !isWaitingForResponse || currentInput.trim() === '' || isLoadingQuestion}
                  className="bg-cta hover:bg-[#00b5b5] text-white py-3 px-6 rounded-r-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CornerDownLeft className="h-5 w-5" /> {/* Send icon */}
                </button>
              </div>
            </form>
          ) : (
            <div className="border-t border-gray-200 p-6 flex flex-col items-center bg-white">
              <p className="text-center text-gray-700 mb-4 new-font">
                You've successfully completed the interview! Your profile is now ready.
              </p>
              <button
                onClick={handleContinueToDashboard}
                className="bg-cta hover:bg-[#00b5b5] text-white py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium basic-font"
              >
                Continue to Dashboard
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;