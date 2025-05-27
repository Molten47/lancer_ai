import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  Filter,
  ArrowUpDown,
  Calendar,
  AlertCircle,
  User
} from 'lucide-react';

const TaskManagement = () => {
  const [activeTab, setActiveTab] = useState('ongoing');

  const tasks = [
    {
      id: 1,
      title: 'Graphics Design for Website',
      assignee: 'Alex Johnson',
      progress: 65,
      dueDate: 'May 15, 2025',
      daysLeft: 2,
      budget: '$250',
      status: 'In progress',
      avatar: 'AJ'
    },
    {
      id: 2,
      title: 'Mobile App Development',
      assignee: 'Sarah Connor',
      progress: 45,
      dueDate: 'May 20, 2025',
      daysLeft: 7,
      budget: '$1,200',
      status: 'In progress',
      avatar: 'SC'
    },
    {
      id: 3,
      title: 'Content Writing Project',
      assignee: 'John Smith',
      progress: 80,
      dueDate: 'May 12, 2025',
      daysLeft: 1,
      budget: '$400',
      status: 'In progress',
      avatar: 'JS'
    }
  ];

  const completedTasks = [
    {
      id: 4,
      title: 'Logo Design',
      assignee: 'Gabriel Nwanem',
      progress: 100,
      completedDate: 'May 10, 2025',
      budget: '$150',
      status: 'Completed',
      avatar: 'GM'
    },
    {
      id: 5,
      title: 'SEO Optimization',
      assignee: 'Peter Roseline',
      progress: 100,
      completedDate: 'May 8, 2025',
      budget: '$300',
      status: 'Completed',
      avatar: 'PR'
    }
  ];

  const currentTasks = activeTab === 'ongoing' ? tasks : completedTasks;

  return (
    <div className="p-7 min-h-full">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between mb-6">
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

        {/* Filter and Sort */}
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

      {/* Task Cards */}
  
{/* Task Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 basic-font">
    {currentTasks.map((task) => (
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
            {activeTab === 'completed' ? '100' : task.progress}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-[#D9D9D9] rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                activeTab === 'completed' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : 'bg-[#0177FB]'
              }`}
              style={{ width: activeTab === 'completed' ? '100%' : `${task.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Date, Time Left, and Budget - All on Same Row */}
        <div className='flex flex-row justify-between items-center mt-4'>
          {/* Date */}
          <div className="flex items-center gap-2 text-[#92929D]">
            <Calendar size={16} className='text-[#6B7280]' />
            <span className="text-sm">{activeTab === 'ongoing' ? task.dueDate : task.completedDate}</span>
          </div>
          
          {/* Time Left or Time Ago - Centered */}
          <div className="flex items-center justify-center">
            {activeTab === 'ongoing' ? (
              <div className={`flex items-center gap-1 text-sm ${
                task.daysLeft <= 2 ? 'text-red-500' : 'text-orange-500'
              }`}>
                <Clock size={16} />
                {task.daysLeft} days left
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-[#92929D]">
                <Clock size={16} />
                2 weeks ago
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

      {/* Empty State */}
      {currentTasks.length === 0 && (
        <div className="text-center py-12">
          {activeTab === 'ongoing' ? (
            <>
              <Clock size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ongoing tasks</h3>
              <p className="text-gray-600">Create a new task to get started with your projects.</p>
            </>
          ) : (
            <>
              <CheckCircle size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed tasks yet</h3>
              <p className="text-gray-600">Completed tasks will appear here once you finish them.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskManagement;