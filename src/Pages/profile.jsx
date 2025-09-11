import React, { useState, useEffect } from 'react';
import { MapPin, Edit3, Star, Loader2, AlertCircle } from 'lucide-react';

// StarRating component
const StarRating = ({ rating, maxRating }) => {
  if (!rating) return null;
  
  const stars = [];
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  for (let i = 0; i < maxRating; i++) {
    if (i < filledStars) {
      stars.push(<Star key={i} size={14} className="text-yellow-400 fill-current" />);
    } else if (i === filledStars && hasHalfStar) {
      stars.push(<Star key={i} size={14} className="text-yellow-400 fill-current opacity-50" />);
    } else {
      stars.push(<Star key={i} size={14} className="text-gray-300" />);
    }
  }
  
  return (
    <div className="flex items-center gap-1">
      {stars}
      <span className="text-sm text-gray-600 ml-1">{rating}/{maxRating}</span>
    </div>
  );
};

// Avatar generator using initials
const generateAvatar = (firstname, lastname) => {
  const initials = `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
    'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
  ];
  
  // Use the length of the name to pick a consistent color
  const colorIndex = (firstname?.length || 0 + lastname?.length || 0) % colors.length;
  const bgColor = colors[colorIndex];
  
  return (
    <div className={`w-full h-full ${bgColor} rounded-full flex items-center justify-center text-white font-semibold text-lg`}>
      {initials}
    </div>
  );
};

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const accessToken = localStorage.getItem('access_jwt');
        if (!accessToken) {
          setError('Authentication token not found. Please sign in again.');
          return;
        }

        const API_URL = import.meta.env.VITE_API_URL;
        
        const response = await fetch(`${API_URL}/api/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            setError('Session expired. Please sign in again.');
          } else {
            setError(data.error_message || 'Failed to load profile data.');
          }
          return;
        }

        if (data.well_received && data.profile_data) {
          // Transform API data to match our display format
          const transformedData = {
            name: `${data.profile_data.firstname || ''} ${data.profile_data.lastname || ''}`.trim(),
            username: data.profile_data.username || `@${data.profile_data.email?.split('@')[0] || 'user'}`,
            email: data.profile_data.email,
            firstname: data.profile_data.firstname,
            lastname: data.profile_data.lastname,
            expertiseScore: data.profile_data.expertise_score,
            maxScore: 10,
            bio: data.profile_data.bio || "No bio provided yet. Edit your profile to add a personal bio.",
            state: data.profile_data.state,
            country: data.profile_data.country,
            skill: data.profile_data.skill
          };
          
          setProfileData(transformedData);
        } else {
          setError('Invalid response format from server.');
        }

      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditProfile = () => {
    // Navigate to edit profile page or open edit modal
    console.log('Edit profile clicked');
    // You can add navigation logic here
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="lg:col-span-1 max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 mb-4 animate-pulse"></div>
                <div className="h-5 bg-white bg-opacity-20 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-4 bg-white bg-opacity-20 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                <span className="ml-2 text-gray-600">Loading profile...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="lg:col-span-1 max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="lg:col-span-1 max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>No profile data available.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Profile Section */}
      <div className="lg:col-span-1 max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header with Blue Background */}
          <div className="bg-blue-600 px-6 py-8 text-white relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-white p-1 mb-4">
                {generateAvatar(profileData.firstname, profileData.lastname)}
              </div>
              <h2 className="text-xl font-semibold">{profileData.name}</h2>
              <p className="text-blue-100 text-sm">{profileData.username}</p>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 space-y-6">
            {/* Expertise Score - Only show if user has a score */}
            {profileData.expertiseScore && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Expertise Score</span>
                  <StarRating rating={profileData.expertiseScore} maxRating={profileData.maxScore} />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(profileData.expertiseScore / profileData.maxScore) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Bio */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Bio</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {profileData.bio}
              </p>
            </div>

            {/* Location */}
            {(profileData.state || profileData.country) && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={14} className="mr-2" />
                  {[profileData.state, profileData.country].filter(Boolean).join(', ')}
                </div>
              </div>
            )}

            {/* Skills */}
            {profileData.skill && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Skill</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                    {profileData.skill}
                  </span>
                </div>
              </div>
            )}

            {/* Edit Profile Button */}
            <button 
              onClick={handleEditProfile}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;