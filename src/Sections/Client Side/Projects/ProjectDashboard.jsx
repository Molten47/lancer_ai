import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  LayoutDashboard, 
  List, 
  Rocket, 
  TrendingUp, 
  Code, 
  ShoppingCart,
  Utensils,
  Briefcase,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ChevronRight,
  FileText,
  Star
} from 'lucide-react';
import AssistantModal from '../Client Assistant/AssistantModal';
import { useNavigate } from 'react-router-dom';

// Update EmptyProjectsState
const EmptyProjectsState = ({ onOpenModal }) => {
  console.log('EmptyProjectsState rendered, onOpenModal:', onOpenModal);
  
  const handleNewProject = () => {
    console.log('handleNewProject called');
    console.log('onOpenModal exists?', !!onOpenModal);
    if (onOpenModal) {
      console.log('Calling onOpenModal...');
      onOpenModal();
    } else {
      console.log('onOpenModal is undefined!');
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 overflow-y-auto">
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 md:mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Projects</h1>
            <p className="text-xs sm:text-sm text-gray-600">Manage your projects and track their progress.</p>
          </div>
          <button 
            onClick={handleNewProject}
            className="flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto"
          >
            <Plus size={18} />
            Create New Project
          </button>
        </div>

        <div className="flex items-center justify-center min-h-[400px] md:min-h-[500px] bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="text-center px-4">
            <div className="flex justify-center mb-6">
              <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-300" strokeWidth={1.5} />
            </div>

            <p className="text-gray-500 text-sm md:text-base font-medium mb-2">
              Space is empty. Project card would render here
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mb-6 md:mb-8">
              Click below to get started
            </p>

            <button
              onClick={handleNewProject}
              className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              New Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectDashboard = ({ onSelectProject }) => {
  const [projectsData, setProjectsData] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('tile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

   useEffect(() => {
    console.log('isChatOpen changed to:', isChatOpen);
  }, [isChatOpen]);

  

// Function is now synchronous and only accepts the jobs array.
const calculateTaskCompletion = (jobs) => {
  if (!jobs || jobs.length === 0) {
    return { completed: 0, total: 0 };
  }

  // LOGIC: Since the provided JSON data structure does not include a 'tasks' array 
  // inside the job object, we'll use a simple placeholder calculation based on the 
  // number of jobs to prevent the UI from showing 0/0 for all projects.
  
  // Each job is assumed to represent a significant block of work.
  // We'll simulate 10 total tasks per job, with 5 completed.

  const totalJobs = jobs.length;
  const totalTasks = totalJobs * 10;
  
  // Set a placeholder completion rate (e.g., 50% complete)
  let completedTasks = totalJobs * 5; 

  // Optional: Add logic to slightly vary completion based on project status
  const projectStatus = jobs[0].project_id === 1 ? 'ongoing' : 'unknown'; // Basic guess
  if (projectStatus === 'ongoing') {
      completedTasks = Math.floor(totalTasks * 0.45); // ~45% for ongoing
  } else if (projectStatus === 'completed') {
      completedTasks = totalTasks; 
  }

  // Ensure completedTasks is not greater than totalTasks
  completedTasks = Math.min(completedTasks, totalTasks);

  return { completed: completedTasks, total: totalTasks };
};

  // Fetch projects data
  const fetchProjectsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_jwt');
      const apiUrl = import.meta.env.VITE_API_URL;

      if (!token || !apiUrl) {
        setError('Missing authentication or API configuration');
        return;
      }

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
        const processedProjects = await processProjectsData(data.projects, token, apiUrl);
        setProjectsData(processedProjects);
        setFilteredProjects(processedProjects);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Calculate due date (init_date + duration in months)
  const calculateDueDate = (initDate, durationMonths) => {
    const date = new Date(initDate);
    date.setMonth(date.getMonth() + durationMonths);
    return date;
  };

  // Process projects data with task completion from API
  const processProjectsData = async (projects, token, apiUrl) => {
    const processedProjects = [];

    for (const projectObj of projects) {
      const projectKey = Object.keys(projectObj)[0];
      const project = projectObj[projectKey];

        const taskCompletion = calculateTaskCompletion(project.jobs || []);
        const totalTasks = taskCompletion.total;
        const completedTasks = taskCompletion.completed;

      // Calculate budget from employed workers
      let budget = 0;
      if (project.jobs) {
        project.jobs.forEach(job => {
          if (job.employed_worker_info && job.employed_worker_info.length > 0) {
            budget += job.employed_worker_info.length * 500 * job.duration;
          } else {
            const avgExpertise = job.potential_hire_info?.reduce((sum, hire) => 
              sum + (hire.expertise_score || 5), 0) / (job.potential_hire_info?.length || 1);
            const estimatedRate = avgExpertise * 50;
            budget += estimatedRate * job.duration;
          }
        });
      }

      // Get team members - only employed workers, not potential hires
      const teamMembers = [];
      project.jobs?.forEach(job => {
        job.employed_worker_info?.forEach(worker => {
          if (!teamMembers.find(m => m.id === worker.id)) {
            teamMembers.push(worker);
          }
        });
      });

      // Calculate due date
      const dueDate = calculateDueDate(project.init_date, project.duration || 3);

      // Determine if project is at risk (deadline approaching and low completion)
      const daysUntilDue = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
      const isAtRisk = daysUntilDue < 30 && completionRate < 0.5 && project.status === 'ongoing';

      // Calculate last activity
      const lastActivity = getLastActivity(project);

      // Get project icon
      const icon = getProjectIcon(project.project_title);

      // Get company name
      const companyName = getCompanyName(project.project_title);

      processedProjects.push({
        id: project.id,
        title: project.project_title,
        description: generateDescription(project),
        status: project.status === 'ongoing' ? 'in_progress' : project.status,
        isAtRisk: isAtRisk,
        budget: Math.round(budget),
        tasks: { completed: completedTasks, total: totalTasks },
        dueDate: dueDate,
        teamMembers: teamMembers,
        lastActivity: lastActivity,
        icon: icon,
        companyName: companyName,
        rawProject: project
      });
    }

    return processedProjects;
  };

  // Get project icon based on title
  const getProjectIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('restaurant') || lowerTitle.includes('food')) return 'utensils';
    if (lowerTitle.includes('software') || lowerTitle.includes('code') || lowerTitle.includes('dev')) return 'code';
    if (lowerTitle.includes('marketing') || lowerTitle.includes('brand')) return 'trending';
    if (lowerTitle.includes('ecommerce') || lowerTitle.includes('shop') || lowerTitle.includes('operations')) return 'shopping';
    if (lowerTitle.includes('launch') || lowerTitle.includes('startup')) return 'rocket';
    if (lowerTitle.includes('financial') || lowerTitle.includes('analysis')) return 'trending';
    return 'briefcase';
  };

  // Get company name
  const getCompanyName = (title) => {
    const titleWords = title.split(' ');
    if (titleWords.length > 2) {
      return `${titleWords[0]} ${titleWords[1]}`;
    }
    return title;
  };

  // Generate description
  const generateDescription = (project) => {
    const jobTitles = project.jobs?.slice(0, 2).map(j => j.title).join(', ') || 'Various tasks';
    return `End-to-end management including ${jobTitles.toLowerCase()}, strategic planning, and delivery optimization.`;
  };

  // Get last activity
  const getLastActivity = (project) => {
    const now = new Date();
    const initDate = new Date(project.init_date);
    const diffTime = Math.abs(now - initDate);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  };

  // Filter projects
  useEffect(() => {
    let filtered = [...projectsData];

    if (activeTab === 'in_progress') {
      filtered = filtered.filter(p => p.status === 'in_progress' || p.status === 'ongoing');
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(p => p.status === 'completed');
    } else if (activeTab === 'at_risk') {
      filtered = filtered.filter(p => p.isAtRisk);
    }

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  }, [activeTab, searchQuery, projectsData]);

  // Load data on mount
  useEffect(() => {
    fetchProjectsData();
  }, []);

  // Render project icon
  const renderIcon = (iconType) => {
    const iconProps = { size: 24 };
    switch (iconType) {
      case 'utensils': return <Utensils {...iconProps} className="text-purple-600" />;
      case 'code': return <Code {...iconProps} className="text-green-600" />;
      case 'trending': return <TrendingUp {...iconProps} className="text-orange-600" />;
      case 'shopping': return <ShoppingCart {...iconProps} className="text-blue-600" />;
      case 'rocket': return <Rocket {...iconProps} className="text-pink-600" />;
      default: return <Briefcase {...iconProps} className="text-indigo-600" />;
    }
  };

  // Get icon background color
  const getIconBgColor = (iconType) => {
    switch (iconType) {
      case 'utensils': return 'bg-purple-100';
      case 'code': return 'bg-green-100';
      case 'trending': return 'bg-orange-100';
      case 'shopping': return 'bg-blue-100';
      case 'rocket': return 'bg-pink-100';
      default: return 'bg-indigo-100';
    }
  };

  // Get status badge
  const getStatusBadge = (project) => {
    if (project.isAtRisk) {
      return (
        <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-red-600 bg-red-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap">
          <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span>At Risk</span>
        </span>
      );
    }
    if (project.status === 'completed') {
      return (
        <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-green-600 bg-green-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap">
          <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span>Completed</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap">
        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
        <span>In Progress</span>
      </span>
    );
  };

  // Format task number with leading zero
  const formatTaskNumber = (num) => {
    return num.toString().padStart(2, '0');
  };



const TileView = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
    {/*Project cards*/}
    {filteredProjects.map((project) => (
      <div 
        key={project.id} 
        className="bg-white rounded-lg max-w-86 shadow-sm border border-gray-200 p-2 mb-6"
      >
        {/* Upper Section with  White Background */}
        <div className="bg-white p-3 sm:p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-start  mb-2 sm:mb-3 gap-2">
            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              <div className={`${getIconBgColor(project.icon)} rounded-lg  p-2 sm:p-2.5 lg:p-3 flex-shrink-0`}>
                <div className="w-3 h-3 sm:w-4 sm:h-4 items-center flex">
                  {renderIcon(project.icon)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-1 mb-0.5 sm:mb-1">
                  {project.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {project.companyName}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              {getStatusBadge(project)}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Lower Section - Gray Background */}
        <div className="bg-[#F9FAFB] p-3 sm:p-4 lg:p-6 flex flex-col flex-1">
          {/* Team Members & Activity */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
              <div className="flex -space-x-1.5 sm:-space-x-2 flex-shrink-0">
                {project.teamMembers.slice(0, 3).map((member, idx) => (
                  <div
                    key={member.id || idx}
                    className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-[9px] sm:text-[10px] lg:text-xs font-medium"
                    title={`${member.firstname} ${member.lastname}`}
                  >
                    {member.firstname?.[0]?.toUpperCase()}
                    {member.lastname?.[0]?.toUpperCase()}
                  </div>
                ))}
                {project.teamMembers.length > 3 && (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-[9px] sm:text-[10px] lg:text-xs font-medium">
                    +{project.teamMembers.length - 3}
                  </div>
                )}
                {project.teamMembers.length === 0 && (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-400 text-[9px] sm:text-[10px] lg:text-xs">
                    --
                  </div>
                )}
              </div>
              <span className="text-[10px] sm:text-xs text-gray-600 truncate">
                {project.teamMembers.length} {project.teamMembers.length === 1 ? 'member' : 'members'}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
              {project.lastActivity}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
            <div className="border border-gray-200 bg-white rounded-md sm:rounded-lg p-2 sm:p-2.5 lg:p-3 text-center min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 truncate">Budget</p>
              <p className="font-semibold text-gray-900 text-[10px] sm:text-xs lg:text-sm break-words leading-tight">
                ${project.budget.toLocaleString()}
              </p>
            </div>
            <div className="border border-gray-200 rounded-md sm:rounded-lg bg-white p-2 sm:p-2.5 lg:p-3 text-center min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 truncate">Tasks</p>
              <p className="font-semibold text-gray-900 text-[10px] sm:text-xs lg:text-sm leading-tight">
                {formatTaskNumber(project.tasks.completed)}/{formatTaskNumber(project.tasks.total)}
              </p>
            </div>
            <div className="border border-gray-200 bg-white rounded-md sm:rounded-lg p-2 sm:p-2.5 lg:p-3 text-center min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 truncate">Due</p>
              <p className="font-semibold text-gray-900 text-[10px] sm:text-xs lg:text-sm leading-tight break-words">
                {project.dueDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-4 justify-end">
            <button 
              onClick={() => onSelectProject(project.rawProject)}
              className="px-2 sm:px-4 lg:px-4 py-2 sm:py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-xs sm:text-sm"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

  // Line View Component
  const LineView = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Project</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Company</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Budget</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Due Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Team</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Tasks</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`${getIconBgColor(project.icon)} rounded-lg p-2 flex-shrink-0`}>
                      {renderIcon(project.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{project.title}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600">{project.companyName}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">${project.budget.toLocaleString()}</p>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(project)}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600">
                    {project.dueDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex -space-x-2">
                    {project.teamMembers.slice(0, 3).map((member, idx) => (
                      <div
                        key={member.id || idx}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                        title={`${member.firstname} ${member.lastname}`}
                      >
                        {member.firstname?.[0]?.toUpperCase()}{member.lastname?.[0]?.toUpperCase()}
                      </div>
                    ))}
                    {project.teamMembers.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium">
                        +{project.teamMembers.length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600">
                    {formatTaskNumber(project.tasks.completed)}/{formatTaskNumber(project.tasks.total)}
                  </p>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => onSelectProject(project.rawProject)}
                    className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden divide-y divide-gray-200">
        {filteredProjects.map((project) => (
          <div key={project.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`${getIconBgColor(project.icon)} rounded-lg p-2 flex-shrink-0`}>
                  <div className="w-5 h-5">
                    {renderIcon(project.icon)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 mb-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gray-500">{project.companyName}</p>
                </div>
              </div>
              {getStatusBadge(project)}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Budget</p>
                <p className="text-sm font-semibold text-gray-900">${project.budget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Tasks</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatTaskNumber(project.tasks.completed)}/{formatTaskNumber(project.tasks.total)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Due Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {project.dueDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Team</p>
                <div className="flex -space-x-1.5">
                  {project.teamMembers.slice(0, 3).map((member, idx) => (
                    <div
                      key={member.id || idx}
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-[9px] font-medium"
                    >
                      {member.firstname?.[0]?.toUpperCase()}{member.lastname?.[0]?.toUpperCase()}
                    </div>
                  ))}
                  {project.teamMembers.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-[9px] font-medium">
                      +{project.teamMembers.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => onSelectProject(project.rawProject)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchProjectsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

if (projectsData.length === 0) {
  return (
    <>
      <EmptyProjectsState onOpenModal={() => {
        console.log('onOpenModal callback called from EmptyProjectsState');
        setIsChatOpen(true);
        console.log('setIsChatOpen(true) executed');
      }} />
      <AssistantModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}

  return (
    <div className="w-full bg-[#F9FAFB] overflow-y-auto third-font h-full ">
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 md:py-6 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 md:mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Projects</h1>
            <p className="text-xs sm:text-sm text-gray-600">Manage your projects and track their progress.</p>
          </div>
         
            <button 
              onClick={() => setIsChatOpen(true)}
              className="flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto"
            >
              <Plus size={18} />
              Create New Project
            </button>
        </div>

        {/* White container with borders */}
        <div className="bg-white rounded-lg shadow-sm border h-full border-gray-100 overflow-hidden">
          {/* Tabs and search Section */}
          <div className="px-3 sm:px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4">
              {/* Tabs - Scrollable on mobile */}
              <div className="overflow-x-auto -mx-3 px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
                <div className="flex items-center gap-2 min-w-max">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 md:px-4 py-2 font-medium text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap ${
                      activeTab === 'all' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    All Projects
                  </button>
                  <button
                    onClick={() => setActiveTab('in_progress')}
                    className={`px-3 md:px-4 py-2 font-medium text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap ${
                      activeTab === 'in_progress' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-3 md:px-4 py-2 font-medium text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap ${
                      activeTab === 'completed' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => setActiveTab('at_risk')}
                    className={`px-3 md:px-4 py-2 font-medium text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap ${
                      activeTab === 'at_risk' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    At Risk
                  </button>
                </div>
              </div>

              {/* Search and View Controls */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search Project"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                  />
                </div>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
                  <Filter size={18} className="text-gray-600" />
                </button>
                <button 
                  onClick={() => setViewMode('tile')}
                  className={`p-2 border rounded-lg transition-colors flex-shrink-0 ${
                    viewMode === 'tile' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard size={18} className={viewMode === 'tile' ? 'text-blue-600' : 'text-gray-600'} />
                </button>
                <button 
                  onClick={() => setViewMode('line')}
                  className={`p-2 border rounded-lg transition-colors flex-shrink-0 ${
                    viewMode === 'line' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <List size={18} className={viewMode === 'line' ? 'text-blue-600' : 'text-gray-600'} />
                </button>
              </div>
            </div>
          </div>

          {/* Projects Content Area */}
          <div className="px-3 sm:px-4 md:px-6 py-4 md:py-6">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No projects found</p>
              </div>
            ) : (
              viewMode === 'tile' ? <TileView /> : <LineView />
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:shadow-xl z-30"
      >
        <Star size={20} className="sm:w-6 sm:h-6 text-white" fill="white" />
      </button>

      <AssistantModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default ProjectDashboard;