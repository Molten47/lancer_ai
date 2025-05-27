import { useState } from 'react';
import { Filter, Calendar, CheckCircle, DollarSign, Settings, User, Clock } from 'lucide-react';

const Activity = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  const activityTabs = [
    { id: 'all', label: 'All Activities', count: 12 },
    { id: 'tasks', label: 'Tasks', count: 5 },
    { id: 'messages', label: 'Messages', count: 3 },
    { id: 'payment', label: 'Payment', count: 8 },
    { id: 'system', label: 'System', count: 2 }
  ];

  const allActivities = [
    {
      id: 1,
      type: 'tasks',
      title: 'New Completed Task',
      description: 'Website Design Project was marked as completed',
      amount: '+$850',
      status: 'Completed',
      time: '2 mins ago',
      timestamp: new Date(Date.now() - 2 * 60000),
      icon: <CheckCircle size={28} className="text-[#662D91]" />,
      bgColor: 'bg-[#F8EEFF]'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      description: 'Payment for Mobile App Design project',
      amount: '+$430',
      status: 'Processed',
      time: '1 hr ago',
      timestamp: new Date(Date.now() - 60 * 60000),
      icon: <DollarSign className="w-5 h-5 text-green-500" />,
      bgColor: 'bg-green-50'
    },
    {
      id: 3,
      type: 'system',
      title: 'System Update',
      description: 'Your account settings were updated successfully',
      amount: null,
      status: null,
      time: 'Yesterday',
      timestamp: new Date(Date.now() - 24 * 60 * 60000),
      icon: <Settings className="w-5 h-5 text-blue-500" />,
      bgColor: 'bg-blue-50'
    },
    {
      id: 4,
      type: 'system',
      title: 'Profile Updated',
      description: 'You updated your profile information',
      amount: null,
      status: null,
      time: 'Yesterday',
      timestamp: new Date(Date.now() - 25 * 60 * 60000),
      icon: <User className="w-5 h-5 text-gray-500" />,
      bgColor: 'bg-gray-50'
    },
    {
      id: 5,
      type: 'messages',
      title: 'New Message Received',
      description: 'Client sent a message about project requirements',
      amount: null,
      status: 'Unread',
      time: '3 hrs ago',
      timestamp: new Date(Date.now() - 3 * 60 * 60000),
      icon: <User className="w-5 h-5 text-blue-500" />,
      bgColor: 'bg-blue-50'
    },
    {
      id: 6,
      type: 'tasks',
      title: 'Task Assignment',
      description: 'New task has been assigned to your account',
      amount: null,
      status: 'Pending',
      time: '5 hrs ago',
      timestamp: new Date(Date.now() - 5 * 60 * 60000),
      icon: <CheckCircle className="w-5 h-5 text-orange-500" />,
      bgColor: 'bg-orange-50'
    },
    {
      id: 7,
      type: 'messages',
      title: 'Message Sent',
      description: 'You replied to client inquiry',
      amount: null,
      status: 'Sent',
      time: '6 hrs ago',
      timestamp: new Date(Date.now() - 6 * 60 * 60000),
      icon: <User className="w-5 h-5 text-green-500" />,
      bgColor: 'bg-green-50'
    },
    {
      id: 8,
      type: 'payment',
      title: 'Invoice Generated',
      description: 'Invoice #1234 has been generated',
      amount: '$1,200',
      status: 'Pending',
      time: '1 day ago',
      timestamp: new Date(Date.now() - 26 * 60 * 60000),
      icon: <DollarSign className="w-5 h-5 text-blue-500" />,
      bgColor: 'bg-blue-50'
    }
  ];

  // Filter activities based on active tab
  const getFilteredActivities = () => {
    let filtered = activeTab === 'all' ? allActivities : allActivities.filter(activity => activity.type === activeTab);
    
    // Sort activities
    if (sortBy === 'newest') {
      filtered = filtered.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === 'oldest') {
      filtered = filtered.sort((a, b) => a.timestamp - b.timestamp);
    } else if (sortBy === 'amount') {
      filtered = filtered.sort((a, b) => {
        const amountA = a.amount ? parseFloat(a.amount.replace(/[+$,]/g, '')) : 0;
        const amountB = b.amount ? parseFloat(b.amount.replace(/[+$,]/g, '')) : 0;
        return amountB - amountA;
      });
    }
    
    return filtered;
  };

  const activityFeed = getFilteredActivities();

  return (
    <div className="p-6 bg-white min-h-screen basic-font">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {/* Activity Header with Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-5 py-3  rounded-lg text-sm font-medium  bg-[#F9FAFB] text-[#6B7280]  transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            {filterOpen && (
              <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 w-48">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" /> Show Completed
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" /> Show Pending
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" /> Show Processed
                  </label>
                </div>
              </div>
            )}
          </div>
          <div className='flex flex-row justify-center items-center gap-2 px-2 relative'>
           <button 
             onClick={() => setDateRangeOpen(!dateRangeOpen)}
             className="flex items-center gap-2 px-5 py-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
           >
              <Calendar className="w-4 h-4" />
              <span className="hidden bg-[#F9FAFB] text-[#6B7280] sm:inline">Date Range</span>
              <span className="sm:hidden">Date</span>
            </button>
            {dateRangeOpen && (
              <div className="absolute top-12 right-16 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 w-40">
                <div className="space-y-2 text-sm">
                  <button className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded">Today</button>
                  <button className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded">Yesterday</button>
                  <button className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded">Last 7 days</button>
                  <button className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded">Last 30 days</button>
                </div>
              </div>
            )}
             <button 
               onClick={() => setSortOpen(!sortOpen)}
               className="flex items-center gap-2 px-5 py-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
             >
               Sort
             </button>
             {sortOpen && (
               <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 w-40">
                 <div className="space-y-2 text-sm">
                   <button 
                     onClick={() => {setSortBy('newest'); setSortOpen(false);}}
                     className={`block w-full text-left px-2 py-1 hover:bg-gray-100 rounded ${sortBy === 'newest' ? 'bg-gray-100 font-medium' : ''}`}
                   >
                     Newest First
                   </button>
                   <button 
                     onClick={() => {setSortBy('oldest'); setSortOpen(false);}}
                     className={`block w-full text-left px-2 py-1 hover:bg-gray-100 rounded ${sortBy === 'oldest' ? 'bg-gray-100 font-medium' : ''}`}
                   >
                     Oldest First
                   </button>
                   <button 
                     onClick={() => {setSortBy('amount'); setSortOpen(false);}}
                     className={`block w-full text-left px-2 py-1 hover:bg-gray-100 rounded ${sortBy === 'amount' ? 'bg-gray-100 font-medium' : ''}`}
                   >
                     By Amount
                   </button>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Activity Tabs - Responsive */}
        <div className="mb-6">
          {/* Desktop Tabs */}
          <div className="hidden md:flex gap-2 overflow-x-auto">
            {activityTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-black text-white' 
                    : 'bg-[#F9FAFB] text-[#6B7280] hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          
          {/* Mobile Tabs - Stacked */}
          <div className="md:hidden grid grid-cols-2 gap-2">
            {activityTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="truncate bg-[#F9FAFB] text-[#6B7280]">{tab.label}</span>
                <span className="text-xs">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Feed</h3>
          <div className="space-y-4">
            {activityFeed.map((activity) => (
              <div key={activity.id} className="bg-white rounded-lg p-6 hover:shadow-md transition-shadow min-h-[120px]">
                <div className="flex items-start justify-between h-full">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-dark mb-2 text-base text-[1rem]">{activity.title}</h4>
                      <p className="text-[0.9rem] text-[#6B7280] mb-4 leading-relaxed">{activity.description}</p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        {activity.amount && (
                          <span className={`text-sm font-semibold ${
                            activity.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {activity.amount}
                          </span>
                        )}
                        {activity.status && (
                          <span className="text-sm text-gray-500 font-medium">{activity.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-sm flex-shrink-0 ml-4">
                    <Clock className="w-4 h-4" />
                    <span className="hidden sm:inline">{activity.time}</span>
                    <span className="sm:hidden text-xs">{activity.time.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;