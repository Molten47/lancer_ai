import React, { useState, useEffect, useRef } from 'react'
import { Sidebar, Bell, User, Settings, Home, BarChart2, FileText, Search, Wallet, PieChart, MessageCircle, Send, AlertCircle, ChevronDown, ChevronUp, Plus, ChevronLeft, ChevronRight, LucideShieldHalf, HardDriveDownload, LockKeyhole, ClipboardPaste, Clipboard, Download} from 'lucide-react'
import { motion } from 'framer-motion'

import DashboardView from '../../Sections/DashboardView/DashboardView'
import TaskManagement from '../../Sections/Task/Task'
import WalletView from '../../Sections/Wallet/Wallet'
import Activity from '../../Sections/Activity/Activity'
import MessageCl from '../../Sections/ClientMessage/MessageCl'
import Analytics from '../../Sections/Analysis/Analytics'

// These would be imported in a real application
const MessagesView = () => <div className="p-6">
  <MessageCl/>
</div>
const WalletsView = () => <div className="p-6">
  <WalletView/>
</div>
const ActivityView = () => <div className="p-6">
  <Activity/>
</div>
const AnalyticsView = () => <div className="p-6">
  <Analytics/>
</div>
const SettingsView = () => <div className="p-6">Settings Component</div>
const HelpView = () => <div className="p-6">Get Help Component</div>

