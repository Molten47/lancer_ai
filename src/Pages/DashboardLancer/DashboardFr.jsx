import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sidebar, Bell, User, Settings, Home, FileText, MessageCircle, Download, X, MessageSquare, HelpCircle, Building2, ChevronRight, TrendingUp, LucideMessageSquareText, Briefcase, LayoutDashboard, Menu , ChevronDown} from 'lucide-react'
import { useSelector } from 'react-redux'
import SideLogo from '../../assets/Images/SVG/Flogo2.svg'

import DashboardViews from '../../Sections/Freelancer Side/DashboardView/DashboardView'
import FreelancerJobsDashboard from '../../Sections/Jobs/JobDahboard' // Import the new component
import ChatModal from '../../Sections/Freelancer Side/ChatModal'
import Prosettingss from '../../Sections/Profile Settings/Prosettings'
import GetHelps from '../../Sections/Gethelp/Help'
import LogoutButton from '../../Components/Platform Users/Logout'
import Notifications from '../../Pages/Notifications/Notifications'
import GroupChat from '../../Sections/Jobs/GroupChat'
import JobsProjectManagerChat from '../../Sections/Freelancer Side/FreeMessa/ProjectManager'
import JobTask from '../../Sections/Freelancer Side/DashboardView/Task'
import ProfilePage from '../profile'
import MessageList from '../../Sections/ChatSpace/ConversationList'

const DashboardView = () => <div className="p-8 bg-white min-h-full">
  <DashboardViews />
</div>

const JobsDashboardView = () => <div className="bg-gray-50 min-h-full">
  <FreelancerJobsDashboard onSelectJob={(job) => console.log('Selected job:', job)} />
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
        isClient={false}
      />
    </div>
  );
};

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
    <JobsProjectManagerChat />
  </div>
</div>

const SettingsView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
    <Prosettingss />
  </div>
</div>

const JobTaskView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
    <JobTask />
  </div>
</div>

const HelpView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
    <GetHelps />
  </div>
</div>

const NotificationsView = () => <div className="p-6 bg-gray-50 min-h-full">
  <div className="bg-white rounded-lg p-8 shadow-sm">
    <Notifications />
  </div>
</div>

const ProfileView = () => <div className="p-6 bg-gray-50 min-h-full">
  <ProfilePage />
</div>

const DashboardFr = () => {
  const location = useLocation();
  const [activeView, setActiveView] = useState(() => {
    const hash = location.hash.replace('#', '');
    const validViews = [
      'dashboard', 'jobs', 'group-chat', 'messages', 'pm-agent',
      'settings', 'help', 'notifications', 'jobs-task', 'profile'
    ];
    return validViews.includes(hash) ? hash : 'dashboard';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [profileData, setProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const userData = useSelector(state => state.user.userData);
  const navigate = useNavigate();

  const fetchProfileData = async () => {
    try {
      setIsLoadingProfile(true);
      setProfileError(null);

      const token = localStorage.getItem('access_jwt')
      const API_URL = import.meta.env.VITE_API_URL
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

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

  useEffect(() => {
    fetchProfileData();
  }, []);

  const firstName = profileData?.firstname || userData?.firstname || '';
  const lastName = profileData?.lastname || userData?.lastname || '';
  const username = profileData?.username || userData?.username || 'User';
  const email = profileData?.email || userData?.email || '';

  const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : (firstName || lastName || username);

  const getInitials = (first, last) => {
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    } else if (first) {
      return first.charAt(0).toUpperCase();
    } else if (last) {
      return last.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const initials = getInitials(firstName, lastName);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
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
        'dashboard', 'jobs', 'group-chat', 'messages', 'pm-agent',
        'settings', 'help', 'notifications', 'jobs-task', 'profile'
      ];
      if (validViews.includes(hash) && hash !== activeView) {
        setActiveView(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeView]);

  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobile, isSidebarOpen])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleMenuClick = (view) => {
    setActiveView(view)
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  const handleAvatarClick = () => {
    setActiveView('profile')
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  const handleOverlayClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'jobs':
        return <JobsDashboardView />;
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
      case 'notifications':
        return <NotificationsView />
      case 'jobs-task':
        return <JobTaskView />
      case 'profile':
        return <ProfileView />
      default:
        return <DashboardView />;
    }
  }

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-gray-50 third-font">
      {/* Top Navigation Bar */}
      <nav className="w-full py-4 px-6 flex justify-between items-center border-b border-gray-200 relative z-50 flex-shrink-0 bg-white">
          {/* Left side - Hamburger and Search */}
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={toggleSidebar} 
              className="p-2 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu size={22} />
            </button>
            
            {/* Search input */}
            <div className="relative max-w-md w-full">
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
              />
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                width="18" 
                height="18" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <button 
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors relative"
              onClick={() => handleMenuClick('notifications')}
            >
              <Bell size={22} className="text-gray-700" />
              <span className="absolute top-2 right-2 flex items-center justify-center w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Profile section */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick('profile');
                }}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  {isLoadingProfile ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {initials}
                    </span>
                  )}
                </div>
                
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
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

      {/* Main content area with sidebar */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        {/* Overlay for mobile sidebar */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-20 z-30"
            onClick={handleOverlayClick}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          ${isMobile ? 'fixed left-0 z-40' : 'relative'}
          ${isSidebarOpen ? (isMobile ? 'w-64' : 'w-64') : (isMobile ? 'w-0' : 'w-0')}
          border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden bg-white
          ${isMobile ? 'shadow-2xl h-full' : 'h-full'}
        `}>

       {/* Logo Section at the top */}
            <div className="h-24 px-6 py-4 border-b border-gray-100 flex-shrink-0 relative flex items-center">
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="absolute top-3 right-3 p-2 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors z-10"
                  aria-label="Close sidebar"
                >
                  <X size={20} />
                </button>
              )}
              <img 
                src={SideLogo} 
                className='max-h-16 w-auto max-w-full object-contain' 
                alt="Lancer-logo" 
              />
            </div>

          {/* Navigation */}
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
                  : 'text-[#374151] hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard size={20} className="mr-3" />
              <span>Dashboard</span>
            </a>

            {/* Jobs Section - Main Item */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick('jobs');
              }}
              className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeView === 'jobs'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Briefcase size={20} className="mr-3" />
              <span>Jobs</span>
            </a>

            {/* Messages Section */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick('messages');
              }}
              className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeView === 'messages'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-[#374151] hover:bg-gray-50'
              }`}
            >
              <LucideMessageSquareText size={20} className="mr-3" />
              <span>Messages</span>
            </a>
            
          </nav>

          {/* Bottom section */}
          <div className="p-3 border-t border-gray-200 flex-shrink-0">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick('settings');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                {isLoadingProfile ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {initials}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#374151] truncate">
                  {isLoadingProfile ? 'Loading...' : fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">Professional Account</p>
              </div>
            </a>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Content area */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardFr