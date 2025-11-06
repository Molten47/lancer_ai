import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { User, Bell, Lock, CreditCard, Globe, Shield, HelpCircle, ChevronRight } from 'lucide-react';

const GeneralSettings = () => {
  const userData = useSelector(state => state.user.userData);
  
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('access_jwt');
        const API_URL = import.meta.env.VITE_API_URL;
        
        const response = await fetch(`${API_URL}/api/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0 && data[0].well_received) {
          setProfileData(data[0].profile_data);
          populateFormData(data[0].profile_data);
        } else if (data.well_received) {
          setProfileData(data.profile_data);
          populateFormData(data.profile_data);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        if (userData) {
          const fallbackData = {
            firstname: userData.firstname,
            lastname: userData.lastname,
            username: userData.username,
            email: userData.email
          };
          setProfileData(fallbackData);
          populateFormData(fallbackData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userData]);

  const populateFormData = (data) => {
    setFormData({
      fullName: `${data.firstname || ''} ${data.lastname || ''}`.trim(),
      email: data.email || '',
      phone: data.phone || '',
      location: data.location || '',
      bio: data.bio || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('access_jwt');
      const API_URL = import.meta.env.VITE_API_URL;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add your actual save logic here
      console.log('Saving profile data:', formData);
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      populateFormData(profileData);
    }
  };

  const getInitials = () => {
    if (profileData?.firstname && profileData?.lastname) {
      return `${profileData.firstname.charAt(0)}${profileData.lastname.charAt(0)}`.toUpperCase();
    }
    return 'AK';
  };

  const settingsTabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'account', label: 'Account', icon: Shield }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 third-font flex overflow-hidden">
      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-6 py-6 lg:px-8 lg:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar Navigation */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                <nav className="space-y-1">
                  {settingsTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={18} className="mr-3" />
                        <span className="flex-1 text-left">{tab.label}</span>
                        <ChevronRight size={16} className={`${activeTab === tab.id ? 'text-blue-700' : 'text-gray-400'}`} />
                      </button>
                    );
                  })}
                </nav>

                {/* Help Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button className="w-full flex items-center px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                    <HelpCircle size={18} className="mr-3" />
                    <span className="flex-1 text-left">Need help?</span>
                  </button>
                  <p className="px-3 mt-2 text-xs text-gray-500">
                    Check our documentation or contact support
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content Area - Takes remaining space */}
            <div className="flex-1 min-w-0">
              {activeTab === 'profile' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {/* Profile Picture Section */}
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Profile Picture</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-2xl">{getInitials()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                          Change
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Phone */}
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      {/* Location */}
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="San Francisco, CA"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Passionate about creating innovative digital products and services."
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Other Tabs - Placeholder Content */}
              {activeTab !== 'profile' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {activeTab === 'notifications' && <Bell size={24} className="text-gray-400" />}
                      {activeTab === 'security' && <Lock size={24} className="text-gray-400" />}
                      {activeTab === 'billing' && <CreditCard size={24} className="text-gray-400" />}
                      {activeTab === 'preferences' && <Globe size={24} className="text-gray-400" />}
                      {activeTab === 'account' && <Shield size={24} className="text-gray-400" />}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {settingsTabs.find(t => t.id === activeTab)?.label}
                    </h3>
                    <p className="text-gray-600">
                      This section is under construction. Check back soon!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;