const DashboardFr = () => {
  // State to track the active view
  const [activeView, setActiveView] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! I'm your AI assistant. How can I help you today?", sender: "ai" }
  ])
  const [inputValue, setInputValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef(null)
  const [isTaskDropdownOpen, setTaskDropdownOpen] = useState(false);
    
  // Function to get dynamic description based on active view
  const getViewDescription = () => {
    switch(activeView) {
      case 'dashboard':
        return 'Welcome Back, Besamad! What are you doing today?';
      case 'task': 
        return 'Manage your tasks and track project progress here!';
      case 'messages':
        return 'Stay connected with your clients and team members!';
      case 'wallets':
        return 'Manage your finances and track your earnings!';
      case 'activity':
        return 'Review your recent activities and performance!';
      case 'analytics':
        return 'Analyze your data and gain valuable insights!';
      case 'settings':
        return 'Customize your preferences and account settings!';
      case 'help':
        return 'Get assistance and find answers to your questions!';
      default:
        return 'Welcome Back, Besamad! What are you doing today?';
    }
  }

  
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

  // Function to render the appropriate view based on the active state
const renderView = () => {
  switch(activeView) {
    case 'dashboard':
      return <DashboardView />;
    case 'task': 
      return <TaskManagement />;
    case 'messages':
      return <MessagesView />;
    case 'wallets':
      return <WalletsView />;
    case 'activity':
      return <ActivityView />;
    case 'analytics':
      return <AnalyticsView />;
    case 'settings':
      return <SettingsView />;
    case 'help':
      return <HelpView />;
    default:
      return <DashboardView />;
  }
}

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-[#FEFFFF]">
      {/* Navigation bar */}
      <nav className="w-full py-3 px-6 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center w-[20%] gap-6">
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
          <div className='flex flex-row gap-0'>
            <ChevronLeft/>
            <ChevronRight/>
          </div>
        </div>
          <div className='flex flex-row w-[70%] gap-2 justify-center items-center'>
          <LucideShieldHalf size={20}/>
        <div className="relative w-4/6 justify-center items-center">
        <div className="absolute inset-y-0 left-3 flex justify-center items-center pointer-events-none">
          <LockKeyhole size={14}  />
        </div>
        {/* Search Input */}
        <input 
          type="search"
          placeholder="Search or enter URL..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-light text-[12px] font-normal focus:outline-none focus:ring-2 focus:ring-primary"
        />
        </div>
          </div>
          <div className='w-[10%] pl-10 flex flex-row gap-4 justify-center items-center'>
                    <HardDriveDownload/>
                    <Plus/>
                    <ClipboardPaste/>
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
            {/* Dashboard link */}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setActiveView('dashboard');
              }}
              className={`flex items-center px-4 py-4 font-medium hover:bg-blue-50 rounded-md relative group ${activeView === 'dashboard' ? 'text-[#0c0950] bg-blue-50' : 'text-dark'}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'dashboard' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <Home size={20} className={`mr-3 ${activeView === 'dashboard' ? 'text-[#0c0950]' : 'text-gray-400'} group-hover:text-[#0c0950] transition-colors`} />
              <span className="group-hover:text-[#0c0950] basic-font transition-colors">Dashboard</span>
            </a>
         
            {/* Task with dropdown */}
            <div>
              <button 
                onClick={() => setTaskDropdownOpen(!isTaskDropdownOpen)} 
                className="w-full flex items-center justify-between px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md transition-colors relative group"
              >
                <div className="flex items-center">
                  <div className="absolute left-0 w-1 h-full bg-primary rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <FileText size={20} className="mr-3 text-gray-400 group-hover:text-[#0c0950] transition-colors" />
                  <span className="group-hover:text-[#0c0950] basic-font transition-colors">Task</span>
                </div>
                {isTaskDropdownOpen ? 
                  <ChevronUp size={16} className="text-gray-400" /> : 
                  <ChevronDown size={16} className="text-gray-400" />
                }
              </button>
              
              {/* Task dropdown items */}
          {isTaskDropdownOpen && (
  <div className="ml-10 space-y-1 mt-1">
    <button 
      onClick={(e) => {
        e.preventDefault();
        setActiveView('task');
        setTaskDropdownOpen(false); // Close dropdown after selection
      }}
      className="w-full text-left flex items-center px-4 py-3 rounded-md bg-red-500 text-white basic-font hover:bg-red-600 transition-colors"
    >
      <span>Ongoing Tasks</span>
    </button>
    <button 
      onClick={(e) => {
        e.preventDefault();
        setActiveView('task');
        setTaskDropdownOpen(false); // Close dropdown after selection
      }}
      className="w-full text-left flex items-center px-4 py-3 rounded-md bg-green-500 text-white basic-font hover:green-600 transition-colors"
    >
      <span>Completed Tasks</span>
    </button>
  </div>
)}
            </div>
            
            {/* Messages link */}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setActiveView('messages');
              }}
              className={`flex items-center px-4 py-4 font-medium hover:bg-blue-50 rounded-md relative group ${activeView === 'messages' ? 'text-[#0c0950] bg-blue-50' : 'text-dark'}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'messages' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <MessageCircle size={20} className={`mr-3 ${activeView === 'messages' ? 'text-[#0c0950]' : 'text-gray-400'} group-hover:text-[#0c0950] transition-colors`} />
              <span className="group-hover:text-[#0c0950] basic-font transition-colors">Messages</span>
              <span className="ml-auto flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">2</span>
            </a>
            
            {/* Wallets link */}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setActiveView('wallets');
              }}
              className={`flex items-center px-4 py-4 font-medium hover:bg-blue-50 rounded-md relative group ${activeView === 'wallets' ? 'text-[#0c0950] bg-blue-50' : 'text-dark'}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'wallets' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <Wallet size={20} className={`mr-3 ${activeView === 'wallets' ? 'text-[#0c0950]' : 'text-gray-400'} group-hover:text-[#0c0950] transition-colors`} />
              <span className="group-hover:text-[#0c0950] basic-font transition-colors">My Wallets</span>
            </a>
            
            {/* Activity link */}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setActiveView('activity');
              }}
              className={`flex items-center px-4 py-4 font-medium hover:bg-blue-50 rounded-md relative group ${activeView === 'activity' ? 'text-[#0c0950] bg-blue-50' : 'text-dark'}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'activity' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <PieChart size={20} className={`mr-3 ${activeView === 'activity' ? 'text-[#0c0950]' : 'text-gray-400'} group-hover:text-[#0c0950] transition-colors`} />
              <span className="group-hover:text-[#0c0950] basic-font transition-colors">Activity</span>
            </a>
            
            {/* Analytics link */}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setActiveView('analytics');
              }}
              className={`flex items-center px-4 py-4 font-medium hover:bg-blue-50 rounded-md relative group ${activeView === 'analytics' ? 'text-[#0c0950] bg-blue-50' : 'text-dark'}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'analytics' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <BarChart2 size={20} className={`mr-3 ${activeView === 'analytics' ? 'text-[#0c0950]' : 'text-gray-400'} group-hover:text-[#0c0950] transition-colors`} />
              <span className="group-hover:text-[#0c0950] basic-font transition-colors">Analytics</span>
            </a>
          </nav>
          
          <div className="p-3 mt-auto">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="ml-3">
                {/* Settings link */}
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView('settings');
                  }}
                  className={`flex items-center px-4 py-4 font-medium hover:bg-blue-50 rounded-md relative group ${activeView === 'settings' ? 'text-[#0c0950] bg-blue-50' : 'text-dark'}`}
                >
                  <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'settings' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
                  <Settings size={20} className={`mr-3 ${activeView === 'settings' ? 'text-[#0c0950]' : 'text-gray-400'} group-hover:text-[#0c0950] transition-colors`} />
                  <span className="group-hover:text-[#0c0950] basic-font transition-colors">Settings</span>
                </a>
                
                {/* Get Help link */}
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView('help');
                  }}
                  className={`flex items-center px-4 py-4 font-medium hover:bg-blue-50 rounded-md relative group ${activeView === 'help' ? 'text-[#0c0950] bg-blue-50' : 'text-dark'}`}
                >
                  <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'help' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
                  <AlertCircle size={20} className={`mr-3 ${activeView === 'help' ? 'text-[#0c0950]' : 'text-gray-400'} group-hover:text-[#0c0950] transition-colors`} />
                  <span className="group-hover:text-[#0c0950] basic-font transition-colors">Get Help</span>
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content - Conditionally render based on active view */}
        <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? '' : 'pl-6'}`}>
          {/* Header section */}
          <div className="w-full pb-4">
            <div className="flex justify-between w-full py-4 items-center px-7">
              <div className='flex flex-col basic-font gap-1'>
                <h2 className='text-dark font-bold text-[1.4rem]'>
                  {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                </h2>
                <p className='text-gray-500 font-normal text-[0.9rem]'>{getViewDescription()}</p>
              </div>

              <div className="flex items-center space-x-4"> 
                {/* Search bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="search"
                    placeholder="Search..."
                    className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Grid/Menu icon */}
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="grid grid-cols-3 gap-1 w-5 h-5">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    ))}
                  </div>
                </button>

                {/* Notification bell */}
                <motion.button 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                  animate={{ y: [0, -2, 0] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                    ease: "easeInOut",
                    delay: 0.4
                  }}
                >
                  <Bell size={20} className="text-gray-600" />
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">3</span>
                </motion.button>

                {/* User profile */}
                <div className='flex flex-row items-center gap-3'>
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">B</span>
                  </div>
                  <div className='flex flex-col basic-font text-dark'>
                    <h2 className='font-semibold text-[0.9rem]'>Besamad</h2>
                    <p className='font-normal text-[0.75rem] text-gray-500'>Lancer.com</p>
                  </div>
                  <ChevronDown size={18} className="text-gray-400"/>
                </div>
              </div>
            </div>
          </div>
          
          {/* Border that spans the full width */}
          <div className="w-full border-t border-gray-200 flex-1 overflow-y-auto">
            {/* Render the appropriate view based on the active state */}
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardFr