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

  // --- MOCK DATA FOR FRONTEND DEVELOPMENT ---
  const mockOngoingTasks = [
    {
      id: 'task-1',
      title: 'Design Marketing Website Homepage',
      assignee: 'Alice Johnson',
      progress: 75,
      dueDate: '2025-06-15',
      daysLeft: 9,
      budget: '$1200',
      status: 'Ongoing',
      avatar: 'AJ',
      completedDate: null,
    },
    {
      id: 'task-2',
      title: 'Develop Mobile App Prototype',
      assignee: 'Bob Williams',
      progress: 40,
      dueDate: '2025-07-01',
      daysLeft: 25,
      budget: '$3000',
      status: 'Ongoing',
      avatar: 'BW',
      completedDate: null,
    },
    {
      id: 'task-3',
      title: 'Create Social Media Content Calendar',
      assignee: 'Charlie Davis',
      progress: 90,
      dueDate: '2025-06-08',
      daysLeft: 2,
      budget: '$500',
      status: 'Ongoing',
      avatar: 'CD',
      completedDate: null,
    },
  ];

  const mockCompletedTasks = [
    {
      id: 'task-c1',
      title: 'Brand Logo Redesign',
      assignee: 'Alice Johnson',
      progress: 100,
      dueDate: '2025-05-20',
      daysLeft: 0,
      budget: '$800',
      status: 'Completed',
      avatar: 'AJ',
      completedDate: '2025-05-18',
    },
    {
      id: 'task-c2',
      title: 'SEO Keyword Research',
      assignee: 'Charlie Davis',
      progress: 100,
      dueDate: '2025-05-25',
      daysLeft: 0,
      budget: '$350',
      status: 'Completed',
      avatar: 'CD',
      completedDate: '2025-05-24',
    },
  ];
  // --- END MOCK DATA ---


  // Function to simulate fetching tasks (frontend only)
  const simulateFetchTasks = useCallback((status) => {
    setLoading(true);
    setError(null);
    setClientTasks([]); // Clear previous tasks

    setTimeout(() => {
      if (status === 'ongoing') {
        setClientTasks(mockOngoingTasks);
      } else if (status === 'completed') {
        setClientTasks(mockCompletedTasks);
      }
      setLoading(false);
    }, 800); // Simulate network delay
  }, []);

  // Effect to call simulateFetchTasks whenever activeTab changes
  useEffect(() => {
    simulateFetchTasks(activeTab);
  }, [activeTab, simulateFetchTasks]);

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