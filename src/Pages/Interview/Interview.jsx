import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, MessageSquare, Send, XCircle } from 'lucide-react';

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // BACKEND COMMENTED OUT - uncomment when backend is ready
  // const userId = localStorage.getItem('user_id');
  const userId = 'mock-user-123'; // Mock user ID for development
  
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [socketError, setSocketError] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const messagesEndRef = useRef(null);

  const interviewQuestions = [
    "Tell me about your most significant project experience related to your chosen job title.",
    "How do you handle tight deadlines and pressure in your work?",
    "Describe a time you faced a technical challenge and how you overcame it.",
    "What are your strengths and weaknesses as a freelancer/professional?",
    "How do you ensure effective communication with clients or team members?",
    "What are your long-term career goals?",
  ];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    // BACKEND COMMENTED OUT - uncomment when backend is ready
    /*
    // Log localStorage contents on mount
    console.log('Interview component mounted, localStorage:', {
      user_id: localStorage.getItem('user_id'),
      userRole: localStorage.getItem('userRole'),
      access_jwt: localStorage.getItem('access_jwt'),
      refresh_jwt: localStorage.getItem('refresh_jwt'),
    });

    if (!userId) {
      setSocketError('User ID is missing. Cannot start interview. Please log in.');
      navigate('/signin');
      return;
    }

    const checkProfile = async () => {
      try {
        const response = await fetch('https://lancer-backend-y9bv.onrender.com/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_jwt')}`,
            'Content-Type': 'application/json',
          },
        });
        const profileData = await response.json();
        console.log('Profile data in Interview:', profileData);
        if (!response.ok || !profileData.is_complete) {
          console.log('Profile incomplete, redirecting to /setup');
          navigate('/setup', { state: { role: localStorage.getItem('userRole') } });
          return;
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setSocketError('Failed to verify profile. Redirecting to setup.');
        navigate('/setup', { state: { role: localStorage.getItem('userRole') } });
        return;
      }

      // Simulate initial greeting and first question
      setIsLoadingQuestion(true);
      setTimeout(() => {
        setMessages([
          {
            sender_id: 'ai',
            message_content:
              "Welcome to the interview! This will help us understand your experience and working style better. I'll ask you 6 questions - please answer them one at a time.",
            sender_tag: 'sender_a',
          },
        ]);
        setTimeout(() => {
          if (interviewQuestions[currentQuestionIndex]) {
            setMessages((prev) => [
              ...prev,
              {
                sender_id: 'ai',
                message_content: interviewQuestions[currentQuestionIndex],
                sender_tag: 'sender_a',
                is_question: true,
                interview_complete: false,
              },
            ]);
            setIsWaitingForResponse(true);
          }
          setIsLoadingQuestion(false);
        }, 1000);
      }, 500);
    };

    checkProfile();
    */

    // MOCK MODE - remove this when backend is ready
    console.log('Interview component mounted (mock mode)');

    // Simulate initial greeting and first question
    setIsLoadingQuestion(true);
    setTimeout(() => {
      setMessages([
        {
          sender_id: 'ai',
          message_content:
            "Welcome to the interview! This will help us understand your experience and working style better. I'll ask you 6 questions - please answer them one at a time.",
          sender_tag: 'sender_a',
        },
      ]);
      setTimeout(() => {
        if (interviewQuestions[currentQuestionIndex]) {
          setMessages((prev) => [
            ...prev,
            {
              sender_id: 'ai',
              message_content: interviewQuestions[currentQuestionIndex],
              sender_tag: 'sender_a',
              is_question: true,
              interview_complete: false,
            },
          ]);
          setIsWaitingForResponse(true);
        }
        setIsLoadingQuestion(false);
      }, 1000);
    }, 500);

    return () => {};
  }, [navigate]);

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

    if (currentInput.trim() === '' || !isWaitingForResponse) {
      return;
    }

    const userMessage = {
      sender_id: userId,
      message_content: currentInput.trim(),
      sender_tag: 'sender_b',
    };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentInput('');
    setIsWaitingForResponse(false);
    setIsLoadingQuestion(true);

    setTimeout(() => {
      const nextQuestionIndex = currentQuestionIndex + 1;
      if (nextQuestionIndex < interviewQuestions.length) {
        setMessages((prev) => [
          ...prev,
          {
            sender_id: 'ai',
            message_content: "Thank you for your answer. Here's the next question:",
            sender_tag: 'sender_a',
            is_question: false,
            interview_complete: false,
          },
          {
            sender_id: 'ai',
            message_content: interviewQuestions[nextQuestionIndex],
            sender_tag: 'sender_a',
            is_question: true,
            interview_complete: false,
          },
        ]);
        setCurrentQuestionIndex(nextQuestionIndex);
        setIsWaitingForResponse(true);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender_id: 'ai',
            message_content:
              'That concludes our interview! Thank you for your time and thoughtful responses. Your profile is now complete.',
            sender_tag: 'sender_a',
            is_question: false,
            interview_complete: true,
          },
        ]);
        setInterviewComplete(true);
      }
      setIsLoadingQuestion(false);
    }, 1500);
  };

  const handleContinueToDashboard = () => {
    navigate('/tasks');
  };

  if (socketError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required!</h2>
        <p className="text-gray-600 mb-4">{socketError}</p>
        <button
          onClick={() => navigate('/signin')}
          className="py-2 px-6 bg-updated hover:bg-[#00b5b5] text-white rounded-md shadow-md transition-all"
        >
          Go to Sign In
        </button>
        <button
          onClick={() => navigate('/setup')}
          className="mt-4 py-2 px-6 bg-gray-500 hover:bg-gray-600 text-white rounded-md shadow-md transition-all"
        >
          Go to Profile Setup
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white flex justify-center py-12">
      <div className="w-full max-w-6xl flex flex-col rounded-xl overflow-hidden shadow-xl">
        <div className="bg-updated text-white rounded-t-xl px-8 py-6 border-b border-gray-200">
          <h2 className="text-3xl text-white font-bold basic-font primary flex items-center">
             AI Interview
          </h2>
          <p className="mt-2 text-lg opacity-90 basic-font primary">
            {!interviewComplete
              ? "Our AI will ask you queastions to understand your skill better"
              : 'Interview complete! Your profile is ready.'}
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-updated h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentQuestionIndex / interviewQuestions.length) * 100}%` }}
            ></div>
          </div>
          <p className="mt-1 text-sm text-white basic-font">
            {currentQuestionIndex} of {interviewQuestions.length} questions answered
          </p>
        </div>

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
                      ? 'bg-updated text-white rounded-br-none'
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

          {!interviewComplete ? (
            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center">
                <textarea
                  value={currentInput}
                  onChange={handleInputChange}
                  disabled={!isConnected || !isWaitingForResponse || isLoadingQuestion}
                  className="flex-1 resize-none border border-gray-300 rounded-l-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-light basic-font h-12 overflow-hidden"
                  placeholder={
                    !isConnected
                      ? 'Connecting...'
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
                  disabled={!isConnected || !isWaitingForResponse || currentInput.trim() === '' || isLoadingQuestion}
                  className="bg-updated hover:bg-[#1447e6] text-white py-3 px-6 m-4 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5 rounded-lg" />
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
                className="bg-updated hover:bg-[#1447e6] text-white py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium basic-font"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;