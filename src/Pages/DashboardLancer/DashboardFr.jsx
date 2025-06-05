import React, { useState, useEffect, useRef } from 'react'
import { Sidebar, Bell, User, Settings, Home, BarChart2, FileText, Search, Wallet, PieChart, MessageCircle, Send, AlertCircle, ChevronDown, ChevronUp, Plus, ChevronLeft, ChevronRight, LucideShieldHalf, HardDriveDownload, LockKeyhole, ClipboardPaste, Clipboard, Download, X} from 'lucide-react'
import { motion } from 'framer-motion'

import DashboardView from '../../Sections/DashboardView/DashboardView'
import TaskManagement from '../../Sections/Task/Task'
import WalletView from '../../Sections/Wallet/Wallet'
import Activity from '../../Sections/Activity/Activity'
import MessagesFr from '../../Sections/MessageFL/MessageFr'
import Analytics from '../../Sections/Analysis/Analytics'
import Prosettings from '../../Sections/Prosetting/Prosettings'
import GetHelp from '../../Sections/Gethelp/Help'

// These would be imported in a real application
const MessagesView = () => <div className="p-6">
  <MessagesFr/>
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
const SettingsView = () => <div className="p-6">
  <Prosettings/>
</div>
const HelpView = () => <div className="p-6">
  <GetHelp/>
</div>

