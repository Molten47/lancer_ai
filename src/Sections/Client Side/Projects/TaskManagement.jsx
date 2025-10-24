import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const TaskManagementComponent = ({ project = null }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (project) {
      setProjectData(project);
      setError(null);
      processTasksData(project);
    } else {
      setError('No project data provided');
    }
  }, [project]);

  const processTasksData = (data) => {
    if (!data || !data.jobs) return;

    const processedTasks = [];

    data.jobs.forEach(job => {
      // Create tasks from employed workers
      job.employed_worker_info?.forEach((worker, index) => {
        processedTasks.push({
          id: `${job.id}-${worker.id}-${index}`,
          jobId: job.id,
          title: job.title,
          description: job.metrics || 'No description available',
          assignee: `${worker.firstname} ${worker.lastname}`,
          assigneeFirstName: worker.firstname,
          assigneeLastName: worker.lastname,
          assigneeEmail: worker.email,
          status: job.status === 'completed' ? 'Completed' : 'In Progress',
          dueDate: calculateDueDate(data.init_date, job.duration),
          isCompleted: job.status === 'completed' || job.employed_worker_info?.length > 0,
        });
      });

      // If no employed workers, create a task with "Unassigned"
      if (job.employed_worker_info?.length === 0) {
        const potentialHire = job.potential_hire_info?.[0];
        processedTasks.push({
          id: `${job.id}-unassigned`,
          jobId: job.id,
          title: job.title,
          description: job.metrics || 'No description available',
          assignee: 'Unassigned',
          assigneeFirstName: '',
          assigneeLastName: '',
          assigneeEmail: '',
          status: 'Pending',
          dueDate: calculateDueDate(data.init_date, job.duration),
          isCompleted: false,
          potentialAssignee: potentialHire ? `${potentialHire.firstname} ${potentialHire.lastname}` : null
        });
      }
    });

    setTasks(processedTasks);
    setFilteredTasks(processedTasks);
  };

  const calculateDueDate = (initDate, durationMonths) => {
    const date = new Date(initDate);
    date.setMonth(date.getMonth() + durationMonths);
    return date;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle size={14} />
            Completed
          </span>
        );
      case 'in progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Clock size={14} />
            In Progress
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            <AlertCircle size={14} />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const handleEdit = (task) => {
    console.log('Editing task:', task);
    // Add your edit logic here
  };

  const handleComplete = (task) => {
    console.log('Completing task:', task);
    // Add your complete logic here
  };

  // Filter tasks based on tab and search
  useEffect(() => {
    let filtered = [...tasks];

    // Filter by tab
    if (activeTab === 'in_progress') {
      filtered = filtered.filter(t => t.status === 'In Progress');
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(t => t.status === 'Completed');
    } else if (activeTab === 'pending') {
      filtered = filtered.filter(t => t.status === 'Pending');
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignee.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  }, [activeTab, searchQuery, tasks]);

  if (error || !projectData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">{error || 'No task data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search tasks"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={18} className="text-gray-600" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={18} />
            Create Task
          </button>
        </div>
      </div>

      {/* Tabs and Task List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex items-center gap-1 px-6 py-3">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'in_progress'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'completed'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'pending'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* Task Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => {}}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700">{task.assignee}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700">{formatDate(task.dueDate)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(task)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                        {!task.isCompleted && (
                          <button
                            onClick={() => handleComplete(task)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskManagementComponent;