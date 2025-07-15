import React, { useState, useEffect } from 'react'
import { Sidebar, Bell, User, Settings, Home, BarChart2, FileText, Search, Wallet, PieChart, MessageCircle, ChevronDown, ChevronUp, Plus, ChevronLeft, ChevronRight, LucideShieldHalf, HardDriveDownload, LockKeyhole, ClipboardPaste, AlertCircle, X} from 'lucide-react'
import DashboardView from '../../Sections/DashboardView/DashboardClient'
import Messages from '../../Sections/ClienMessa/Clientmessage'
import TaskManagement from '../../Sections/Task/Task'
import WalletView from '../../Sections/Wallet/Wallet'
import Activity from '../../Sections/Activity/Activity'
import Analytics from '../../Sections/Analysis/Analytics'
import Prosettings from '../../Sections/Prosetting/Prosettings'
import GetHelp from '../../Sections/Gethelp/Help'

const MessageView = () => <div className="p-6">
  <Messages/>
</div>
const WalletsView = () => <div className="p-6"><WalletView/></div>
const ActivityView = () => <div className="p-6"><Activity/></div>
const AnalyticsView = () => <div className="p-6"><Analytics/></div>
const SettingsView = () => <div className="p-6"><Prosettings/></div>
const HelpView = () => <div className="p-6"><GetHelp/></div>
const TaskView = () => <div className="p-6"><TaskManagement/></div>


