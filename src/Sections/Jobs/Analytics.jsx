import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Users, BarChart3 } from 'lucide-react';

const AnalyticsComponent = ({ project = null }) => {
  // MOCK DATA - Replace with API data when ready
  const metrics = {
    completionRate: 80,
    completedTasks: 8,
    totalTasks: 10,
    totalHours: 160,
    hoursIncrease: '+12%',
    teamCount: 3,
    teamMembers: [
      { id: 1, firstname: 'John', lastname: 'Doe' },
      { id: 2, firstname: 'Jane', lastname: 'Smith' },
      { id: 3, firstname: 'Mike', lastname: 'Johnson' }
    ]
  };

  const getInitials = (firstname, lastname) => {
    const first = firstname?.[0]?.toUpperCase() || '';
    const last = lastname?.[0]?.toUpperCase() || '';
    return `${first}${last}`;
  };

  const projectData = { duration: 3 };

  return (
    <div className="w-full bg-[#F9FAFB] p-6">
      <div className="space-y-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Task Completion Rate */}
              <div className='bg-[#F9FAFB] p-4 rounded-lg'>
                <p className="text-sm text-[#6B7280] mb-3">Task Completion Rate</p>
                <p className="text-xl font-bold text-[#111827] mb-4">{metrics.completionRate}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-[#2563EB] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.completionRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{metrics.completedTasks} Completed</span>
                  <span>{metrics.totalTasks} total</span>
                </div>
              </div>

              {/* Hours Utilized */}
              <div className='bg-[#F9FAFB] p-4 rounded-lg'>
                <p className="text-sm text-[#6B7280] mb-3">Hours Utilized</p>
                <p className="text-xl font-bold text-[#111827] mb-4">{metrics.totalHours}</p>
                <p className="text-sm text-green-600 font-medium">{metrics.hoursIncrease} from last month</p>
              </div>

              {/* Team */}
           <div className='bg-[#F9FAFB] p-4 rounded-lg'>
            <p className="text-sm text-gray-500 mb-6">Team</p>
  
            <div className="flex items-center justify-between">
            <div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{metrics.teamCount}</p>
      <span className="text-sm text-gray-500">Team Members</span>
    </div>
    
    <div className="flex -space-x-2">
      {metrics.teamMembers.slice(0, 3).map((member, index) => (
        <div
          key={member.id}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium border-2 border-white"
          title={`${member.firstname} ${member.lastname}`}
        >
          {getInitials(member.firstname, member.lastname)}
        </div>
      ))}
    </div>
  </div>
</div>
            </div>
          </div>
        </div>

{/* Charts Section */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Task Completion Trend */}
  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">Task Completion Trend</h3>
    </div>
    <div className="p-6">
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="flex items-end justify-center gap-2 mb-3">
            <div className="w-1 h-12 bg-gray-300 "></div>
            <div className="w-1 h-16 bg-gray-300 "></div>
            <div className="w-1 h-10 bg-gray-300 "></div>
          </div>
          <p className="text-gray-500 text-sm">Task completion chart would render here</p>
          <p className="text-gray-400 text-xs mt-1">Using actual chart library in production</p>
        </div>
      </div>
    </div>
  </div>

  {/* Hours Logged */}
  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">Hours Logged</h3>
    </div>
    <div className="p-6">
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="flex items-end justify-center gap-2 mb-3">
            <div className="w-1 h-12 bg-gray-300 rounded"></div>
            <div className="w-1 h-16 bg-gray-300 rounded"></div>
            <div className="w-1 h-10 bg-gray-300 rounded"></div>
          </div>
          <p className="text-gray-500 text-sm">Hours logged chart would render here</p>
          <p className="text-gray-400 text-xs mt-1">Using actual chart library in production</p>
        </div>
      </div>
    </div>
  </div>
</div>

   
      </div>
    </div>
  );
};

export default AnalyticsComponent;