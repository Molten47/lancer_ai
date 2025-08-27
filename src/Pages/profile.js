  const profileData = {
    name: "profile_name",
    username: "@username",
    avatar: "/api/placeholder/120/135",
    expertiseScore: 8.4,
    maxScore: 10,
    bio: "Passionate UI/UX designer with 5+ years of experience creating intuitive and engaging digital experiences. Specialized in React-based web applications with a focus on accessibility and clean design.",
    state:"California",
    country: "United States",
    skill: "graphics designer"
  };

{/* Profile Section */}
          
          <div className="lg:col-span-1 max-w-7xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Profile Header with Blue Background */}
              <div className="bg-blue-600 px-6 py-8 text-white relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-white p-1 mb-4">
                    <img 
                      src={profileData.avatar} 
                      alt={profileData.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-semibold">{profileData.name}</h2>
                  <p className="text-blue-100 text-sm">{profileData.username}</p>
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-6 space-y-6">
                {/* Expertise Score */}
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

                {/* Bio */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Bio</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {profileData.bio}
                  </p>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={14} className="mr-2" />
                    {profileData.state + ', ' + profileData.country}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Skill</h3>
                  <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                        {profileData.skill}
                      </span>
                    
                  </div>
                </div>

                {/* Edit Profile Button */}
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>