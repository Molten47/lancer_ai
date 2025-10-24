import React, { useState } from 'react';
import { ChevronLeft, BarChart3, CheckCircle, File, ChevronDown } from 'lucide-react';

export default function FullJobDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ChevronLeft className="w-5 h-5 text-gray-400 cursor-pointer" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">E-commerce Operations</h1>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                In Progress
              </p>
            </div>
            <p className="text-sm text-gray-600 ml-4">Fashion Boutique Inc.</p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
            Custom Offer: $1500
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {['Overview', 'Tasks', 'Messages', 'Analytics', 'Documents'].map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.toLowerCase()
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                } relative`}
              >
                {tab}
                {tab === 'Messages' && (
                  <span className="absolute -top-1 -right-3 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    1
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Project Duration */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Project Duration</h3>
              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1 rounded-full">
                In Progress
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Start Date:</p>
                <p className="font-medium text-gray-900">Aug 15, 2025</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Due Date:</p>
                <p className="font-medium text-gray-900">Oct 15, 2025</p>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Tasks</h3>
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                This Month
              </span>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900">08/10</p>
              <p className="text-sm text-gray-500 mt-1">Tasks Completed</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>

          {/* Team */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Team</h3>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                Active
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-4">3</p>
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"
                ></div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">Team Members</p>
          </div>

          {/* Messages */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Messages</h3>
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                Unread
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-4">4</p>
            <p className="text-sm text-gray-500">New Messages</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-3 gap-6">
          {/* Assigned Tasks */}
          <div className="col-span-2 bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Assigned Tasks</h3>
              <a href="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">
                View All
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Task</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Clients</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Due Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">Homepage Wireframe</td>
                    <td className="py-4 px-4 text-gray-600">Bello Samad</td>
                    <td className="py-4 px-4 text-gray-600">2025-10-15</td>
                    <td className="py-4 px-4">
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                        Completed
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">Header Redesign</td>
                    <td className="py-4 px-4 text-gray-600">Bella Samad</td>
                    <td className="py-4 px-4 text-gray-600">2025-10-21</td>
                    <td className="py-4 px-4">
                      <span className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                        In Progress
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Activity</h3>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    <span className="font-bold">Hephzibah Ilori</span> completed task
                  </p>
                  <p className="text-sm text-gray-600">Review customer feedback</p>
                  <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <File className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    <span className="font-bold">Damilare A.</span> update document
                  </p>
                  <p className="text-sm text-gray-600">Monthly Report September</p>
                  <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-2 gap-6 mt-8">
          {/* Active Automations */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Active Automations</h3>
              <a href="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">
                View All
              </a>
            </div>
            <div className="h-32 flex items-center justify-center text-gray-400">
              <p className="text-sm">No active automations</p>
            </div>
          </div>

          {/* Recent Documents */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Documents</h3>
              <a href="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">
                View All
              </a>
            </div>
            <div className="space-y-3">
              {[
                { title: 'E-commerce Operations Manual', date: '2025-09-15', author: 'Alex Johnson' },
                { title: 'Inventory Procedures', date: '2025-09-20', author: 'Michael Brown' },
                { title: 'Customer Support Guidelines', date: '2025-09-25', author: 'Sarah Miller' },
              ].map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded cursor-pointer">
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                      <p className="text-xs text-gray-500">Updated {doc.date} by {doc.author}</p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}