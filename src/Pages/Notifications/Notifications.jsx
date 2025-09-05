import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Info, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const navigate = useNavigate();
  
  // State to hold the notifications data fetched from the API
  const [notifications, setNotifications] = useState([]);
  // State to track if the data is being loaded
  const [loading, setLoading] = useState(true);
  // State to handle any errors during the API call
  const [error, setError] = useState(null);

  // Click handler for interview routing
  const handleNotificationClick = (notification) => {
    if (notification.type === 'interview') {
      navigate('/job-interview', { 
        state: { 
          recipient_id: notification.anc,
          chat_type: notification.anc
        } 
      });
    }
  };

  useEffect(() => {
    // Define an asynchronous function to fetch the data
    const fetchNotifications = async () => {
      try {
        // Retrieve the JWT from a secure location
        const token = localStorage.getItem('access_jwt');

        if (!token) {
          setError('Authentication token not found.');
          setLoading(false);
          return;
        }
        
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/api/notifications`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Transform the notifications to add missing properties with defaults
        const transformedNotifications = data.notifications.map(notification => ({
          ...notification,
          read: false, // Default all notifications as unread since API doesn't provide this
          time: 'Just now' // Default time since API doesn't provide this
        }));
        
        setNotifications(transformedNotifications);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Helper function to get the correct icon and color based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'interview':
        return { icon: <Mail size={20} />, iconColor: 'text-blue-500', bgColor: 'bg-blue-50' };
      case 'payment':
        return { icon: <CheckCircle size={20} />, iconColor: 'text-green-500', bgColor: 'bg-green-50' };
      default:
        return { icon: <Info size={20} />, iconColor: 'text-gray-500', bgColor: 'bg-gray-50' };
    }
  };

  // Helper function to get notification title based on type
  const getNotificationTitle = (type) => {
    switch (type) {
      case 'interview':
        return 'Job Interview Request';
      case 'payment':
        return 'Payment Notification';
      default:
        return 'System Notification';
    }
  };
  
  // Conditional rendering based on loading and error states
  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading notifications...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>
          <div className="text-center text-gray-500 py-8">
            <Info size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        </div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>
        
        {/* Unread Notifications Section */}
        {unreadNotifications.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Unread ({unreadNotifications.length})
            </h3>
            <div className="space-y-4">
              {unreadNotifications.map((notification, index) => {
                const { icon, iconColor, bgColor } = getNotificationIcon(notification.type);
                return (
                  <div 
                    key={`unread-${index}`}
                    className={`flex items-start p-4 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow ${bgColor}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={`flex-shrink-0 p-2 rounded-full ${bgColor} mr-4`}>
                      {React.cloneElement(icon, { className: iconColor })}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold text-gray-900">
                          {getNotificationTitle(notification.type)}
                        </p>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      {notification.type === 'interview' && (
                        <p className="text-xs text-blue-600 mt-1">Click to start interview</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Notifications Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">All Notifications</h3>
          <div className="space-y-4">
            {notifications.map((notification, index) => {
              const { icon, iconColor, bgColor } = getNotificationIcon(notification.type);
              return (
                <div 
                  key={`all-${index}`}
                  className={`flex items-start p-4 rounded-lg border border-gray-100 cursor-pointer transition-colors duration-200 ${
                    notification.read ? 'bg-white hover:bg-gray-50' : `${bgColor} hover:shadow-md`
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 p-2 rounded-full mr-4">
                    {React.cloneElement(icon, { className: iconColor })}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className={`font-semibold ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {getNotificationTitle(notification.type)}
                      </p>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                    <p className="text-sm text-gray-500">{notification.message}</p>
                    {notification.type === 'interview' && !notification.read && (
                      <p className="text-xs text-blue-600 mt-1">Click to start interview</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;