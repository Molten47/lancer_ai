import React, { useState, useEffect, useRef } from 'react'
import { Sidebar, Bell, User, Settings, Home, BarChart2, FileText, Search, Wallet, PieChart, MessageCircle, Send, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
const DashboardCl = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! I'm your AI assistant. How can I help you today?", sender: "ai" }
  ])
  const [inputValue, setInputValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef(null)
  
  const suggestionQuestions = [
    "What services do you offer?",
    "How can I find freelancers for my project?",
    "What are the payment options?",
    "How do I create a new task?",
    "Can you help me with project management?",
    "What's the best way to communicate with freelancers?"
  ]

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    
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
  
  const handleSuggestionClick = (question) => {
    setInputValue(question)
    handleSendMessage({ preventDefault: () => {} })
  }

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-white">
      {/* Navigation bar */}
      <nav className="w-full py-3 px-6 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-6">
          {/* Brand circles */}
          <div className="flex items-center gap-2 pl-3">
            <div className="flex items-center gap-1">
              <motion.div className="w-3 h-3 rounded-full bg-blue-900"
                            animate={{ y: [0, -2, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: "easeInOut"
                  
                }}
              ></motion.div>
              <motion.div className="w-3 h-3 rounded-full bg-blue-500"
              animate={{ y: [0, -2, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: "easeInOut",
                  delay: 0.2
                }}
              ></motion.div>
              <motion.div className="w-3 h-3 rounded-full bg-indigo-300"
              animate={{ y: [0, -2, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: "easeInOut",
                  delay: 0.4
                }}
              ></motion.div>
            </div>
          </div>
          <button 
            onClick={toggleSidebar} 
            className="p-2 hover:bg-gray-100 text-gray-700 rounded-full transition-colors"
            aria-label="Toggle sidebar"
          >
            <Sidebar size={20} />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 bg-light rounded-full transition-colors">
            <User size={20} />
          </button>
          <motion.button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
               animate={{ y: [0, -2, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: "easeInOut",
                  delay: 0.4
                }}
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">3</span>
          </motion.button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Search size={20} />
          </button>
        </div>
      </nav>

      {/* Main content area with sidebar */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`}>
          <div className="p-4">
            <h2 className="text-2xl font-bold text-primary basic-font">LANCER</h2>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1">
            <a href="#" className="flex items-center px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md relative group">
              <div className="absolute left-0 w-1 h-full bg-primary rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Home size={20} className="mr-3 text-gray-400 group-hover:text-[#0c0950] transition-colors" />
              <span className="group-hover:text-[#0c0950] basic-font transition-colors">Dashboard</span>
            </a>
         
            <a href="#" className="flex items-center px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md transition-colors relative group">
              <div className="absolute left-0 w-1 h-full bg-primary rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <FileText size={20} className="mr-3 text-gray-400 group-hover:text-[#0c0950] transition-colors" />
              <span className="group-hover:text-[#0c0950] basic-font transition-colors">Task</span>
            </a>
            <a href="#" className="flex items-center px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md transition-colors relative group">
              <div className="absolute left-0 w-1 h-full bg-primary rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <MessageCircle size={20} className="mr-3 text-gray-400 group-hover:text-[#0c0950] transition-colors" />
              <span className="group-hover:text-[#0c0950] basic-font transition-colors">Messages</span>
              <span className="ml-auto flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">2</span>
            </a>
            <a href="#" className="flex items-center px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md transition-colors relative group">
              <div className="absolute left-0 w-1 h-full bg-primary rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Wallet size={20} className="mr-3 text-gray-400 group-hover:text-[#0c0950] transition-colors" />
              <span className="group-hover:text-[#0c0950] basic-font transition-colors">My Wallets</span>
            </a>
                    <a href="#" className="flex items-center px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md transition-colors relative group">
              <div className="absolute left-0 w-1 h-full bg-primary rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <PieChart size={20} className="mr-3 text-gray-400 group-hover:text-[#0c0950] transition-colors" />
              <span className="group-hover:text-[#0c0950] basic-font transition-colors">Activity</span>
            </a>
            <a href="#" className="flex items-center px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md transition-colors relative group">
              <div className="absolute left-0 w-1 h-full bg-primary rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <BarChart2 size={20} className="mr-3 text-gray-400 group-hover:text-[#0c0950] transition-colors" />
              <span className="group-hover:text-[#0c0950] basic-font transition-colors">Analytics</span>
            </a>
          </nav>
          
          <div className="p-3 mt-auto">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="ml-3">
               <a href="#" className="flex items-center px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md transition-colors relative group">
              <div className="absolute left-0 w-1 h-full bg-primary rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Settings size={20} className="mr-3 text-gray-400 group-hover:text-[#0c0950] transition-colors" />
              <span className="group-hover:text-[#0c0950] basic-font transition-colors">Settings</span>
            </a>
              <a href="#" className="flex items-center px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md transition-colors relative group">
              <div className="absolute left-0 w-1 h-full bg-primary rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <AlertCircle size={20} className="mr-3 text-gray-400 group-hover:text-[#0c0950] transition-colors" />
              <span className="group-hover:text-[#0c0950] basic-font transition-colors">Get Help</span>
            </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content - Chat Interface */}
        <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? '' : 'pl-6'}`}>
          {/* Chat messages area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className='flex justify-center items-center m-8'>
              <h2 className='basic-font text-primary text-[2rem] font-normal'>What do you want to get today?</h2>
            </div>
            <div className="max-w-7xl mx-auto">
              <div className="space-y-8">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-md p-4 rounded-lg ${
                        message.sender === 'user' 
                          ? 'bg-cta text-white basic-font'
                          : 'bg-light text-dark basic-font'
                      }`}
                    >
                      <p>{message.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
          
          {/* Suggestion chips */}
          {showSuggestions && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="max-w-3xl mx-auto">
                <div className="flex flex-wrap gap-2">
                  {suggestionQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(question)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Message input area */}
          <div className="p-6 border-t border-gray-200">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message here..."
                  className="new-font flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a8dff] focus:border-blue-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className={`px-4 py-3 rounded-lg font-medium ${
                    inputValue.trim() 
                      ? 'bg-cta text-white basic-font hover:bg-[#00b5b5]' 
                      : 'bg-cta text-white basic-font cursor-pointer'
                  } transition-colors`}
                >
                  <Send/>
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardCl