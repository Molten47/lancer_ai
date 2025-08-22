import React, { useState, useEffect, useRef } from 'react'
import { Sidebar, Bell, User, Settings, Home, 
       FileText,  MessageCircle, 
       
       Download, X, LogOut, MessageSquare, HelpCircle, Building2} from 'lucide-react'
       
import DashboardViews from '../../Sections/Freelancer Side/DashboardView/DashboardView'
import TaskManagements from '../../Sections/Task/Task'
import WalletViews from '../../Sections/Wallet/Wallet'
import MessagesFrs from '../../Sections/Freelancer Side/MessageFL/MessageFr'
import Prosettingss from '../../Sections/Prosetting/Prosettings'
import GetHelps from '../../Sections/Gethelp/Help'
import LogoutButton from '../../Components/Return/Logout'


// Mock components - replace with your actual components
const DashboardView = () => <div className="p-6 bg-gray-50 min-h-full">
<DashboardViews/>
</div>

const TaskManagement = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
   <TaskManagements/>
  </div>
</div>

const MessagesView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
   <MessagesFrs/>
  </div>
</div>

const WalletsView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
    <WalletViews/>
  </div>
</div>

const SettingsView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
  <Prosettingss/>
  </div>
</div>

const HelpView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
    <GetHelps/>
  </div>
</div>

const DashboardFr = () => {
  // State to track the active view
  const [activeView, setActiveView] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Default closed
  // Add state to track screen size
  const [isMobile, setIsMobile] = useState(false)
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
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpView />;
      default:
        return <DashboardView />;
    }
  }

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-white basic-font">
      {/* Clean Navigation bar - Fixed at top */}
      <nav className="w-full py-4 px-6 flex justify-between items-center border-b border-gray-100 relative z-50 flex-shrink-0 bg-white">
        {/* Left side - Brand and hamburger */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar} 
            className="p-2 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Sidebar size={20} />
          </button>
          <h1 className="text-xl font-bold text-blue-600">Lancer AI</h1>
        </div>

        {/* Right side - Notifications and User */}
        <div className="flex items-center gap-4">
          {/* Notification bell */}
          <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full">3</span>
          </button>

          {/* Messages */}
          <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative">
            <MessageSquare size={20} className="text-gray-600" />
          </button>
        </div>
      </nav>

      {/* Main content area with sidebar - Takes remaining height */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        {/* Overlay for mobile sidebar */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 z-30"
            onClick={handleOverlayClick}
          />
        )}

        {/* Sidebar - Fixed position */}
        <aside className={`
          ${isMobile ? 'fixed left-0 z-40' : 'relative'} 
          ${isSidebarOpen ? (isMobile ? 'w-72' : 'w-72') : (isMobile ? 'w-0' : 'w-0')} 
          border-r border-gray-100 flex flex-col transition-all duration-300 overflow-hidden bg-white
          ${isMobile ? 'shadow-2xl h-full' : 'h-full'}
        `}>
          
          {/* Profile Section at the top */}
          <div className="p-6 border-b border-gray-100 flex-shrink-0">
            {/* User Profile Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">AM</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Alex Morgan</h3>
                <p className="text-sm text-gray-500">@codecraft_alex</p>
              </div>
            </div>

            {/* Role Switcher - Simplified */}
            <div className="bg-gray-50 rounded-lg p-1 flex">
              <button
                onClick={() => setUserRole('client')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  userRole === 'client'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Client
              </button>
              <button
                onClick={() => setUserRole('freelancer')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  userRole === 'freelancer'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Freelancer
              </button>
            </div>
          </div>
          
          {/* Navigation - Clean and Simple */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {/* Dashboard link */}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick('dashboard');
              }}
              className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeView === 'dashboard' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home size={20} className="mr-3" />
              <span>Dashboard</span>
            </a>
             
            {/* Messages link */}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick('messages');
              }}
              className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeView === 'messages' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageCircle size={20} className="mr-3" />
              <span>Messages</span>
              <span className="ml-auto flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">2</span>
            </a>

            {/* Jobs link */}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick('task');
              }}
              className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeView === 'task' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Building2 size={20} className="mr-3" />
              <span>Jobs</span>
            </a>

            {/* Learning link */}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick('wallets');
              }}
              className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeView === 'wallets' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText size={20} className="mr-3" />
              <span>Learning</span>
            </a>
          </nav>
          
          {/* Bottom section */}
          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            {/* Settings link */}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick('settings');
              }}
              className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 mb-2 ${
                activeView === 'settings' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Settings size={20} className="mr-3" />
              <span>Settings</span>
            </a>
            
            {/* Help Center link */}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick('help');
              }}
              className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 mb-2 ${
                activeView === 'help' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <HelpCircle size={20} className="mr-3" />
              <span>Help Center</span>
            </a>

            {/* Log Out link */}
            <LogoutButton 
            className="w-full justify-start px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
             text="Log Out"
            showIcon={true}
  />
          </div>
        </aside>

        {/* Main content - Scrollable */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Simple Header */}
          <div className="w-full px-6 py-6 border-b border-gray-100 flex-shrink-0 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className='text-gray-900 font-bold text-2xl mb-1'>
                  {activeView === 'messages' ? 'Messages' : 
                  activeView === 'dashboard' ? 'Dashboard' : 
                  activeView === 'wallets' ? 'Learning' : 
                  activeView === 'task' ? 'Jobs' : 
                  activeView === 'settings' ? 'Settings' : 
                  activeView === 'help' ? 'Help Center' : 'Dashboard'}
                </h2>
                <p className='text-gray-500 text-sm'>
                  {activeView === 'dashboard' && 'Welcome back! Here\'s your overview for today.'}
                  {activeView === 'messages' && 'Manage your conversations and collaborations.'}
                  {activeView === 'task' && 'Track and manage your ongoing projects.'}
                  {activeView === 'wallets' && 'Expand your skills with our learning resources.'}
                  {activeView === 'settings' && 'Customize your account and preferences.'}
                  {activeView === 'help' && 'Get support and find answers to your questions.'}
                </p>
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

export default DashboardFr