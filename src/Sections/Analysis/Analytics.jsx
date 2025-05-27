import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Calendar, Download, DollarSign, CheckSquare, Clock, Users, TrendingUp, TrendingDown } from 'lucide-react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('Last 30 Days');

  const earningsData = [
    { month: 'JAN', earnings: 5200 },
    { month: 'FEB', earnings: 4800 },
    { month: 'MAR', earnings: 5600 },
    { month: 'APR', earnings: 6200 },
    { month: 'MAY', earnings: 5800 },
    { month: 'JUN', earnings: 8400 },
    { month: 'JUL', earnings: 10432 }
  ];

  const metrics = [
    {
      title: 'Total Earnings',
      value: '$10,432',
      change: '12.5% vs last month',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Tasks Completed',
      value: '18',
      change: '-4.2% vs last month',
      trend: 'down',
      icon: CheckSquare,
      color: 'text-purple-600'
    },
    {
      title: 'Hours Worked',
      value: '164',
      change: '8.1% vs last month',
      trend: 'up',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'Active Clients',
      value: '3',
      change: '2.3% vs last month',
      trend: 'up',
      icon: Users,
      color: 'text-gray-600'
    }
  ];

  const taskDistribution = [
    { category: 'Web Development', count: 50, percentage: 44.2, color: 'bg-[#166534]' },
    { category: 'Design', count: 35, percentage: 31.0, color: 'bg-[#0C0950]' },
    { category: 'Technical Writing', count: 60, percentage: 31.0, color: 'bg-[#0C0950]' },
    { category: 'Content Writing', count: 28, percentage: 24.8, color: 'bg-[#FF3D00]' }
  ];

  return (
    <div className="bg-white p-6 space-y-8 basic-font">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-600">Track your performance and growth</p>
        </div>
        <div className="flex items-center space-x-3 ">
          <div className="flex items-center space-x-2 bg-gray-50 px-5 py-3 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{timeRange}</span>
          </div>
          <div className="flex items-center space-x-2 bg-cta hover:bg-cyan-600 text-white px-5 justify-center py-3 rounded-lg transition-colors">
            <Download size={18} className="" />
            <span className="text-sm  font-medium">Export</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 hover:bg-gray-100 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>
                <div className="flex items-center space-x-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className={`p-2 rounded-lg bg-white`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        {/* Earnings Overview */}
        <div className="lg:col-span-2 bg-white  rounded-lg p-18 shadow-lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Earnings Overview</h3>
            <p className="text-sm text-gray-600">Your earnings performance over time</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={earningsData}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Distribution */}
        <div className="bg-white rounded-lg p-6 border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Task Distribution</h3>
            <p className="text-sm text-gray-600">Tasks completed by category</p>
          </div>
          <div className="space-y-4">
            {taskDistribution.map((task, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{task.category}</span>
                  <span className="text-lg font-bold text-gray-900">{task.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${task.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${task.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;