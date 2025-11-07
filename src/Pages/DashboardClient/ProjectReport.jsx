import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Bot, ArrowRight, Briefcase, CheckCircle, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AISidebarChat from '../../Sections/Client Side/Client Assistant/SideAsssistant';

const DynamicDashboard = () => {
  const [profileData, setProfileData] = useState(null);
  const [projectsData, setProjectsData] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    activeProjects: 0,
    completedProjects: 0,
    budgetSpent: 0,
    upcomingDeadlines: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [highRiskProjects, setHighRiskProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
const [isChatOpen, setIsChatOpen] = useState(false);
const [showFAB, setShowFAB] = useState(true);
const [fabTimeout, setFabTimeout] = useState(null);

const toggleChat = () => setIsChatOpen(prev => !prev);


  // Fetch profile data
  const fetchProfileData = async (token, apiUrl) => {
    try {
      const response = await fetch(`${apiUrl}/api/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0].profile_data || data[0];
      }
      return data.profile_data || data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  // Fetch projects data
  const fetchProjectsData = async (token, apiUrl) => {
    try {
      const response = await fetch(`${apiUrl}/api/projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const data = await response.json();
      if (data.well_received && data.projects) {
        return data.projects;
      }
      return [];
    } catch (err) {
      console.error('Error fetching projects:', err);
      return [];
    }
  };

  // Helper function to format time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return 'A week ago';
  };

  // Calculate due date (init_date + duration in months)
  const calculateDueDate = (initDate, durationMonths) => {
    const date = new Date(initDate);
    date.setMonth(date.getMonth() + durationMonths);
    return date;
  };

  // Calculate project progress based on job statuses and time elapsed
  const calculateProgress = (project) => {
    const initDate = new Date(project.init_date);
    const dueDate = calculateDueDate(project.init_date, project.duration);
    const now = new Date();
    
    // Time-based progress
    const totalDuration = dueDate - initDate;
    const elapsed = now - initDate;
    const timeProgress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    
    // Job-based progress
    if (project.jobs && project.jobs.length > 0) {
      const completedJobs = project.jobs.filter(job => 
        job.status === 'completed' || job.employed_worker_info?.length > 0
      ).length;
      const jobProgress = (completedJobs / project.jobs.length) * 100;
      
      // Average of time and job progress
      return Math.round((timeProgress + jobProgress) / 2);
    }
    
    return Math.round(timeProgress);
  };

  const createNewProject = () => {
    console.log('Navigating to client assistant...');
    navigate('/client-assistant');
  };

  // Handle action clicks from chat
  const handleChatAction = (action) => {
    if (action === 'start') {
      createNewProject();
    } else if (action === 'demo') {
      console.log('Watch demo clicked');
      // Add your demo logic here
    }
  };

  // Process projects data for metrics and activity
  const processProjectsData = (projects) => {
    let activeCount = 0;
    let completedCount = 0;
    let totalBudget = 0;
    let upcomingDeadlinesCount = 0; 
    const activities = [];
    const highRiskProjects = [];
    const now = new Date();

    projects.forEach((projectObj) => {
      const projectKey = Object.keys(projectObj)[0];
      const project = projectObj[projectKey];

      // Count active and completed projects
      if (project.status === 'ongoing' || project.status === 'active') {
        activeCount++;
      } else if (project.status === 'completed') {
        completedCount++;
      }

      // Calculate budget
      if (project.budget && typeof project.budget === 'number') {
        totalBudget += project.budget;
      } 

      // Calculate time-based progress for risk assessment
      const initDate = new Date(project.init_date);
      const dueDate = calculateDueDate(project.init_date, project.duration);
      const totalDurationMs = dueDate - initDate;
      const elapsedMs = now - initDate;
      
      // Time-based progress (maxed at 100%)
      const timeProgress = Math.min(Math.max((elapsedMs / totalDurationMs) * 100, 0), 100);

      // Check for high-risk projects (time elapsed >= 70%)
      if (timeProgress >= 70 && project.status !== 'completed' && project.status !== 'cancelled') {
        highRiskProjects.push({
          ...project,
          timeProgress: Math.round(timeProgress),
          dueDate: dueDate
        });
        upcomingDeadlinesCount++; 
      }

      // Process jobs for activity feed
      if (project.jobs) {
        project.jobs.forEach(job => {
          // Add to activity feed for active/inactive jobs
          if (job.status === 'active' || job.status === 'inactive' || job.status === 'ongoing') {
            activities.push({
              id: `job-${job.id}`,
              type: 'job',
              title: `Job posted: ${job.title}`,
              description: job.title,
              timestamp: new Date(job.init_date),
              project: project.project_title
            });
          }
        });
      }

      // Add project activity
      activities.push({
        id: `project-${project.id}`,
        type: 'project',
        title: `Project initiated: ${project.project_title}`,
        description: project.project_title,
        timestamp: new Date(project.init_date),
        status: project.status
      });
    });

    // Sort activities by date (most recent first) and limit to 4
    const sortedActivities = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 4)
      .map((activity) => ({
        ...activity,
        timeAgo: getTimeAgo(activity.timestamp),
        icon: activity.type === 'job' ? '📋' : '📁'
      }));

    return {
      activeProjects: activeCount,
      completedProjects: completedCount,
      budgetSpent: Math.round(totalBudget),
      upcomingDeadlines: upcomingDeadlinesCount, 
      activities: sortedActivities,
      highRiskProjects: highRiskProjects 
    };
  };

  // Main data fetch effect
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_jwt');
        const apiUrl = import.meta.env.VITE_API_URL;

        if (!token || !apiUrl) {
          setError('Missing authentication or API configuration');
          return;
        }

        const profile = await fetchProfileData(token, apiUrl);
        const projects = await fetchProjectsData(token, apiUrl);

        setProfileData(profile);
        setProjectsData(projects);

        const result = processProjectsData(projects);
        setDashboardMetrics({
          activeProjects: result.activeProjects,
          completedProjects: result.completedProjects,
          budgetSpent: result.budgetSpent,
          upcomingDeadlines: result.upcomingDeadlines
        });
        setRecentActivity(result.activities);
        setHighRiskProjects(result.highRiskProjects);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);
  //FAB appearance control
