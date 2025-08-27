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

const TaskManagement = ({task_type = 'platform_task'}) => {
  const [taskState, setTaskState] = useState('initial');
  const [activeTab, setActiveTab] = useState('solo');
  const [clientTasks, setClientTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const dueDate = (startTime - timeRemaining)
  // --- MOCK DATA FOR FRONTEND DEVELOPMENT ---
  const soloWorkSpace = [
    {
      job_id: 'task-1',
      title: 'Design Marketing Website Homepage',
      assignee: 'Alice Johnson',
      progress: 75,
      dueDate: dueDate,
      daysLeft: timeRemaining,
      budget: '$1200',
      status: 'Ongoing',
      avatar: 'AJ',
      completedDate: null,
    }
  
  ];

  const projectWorkSpace = [
    {
      id: 'task-c1',
      title: 'Online Magazine Project',
      assignee: 'Alice Johnson',
      progress: 100,
      dueDate: '2025-05-20',
      daysLeft: 0,
      budget: '$800',
      status: 'Completed',
      avatar: 'AJ',
      completedDate: '2025-05-18',
    }
 
  ];
// Timer to countdown job delivery period 
useEffect(() => {
  if (taskState !== 'started' || timeRemaining <= 0 ) return;
  const timer = setInterval(() => {
    setTimeRemaining((prev) => {
      if (prev <= 1){
        clearInterval(timer);
        return 0;
      }
      return prev -1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [taskState, timeRemaining]);
/**
 * Formats the current date and time using a preferred list of locales.
 * @param {string|string[]} locales - A single locale string or an array of locale strings.
 */
const formatModernDateTime = (locales = ['en-NG', 'en-US']) => { // Default to an array
  const now = new Date();
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  

  return new Intl.DateTimeFormat(locales, options).format(now);
};

// 1. Using the default fallbacks ('en-NG' then 'en-US')
console.log('Default:', formatModernDateTime()); 
// Output in Nigeria: Default: 25/08/2025, 19:55:29

// 2. Providing a different preferred locale (e.g., German)
console.log('German:', formatModernDateTime('de-DE')); 
// Output: German: 25.08.2025, 19:55:29

// 3. Providing a custom fallback list
console.log('Custom List:', formatModernDateTime(['fr-FR', 'en-GB']));
// Output: Custom List: 25/08/2025 19:55:29

  // Function to simulate fetching tasks (frontend only)
  const simulateFetchTasks = useCallback((status) => {
    setLoading(true);
    setError(null);
    setClientTasks([]); // Clear previous tasks

    setTimeout(() => {
      if (status === 'solo') {
        setClientTasks(soloWorkSpace);
      } else if (status === 'group') {
        setClientTasks(projectWorkSpace);
      }
      setLoading(false);
    }, 800); // Simulate network delay
  }, []);

  // Effect to call simulateFetchTasks whenever activeTab changes
  useEffect(() => {
    simulateFetchTasks(activeTab);
  }, [activeTab, simulateFetchTasks]);
  //API call to start the task or jib for freelancer
 const startTask = async () => {
    setTaskState('loading');
    setError(null);

    try {
      const start_time = new Date().toISOString();
      setStartTime(start_time);

      const token = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      console.log('Token:', token ? `${token.slice(0, 10)}...${token.slice(-10)}` : 'NO_TOKEN');
      
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      // Decode JWT for debugging
      let user_id = null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', {
          exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiry',
          iss: payload.iss || 'No issuer',
          sub: payload.sub || 'No subject',
          scope: payload.scope || 'No scope'
        });
        user_id = payload.sub || payload.user_id;
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          throw new Error('Token is expired. Please log in again.');
        }
      } catch (e) {
        console.error('Failed to decode token:', e.message);
      }

      const API_URL = import.meta.env.VITE_API_URL;
      console.log('API_URL:', API_URL);

      // INITIATION REQUEST: Send status and start_time
      const formData = new FormData();
      formData.append('status', 'initiation');
      formData.append('start_time', start_time);

      console.log('Sending initiation request (POST) to:', `${API_URL}/api/task/${task_type}`);
      console.log('FormData fields:', { 
        status: 'initiation', 
        start_time: start_time
      });

      const response = await fetch(`${API_URL}/api/task/${task_type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        mode: 'cors',
        credentials: 'include'
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        let errorMessage;
        let errorData;
        const responseText = await response.text();
        console.error('Full error response text:', responseText);
        
        try {
          errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorData.detail || `HTTP error! status: ${response.status}`;
          console.error('Detailed error response:', errorData);
        } catch (e) {
          errorMessage = responseText || `HTTP error! status: ${response.status}`;
          console.error('Error response text:', responseText);
        }
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 400) {
          throw new Error(`Bad request: ${errorMessage}`);
        } else if (response.status === 422) {
          throw new Error(`Validation failed: ${errorMessage}`);
        } else if (response.status === 500) {
          throw new Error(`Server error: ${errorMessage}. Please contact support if this persists.`);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Initiation response:', data);
      
      setTaskData({
        instruction: data.Instruction || data.instruction,
        completion_time: data.completion_time
      });
      setTimeRemaining(data.completion_time * 60);
      setTaskState('started');
    } catch (err) {
      console.error('Error starting task:', err);
      setError(err.message || 'Failed to start task. Please try again.');
      setTaskState('error');
    }
  };


  return (
    <div className="p-7 min-h-full">
      {/* Tab Navigation */}
      <div className="flex flex-col lg:flex-row gap-2 items-center justify-between mb-6">
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm basic-font">
          <button
            onClick={() => setActiveTab('solo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'ongoing'
                ? 'bg-blue-100 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Clock size={16} />
            Job
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-[#DBEAFE] text-[#2561E8] basic-font shadow-sm'
                : 'text-[#343744] hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <CheckCircle size={16} />
              Project Workspace
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
          <Loader2 className="animate-spin text-primary w-8 h-8 mr-3" />
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