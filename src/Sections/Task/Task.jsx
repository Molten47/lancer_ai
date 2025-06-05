import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  CheckCircle,
  Filter,
  ArrowUpDown,
  Calendar,
  AlertCircle,
  User,
  Loader2, // Added for loading spinner
  XCircle // Added for error messages
} from 'lucide-react';

const TaskManagement = () => {
  const [activeTab, setActiveTab] = useState('ongoing');
  const [clientTasks, setClientTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch tasks from the backend
  const fetchTasks = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    setClientTasks([]); // Clear previous tasks

    try {
      const response = await fetch(`/api/client/tasks?status=${status}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // You'll need to include your JWT token here for authorization
          // For a client, this would be the client's JWT token
          // 'Authorization': `Bearer ${yourClientAuthToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to fetch ${status} tasks.`);
      }

      // Map backend data to your frontend's expected format if necessary
      // Assuming backend returns an array of task objects like:
      // { id, title, assignee, progress, dueDate, daysLeft, budget, status, avatar, completedDate }
      const formattedTasks = data.tasks.map(task => ({
        id: task.id,
        title: task.title,
        assignee: task.assignee_name, // Assuming backend sends assignee_name
        progress: task.progress,
        dueDate: task.due_date, // Assuming backend sends 'YYYY-MM-DD'
        daysLeft: task.days_left, // Assuming backend calculates this
        budget: `$${task.budget}`, // Assuming backend sends raw number
        status: task.status,
        avatar: task.assignee_avatar_initials || task.assignee_name.split(' ').map(n => n[0]).join('').toUpperCase(), // Generate initials
        completedDate: task.completed_date, // For completed tasks
      }));

      setClientTasks(formattedTasks);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies for fetchTasks itself, it depends on the activeTab via useEffect

  // Effect to call fetchTasks whenever activeTab changes
  useEffect(() => {
    fetchTasks(activeTab);
  }, [activeTab, fetchTasks]);

  return (
    <div className="p-7 min-h-full">
      {/* Tab Navigation */}
      <div className="flex flex-col lg:flex-row gap-2 items-center justify-between mb-6">
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm basic-font">
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'ongoing'
                ? 'bg-blue-100 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Clock size={16} />
            Ongoing Tasks
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-[#DBEAFE] text-[#2561E8] basic-font shadow-sm'
                : 'text-[#343744] hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <CheckCircle size={16} />
            Completed Tasks
          </button>
        </div>

        {/* Filter and Sort (assuming these are client-side filters for now) */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white shadow-sm transition-colors">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white shadow-sm transition-colors">
            <ArrowUpDown size={16} />
            Sort
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-500 w-8 h-8 mr-3" />
          <p className="text-lg text-gray-700">Loading tasks...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 flex items-center" role="alert">
          <XCircle className="w-5 h-5 mr-3" />
          <div>
            <p className="font-bold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-700 hover:text-red-900"
            aria-label="Close alert"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Task Cards */}
      {!loading && !error && clientTasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 basic-font">
          {clientTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg shadow-lg transition-all duration-200">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 leading-tight pr-4 w-[50%]">{task.title}</h3>
                <span className={`inline-block px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  task.status === 'Completed'
                    ? 'bg-[#DCFCE7] text-[#166534]'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {task.status}
                </span>
              </div>

              {/* Assignee */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {task.avatar}
                </div>
                <span className="text-gray-700 font-medium text-lg">{task.assignee}</span>
              </div>

              {/* Progress Percentage */}
              <div className="flex flex-row justify-between items-center mb-2">
                <span className="text-[#92929D] font-medium text-sm">Progress</span>
                <div className="text-[1.2rem] font-normal text-[#131635]">
                  {task.progress}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-[#D9D9D9] rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      task.status === 'Completed'
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : 'bg-[#0177FB]'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Date, Time Left, and Budget - All on Same Row */}
              <div className='flex flex-row justify-between items-center mt-4'>
                {/* Date */}
                <div className="flex items-center gap-2 text-[#92929D]">
                  <Calendar size={16} className='text-[#6B7280]' />
                  <span className="text-sm">{task.status === 'Ongoing' ? task.dueDate : task.completedDate}</span>
                </div>

                {/* Time Left or Time Ago - Centered */}
                <div className="flex items-center justify-center">
                  {task.status === 'Ongoing' ? (
                    <div className={`flex items-center gap-1 text-sm ${
                      task.daysLeft <= 2 ? 'text-red-500' : 'text-orange-500'
                    }`}>
                      <Clock size={16} />
                      {task.daysLeft} days left
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-sm text-[#92929D]">
                      <Clock size={16} />
                      {/* Assuming your backend provides a 'completed_ago' field or similar for completed tasks */}
                      {/* Otherwise, you'd calculate "X weeks ago" on the frontend using task.completedDate */}
                      {task.completedDate ? `Completed on ${task.completedDate}` : 'N/A'}
                    </div>
                  )}
                </div>

                {/* Budget - Right Aligned */}
                <div className="flex items-center justify-end">
                  <span className="text-[1.2rem] font-normal text-[#131635]">{task.budget}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && clientTasks.length === 0 && (
        <div className="text-center py-12">
          {activeTab === 'ongoing' ? (
            <>
              <Clock size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ongoing tasks</h3>
              <p className="text-gray-600">No ongoing tasks assigned to freelancers yet. Create a new task to get started.</p>
            </>
          ) : (
            <>
              <CheckCircle size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed tasks yet</h3>
              <p className="text-gray-600">Completed tasks will appear here once freelancers finish them.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskManagement;