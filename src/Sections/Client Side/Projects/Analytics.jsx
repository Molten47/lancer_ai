import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Users, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsComponent = ({ project = null }) => {
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [taskCompletionData, setTaskCompletionData] = useState([]);
  const [hoursLoggedData, setHoursLoggedData] = useState([]);

  useEffect(() => {
    if (project) {
      setProjectData(project);
      setError(null);
      processAnalyticsData(project);
    } else {
      setError('No project data provided');
    }
  }, [project]);

  const processAnalyticsData = (data) => {
    if (!data || !data.jobs) return;

    // Calculate metrics
    const totalTasks = data.jobs?.length || 0;
    const completedTasks = data.jobs?.filter(job => 
      job.status === 'completed' || job.employed_worker_info?.length > 0
    )?.length || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate hours (estimated)
    const totalHours = data.jobs?.reduce((sum, job) => {
      const workersCount = job.employed_worker_info?.length || 1;
      return sum + (job.duration * 160 * workersCount); // Assuming 160 hours per month
    }, 0) || 0;

    // Get team members
    const teamMembers = [];
    data.jobs?.forEach(job => {
      job.employed_worker_info?.forEach(worker => {
        if (!teamMembers.find(m => m.id === worker.id)) {
          teamMembers.push(worker);
        }
      });
    });

    // Calculate percentage increase (mock for now)
    const hoursIncrease = '+12%';

    setMetrics({
      completionRate,
      completedTasks,
      totalTasks,
      totalHours: Math.round(totalHours),
      hoursIncrease,
      teamCount: teamMembers.length,
      teamMembers
    });

    // Generate task completion trend data
    generateTaskCompletionTrend(data);
    
    // Generate hours logged data
    generateHoursLoggedData(data);
  };

  const generateTaskCompletionTrend = (data) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trendData = months.map((month, index) => {
      const tasksCompleted = Math.floor(Math.random() * 5) + index * 2;
      return {
        month,
        completed: tasksCompleted,
        total: 10
      };
    });
    setTaskCompletionData(trendData);
  };

  const generateHoursLoggedData = (data) => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const hoursData = weeks.map((week) => {
      return {
        week,
        hours: Math.floor(Math.random() * 40) + 20
      };
    });
    setHoursLoggedData(hoursData);
  };

  const getInitials = (firstname, lastname) => {
    const first = firstname?.[0]?.toUpperCase() || '';
    const last = lastname?.[0]?.toUpperCase() || '';
    return `${first}${last}`;
  };

  if (error || !projectData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">{error || 'No analytics data available'}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Task Completion Rate */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Task Completion Rate</p>
            <p className="text-3xl font-bold text-gray-900 mb-3">{metrics.completionRate}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.completionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>{metrics.completedTasks} Completed</span>
              <span>{metrics.totalTasks} total</span>
            </div>
          </div>

          {/* Hours Utilized */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Hours Utilized</p>
            <p className="text-3xl font-bold text-gray-900 mb-3">{metrics.totalHours}</p>
            <p className="text-sm text-green-600 font-medium">{metrics.hoursIncrease} from last month</p>
          </div>

          {/* Team */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Team</p>
            <p className="text-3xl font-bold text-gray-900 mb-3">{metrics.teamCount}</p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {metrics.teamMembers.slice(0, 3).map((member, index) => (
                  <div
                    key={member.id}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                    title={`${member.firstname} ${member.lastname}`}
                  >
                    {getInitials(member.firstname, member.lastname)}
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-600">Team Members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Completion Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taskCompletionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Completed Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hours Logged */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Hours Logged</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursLoggedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="week" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Bar 
                  dataKey="hours" 
                  fill="#3B82F6" 
                  radius={[8, 8, 0, 0]}
                  name="Hours"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Avg. Task Duration</p>
            <Clock size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{projectData.duration || 3} months</p>
          <p className="text-xs text-gray-500 mt-1">Per task average</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Active Tasks</p>
            <BarChart3 size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.totalTasks - metrics.completedTasks}</p>
          <p className="text-xs text-gray-500 mt-1">Currently in progress</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Team Efficiency</p>
            <TrendingUp size={20} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">94%</p>
          <p className="text-xs text-green-600 mt-1">+5% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Team Size</p>
            <Users size={20} className="text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.teamCount}</p>
          <p className="text-xs text-gray-500 mt-1">Active members</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsComponent;