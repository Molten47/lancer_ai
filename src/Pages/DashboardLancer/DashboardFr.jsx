import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sidebar, Bell, User, Settings, Home, FileText,  MessageCircle, Download, X, MessageSquare, HelpCircle, Building2,
       ChevronRight, TrendingUp} from 'lucide-react'
import { useSelector } from 'react-redux'
       
import DashboardViews from '../../Sections/Freelancer Side/DashboardView/DashboardView'
//import TaskManagements from '../../Sections/Jobs/Task'
//import WalletViews from '../../Sections/Freelancer Side/Tools'
//import MessagesFrs from '../../Sections/Freelancer Side/MessageFL/PersonalChat'
import ChatModal from '../../Sections/Freelancer Side/ChatModal'
import Prosettingss from '../../Sections/Profile Settings/Prosettings'
import GetHelps from '../../Sections/Gethelp/Help'
import LogoutButton from '../../Components/Platform Users/Logout'
//import Analytics from '../../Sections/Analysis/Analytics'
import Notifications from '../../Pages/Notifications/Notifications'
import GroupChat from '../../Sections/Freelancer Side/FreeMessa/GroupChat'
import JobsProjectManagerChat from '../../Sections/Freelancer Side/FreeMessa/ProjectManager'
import JobTask from '../../Sections/Freelancer Side/DashboardView/Task'
import ProfilePage from '../profile'
import MessageList from '../../Sections/ChatSpace/ConversationList'

// Mock components - replace with your actual components
const DashboardView = () => <div className="p-6 bg-gray-50 min-h-full">
<DashboardViews/>
</div>

