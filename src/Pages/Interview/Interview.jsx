import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Interview = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const messagesEndRef = useRef(null);

  // Pool of potential interview questions
  const interviewQuestions = [
    "What makes you passionate about freelancing in your field?",
    "Describe your most challenging project and how you overcame obstacles.",
    "How do you manage deadlines and ensure timely delivery?",
    "What's your approach to communicating with clients throughout a project?",
    "Tell us about a time when you had to adapt to unexpected changes in a project.",
    "How do you stay updated with the latest trends and skills in your industry?",
    "What's your process for understanding client requirements before starting a project?",
    "How do you handle constructive criticism or revision requests?",
    "What tools or software are essential to your workflow?",
    "How do you prioritize tasks when working on multiple projects simultaneously?"
  ];

  // Select 6 random questions from the pool
  const [selectedQuestions] = useState(() => {
    const shuffled = [...interviewQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  });

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting message when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        {
          type: 'system',
          text: 'Welcome to the interview! This will help us understand your experience and working style better. I\'ll ask you 6 questions - please answer them one at a time.'
        }
      ]);
      
      // Ask first question after greeting
      setTimeout(() => {
        askNextQuestion();
      }, 1000);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const askNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length) {
      const newMessage = {
        type: 'system',
        text: selectedQuestions[currentQuestionIndex]
      };
      
      setMessages(prev => [...prev, newMessage]);
      setIsWaitingForResponse(true);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions have been asked
      setTimeout(() => {
        setMessages(prev => [
          ...prev, 
          {
            type: 'system',
            text: 'Thank you for completing the interview! Your profile is almost ready. Please click the "Continue to Dashboard" button below to proceed.'
          }
        ]);
        setInterviewComplete(true);
      }, 1000);
    }
  };

  const handleInputChange = (e) => {
    setCurrentInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentInput.trim() === '' || !isWaitingForResponse) return;
    
    // Add user's answer to chat
    const newMessage = {
      type: 'user',
      text: currentInput
    };
    
    setMessages(prev => [...prev, newMessage]);
    setCurrentInput('');
    setIsWaitingForResponse(false);
    
    // Small delay before asking next question
    setTimeout(askNextQuestion, 1000);
  };

  const handleContinueToDashboard = () => {
    navigate('/freelancer-dashboard');
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white flex justify-center py-12">
      <div className="w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-t-xl shadow-lg px-8 py-6">
          <h2 className="text-3xl font-bold basic-font primary">Freelancer Interview</h2>
          <p className="mt-2 text-lg opacity-90 basic-font primary">
            {!interviewComplete 
              ? "Please answer each question to complete your profile setup" 
              : "All questions answered! Your profile is ready"}
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-cta h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${Math.min(100, (currentQuestionIndex / selectedQuestions.length) * 100)}%` }}
            ></div>
          </div>
          <p className="mt-1 text-sm text-gray-500 basic-font">
            {!interviewComplete 
              ? `Question ${currentQuestionIndex} of ${selectedQuestions.length}` 
              : `${selectedQuestions.length} of ${selectedQuestions.length} complete!`}
          </p>
        </div>
        
        {/* Chat area */}
        <div className="flex-1 bg-white shadow-lg overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 p-4 rounded-xl ${
                    message.type === 'user' 
                      ? 'bg-cta text-white rounded-br-none' 
                      : 'bg-light text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm md:text-base basic-font">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area or CTA button for completion */}
          {!interviewComplete ? (
            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <input
                  type="text"
                  value={currentInput}
                  onChange={handleInputChange}
                  disabled={!isWaitingForResponse}
                  className="flex-1 border border-gray-300 rounded-l-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 basic-font"
                  placeholder={isWaitingForResponse ? "Type your answer..." : "Please wait..."}
                />
                <button
                  type="submit"
                  disabled={!isWaitingForResponse || currentInput.trim() === ''}
                  className="bg-cta hover:bg-[#00b5b5] text-white py-3 px-6 rounded-r-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </form>
          ) : (
            <div className="border-t border-gray-200 p-6 flex flex-col items-center">
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