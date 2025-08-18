import React, { useState, useEffect, useRef } from 'react'
import { Sidebar, Bell, User, Settings, Home, 
       FileText,  MessageCircle, ChevronDown, ChevronRight,
       Download, X, LogOut, MessageSquare, HelpCircle, Building2, Send} from 'lucide-react'

import ProjectManagement from '../../Sections/Client Side/Project Manager/ProjectManager'
import AIAssistantChat from '../../Sections/Client Side/Dashboard-Client/DashboardClient'
// Mock components - replace with your actual components
const DashboardView = () => <div className="flex flex-col h-full basic-font">
  {/* AI chat assistant to be imported here*/}
  <AIAssistantChat
   //socket={yourSocketInstance}
   //userId="user-123"
   //assistantName="Lancer AI"
  // onMessageSent={() => {
        // Handle message analytics, logging, etc.
    //  }}
  />

</div>

const ProjectManager = () => <div className="p-6 bg-gray-50 min-h-full">
<ProjectManagement/>
</div>

const ProjectAnalytics = () => <div className="p-6 bg-gray-50 min-h-full">
</div>

const MessagesView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
    <h3 className="text-xl font-semibold mb-4">Messages</h3>
    <p className="text-gray-600">View all your conversations here.</p>
  </div>
</div>

const WalletsView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
    <h3 className="text-xl font-semibold mb-4">Freelancers</h3>
    <p className="text-gray-600">Browse and manage freelancers here.</p>
  </div>
</div>

const SettingsView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
    <h3 className="text-xl font-semibold mb-4">Settings</h3>
    <p className="text-gray-600">Manage your account settings here.</p>
  </div>
</div>

const HelpView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
    <h3 className="text-xl font-semibold mb-4">Help Center</h3>
    <p className="text-gray-600">Get help and support here.</p>
  </div>
</div>

const DashboardCl = () => {
  // State to track the active view
  const [activeView, setActiveView] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Default closed
  // Add state to track screen size
  const [isMobile, setIsMobile] = useState(false)
  const [userRole, setUserRole] = useState('client') // Changed default to client
  const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false)
  
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

  const toggleProjectsDropdown = () => {
    setIsProjectsDropdownOpen(!isProjectsDropdownOpen)
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
      case 'project-manager': 
        return <ProjectManager />;
      case 'project-analytics':
        return <ProjectAnalytics />;
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

  const getPageTitle = () => {
    switch(activeView) {
      case 'messages': return 'Messages';
      case 'dashboard': return 'AI Assistant';
      case 'wallets': return 'Freelancers';
      case 'project-manager': return 'Project Manager';
      case 'project-analytics': return 'Project Analytics';
      case 'settings': return 'Settings';
      case 'help': return 'Help Center';
      default: return 'AI Assistant';
    }
  }

  return (
    <div className="flex w-full h-screen overflow-hidden bg-white basic-font">
      {/* Overlay for mobile sidebar */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-30"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar - Narrower width */}
      <aside className={`
        ${isMobile ? 'fixed left-0 z-40' : 'relative'} 
        ${isSidebarOpen ? (isMobile ? 'w-64' : 'w-64') : (isMobile ? 'w-0' : 'w-0')} 
        border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden bg-white
        ${isMobile ? 'shadow-2xl h-full' : 'h-full'}
      `}>
        
        {/* Profile Section at the top */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          {/* Hamburger menu for mobile */}
          {isMobile && (
            <button 
              onClick={toggleSidebar} 
              className="p-2 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors mb-4"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
          
          {/* User Profile Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">MJ</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">Michael Johnson</h3>
              <p className="text-xs text-gray-500">Techinnovate</p>
            </div>
          </div>
        </div>
        
        {/* Navigation - Clean and Simple */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Assistant link */}
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              handleMenuClick('dashboard');
            }}
            className={`flex items-center px-3 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
              activeView === 'dashboard' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home size={18} className="mr-3" />
            <span>Assistant</span>
          </a>
           
          {/* Messages link */}
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              handleMenuClick('messages');
            }}
            className={`flex items-center px-3 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
              activeView === 'messages' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageCircle size={18} className="mr-3" />
            <span>Messages</span>
          </a>

          {/* Projects dropdown */}
          <div className="space-y-1">
            <button
              onClick={toggleProjectsDropdown}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
                (activeView === 'project-manager' || activeView === 'project-analytics') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <Building2 size={18} className="mr-3" />
                <span>Projects</span>
              </div>
              {isProjectsDropdownOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {/* Dropdown content */}
            {isProjectsDropdownOpen && (
              <div className="ml-6 space-y-1">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMenuClick('project-manager');
                  }}
                  className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    activeView === 'project-manager'
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Project Manager
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMenuClick('project-analytics');
                  }}
                  className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    activeView === 'project-analytics'
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Project Analytics
                </a>
              </div>
            )}
          </div>

          {/* Freelancers link */}
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              handleMenuClick('wallets');
            }}
            className={`flex items-center px-3 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
              activeView === 'wallets' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText size={18} className="mr-3" />
            <span>Freelancers</span>
          </a>
        </nav>
        
        {/* Bottom section */}
        <div className="p-3 border-t border-gray-200 flex-shrink-0">
          {/* Settings link */}
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              handleMenuClick('settings');
            }}
            className={`flex items-center px-3 py-3 rounded-lg font-medium transition-all duration-200 mb-1 text-sm ${
              activeView === 'settings' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings size={18} className="mr-3" />
            <span>Settings</span>
          </a>
          
          {/* Help Center link */}
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              handleMenuClick('help');
            }}
            className={`flex items-center px-3 py-3 rounded-lg font-medium transition-all duration-200 mb-1 text-sm ${
              activeView === 'help' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <HelpCircle size={18} className="mr-3" />
            <span>Help Center</span>
          </a>

          {/* Log Out link */}
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              // Handle logout
            }}
            className="flex items-center px-3 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-all duration-200 text-sm"
          >
            <LogOut size={18} className="mr-3" />
            <span>Log Out</span>
          </a>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation bar */}
        <nav className="w-full py-3 px-4 flex justify-between items-center border-b border-gray-200 relative z-50 flex-shrink-0 bg-white">
          {/* Left side - Brand and hamburger */}
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar} 
              className="p-2 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Sidebar size={18} />
            </button>
            <h1 className="text-lg font-bold text-blue-600">Lancer AI</h1>
          </div>

          {/* Center - Current view title */}
          <div className="flex-1 text-center">
            <h2 className='text-gray-900 font-semibold text-lg'>
              {getPageTitle()}
            </h2>
          </div>

          {/* Right side - Notifications and Messages */}
          <div className="flex items-center gap-2">
            {/* Messages */}
            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative">
              <MessageSquare size={18} className="text-gray-600" />
            </button>
            
            {/* Notification bell */}
            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative">
              <Bell size={18} className="text-gray-600" />
            </button>
          </div>
        </nav>
        
        {/* Content area - Full height */}
        <div className="flex-1 overflow-hidden">
          {renderView()}
        </div>
      </div>
    </div>
  )
}

export default DashboardCl