const GroupChatView = () => {
  const [projectId, setProjectId] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobInfo = async () => {
      try {
        const token = localStorage.getItem('access_jwt');
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/api/jobs`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        
        if (data.well_received && data.jobs.length > 0) {
          // Get first active job or fallback to first job
          let targetJob = data.jobs.find(job => job.status === 'active') || data.jobs[0];
          
          setProjectId(targetJob.project_id);
          setClientId(targetJob.client_id);
          
          console.log(`Freelancer joining project ${targetJob.project_id}, client ${targetJob.client_id}`);
        }
      } catch (error) {
        console.error('Error fetching job info:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobInfo();
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
        <p className="text-gray-600">No active jobs found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full h-screen overflow-hidden">
      <GroupChat 
        userId={localStorage.getItem('user_id')} 
        projectId={projectId}
        clientId={clientId}
        isClient={false}  // Important: false for freelancers
      />
    </div>
  );
};
//This is the first stage
const MessagesView = () => {
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  const handleOpenChat = (senderId, senderName) => {
    setSelectedRecipient({ id: senderId, name: senderName });
    setShowChatModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <MessageList onOpenChat={handleOpenChat} />
      </div>

      {/* Add the Chat Modal */}
      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        recipientId={selectedRecipient?.id}
        recipientName={selectedRecipient?.name}
      />
    </div>
  );
};

const ProjectManagerView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
     <JobsProjectManagerChat/>
  </div>
</div>

const SettingsView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
  <Prosettingss/>
  </div>
</div>

const JobTaskView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
  <JobTask/>
  </div>
</div>

const HelpView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
    <GetHelps/>
  </div>
</div>

const NotificationsView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
    <Notifications />
  </div>
</div>

// Add ProfileView component
const ProfileView = () => <div className="p-6 bg-gray-50 min-h-full">
  <ProfilePage />
</div>

const DashboardFr = () => {
  // State to track the active view
  const location = useLocation();
 const [activeView, setActiveView] = useState(() => {
    const hash = location.hash.replace('#', '');
    const validViews = [
      'dashboard', 'group-chat', 'messages', 'pm-agent', 
      'settings', 'help', 'notifications', 'jobs-task', 'profile'
    ];
    return validViews.includes(hash) ? hash : 'dashboard';
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Default closed
  // Add state to track screen size
  const [isMobile, setIsMobile] = useState(false)
  const [userRole, setUserRole] = useState('freelancer') // New state for role switching
  
  // Add these separate state variables for independent dropdown control
  const [isJobsDropdownOpen, setIsJobsDropdownOpen] = useState(false);
  const [isMetricsDropdownOpen, setIsMetricsDropdownOpen] = useState(false);
  
  // Add state for profile data
  const [profileData, setProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // Determine if the main "Jobs" link or its children are active
  const userData = useSelector(state => state.user.userData);
  const navigate = useNavigate();


  // Function to fetch profile data from API
  const fetchProfileData = async () => {
    try {
      setIsLoadingProfile(true);
      setProfileError(null);

        const token = localStorage.getItem('access_jwt')
        const API_URL = import.meta.env.VITE_API_URL
      // Replace with your actual API endpoint
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

  useEffect(() => {
    navigate(`#${activeView}`, { replace: true });
  }, [activeView, navigate]);
useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validViews = [
        'dashboard', 'group-chat', 'messages', 'pm-agent', 
        'settings', 'help', 'notifications', 'jobs-task', 'profile'
      ];
      if (validViews.includes(hash) && hash !== activeView) {
        setActiveView(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeView]);

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

  // Handle avatar click to show profile
  const handleAvatarClick = () => {
    setActiveView('profile')
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

  const toggleJobsDropdown = () => {
    setIsJobsDropdownOpen(!isJobsDropdownOpen);
  };

  const toggleMetricsDropdown = () => {
    setIsMetricsDropdownOpen(!isMetricsDropdownOpen); 
  };

  const isJobsActive = activeView === 'group-chat' || activeView === 'messages';
  const isMetricsActive = activeView === 'jobs-task' || activeView === 'pm-agent';

  // Function to render the appropriate view based on the active state
  const renderView = () => {
    switch(activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'group-chat': 
        return <GroupChatView />;
      case 'messages':
        return <MessagesView />;
      case 'pm-agent':
        return <ProjectManagerView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpView />;
      case'notifications':
        return < NotificationsView/>
      case 'jobs-task':
        return <JobTaskView/>
      case 'profile':
        return <ProfileView />
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
          <h1 className="text-xl font-bold text-blue-600">Lancer</h1>
        </div>

        {/* Right side - Notifications and User */}
        <div className="flex items-center gap-4">
          {/* Notification bell */}
          <button 
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative"
            onClick={() => handleMenuClick('notifications')}
          >
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
              <button 
                onClick={handleAvatarClick}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200 cursor-pointer"
                title="View Profile"
              >
                {isLoadingProfile ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {initials}
                  </span>
                )}
              </button>
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

            {/* Jobs Section - Blue Theme */}
            <div>
              {/* Main Jobs Button */}
              <button
                onClick={toggleJobsDropdown}
                className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isJobsActive
                    ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                    : 'text-gray-700 hover:bg-blue-25 hover:text-[#1447e6] border border-transparent'
                }`}
              >
                <Building2 size={20} className="mr-3" />
                <span className="flex-grow text-left">Chats</span>
                <ChevronRight
                  size={16}
                  className={`transition-transform duration-200 ${
                    isJobsDropdownOpen ? 'rotate-90 text-blue-600' : ''
                  }`}
                />
              </button>

              {/* Jobs Dropdown Menu - Blue Theme */}
              {isJobsDropdownOpen && (
                <div className="mt-2 pl-7 space-y-1 border-l-2 border-blue-200 ml-6">
                  {/* Jobs History Link */}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuClick('group-chat');//This will open group caht
                    }}
                    className={`flex items-center w-full px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
                      activeView === 'group-chat'
                        ? 'bg-blue-100 text-cta font-semibold shadow-sm'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-[#1447e6]'
                    }`}
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 
                    
                    "></div>
                    Group-Chat
                  </a>

                  {/* Workspace History Link */}
              
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuClick('messages'); // You will open indidual chat space on click
                    }}
                    className={`flex items-center w-full px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
                      activeView === 'messages' // Change this if you create a separate workspace view
                        ? 'bg-blue-100 text-cta font-semibold shadow-sm'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-[#1447e6]'
                    }`}
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3
                    
                    
                    "></div>
                    Individual Chat
                  </a>
                </div>
              )}
            </div>

            {/* Metrics Section - Purple Theme */}
            <div>
              {/* Main Metrics Button */}
              <button
                onClick={toggleMetricsDropdown}
                className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isMetricsActive
                    ? 'bg-purple-50 text-primary border border-purple-200'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-[#1447e6] border border-transparent'
                }`}
              >
                <TrendingUp size={20} className="mr-3" />
                <span className="flex-grow text-left">Utilities</span>
                <ChevronRight
                  size={16}
                  className={`transition-transform duration-200 ${
                    isMetricsDropdownOpen ? 'rotate-90 text-[#1447e6]' : ''
                  }`}
                />
              </button>

              {/* Metrics Dropdown Menu - Purple Theme */}
              {isMetricsDropdownOpen && (
                <div className="mt-2 pl-7 space-y-1 border-l-2 border-blue-500 ml-6">
                  {/* Analytics Link */}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuClick('jobs-task');
                    }}
                    className={`flex items-center w-full px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
                      activeView === 'jobs-task'
                        ? 'bg-purple-100 text-primary font-semibold shadow-sm'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-[#1447e6]'
                    }`}
                  >
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    Submit Task here
                  </a>

                  {/* Earnings Link */}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuClick('pm-agent');
                    }}
                    className={`flex items-center w-full px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
                      activeView === 'pm-agent'
                        ? 'bg-purple-100 text-purple-800 font-semibold shadow-sm'
                        : 'text-gray-600 hover:bg-purple-50 hover:text-[#1447e6]'
                    }`}
                  >
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    Project assistant
                  </a>
                </div>
              )}
            </div>
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
                  activeView === 'wallets' ? 'Your Tools' : 
                  activeView === 'task' ? 'Jobs' : 
                  activeView === 'settings' ? 'Settings' : 
                  activeView === 'help' ? 'Help Center' : 
                  activeView === 'profile' ? 'Profile' : 'Dashboard'}
                </h2>
                <p className='text-gray-500 text-sm'>
                  {activeView === 'dashboard' && 'Welcome back! Here\'s your overview for today.'}
                  {activeView === 'messages' && 'Manage your conversations and collaborations.'}
                  {activeView === 'task' && 'Track and manage your ongoing projects.'}
                  {activeView === 'wallets' && 'These tools are available to aid your workflow'}
                  {activeView === 'settings' && 'Customize your account and preferences.'}
                  {activeView === 'help' && 'Get support and find answers to your questions.'}
                  {activeView === 'profile' && 'View and manage your profile information.'}
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