useEffect(() => {
  const handleMouseMove = () => {
    // Show FAB on mouse movement
    setShowFAB(true);
    
    // Clear existing timeout
    if (fabTimeout) {
      clearTimeout(fabTimeout);
    }
    
    // Set new timeout to hide FAB after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      setShowFAB(false);
    }, 3000);
    
    setFabTimeout(timeout);
  };

  // Add mouse move listener
  window.addEventListener('mousemove', handleMouseMove);
  
  // Cleanup
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    if (fabTimeout) {
      clearTimeout(fabTimeout);
    }
  };
}, [fabTimeout]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const firstName = profileData?.firstname || 'User';
  const userInitials = firstName.charAt(0).toUpperCase();

  return (
    <div className="w-full h-full bg-gray-50 third-font flex overflow-hidden">
      {/* Main Dashboard Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable content container */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-2 md:px-4 py-6 md:py-8">
            <div className="max-w-full mx-auto">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between md:items-start mb-8 gap-4 bg-[#2255D7] px-8 py-10 rounded-xl">
                <div>
                  <h1 className="text-xl md:text-xl font-semibold text-white mb-2">
                    Welcome, {firstName}
                  </h1>
                  <p className="text-white text-sm">Here's what's happening with your project today.</p>
                </div>
                {projectsData.length > 0 && (
                  <div className="flex gap-3 flex-shrink-0">
                    <button 
                      onClick={createNewProject}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
                      New Project
                    </button>
                    <button className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
                      Invite Team
                    </button>
                  </div>
                )}
              </div>

              {projectsData.length === 0 ? (
                /* Empty UI - Only this shows when no projects */
                <div className="p-16 shadow-sm border third-font h-[70vh] flex items-center justify-center border-gray-100">
                  <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <div className="mb-6">
                      {/* Custom bar chart using divs */}
                      <div className="flex items-end justify-center gap-3 h-10 w-8">
                        <div className="w-4 bg-gray-200 rounded-t" style={{ height: '50%' }}></div>
                        <div className="w-4 bg-gray-300 rounded-t" style={{ height: '75%' }}></div>
                        <div className="w-4 bg-gray-200 rounded-t" style={{ height: '90%' }}></div>
                      </div>
                    </div>
                    <h2 className="text-sm font-normal text-[#6B7280] mb-2">Project activity chart would render here</h2>
                    <p className="text-[#9CA3AF] text-xs">Using actual chart library in production</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Metrics Cards - Only show when there are projects */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Active Projects */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-100 rounded-lg p-3">
                          <Briefcase className="text-blue-600" size={24} />
                        </div>
                      </div>
                      <h3 className="text-gray-600 text-sm font-medium mb-1">Active Projects</h3>
                      <p className="text-3xl font-bold text-gray-900">{dashboardMetrics.activeProjects}</p>
                    </div>

                    {/* Completed Projects */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-100 rounded-lg p-3">
                          <CheckCircle className="text-green-600" size={24} />
                        </div>
                      </div>
                      <h3 className="text-gray-600 text-sm font-medium mb-1">Completed Projects</h3>
                      <p className="text-3xl font-bold text-gray-900">{dashboardMetrics.completedProjects}</p>
                    </div>

                    {/* Budget Spent */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-indigo-600 rounded-lg p-3">
                          <DollarSign className="text-white" size={24} />
                        </div>
                      </div>
                      <h3 className="text-gray-600 text-sm font-medium mb-1">Budget Spent</h3>
                      <p className="text-3xl font-bold text-gray-900">${dashboardMetrics.budgetSpent.toLocaleString()}</p>
                    </div>

                    {/* Upcoming Deadlines */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-yellow-500 rounded-lg p-3">
                          <Calendar className="text-white" size={24} />
                        </div>
                      </div>
                      <h3 className="text-gray-600 text-sm font-medium mb-1">Upcoming Deadlines</h3>
                      <p className="text-3xl font-bold text-gray-900">{dashboardMetrics.upcomingDeadlines}</p>
                    </div>
                  </div>

                  {/* Main Content Grid - Active Projects and Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Active Projects Section */}
                    <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Active Projects</h2>
                        <Calendar size={20} className="text-gray-600" />
                      </div>

                      <div className="space-y-0">
                        {projectsData.slice(0, 2).map((projectObj, index) => {
                          const projectKey = Object.keys(projectObj)[0];
                          const project = projectObj[projectKey];
                          const progress = calculateProgress(project);
                          const dueDate = calculateDueDate(project.init_date, project.duration);
                          const isLast = index === projectsData.slice(0, 2).length - 1;

                          return (
                            <div key={project.id} className={`border-t border-gray-100 p-4 hover:bg-gray-50 transition-colors ${isLast ? 'border-b border-gray-100' : ''}`}>
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900">{project.project_title}</h3>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full text-white ${
                                  project.status === 'ongoing' ? 'bg-blue-600' : 
                                  project.status === 'completed' ? 'bg-green-500' : 'bg-gray-500'
                                }`}>
                                  {project.status === 'ongoing' ? 'In Progress' : 
                                   project.status === 'completed' ? 'Completed' : 'Pending'}
                                </span>
                              </div>

                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-gray-700">Progress</span>
                                  <span className="text-sm font-semibold text-gray-700">{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div
                                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div className="text-sm text-gray-500">
                                Due: {dueDate.toLocaleDateString('en-US', {
                                  month: 'numeric',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                          );
                        })}

                        <button className="w-full text-center py-3 text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 border-t border-gray-100">
                          View all projects <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Recent Activity Section */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>

                      <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                          recentActivity.map((activity) => (
                            <div key={activity.id} className="flex gap-3 items-start pb-4 border-b border-gray-100 last:border-0">
                              <span className="text-lg mt-0.5">{activity.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                  {activity.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{activity.timeAgo}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
                        )}

                        {recentActivity.length > 0 && (
                          <button className="w-full text-center py-3 text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 mt-2">
                            View all activity <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Deadlines Section */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Upcoming Deadlines</h2>
                      <Calendar size={20} className="text-gray-400" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projectsData.slice(0, 2).map((projectObj) => {
                        const projectKey = Object.keys(projectObj)[0];
                        const project = projectObj[projectKey];
                        const dueDate = calculateDueDate(project.init_date, project.duration);
                        const now = new Date();
                        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                        
                        let timeLabel = '';
                        let colorClass = '';
                        
                        if (daysUntilDue < 0) {
                          timeLabel = 'Overdue';
                          colorClass = 'bg-red-100 text-red-700';
                        } else if (daysUntilDue === 0) {
                          timeLabel = 'Today';
                          colorClass = 'bg-red-50 text-red-700';
                        } else if (daysUntilDue === 1) {
                          timeLabel = 'Tomorrow';
                          colorClass = 'bg-red-50 text-red-700';
                        } else if (daysUntilDue <= 7) {
                          timeLabel = `${daysUntilDue} days`;
                          colorClass = 'bg-yellow-50 text-yellow-700';
                        } else if (daysUntilDue <= 30) {
                          timeLabel = `${Math.ceil(daysUntilDue / 7)} weeks`;
                          colorClass = 'bg-blue-50 text-blue-700';
                        } else {
                          timeLabel = `${Math.ceil(daysUntilDue / 30)} months`;
                          colorClass = 'bg-gray-50 text-gray-700';
                        }

                        return (
                          <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1 min-w-0 mr-4">
                              <h3 className="font-semibold text-gray-900 truncate">{project.project_title}</h3>
                              <p className="text-sm text-gray-500 truncate">
                                {project.jobs?.length || 0} {project.jobs?.length === 1 ? 'job' : 'jobs'}
                              </p>
                            </div>
                            <div className={`text-right font-semibold px-3 py-1 rounded-lg whitespace-nowrap ${colorClass}`}>
                              {timeLabel}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button className="w-full text-center py-3 text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 mt-4 border-t pt-4">
                      View all deadlines <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Chat Assistant - Desktop (toggleable) */}
          {isChatOpen && (
            <div className="hidden lg:flex lg:w-96 bg-white border-l border-gray-200 flex-col">
           {/* Chat Component */}
           <div className="flex-1 overflow-hidden">
           <AISidebarChat 
              onClose={toggleChat} // Pass the function to close the sidebar
              onActionClick={handleChatAction}
              className="w-full h-full" //
            />
            </div>
         </div>
          )}
        {!showFAB && (
          <div className="fixed bottom-12 right-12 z-40 pointer-events-none">
            <div className="relative w-6 h-6">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
              {/* Middle ring */}
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse opacity-50"></div>
              {/* Center dot */}
              <div className="absolute inset-0 m-auto w-3 h-3 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        )}

{/* Chat Toggle FAB - Auto-hides on inactivity */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            onMouseEnter={() => setShowFAB(true)}
            className={`fixed bottom-16 right-16 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all duration-300 z-50 ${
              showFAB ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
            aria-label={isChatOpen ? "Close chat" : "Open chat"}
          >
            {isChatOpen ? (
              <Bot className="text-white" size={24} />
            ) : (
              <Bot className="text-white" size={24} />
            )}
          </button>

      {/* Mobile Chat Overlay */}
      {isChatOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsChatOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Mobile Chat Header */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Client Assistant</h3>
                    <p className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Mobile Chat Component */}
            <div className="flex-1 overflow-hidden">
              <AISidebarChat 
                assistantName="Client Assistant"
                userName={firstName}
                userAvatar={userInitials}
                onActionClick={handleChatAction}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicDashboard;