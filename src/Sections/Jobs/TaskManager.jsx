import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

export default function TaskDashboard() {
  const [activeFilter, setActiveFilter] = useState('All Tasks');
  const [searchQuery, setSearchQuery] = useState('');

  const tasks = [
    {
      id: 1,
      name: 'Homepage wireframes',
      job: 'E-commerce Website Redesign',
      dueDate: 'Oct 5, 2023',
      status: 'In Progress',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 2,
      name: 'User flow diagrams',
      job: 'E-commerce Website Redesign',
      dueDate: 'Oct 10, 2023',
      status: 'Not Started',
      statusColor: 'bg-red-100 text-red-800'
    },
    {
      id: 3,
      name: 'Logo concepts',
      job: 'E-commerce Website Redesign',
      dueDate: 'Oct 15, 2023',
      status: 'In Review',
      statusColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 4,
      name: 'Design system',
      job: 'E-commerce Website Redesign',
      dueDate: 'Oct 25, 2023',
      status: 'Not Started',
      statusColor: 'bg-red-100 text-red-800'
    }
  ];

  const filters = ['All Tasks', 'In Progress', 'Completed', 'Pending'];

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = activeFilter === 'All Tasks' || task.status === activeFilter;
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.job.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full bg-gray-50 p-6">
      <div className="space-y-6">
        {/* Search and Filter Section */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Task Assigned Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Task Assigned</h2>
          </div>

          {/* Filter Tabs */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    activeFilter === filter
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="col-span-3 text-sm font-semibold text-gray-600">Task</div>
            <div className="col-span-4 text-sm font-semibold text-gray-600">Job</div>
            <div className="col-span-2 text-sm font-semibold text-gray-600">Due Date</div>
            <div className="col-span-2 text-sm font-semibold text-gray-600">Status</div>
            <div className="col-span-1"></div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <div key={task.id} className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-gray-50 transition-colors">
                <div className="col-span-3 text-gray-900 font-medium">{task.name}</div>
                <div className="col-span-4 text-gray-600">{task.job}</div>
                <div className="col-span-2 text-gray-600">{task.dueDate}</div>
                <div className="col-span-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${task.statusColor}`}>
                    {task.status}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Submit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              No tasks found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}