const DashboardFr = () => {
  // State to track the active view
  const [activeView, setActiveView] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Default closed
  // Add state to track screen size
  const [isMobile, setIsMobile] = useState(false)
  const [isTaskDropdownOpen, setTaskDropdownOpen] = useState(false)
  const [userRole, setUserRole] = useState('freelancer') // New state for role switching
  
  // Check if screen is mobile on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768 // md breakpoint
      setIsMobile(mobile)
      // Set initial sidebar state based on screen size
      if (mobile) {
        setIsSidebarOpen(false) // Closed on mobile
      } else {
        setIsSidebarOpen(true) // Open on desktop
      }
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Lock/unlock body scroll when sidebar opens/closes on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobile, isSidebarOpen])

  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! I'm your AI assistant. How can I help you today?", sender: "ai" }
  ])
  const [inputValue, setInputValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef(null)
    


  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Handle menu item clicks
  const handleMenuClick = (view) => {
    setActiveView(view)
    // Close sidebar on mobile after selection
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
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
    <div className="flex flex-col w-full h-screen overflow-hidden bg-[#FEFFFF] basic-font">
      {/* Navigation bar - Fixed at top */}
      <nav className="w-full py-3 px-3 md:px-6 flex justify-between items-center border-b border-gray-200 relative z-50 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-6 md:w-[20%]">
          {/* Brand circles */}
          <div className="flex items-center gap-2 pl-1 md:pl-3">
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
          <div className='hidden md:flex flex-row gap-0'>
            <ChevronLeft/>
            <ChevronRight/>
          </div>
        </div>
        
        <div className='flex flex-row flex-1 md:w-[70%] gap-2 justify-center items-center px-2 md:px-0'>
          <LucideShieldHalf size={20} className="hidden md:block"/>
          <div className="relative w-full md:w-4/6 justify-center items-center">
            <div className="absolute inset-y-0 left-3 flex justify-center items-center pointer-events-none">
              <LockKeyhole size={14} />
            </div>
            {/* Search Input */}
            <input 
              type="search"
              placeholder="Search or enter URL..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 text-[12px] font-normal focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        <div className='flex flex-row gap-2 md:gap-4 justify-center items-center md:w-[10%] md:pl-10'>
          <HardDriveDownload className="hidden md:block"/>
          <Plus className="hidden md:block"/>
          <ClipboardPaste className="hidden md:block"/>
        </div>
      </nav>

      {/* Main content area with sidebar - Takes remaining height */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        {/* Overlay for mobile sidebar */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-white bg-opacity-50 z-30"
            onClick={handleOverlayClick}
          />
        )}

        {/* Sidebar - Fixed position */}
        <aside className={`
          ${isMobile ? 'fixed left-0 z-40' : 'relative'} 
          ${isSidebarOpen ? (isMobile ? 'w-64' : 'w-64') : (isMobile ? 'w-0' : 'w-0')} 
          border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden bg-white
          ${isMobile ? 'shadow-xl h-full' : 'h-full'}
        `}>
          {/* Mobile close button */}
          {isMobile && (
            <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl font-bold text-primary">LANCER</h2>
              <button 
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}
          
          {!isMobile && (
            <div className="p-4 flex-shrink-0">
              <h2 className="text-2xl font-bold text-primary basic-font">LANCER</h2>
            </div>
          )}
          
          {/* Role Switcher */}
          <div className="px-4 pb-4 flex-shrink-0">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setUserRole('client')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  userRole === 'client'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User size={16} className="mr-2" />
                Client
              </button>
              <button
                onClick={() => setUserRole('freelancer')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  userRole === 'freelancer'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User size={16} className="mr-2" />
                Freelancer
              </button>
            </div>
          </div>
          
          {/* Navigation - Scrollable */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {/* Dashboard link */}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick('dashboard');
              }}
              className={`flex items-center px-4 py-4 font-medium hover:bg-blue-50 rounded-md relative group ${activeView === 'dashboard' ? 'text-[#0c0950] bg-blue-50' : 'text-dark'}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'dashboard' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <Home size={20} className={`mr-3 ${activeView === 'dashboard' ? 'text-[#0c0950]' : 'text-gray-400'} group-hover:text-[#0c0950] transition-colors`} />
              <span className="group-hover:text-[#0c0950] basic-font transition-colors">Dashboard  </span>
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
                      handleMenuClick('task');
                      setTaskDropdownOpen(false); // Close dropdown after selection
                    }}
                    className="w-full text-left flex items-center px-4 py-3 rounded-md bg-red-500 text-white basic-font hover:bg-red-600 transition-colors"
                  >
                    <span>Ongoing Tasks</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuClick('task');
                      setTaskDropdownOpen(false); // Close dropdown after selection
                    }}
                    className="w-full text-left flex items-center px-4 py-3 rounded-md bg-green-500 text-white basic-font hover:bg-green-600 transition-colors"
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
                handleMenuClick('messages');
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
                handleMenuClick('wallets');
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
                handleMenuClick('activity');
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
                handleMenuClick('analytics');
              }}
              className={`flex items-center px-4 py-4 font-medium hover:bg-blue-50 rounded-md relative group ${activeView === 'analytics' ? 'text-[#0c0950] bg-blue-50' : 'text-dark'}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'analytics' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <BarChart2 size={20} className={`mr-3 ${activeView === 'analytics' ? 'text-[#0c0950]' : 'text-gray-400'} group-hover:text-[#0c0950] transition-colors`} />
              <span className="group-hover:text-[#0c0950] basic-font transition-colors">Analytics</span>
            </a>
          </nav>
          
          {/* Bottom section - Fixed */}
          <div className="p-3 mt-auto flex-shrink-0">
            <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
              {/* Settings link */}
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick('settings');
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
                  handleMenuClick('help');
                }}
                className={`flex items-center px-4 py-4 font-medium hover:bg-blue-50 rounded-md relative group ${activeView === 'help' ? 'text-[#0c0950] bg-blue-50' : 'text-dark'}`}
              >
                <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'help' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
                <AlertCircle size={20} className={`mr-3 ${activeView === 'help' ? 'text-[#0c0950]' : 'text-gray-400'} group-hover:text-[#0c0950] transition-colors`} />
                <span className="group-hover:text-[#0c0950] basic-font transition-colors">Get Help</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Main content - Scrollable */}
        <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? '' : 'lg:pl-6'}`}>
          {/* Header section - Fixed */}
          <div className="w-full pb-4 flex-shrink-0">
            <div className="flex flex-col md:flex-row justify-between w-full py-4 items-start md:items-center px-4 md:px-7 gap-4 md:gap-0">
              {/* Active view should be dynamically controlled */}
                  <div className='flex flex-col gap-1'>
                <h2 className='text-gray-800 font-bold text-xl md:text-2xl'>
                  {activeView === 'messages' ? 'Messages' : 
                  activeView === 'dashboard' ? `Dashboard (${userRole === 'client' ? 'Client' : 'Freelancer'})` : 
                  activeView === 'wallets' ? 'My Wallets' : 
                  activeView === 'activity' ? 'Activity' : 
                  activeView === 'analytics' ? 'Analytics' : 
                  activeView === 'settings' ? 'Settings' : 
                  activeView === 'help' ? 'Get Help' : 'Dashboard'}
                </h2>
                <p className='text-gray-600 font-normal text-sm md:text-base'>Welcome Back! Here is your overview</p>
              </div>
              <div className='flex flex-col basic-font gap-1'>
              
              </div>
              <div className="flex items-center space-x-4"> 
                {/* Search bar */}
                <div className="relative hidden md:block">
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
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:block">
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
                  <div className='hidden md:flex flex-col basic-font text-dark'>
                    <h2 className='font-semibold text-[0.9rem]'>Besamad</h2>
                    <p className='font-normal text-[0.75rem] text-gray-500'>Lancer.com</p>
                  </div>
                  <ChevronDown size={18} className="text-gray-400 hidden md:block"/>
                </div>
              </div>
            </div>
          </div>
          
          {/* Border that spans the full width and content area - Scrollable */}
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