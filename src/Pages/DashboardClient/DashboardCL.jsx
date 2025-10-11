import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Sidebar, Bell, User, Settings, Home, 
       FileText,  MessageCircle, ChevronDown, ChevronRight,
       Download, X,  LucideMessageSquareText, Briefcase, LayoutDashboard, Menu} from 'lucide-react'
import SideLogo from '../../assets/Images/SVG/Flogo2.svg'

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
const ProjectOverview = () => <div className="p-6 bg-gray-50 min-h-full h-screen overflow-hidden">
<AssociatedJobs/>
</div>
const ProjectAnalytics = () => <div className="p-6 bg-gray-50 min-h-full h-screen overflow-hidden">
  <Analytics/>
</div>
const AgentView = () => <div className="p-6 bg-gray-50  min-h-full h-screen overflow-hidden">
  <ProjectManagers/>
</div>
const HumanChatView = () => <div className="p-6 bg-gray-50 min-h-full h-screen overflow-hidden">
<HumanChat/>
</div>
const GroupChatView = () => {
  const [projectId, setProjectId] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectInfo = async () => {
      try {
        const token = localStorage.getItem('access_jwt');
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/api/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        
        if (data.well_received && data.projects.length > 0) {
          // Get first ongoing project or fallback to first project
          let targetProject = null;
          for (const projectObj of data.projects) {
            const projectKey = Object.keys(projectObj)[0];
            const project = projectObj[projectKey];
            if (project.status === 'ongoing') {
              targetProject = project;
              break;
            }
          }
          
          if (!targetProject) {
            const firstProjectObj = data.projects[0];
            const projectKey = Object.keys(firstProjectObj)[0];
            targetProject = firstProjectObj[projectKey];
          }
          
          setProjectId(targetProject.id);
          setClientId(targetProject.client_id);
        }
      } catch (error) {
        console.error('Error fetching project info:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectInfo();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!projectId || !clientId) {
    return (
      <div className="p-6 bg-gray-50 min-h-full h-screen flex items-center justify-center">
        <p className="text-gray-600">No active projects found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full h-screen overflow-hidden">
      <GroupChatSpace 
        userId={localStorage.getItem('user_id')} 
        projectId={projectId}
        clientId={clientId}
        isClient={true}
        className="custom-class"
      />
    </div>
  );
};

const SettingsView = () => <div className="p-6 bg-gray-50 min-h-full h-screen overflow-hidden">
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
          <div className="flex mb-4">
            <img src={SideLogo} className='max-w-full ' alt="" />
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
            <LayoutDashboard size={18} className="mr-3" />
            <span>Dashboard</span>
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
                <Briefcase size={18} className="mr-3" />
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
               <LucideMessageSquareText size={18} className="mr-3" />
                <span>Message</span>
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
  {/* Profile link */}
  <a 
    href="#" 
    onClick={(e) => {
      e.preventDefault();
      handleMenuClick('settings');
    }}
    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
  >
    {/* Avatar with initials */}
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
      {isLoadingProfile ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <span className="text-white font-semibold text-sm">
          {initials}
        </span>
      )}
    </div>
    
    {/* User info */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">
        {isLoadingProfile ? 'Loading...' : fullName}
      </p>
      <p className="text-xs text-gray-500 truncate">Client Account</p>
    </div>
  </a>
</div>
      </aside>

      {/* Main content area */}
  <div className="flex-1 flex flex-col overflow-hidden">
       {/* Top Navigation bar */}
<nav className="w-full py-3 px-4 flex justify-between items-center border-b border-gray-200 relative z-50 flex-shrink-0 bg-white">
  {/* Left side - Hamburger and Search */}
  <div className="flex items-center gap-3 flex-1">
    <button 
      onClick={toggleSidebar} 
      className="p-2 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors"
      aria-label="Toggle sidebar"
    >
      <Menu size={20} />
    </button>
    
    {/* Search input */}
    <div className="relative max-w-md w-full">
      <input 
        type="text" 
        placeholder="Search" 
        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <svg 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
        width="16" 
        height="16" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  </div>

  {/* Right side - Notifications and Profile */}
  <div className="flex items-center gap-3">
    {/* Notification bell */}
    <button 
      className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative"
      onClick={() => handleMenuClick('notifications')}
    >
      <Bell size={20} className="text-gray-600" />
      <span className="absolute top-1 right-1 flex items-center justify-center w-2 h-2 bg-red-500 rounded-full"></span>
    </button>
    
    {/* Profile section */}
    <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
      {/* Avatar with initials */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
        {isLoadingProfile ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <span className="text-white font-semibold text-sm">
            {initials}
          </span>
        )}
      </div>
      
      {/* User info with dropdown */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          handleMenuClick('settings');
        }}
        className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 transition-colors"
      >
        <div className="text-left min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
            {isLoadingProfile ? 'Loading...' : fullName}
          </p>
          <p className="text-xs text-gray-500 truncate max-w-[150px]">
            {email}
          </p>
        </div>
        <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
      </button>
    </div>
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