const DashboardCl = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Default closed
  const [activeView, setActiveView] = useState('dashboard')
  const [isTaskDropdownOpen, setTaskDropdownOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [userRole, setUserRole] = useState('client') // 'client' or 'freelancer'
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // On desktop, sidebar should be open by default
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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

  const renderView = () => {
    switch(activeView) {
      case 'dashboard':
        return <DashboardView />
      case 'messages':
        return <MessageView />
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
    <div className="flex flex-col w-full h-screen overflow-hidden bg-white basic-font">
      {/* Navigation bar - Fixed at top */}
      <nav className="w-full py-3 px-3 md:px-6 flex justify-between items-center border-b border-gray-200 relative z-50 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-6 md:w-[20%]">
          {/* Brand circles */}
          <div className="flex items-center gap-2 pl-1 md:pl-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-900 animate-bounce"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-3 h-3 rounded-full bg-indigo-300 animate-bounce" style={{animationDelay: '0.4s'}}></div>
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
        `}
        >
          {/* Mobile close button */}
          {isMobile && (
            <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl font-bold text-blue-900">LANCER</h2>
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
              <h2 className="text-2xl font-bold text-blue-900">LANCER</h2>
            </div>
          )}
          
          {/* Role Switcher */}
          <div className="px-4 pb-4 flex-shrink-0">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setUserRole('client')}
                className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  userRole === 'client'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <User size={16} className="mr-2" />
                Client
              </button>
              <button
                onClick={() => setUserRole('freelancer')}
                className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  userRole === 'freelancer'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Settings size={16} className="mr-2" />
                Freelancer
              </button>
            </div>
          </div>
          
          {/* Navigation - Scrollable */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <a 
              href="#" 
              onClick={(e) => {e.preventDefault(); handleMenuClick('dashboard')}}
              className={`flex items-center px-4 py-4 font-medium text-gray-700 hover:bg-blue-50 rounded-md relative group ${activeView === 'dashboard' ? 'bg-blue-50' : ''}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-blue-600 rounded-r-md ${activeView === 'dashboard' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <Home size={20} className={`mr-3 ${activeView === 'dashboard' ? 'text-primary' : 'text-gray-400 group-hover:text-prim'} transition-colors`} />
              <span className={`${activeView === 'dashboard' ? 'text-blue-900' : 'group-hover:text-blue-900'} transition-colors`}>Dashboard</span>
            </a>
         
            {/* Task with dropdown */}
            <div>
              <button 
                onClick={() => setTaskDropdownOpen(!isTaskDropdownOpen)} 
                className="w-full flex items-center justify-between px-4 py-4 font-medium text-gray-700 hover:bg-blue-50 rounded-md transition-colors relative group"
              >
                <div className="flex items-center">
                  <div className="absolute left-0 w-1 h-full bg-blue-600 rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <FileText size={20} className="mr-3 text-gray-400 group-hover:text-blue-900 transition-colors" />
                  <span className="group-hover:text-blue-900 transition-colors">Projects</span>
                </div>
                {isTaskDropdownOpen ? 
                  <ChevronUp size={16} className="text-gray-400" /> : 
                  <ChevronDown size={16} className="text-gray-400" />
                }
              </button>
              
              {/* Task dropdown items */}
              {isTaskDropdownOpen && (
                <div className="ml-10 space-y-1 mt-1">
                  <a href="#" className="flex items-center px-4 py-3 rounded-md bg-blue-500 text-white">
                    <span>Project Manager</span>
                  </a>
                  <a href="#" className="flex items-center px-4 py-3 rounded-md bg-green-500 text-white">
                    <span>Project Analytics</span>
                  </a>
                </div>
              )}
            </div>
            
            <a 
              href="#" 
              onClick={(e) => {e.preventDefault(); handleMenuClick('messages')}}
              className={`flex items-center px-4 py-4 font-medium text-gray-700 hover:bg-blue-50 rounded-md transition-colors relative group ${activeView === 'messages' ? 'bg-blue-50' : ''}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-blue-600 rounded-r-md ${activeView === 'messages' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <MessageCircle size={20} className={`mr-3 ${activeView === 'messages' ? 'text-blue-900' : 'text-gray-400 group-hover:text-blue-900'} transition-colors`} />
              <span className={`${activeView === 'messages' ? 'text-blue-900' : 'group-hover:text-blue-900'} transition-colors`}>Messages</span>
              <span className="ml-auto flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">2</span>
            </a>
            
            <a 
              href="#" 
              onClick={(e) => {e.preventDefault(); handleMenuClick('wallets')}}
              className={`flex items-center px-4 py-4 font-medium text-gray-700 hover:bg-blue-50 rounded-md transition-colors relative group ${activeView === 'wallets' ? 'bg-blue-50' : ''}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-blue-600 rounded-r-md ${activeView === 'wallets' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <Wallet size={20} className={`mr-3 ${activeView === 'wallets' ? 'text-blue-900' : 'text-gray-400 group-hover:text-blue-900'} transition-colors`} />
              <span className={`${activeView === 'wallets' ? 'text-blue-900' : 'group-hover:text-blue-900'} transition-colors`}>My Wallets</span>
            </a>
            
            <a 
              href="#" 
              onClick={(e) => {e.preventDefault(); handleMenuClick('activity')}}
              className={`flex items-center px-4 py-4 font-medium text-gray-700 hover:bg-blue-50 rounded-md transition-colors relative group ${activeView === 'activity' ? 'bg-blue-50' : ''}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-blue-600 rounded-r-md ${activeView === 'activity' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <PieChart size={20} className={`mr-3 ${activeView === 'activity' ? 'text-blue-900' : 'text-gray-400 group-hover:text-blue-900'} transition-colors`} />
              <span className={`${activeView === 'activity' ? 'text-blue-900' : 'group-hover:text-blue-900'} transition-colors`}>Activity</span>
            </a>
            
            <a 
              href="#" 
              onClick={(e) => {e.preventDefault(); handleMenuClick('analytics')}}
              className={`flex items-center px-4 py-4 font-medium text-gray-700 hover:bg-blue-50 rounded-md transition-colors relative group ${activeView === 'analytics' ? 'bg-blue-50' : ''}`}
            >
              <div className={`absolute left-0 w-1 h-full bg-blue-600 rounded-r-md ${activeView === 'analytics' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
              <BarChart2 size={20} className={`mr-3 ${activeView === 'analytics' ? 'text-blue-900' : 'text-gray-400 group-hover:text-blue-900'} transition-colors`} />
              <span className={`${activeView === 'analytics' ? 'text-blue-900' : 'group-hover:text-blue-900'} transition-colors`}>Analytics</span>
            </a>
          </nav>
          
          {/* Bottom section - Fixed */}
          <div className="p-3 mt-auto flex-shrink-0">
            <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
              <a 
                href="#" 
                onClick={(e) => {e.preventDefault(); handleMenuClick('settings')}}
                className={`flex items-center px-4 py-4 font-medium text-gray-700 hover:bg-blue-50 rounded-md transition-colors relative group ${activeView === 'settings' ? 'bg-blue-50' : ''}`}
              >
                <div className={`absolute left-0 w-1 h-full bg-blue-600 rounded-r-md ${activeView === 'settings' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
                <Settings size={20} className={`mr-3 ${activeView === 'settings' ? 'text-blue-900' : 'text-gray-400 group-hover:text-blue-900'} transition-colors`} />
                <span className={`${activeView === 'settings' ? 'text-blue-900' : 'group-hover:text-blue-900'} transition-colors`}>Settings</span>
              </a>
              
              <a 
                href="#" 
                onClick={(e) => {e.preventDefault(); handleMenuClick('help')}}
                className={`flex items-center px-4 py-4 font-medium text-gray-700 hover:bg-blue-50 rounded-md transition-colors relative group ${activeView === 'help' ? 'bg-blue-50' : ''}`}
              >
                <div className={`absolute left-0 w-1 h-full bg-blue-600 rounded-r-md ${activeView === 'help' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
                <AlertCircle size={20} className={`mr-3 ${activeView === 'help' ? 'text-blue-900' : 'text-gray-400 group-hover:text-blue-900'} transition-colors`} />
                <span className={`${activeView === 'help' ? 'text-blue-900' : 'group-hover:text-blue-900'} transition-colors`}>Get Help</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Main content - Scrollable */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* User profile section - Fixed */}
          <div className="w-full pb-4 flex-shrink-0 bg-white border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between w-full py-4 items-start md:items-center px-4 md:px-7 gap-4 md:gap-0">
              {/* Title section */}
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

              {/* User profile section */}
              <div className="flex items-center space-x-4"> 
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors relative animate-bounce"
                  style={{animationDelay: '0.4s'}}
                >
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">3</span>
                </button>
                <div className='flex flex-row justify-center items-center gap-2'>
                  <div>
                    <button className="p-2 hover:bg-gray-100 bg-gray-100 rounded-full transition-colors">
                      <User size={24} />
                    </button>
                  </div>
                  <div className='hidden md:flex flex-col text-gray-800'>
                    <h2 className='font-semibold text-base'>Besamad</h2>
                    <p className='font-normal text-xs'>Lancer.com</p>
                  </div>
                  <div className="hidden md:block">
                    <ChevronDown size={20}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content area - Scrollable */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardCl