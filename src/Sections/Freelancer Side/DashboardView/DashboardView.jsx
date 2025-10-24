import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, ArrowRight, MessageSquare, CheckCircle } from 'lucide-react';

const DashboardView = () => {
  const [jobs, setJobs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    firstname: 'User',
    lastname: '',
    email: '',
    username: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('access_jwt');
        if (!token) {
          throw new Error('Authentication token not found.');
        }

        const response = await fetch(`${API_URL}/api/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.well_received && data.profile_data) {
          setProfile({
            firstname: data.profile_data.firstname || 'User',
            lastname: data.profile_data.lastname || '',
            email: data.profile_data.email || '',
            username: data.profile_data.username || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfileData();
  }, [API_URL]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('access_jwt');
        if (!token) {
          throw new Error('Authentication token not found.');
        }

        const response = await fetch(`${API_URL}/api/jobs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.well_received && data.jobs) {
          setJobs(data.jobs);
          
          // Extract all tasks from all jobs
          const allTasks = data.jobs.flatMap(job => 
            (job.tasks || []).map(task => ({
              ...task,
              jobTitle: job.title,
              jobId: job.id
            }))
          );
          setTasks(allTasks);
          
          // Generate recent activities from tasks
          const recentActivities = allTasks
            .filter(task => task.status === 'complete' || task.updated_at)
            .slice(0, 5)
            .map((task, index) => ({
              id: task.id || index,
              message: task.status === 'complete' 
                ? `Task ${task.title} completed`
                : `New message from ${task.assignee || 'Team'}`,
              time: task.updated_at || task.due_date,
              type: task.status === 'complete' ? 'completion' : 'message'
            }));
          
          setActivities(recentActivities);
          setError(null);
        } else {
          throw new Error('API response format is incorrect.');
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_URL]);

  const getStatusColor = (status) => {
    const statusMap = {
      'in progress': 'bg-yellow-100 text-yellow-800',
      'not started': 'bg-red-100 text-red-800',
      'in review': 'bg-blue-100 text-blue-800',
      'complete': 'bg-green-100 text-green-800',
      'active': 'bg-blue-100 text-blue-800',
      'inactive': 'bg-gray-100 text-gray-800'
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const calculateProgress = (job) => {
    if (!job.tasks || job.tasks.length === 0) return 0;
    const completed = job.tasks.filter(t => t.status === 'complete').length;
    return Math.round((completed / job.tasks.length) * 100);
  };

  const calculateDueDate = (initDate, duration) => {
    if (!initDate || !duration) return 'N/A';
    const initialDate = new Date(initDate);
    initialDate.setDate(initialDate.getDate() + duration);
    return initialDate.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const displayName = profile.firstname 
    ? `${profile.firstname}`
    : profile.firstname;

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-g p-6 third-font overflow-auto">
      <div className="w-full space-y-4">
        {/* Welcome Section */}
        <div className="bg-[#F3F4F6] rounded-lg border-[0.5px] border-[#E5E7EB] p-7">
          <h1 className="text-2xl font-semibold text-[#151B25]">Welcome back, {displayName}</h1>
          <p className="text-[#374151] mt-1">Here's what's happening with your project today.</p>
        </div>

        {/* Tasks Assigned Table */}
        <div className="bg-white rounded-lg shadow-sm border border-[#F3F4F6]">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Task Assigned</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F3F4F6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] tracking-wider">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280]  tracking-wider">Job</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280]  tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280]  tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#6B7280] tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {error ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-red-500">
                      Error: {error}
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No tasks assigned yet.
                    </td>
                  </tr>
                ) : (
                  tasks.slice(0, 4).map((task, index) => (
                    <tr key={task.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{task.jobTitle}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{formatDate(task.due_date)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {task.status || 'Not Started'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Grid: Project & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Project</h2>
              <Calendar className="text-gray-400" size={20} />
            </div>
            
            {jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.slice(0, 1).map((job) => {
                  const progress = calculateProgress(job);
                  const dueDate = calculateDueDate(job.init_date, job.duration);
                  
                  return (
                    <div key={job.id}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{job.client_id || 'Client'}</p>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                          {job.status || 'Active'}
                        </span>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 text-sm text-gray-600">
                        <span>Due: {dueDate}</span>
                      </div>
                      
                      {job.tasks && job.tasks.length > 0 && (
                        <div className="mt-4 flex -space-x-2">
                          {job.tasks.slice(0, 3).map((task, idx) => (
                            <div 
                              key={idx}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                            >
                              {(task.assignee || 'U').charAt(0).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                        View projects
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No projects found.</p>
            )}
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
            
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'completion' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.time)}</p>
                    </div>
                  </div>
                ))}
                
                <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                  View all activity
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;