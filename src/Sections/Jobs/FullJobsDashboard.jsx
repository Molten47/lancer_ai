import React, { useState } from 'react';
import { ChevronLeft, MessageSquare, Users, CheckSquare, Clock, AlertCircle, ArrowLeft, FileArchive, File } from 'lucide-react';
import FileManager from './DocumentManager';
import TaskDashboard from './TaskManager';
import AnalyticsComponent from './Analytics';
import MessagesComponent from './MessagesLevel';

// Placeholder Tab Components - Replace with your actual component imports
const OverviewTab = ({ project }) => {
  const tasks = [
    { name: 'Homepage Wireframe', client: 'Bello Samad', dueDate: '2025-10-15', status: 'Completed' },
    { name: 'Userflow Diagram', client: 'Bello Samad', dueDate: '2025-10-31', status: 'In-progress' },
    { name: 'Logo Concept', client: 'Bello Samad', dueDate: '2025-11-05', status: 'In-progress' },
    { name: 'Design System', client: 'Bello Samad', dueDate: '2025-11-10', status: 'Pending' },
  ];

  const activityItems = [
    { type: 'completed', name: 'Hephzibah Ilori', action: 'completed task', details: 'Review customer feedback', time: '1 hour ago' },
    { type: 'document', name: 'Damilare A.', action: 'update document', details: 'Monthly Report September', time: '3 hours ago' },
    { type: 'comment', name: 'Ocheje S.', action: 'commented on task', details: 'Review customer feedback', time: '6 hours ago' },
    { type: 'assigned', name: 'Damilare Alabi', action: 'assigned task to', details: 'Hephzibah Ilori', time: '1 day ago' },
  ];

  const documents = [
    { name: 'E-commerce Operations Manual', updated: '2025-09-15', by: 'Alex Johnson' },
    { name: 'Inventory Procedures', updated: '2025-09-20', by: 'Michael Brown' },
    { name: 'Customer Support Guidelines', updated: '2025-09-25', by: 'Sarah Miller' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In-progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

 const getActivityIcon = (type) => {
  switch(type) {
    case 'completed': 
      return (
        <span className='bg-primary rounded-full p-3 flex items-center justify-center'>
          <CheckSquare size={20} className="text-white" />
        </span>
      );
    case 'document': 
      return (
        <span className='bg-[#22C55E] rounded-full p-3 flex items-center justify-center'>
          <File className="w-5 h-5 text-white" />
        </span>
      );
    case 'comment': 
      return (
        <span className='bg-primary rounded-full p-3 flex items-center justify-center'>
          <MessageSquare className="w-5 h-5 text-white" />
        </span>
      );
    case 'assigned': 
      return (
        <span className='bg-[#22C55E] rounded-full p-3 flex items-center justify-center'>
          <Users className="w-5 h-5 text-white" />
        </span>
      );
    default: 
      return (
        <span className='bg-gray-500 rounded-full p-3 flex items-center justify-center'>
          <Clock className="w-5 h-5 text-white" />
        </span>
      );
  }
};

  return (
    <div className="p-6 overflow-y-auto max-h-[calc(100vh-180px)]">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         {/* Project Duration */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-16">
            <h3 className="text-gray-500 text-sm font-medium">Project Duration</h3>
            <div className="bg-[#F3E8FF] text-[#9333EA] text-xs font-normal px-2 py-1 rounded-full">In Progress</div>
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-[0.85em] font-medium text-[#151B25]">Start Date:</p>
              <p className="text-[0.85em] font-medium text-gray-500">Aug 15, 2025</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[0.85em] font-medium text-[#151B25]">Due Date:</p>
              <p className="text-[0.85em] font-medium text-gray-500">Oct 15, 2025</p>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className='flex flex-row justify-between items-center'>
          <h3 className="text-gray-600 text-sm font-medium mb-4">Tasks</h3>
          <span className="bg-[#DBEAFE] text-[#2255D7] text-xs font-normal px-2 py-1 rounded-full">This Month</span>
          </div>
          <p className="text-xl font-bold text-[#151B25] mb-1">08/10</p>
          <p className="text-xs text-gray-500 mb-4">Tasks Completed</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white flex flex-col gap-4 rounded-lg p-4 border border-gray-200">
          <div className='flex flex-row justify-between items-center'>
          <h3 className="text-gray-600 text-sm font-medium mb-4">Team</h3>
          <span className="bg-[#DCFCE7] text-[#166534] text-xs px-2 py-1 font-normal rounded-full">Active</span>
          </div>
          <div className='flex flex-row justify-between items-center'>
          <div className='flex flex-col justify-center'>
          <p className="text-3xl font-bold text-gray-900 mb-3">3</p>
          <p className="text-xs text-gray-500 mb-4">Team Members</p>
            </div>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white"></div>
            <div className="w-8 h-8 bg-gray-500 rounded-full border-2 border-white"></div>
            <div className="w-8 h-8 bg-gray-600 rounded-full border-2 border-white"></div>
          </div>
          </div>
        
        
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className='flex flex-row justify-between items-center'>
          <h3 className="text-gray-600 text-sm font-medium mb-4">Messages</h3>
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1  font-normal rounded-full">Unread</span>
          </div>
          <div className='flex flex-row justify-between items-center'>
          <div className='flex flex-col gap-2'>
          <p className="text-3xl font-bold text-gray-900 mb-3">4</p>
          <p className="text-xs text-gray-500 mb-4">New Messages</p>
          </div>
          <span className='h-9 w-9 flex rounded-full justify-center items-center bg-[#EFF6FF]'>
             <MessageSquare size={20} className="text-[#2255D7]" />
          </span>
          </div>
        </div>
      </div>

      {/* Tasks Table and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Assigned Tasks */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Assigned Tasks</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Clients</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{task.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.client}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.dueDate}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Activity</h3>
          </div>
          <div className="max-h-96 overflow-y-auto p-6">
            {activityItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 relative">
                <div className="flex-shrink-0 relative z-10">
                  {getActivityIcon(item.type)}
                  {/* Connecting line - starts from bottom of icon to next icon */}
                  {idx !== activityItems.length - 1 && (
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-gray-200" 
                      style={{ top: '48px', bottom: '-42px' }}
                    ></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span className="text-gray-500"> {item.action}</span>
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{item.details}</p>
                    </div>
                    <p className="text-xs text-gray-400 ml-4">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Agent Activity</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          <div className="text-gray-600 text-sm py-8 text-center">
            <p>Job assistant is sending task update...</p>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Recent Documents</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Updated {doc.updated} by {doc.by}</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-300 transform rotate-180" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksTab = ({ project }) => {
  return (
    <div className="p-6">
        <p className="text-gray-600"><TaskDashboard/></p>
    </div>
  );
};

const MessagesTab = ({ project }) => {
  return (
    <div className="p-6">
      <MessagesComponent/>
    </div>
  );
};

const AnalyticsTab = ({ project }) => {
  return (
    <div className="p-6">
        <AnalyticsComponent/>
    </div>
  );
};

const DocumentsTab = ({ project }) => {
  return (
    <div className="p-6">
        <p className="text-gray-600"><FileManager/></p>
    </div>
  );
};

export default function FullJobsDashboard({ project, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'messages', label: 'Messages', badge: 2 },
    { id: 'analytics', label: 'Analytics' },
    { id: 'documents', label: 'Documents' }
  ];

  return (
    <div className="min-h-screen third-font bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              < ArrowLeft className="w-6 h-6 text-[#6B7280]" />
            </button>
            <div className='flex flex-row justify-center items-center gap-4 '>
              <div>
              <p className="text-[1em] font-bold text-[#151B25]">
                {project?.title || 'E-commerce Operations'}
              </p>
              <p className='text-[#6B7280] font-normal'>
                Fashion Boutique Inc.
              </p>

              </div>
              
              <span className="text-[0.85rem] gap-1 flex flex-row justify-center items-center text-[#2255D7] ">
                <Clock size={18} className='text-[#2255D7]'/>
                {project?.status || 'In Progress'}
              </span>
            </div>
          </div>
          <button className="bg-primary text-[0.75em]  text-white px-3 py-5 rounded-lg font-medium transition">
            Custom Offer: ${project?.price || 1500}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-200 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm transition border-b-3 ${
                activeTab === tab.id
                  ? 'text-[#2255D7] border-[#2255D7]'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.badge && (
                <span className="ml-2 bg-blue-600 text-white rounded-full w-5 h-5 text-xs items-center justify-center inline-block">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab project={project} />}
        {activeTab === 'tasks' && <TasksTab project={project} />}
        {activeTab === 'messages' && <MessagesTab project={project} />}
        {activeTab === 'analytics' && <AnalyticsTab project={project} />}
        {activeTab === 'documents' && <DocumentsTab project={project} />}
      </div>
    </div>
  );
}