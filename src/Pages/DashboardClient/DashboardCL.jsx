import React, { useState } from 'react'
import { Sidebar, Bell, User, Settings, Home, BarChart2, FileText, Search, Wallet, PieChart, MessageCircle, ChevronDown, ChevronUp, Plus, ChevronLeft, ChevronRight, LucideShieldHalf, HardDriveDownload, LockKeyhole, ClipboardPaste, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

// Import the components
import MessagesCl from '../../Sections/MessageCL/MessageCli'

// Placeholder components
const  MessageView = () => <div className="p-6"><MessagesCl/></div>
const DashboardView = () => <div className="p-6">Dashboard Component</div>
const WalletsView = () => <div className="p-6">My Wallets Component</div>
const ActivityView = () => <div className="p-6">Activity Component</div>
const AnalyticsView = () => <div className="p-6">Analytics Component</div>
const SettingsView = () => <div className="p-6">Settings Component</div>
const HelpView = () => <div className="p-6">Get Help Component</div>

const DashboardCl = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState('messages')
  const [isTaskDropdownOpen, setTaskDropdownOpen] = useState(false)
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }
  
  // Handle menu item clicks
  const handleMenuClick = (view) => {
    setActiveView(view)
  }

  const renderView = () => {
    switch(activeView) {
      case 'dashboard':
        return <DashboardView />
      case 'messages':
        return <MessagesCl />
      case 'wallets':
        return <WalletsView />
      case 'activity':
        return <ActivityView />
      case 'analytics':
        return <AnalyticsView />
      case 'settings':
        return <SettingsView />
      case 'help':
        return <HelpView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen overflow-hidden bg-white">
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
            <a 
              href="#" 
              onClick={(e) => {e.preventDefault(); handleMenuClick('dashboard')}}
              className={`flex items-center px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md relative group ${activeView === 'dashboard' ? 'bg-blue-50' : ''}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'dashboard' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <Home size={20} className={`mr-3 ${activeView === 'dashboard' ? 'text-[#0c0950]' : 'text-gray-400 group-hover:text-[#0c0950]'} transition-colors`} />
              <span className={`${activeView === 'dashboard' ? 'text-[#0c0950]' : 'group-hover:text-[#0c0950]'} basic-font transition-colors`}>Dashboard</span>
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
                  <a href="#" className="flex items-center px-4 py-3 rounded-md bg-red-500 text-white basic-font">
                    <span>Ongoing Tasks</span>
                  </a>
                  <a href="#" className="flex items-center px-4 py-3 rounded-md bg-green-500 text-white basic-font">
                    <span>Completed Tasks</span>
                  </a>
                </div>
              )}
            </div>
            
            <a 
              href="#" 
              onClick={(e) => {e.preventDefault(); handleMenuClick('messages')}}
              className={`flex items-center px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md transition-colors relative group ${activeView === 'messages' ? 'bg-blue-50' : ''}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'messages' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <MessageCircle size={20} className={`mr-3 ${activeView === 'messages' ? 'text-[#0c0950]' : 'text-gray-400 group-hover:text-[#0c0950]'} transition-colors`} />
              <span className={`${activeView === 'messages' ? 'text-[#0c0950]' : 'group-hover:text-[#0c0950]'} basic-font transition-colors`}>Messages</span>
              <span className="ml-auto flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">2</span>
            </a>
            
            <a 
              href="#" 
              onClick={(e) => {e.preventDefault(); handleMenuClick('wallets')}}
              className={`flex items-center px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md transition-colors relative group ${activeView === 'wallets' ? 'bg-blue-50' : ''}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'wallets' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <Wallet size={20} className={`mr-3 ${activeView === 'wallets' ? 'text-[#0c0950]' : 'text-gray-400 group-hover:text-[#0c0950]'} transition-colors`} />
              <span className={`${activeView === 'wallets' ? 'text-[#0c0950]' : 'group-hover:text-[#0c0950]'} basic-font transition-colors`}>My Wallets</span>
            </a>
            
            <a 
              href="#" 
              onClick={(e) => {e.preventDefault(); handleMenuClick('activity')}}
              className={`flex items-center px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md transition-colors relative group ${activeView === 'activity' ? 'bg-blue-50' : ''}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'activity' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <PieChart size={20} className={`mr-3 ${activeView === 'activity' ? 'text-[#0c0950]' : 'text-gray-400 group-hover:text-[#0c0950]'} transition-colors`} />
              <span className={`${activeView === 'activity' ? 'text-[#0c0950]' : 'group-hover:text-[#0c0950]'} basic-font transition-colors`}>Activity</span>
            </a>
            
            <a 
              href="#" 
              onClick={(e) => {e.preventDefault(); handleMenuClick('analytics')}}
              className={`flex items-center px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md transition-colors relative group ${activeView === 'analytics' ? 'bg-blue-50' : ''}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'analytics' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <BarChart2 size={20} className={`mr-3 ${activeView === 'analytics' ? 'text-[#0c0950]' : 'text-gray-400 group-hover:text-[#0c0950]'} transition-colors`} />
              <span className={`${activeView === 'analytics' ? 'text-[#0c0950]' : 'group-hover:text-[#0c0950]'} basic-font transition-colors`}>Analytics</span>
            </a>
          </nav>
          
          <div className="p-3 mt-auto">
            <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
              <a 
                href="#" 
                onClick={(e) => {e.preventDefault(); handleMenuClick('settings')}}
                className={`flex items-center px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md transition-colors relative group ${activeView === 'settings' ? 'bg-blue-50' : ''}`}
              >
                <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'settings' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
                <Settings size={20} className={`mr-3 ${activeView === 'settings' ? 'text-[#0c0950]' : 'text-gray-400 group-hover:text-[#0c0950]'} transition-colors`} />
                <span className={`${activeView === 'settings' ? 'text-[#0c0950]' : 'group-hover:text-[#0c0950]'} basic-font transition-colors`}>Settings</span>
              </a>
              
              <a 
                href="#" 
                onClick={(e) => {e.preventDefault(); handleMenuClick('help')}}
                className={`flex items-center px-4 py-4 font-medium text-dark hover:bg-blue-50 rounded-md transition-colors relative group ${activeView === 'help' ? 'bg-blue-50' : ''}`}
              >
                <div className={`absolute left-0 w-1 h-full bg-primary rounded-r-md ${activeView === 'help' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
                <AlertCircle size={20} className={`mr-3 ${activeView === 'help' ? 'text-[#0c0950]' : 'text-gray-400 group-hover:text-[#0c0950]'} transition-colors`} />
                <span className={`${activeView === 'help' ? 'text-[#0c0950]' : 'group-hover:text-[#0c0950]'} basic-font transition-colors`}>Get Help</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Main content - Chat Interface */}
        <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? '' : 'pl-6'}`}>
          {/* User profile section with proper full-width border bottom */}
          <div className="w-full pb-4">
            <div className="flex justify-between w-full py-4 items-center px-7">
              {/* Interactions container with proper right alignment */}
              <div className='flex flex-col basic-font gap-1'>
                <h2 className='text-dark font-bold text-[1.4rem]'>
                  {activeView === 'messages' ? 'Messages' : 
                  activeView === 'dashboard' ? 'Dashboard' : 
                  activeView === 'wallets' ? 'My Wallets' : 
                  activeView === 'activity' ? 'Activity' : 
                  activeView === 'analytics' ? 'Analytics' : 
                  activeView === 'settings' ? 'Settings' : 
                  activeView === 'help' ? 'Get Help' : 'Dashboard'}
                </h2>
                <p className='text-dark font-normal text-[1rem]'>Welcome Back, Besamad! What are you doing today?</p>
              </div>

              <div className="flex items-center space-x-4"> 
                <motion.button 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
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
                <div className='flex flex-row justify-center items-center gap-2'>
                  <div>
                    <button className="p-2 hover:bg-gray-100 bg-light rounded-full transition-colors">
                      <User size={24} />
                    </button>
                  </div>
                  <div className='flex flex-col basic-font text-dark'>
                    <h2 className='font-semibold text-[1rem]'>Besamad</h2>
                    <p className='font-normal text-[0.7rem]'>Lancer.com</p>
                  </div>
                  <div>
                    <ChevronDown size={20}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Border that spans the full width */}
          <div className="w-full border-t border-[#d9d9d9] h-full overflow-hidden">
            {renderView()}
          </div>
           <div className="px-6 py-5 border-t border-[#D9D9D9]">
              <div className="max-w-3xl mx-auto">
            
              </div>
            </div>

        </main>
      </div>
    </div>
  )
}

export default DashboardCl