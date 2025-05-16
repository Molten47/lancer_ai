import React, { useState, useEffect, useRef } from 'react'
import { Send, ChevronDown, ChevronUp } from 'lucide-react'

const MessageCl = () => {
    // State declarations
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const [hasInteraction, setHasInteraction] = useState(false)

    const suggestionQuestions = [
      "What services do you offer?",
      "How can I find freelancers for my project?",
      "What are the payment options?",
      "How do I create a new task?",
      "Can you help me with project management?",
      "What's the best way to communicate with freelancers?"
    ]

    // Filter suggestions based on input value
    const filteredSuggestions = inputValue.trim() !== "" 
      ? suggestionQuestions.filter(q => 
          q.toLowerCase().includes(inputValue.toLowerCase())
        )
      : []

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    
    useEffect(() => {
      scrollToBottom()
    }, [messages])

    // Show suggestions when user starts typing
    useEffect(() => {
      if (inputValue.trim() !== "") {
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
      }
    }, [inputValue])

    const handleSendMessage = (e) => {
      if (e) e.preventDefault()
      if (!inputValue.trim()) return
      
      // Set interaction state to true to enable scrolling
      setHasInteraction(true)
      
      // Add user message
      const newUserMessage = { id: messages.length + 1, text: inputValue, sender: "user" }
      setMessages([...messages, newUserMessage])
      
      // Clear input and hide suggestions
      setInputValue("")
      setShowSuggestions(false)
      
      // Simulate AI response
      setTimeout(() => {
        let responseText = ""
        
        // Some canned responses based on possible questions
        if (inputValue.toLowerCase().includes("service")) {
          responseText = "We offer a wide range of freelance services including web development, design, content writing, marketing, and more!"
        } else if (inputValue.toLowerCase().includes("freelancer")) {
          responseText = "You can find freelancers by posting a task and browsing through our talented pool of professionals. You can filter by skills, ratings, and availability."
        } else if (inputValue.toLowerCase().includes("payment")) {
          responseText = "We support multiple payment methods including credit cards, PayPal, and bank transfers. All payments are secured through our escrow system."
        } else if (inputValue.toLowerCase().includes("task")) {
          responseText = "To create a new task, click on the 'Task' option in the sidebar menu, then click '+ New Task' and fill in the details of your project."
        } else {
          responseText = "Thanks for your question! I'd be happy to help with that. Could you provide more details so I can give you the most relevant information?"
        }
        
        const newAiMessage = { id: messages.length + 2, text: responseText, sender: "ai" }
        setMessages(prevMessages => [...prevMessages, newAiMessage])
      }, 1000)
    }
    
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleSendMessage()
      }
    }
    
    const handleSuggestionClick = (question) => {
      setInputValue(question)
      setHasInteraction(true)
      setTimeout(() => {
        handleSendMessage()
      }, 0)
    }

    return (
      <div className={`flex flex-col h-full w-full ${!hasInteraction ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {messages.length === 0 ? (
          // Initial centered view when no messages
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-[2rem] font-semibold mb-8 text-center text-dark basic-font">What do you wants to get done today?</h1>
            <div className="w-full max-w-3xl px-4 mt-5">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Write your message here"
                  className="w-full py-5 px-6 rounded-2xl border border-[#cccccc] bg-light text-[#6B7280] basic-font focus:outline-none focus:ring-2 focus:ring-[#1e1e2f]"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 ${
                    inputValue.trim() 
                      ? 'cursor-pointer' 
                      : 'cursor-not-allowed'
                  }`}
                >
                  <Send size={20} className={inputValue.trim() ? 'text-primary' : 'text-primary'} />
                </button>
              </div>
              
              {/* Suggestions dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-full max-w-3xl">
                  {filteredSuggestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(question)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Conversation view with messages
          <div className="flex flex-col h-full">
            {/* Messages container with flex-grow to push input to bottom */}
            <div className="flex-grow overflow-y-auto px-4 py-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`p-4 rounded-2xl ${
                        message.sender === 'user' 
                          ? 'bg-cta text-light basic-font max-w-xl' 
                          : 'bg-light basic-font max-w-xl'
                      }`}
                    >
                      {message.text}
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 ml-2 mt-auto flex-shrink-0"></div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Input container - fixed at bottom */}
            <div className="px-4 py-4 border-t border-gray-200 bg-white">
              <div className="max-w-3xl mx-auto relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Write your message here"
                  className="w-full py-4 px-6 pr-12 rounded-2xl border border-[#cccccc] bg-light text-[#6B7280] basic-font focus:outline-none focus:ring-2 focus:ring-[#1e1e2f]"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                    inputValue.trim() 
                      ? 'bg-primary text-white cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send size={20} />
                </button>
                
                {/* Suggestions dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-full">
                    {filteredSuggestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(question)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
}

export default MessageCl