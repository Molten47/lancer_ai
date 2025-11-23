import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  LayoutDashboard, 
  List,
  Code,
  ShoppingCart,
  Utensils,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle,
  ChevronRight,
  FileText,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

// Project Detail View Component
const ProjectDetailView = ({ project, onBack }) => {
  return (
    <div className="w-full bg-gray-50 overflow-y-auto">
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.title}</h1>
              <p className="text-sm text-gray-600">{project.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium text-blue-600">{project.status}</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-12 h-12 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h2>
              <p className="text-lg text-gray-600 mb-6">{project.company}</p>
              <p className="text-gray-600 leading-relaxed mb-8">{project.description}</p>
              
              {/* Key Details */}
              <div className="grid grid-cols-2 gap-6 py-6 border-y border-gray-200">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Budget</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${project.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Fixed price</p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Duration</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{project.duration}</p>
                  <p className="text-xs text-gray-500 mt-1">Estimated timeline</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Members</h3>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {project.teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`w-14 h-14 ${member.color} rounded-full border-4 border-white flex items-center justify-center text-sm font-semibold text-gray-700 shadow-sm`}
                    title={member.initials}
                  >
                    {member.initials}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{project.teamMembers.length} Team Members Assigned</p>
                <p className="text-xs text-gray-500 mt-1">Working on this project</p>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="border-t border-gray-200 mt-8 pt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
              <span className="text-2xl font-bold text-gray-900">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-3">On track for on-time completion</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
            Edit Project
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            View Full Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyJobsState = () => {
  return (
    <div className="w-full h-full bg-[#F9FAFB] overflow-y-auto">
      <div className="w-[90%] px-6 py-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Jobs</h1>
            <p className="text-sm text-gray-600">Manage your jobs and track your progress.</p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[500px] bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <FileText className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="text-gray-500 text-base font-medium mb-2">
              Space is empty. Job card would render here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function JobsDashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('tile');
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobsData, setJobsData] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch jobs data
  const fetchJobsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_jwt');
      const apiUrl = import.meta.env.VITE_API_URL;

      if (!token || !apiUrl) {
        setError('Missing authentication or API configuration');
        return;
      }

      const response = await fetch(`${apiUrl}/api/jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');
      
      const data = await response.json();
      
      if (data.well_received && data.jobs) {
        const processedJobs = processJobsData(data.jobs);
        setJobsData(processedJobs);
        setFilteredJobs(processedJobs);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  // Process jobs data
  const processJobsData = (jobs) => {
    return jobs.map(jobObj => {
      const jobKey = Object.keys(jobObj)[0];
      const job = jobObj[jobKey];

      // Calculate budget
      let budget = 0;
      if (job.employed_worker_info && job.employed_worker_info.length > 0) {
        budget = job.employed_worker_info.length * 500 * (job.duration || 1);
      } else if (job.potential_hire_info && job.potential_hire_info.length > 0) {
        const avgExpertise = job.potential_hire_info.reduce((sum, hire) => 
          sum + (hire.expertise_score || 5), 0) / job.potential_hire_info.length;
        const estimatedRate = avgExpertise * 50;
        budget = estimatedRate * (job.duration || 1);
      }

      // Get team members
      const teamMembers = (job.employed_worker_info || []).map(worker => ({
        id: worker.id,
        initials: `${worker.firstname?.[0] || ''}${worker.lastname?.[0] || ''}`.toUpperCase(),
        color: getRandomColor(),
        name: `${worker.firstname} ${worker.lastname}`
      }));

      // Calculate progress (mock for now, can be derived from task completion)
      const progress = job.status === 'completed' ? 100 : 
                      job.status === 'ongoing' ? 65 : 
                      job.status === 'pending' ? 10 : 0;

      // Format duration
      const duration = job.duration ? `${job.duration} week${job.duration > 1 ? 's' : ''}` : '1 week';

      return {
        id: job.id,
        title: job.title,
        company: job.project_name || 'Project',
        description: job.description || generateJobDescription(job.title),
        price: Math.round(budget),
        duration: duration,
        status: formatStatus(job.status),
        progress: progress,
        teamMembers: teamMembers,
        rawJob: job
      };
    });
  };

  // Helper function to generate description if not available
  const generateJobDescription = (title) => {
    return `End-to-end management of ${title.toLowerCase()} including planning, execution, and delivery optimization.`;
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return 'Pending';
    const statusMap = {
      'ongoing': 'In Progress',
      'completed': 'Completed',
      'pending': 'Pending',
      'active': 'In Progress'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  // Get random color for team member avatars
  const getRandomColor = () => {
    const colors = ['bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-purple-200', 'bg-yellow-200', 'bg-red-200'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get status badge
  const getStatusBadge = (job) => {
    if (job.status === 'Completed') {
      return (
        <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
          <CheckCircle className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    }
    if (job.status === 'In Progress') {
      return (
        <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
          <Clock className="w-3.5 h-3.5" />
          In Progress
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
        <AlertCircle className="w-3.5 h-3.5" />
        {job.status}
      </span>
    );
  };

  // Handle navigation to full job details
  const handleViewFullDetails = (job) => {
    setSelectedJob(job);
  };

  // Filter jobs
  useEffect(() => {
    let filtered = [...jobsData];

    if (activeTab === 'active') {
      filtered = filtered.filter(j => j.status === 'In Progress');
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(j => j.status === 'Completed');
    }

    if (searchQuery) {
      filtered = filtered.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [activeTab, searchQuery, jobsData]);

  // Load data on mount
  useEffect(() => {
    fetchJobsData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchJobsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (selectedJob) {
    return (
      <ProjectDetailView 
        project={selectedJob} 
        onBack={() => setSelectedJob(null)} 
      />
    );
  }

  if (jobsData.length === 0) {
    return <EmptyJobsState />;
  }

  return (
    <div className="w-full h-full bg-[#F9FAFB] overflow-y-auto">
      <div className="w-full px-6 py-6 pb-24">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Jobs</h1>
            <p className="text-sm text-gray-600">Manage your jobs and track your progress.</p>
          </div>
        </div>
        <section className='main-section rounded-lg min-h-screen w-full bg-white'>
          {/* Tabs and Controls */}
          <div className="bg-white mb-6 border-b-2 border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                    activeTab === 'all'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  All Jobs
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                    activeTab === 'active'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Active Jobs
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                    activeTab === 'completed'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Completed
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search Jobs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter size={18} className="text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode('tile')}
                  className={`p-2 border rounded-lg transition-colors ${
                    viewMode === 'tile'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard size={18} className={viewMode === 'tile' ? 'text-blue-600' : 'text-gray-600'} />
                </button>
                <button
                  onClick={() => setViewMode('line')}
                  className={`p-2 border rounded-lg transition-colors ${
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

          {/* Jobs Grid */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-500">No jobs found</p>
            </div>
          ) : viewMode === 'tile' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-6 pb-6">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                      </div>
                      {getStatusBadge(job)}
                    </div>

                    {/* Title and Company */}
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{job.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{job.company}</p>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-4"></div>

                    {/* Details and Team Members Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-900">${job.price.toLocaleString()}</span>
                          <span className="text-gray-500">fixed price</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={16} className="text-gray-400" />
                          <span className="text-gray-600">Duration: {job.duration}</span>
                        </div>
                      </div>

                      {/* Team Members Avatars */}
                      <div className="flex -space-x-2">
                        {job.teamMembers.slice(0, 3).map((member) => (
                          <div
                            key={member.id}
                            className={`w-8 h-8 ${member.color} rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700`}
                            title={member.name}
                          >
                            {member.initials}
                          </div>
                        ))}
                        {job.teamMembers.length > 3 && (
                          <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700">
                            +{job.teamMembers.length - 3}
                          </div>
                        )}
                        {job.teamMembers.length === 0 && (
                          <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-xs text-gray-400">
                            --
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Progress</span>
                        <span className="text-sm font-semibold text-gray-900">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleViewFullDetails(job)}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mx-6 mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Job Title</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Duration</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Progress</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Briefcase size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{job.title}</p>
                            <p className="text-xs text-gray-500">{job.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">${job.price.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{job.duration}</p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(job)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{job.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewFullDetails(job)}
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
          )}
        </section>
      </div>
    </div>
  );
}