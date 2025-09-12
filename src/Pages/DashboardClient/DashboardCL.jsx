import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Sidebar, Bell, User, Settings, Home, 
       FileText,  MessageCircle, ChevronDown, ChevronRight,
       Download, X, LogOut, MessageSquare, HelpCircle, Building2, Send} from 'lucide-react'

import ProjectManagement from '../../Sections/Client Side/Projects/Projects'
import ProjectManagers from '../../Sections/Client Side/Projects/ProjectManager'
import AIAssistantChat from '../../Sections/Client Side/Client Assistant/DashboardClient'
import Notifications from '../Notifications/Notifications'
import GroupChatSpace from '../../Sections/Client Side/Projects/Groupchat'
import AssociatedJobs from '../../Sections/Client Side/Projects/AssociatedJob'
import Analytics from '../../Sections/Client Side/Projects/Analytics'
import HumanChat from '../../Sections/Client Side/Projects/IndividualChat'
const DashboardView = () => <div className="flex flex-col h-full basic-font">
  {/* AI chat assisant to be imported here*/}
  <AIAssistantChat/>
</div>
const ProjectOverview = () => <div className="p-6 bg-gray-50 min-h-full">
<AssociatedJobs/>
</div>
const ProjectAnalytics = () => <div className="p-6 bg-gray-50 min-h-full">
  <Analytics/>
</div>
const AgentView = () => <div className="p-6 bg-gray-50 min-h-full">
  <ProjectManagers/>
</div>
const HumanChatView = () => <div className="p-6 bg-gray-50 min-h-full">
<HumanChat/>
</div>
const GroupChatView = () => <div className="p-6 bg-gray-50 min-h-full">
  <GroupChatSpace/>
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

const NotificationsView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
    <Notifications />
  </div>
</div>

const DashboardCl = () => {
  // Function to get saved view from localStorage or return default
  const getSavedView = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboardActiveView');
      return saved || 'dashboard';
    }
    return 'dashboard';
  };

  // Function to get saved dropdown state from localStorage
  const getSavedDropdownState = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboardProjectsDropdown');
      return saved === 'true';
    }
    return false;
  };
  const getSavedMessagesDropdownState = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('dashboardMessagesDropdown');
    return saved === 'true';
  }
  return false;
};

  // State to track the active view - now initialized from localStorage
  const [activeView, setActiveView] = useState(getSavedView)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Default closed
  // Add state to track screen size
  const [isMobile, setIsMobile] = useState(false)
  const [userRole, setUserRole] = useState('client') // Changed default to client
  const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(getSavedDropdownState)
  const [isMessagesDropdownOpen, setIsMessagesDropdownOpen] = useState(getSavedMessagesDropdownState)
  
  // Add state for profile data
  const [profileData, setProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);
      
  // Select the specific fields from the Redux store
  const userData = useSelector(state => state.user.userData);

  // Function to fetch profile data from API
  const fetchProfileData = async () => {
    try {
      setIsLoadingProfile(true);
      setProfileError(null);

      // Replace with your actual API endpoint
      const token = localStorage.getItem('access_jwt')
      const API_URL = import.meta.env.VITE_API_URL
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // Include cookies if using session-based auth
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle the array format from your API response
      if (Array.isArray(data) && data.length > 0 && data[0].well_received) {
        setProfileData(data[0].profile_data);
      } else if (data.well_received) {
        setProfileData(data.profile_data);
      } else {
        throw new Error('Profile data not well received');
      }
      
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setProfileError(error.message);
      // Fallback to Redux data if available
      if (userData) {
        setProfileData({
          firstname: userData.firstname,
          lastname: userData.lastname,
          username: userData.username,
          email: userData.email
        });
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  // Extract user information with fallbacks
  const firstName = profileData?.firstname || userData?.firstname || '';
  const lastName = profileData?.lastname || userData?.lastname || '';
  const username = profileData?.username || userData?.username || 'User';
  const email = profileData?.email || userData?.email || '';

  // Combine for the full name
  const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : 'User';

  // Get initials from first and last names
  const getInitials = (first, last) => {
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    } else if (first) {
      return first.charAt(0).toUpperCase();
    } else if (last) {
      return last.charAt(0).toUpperCase();
    }
    return 'U'; // Default fallback
  };

  const initials = getInitials(firstName, lastName);
  
  // Save activeView to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardActiveView', activeView);
    }
  }, [activeView]);

  // Save dropdown state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardProjectsDropdown', isProjectsDropdownOpen.toString());
    }
  }, [isProjectsDropdownOpen]);
  
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

  // Add this new useEffect for Messages dropdown
useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dashboardMessagesDropdown', isMessagesDropdownOpen.toString());
  }
}, [isMessagesDropdownOpen]);

// Add this new toggle function


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
// Project Dropdown Toggler
  const toggleProjectsDropdown = () => {
    setIsProjectsDropdownOpen(!isProjectsDropdownOpen)
  }
  // Message Dropwown Toggler
  const toggleMessagesDropdown = () => {
  setIsMessagesDropdownOpen(!isMessagesDropdownOpen)
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
      case 'projects': 
        return <ProjectOverview /> ;
      case 'project-analytics':
        return <ProjectAnalytics />;
      case 'pm-agent':
        return <AgentView />;
      case 'group-chat':
        return <GroupChatView />;
      case 'personal-chat':
        return <HumanChatView />;
      case 'settings':
        return <SettingsView />;
      case'notifications':
        return < NotificationsView/>
      case 'help':
        return <HelpView />;
      default:
        return <DashboardView />;
    }
  }

  const getPageTitle = () => {
    switch(activeView) {
      case 'pm-agent': return 'PM Agent';
      case 'dashboard': return 'AI Assistant';
      case 'group-chat': return 'Group Chat';
      case 'projects': return 'Projects';
      case 'project-analytics': return 'Project Analytics';
      case 'personal-chat': return 'Chat';
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
              {isLoadingProfile ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-white font-semibold text-sm">
                  {initials}
                </span>
              )}
            </div>
            <div className="flex-1">
              {isLoadingProfile ? (
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {fullName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {username || email}
                  </p>
                </>
              )}
            </div>
          </div>
          
          {/* Show error message if profile fetch failed */}
          {profileError && !isLoadingProfile && (
            <div className="text-xs text-red-500 mt-2">
              Using cached data
            </div>
          )}
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

          {/* Projects dropdown */}
          <div className="space-y-1">
            <button
              onClick={toggleProjectsDropdown}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
                (activeView === 'projects' || activeView === 'project-analytics' || activeView === 'pm-agent') 
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
                    handleMenuClick('projects');
                  }}
                  className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    activeView === 'projects'
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Associated Jobs
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
                  Analytics
                </a>
                 <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMenuClick('pm-agent');
                  }}
                  className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    activeView === 'pm-agent'
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  PM Agent
                </a>
              </div>
            )}
          </div>
            {/* Messages dropdown */}
          <div className="space-y-1">
            <button
              onClick={toggleMessagesDropdown}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
                (activeView === 'group-chat' || activeView === 'personal-chat') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
               <MessageCircle size={18} className="mr-3" />
                <span>Chats</span>
              </div>
              {isMessagesDropdownOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {/* Dropdown content */}
            {isMessagesDropdownOpen && (
              <div className="ml-6 space-y-1">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMenuClick('group-chat');
                  }}
                  className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    activeView === 'group-chat'
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Groupchat
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMenuClick('personal-chat');
                  }}
                  className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    activeView === 'personal-chat'
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Chat
                </a>
              </div>
            )}
          </div>
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
              // Handle logout - you might want to clear localStorage here too
              // localStorage.removeItem('dashboardActiveView');
              // localStorage.removeItem('dashboardProjectsDropdown');
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
            <h1 className="text-lg font-bold text-blue-600">Lancer</h1>
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
            <button 
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative"
              onClick={() => handleMenuClick('notifications')}
            >
              <Bell size={20} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full">3</span>
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