import React, { useState } from 'react';
import { Star, Calendar, Clock, DollarSign, User, MapPin, Edit3, Eye } from 'lucide-react';

const DashboardView = () => {
  // Profile data
  const profileData = {
    name: "Alex Morgan",
    username: "@codecraft_alex",
    avatar: "/api/placeholder/120/120",
    expertiseScore: 8.4,
    maxScore: 10,
    bio: "Passionate UI/UX designer with 5+ years of experience creating intuitive and engaging digital experiences. Specialized in React-based web applications with a focus on accessibility and clean design.",
    location: "California, United States",
    skills: ["UI/UX Design", "React", "Figma", "Tailwind CSS"]
  };

  // Current jobs data
  const currentJobs = [
    {
      id: 1,
      title: "E-commerce Website Redesign",
      client: "FashionForward",
      status: "In Progress",
      dueDate: "Nov 15, 2024",
      statusColor: "bg-yellow-100 text-yellow-800"
    },
    {
      id: 2,
      title: "Mobile App UI Design",
      client: "HealthTrack",
      status: "Completed",
      dueDate: "Oct 28, 2024",
      statusColor: "bg-green-100 text-green-800"
    }
  ];

  // Recommended jobs data
  const recommendedJobs = [
    {
      id: 1,
      title: "Website Design for Tech Startup",
      description: "Create a modern landing page for a SaaS company",
      budget: "$800-1,200",
      match: "95%",
      matchColor: "text-green-600"
    },
    {
      id: 2,
      title: "E-commerce Product Page Redesign",
      description: "Improve UX and conversion rate for product pages",
      budget: "$500-700",
      match: "87%",
      matchColor: "text-green-600"
    },
    {
      id: 3,
      title: "Dashboard UI for Analytics Platform",
      description: "Design an intuitive dashboard for data visualization",
      budget: "$1,000-1,500",
      match: "82%",
      matchColor: "text-green-600"
    }
  ];

  // Star Rating Component
  const StarRating = ({ rating, maxRating = 10 }) => {
    const stars = [];
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = (rating / 2) % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star size={16} className="text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} size={16} className="text-gray-300" />
        );
      }
    }

    return (
      <div className="flex items-center gap-1">
        <div className="flex">{stars}</div>
        <span className="text-sm font-medium ml-1">
          {rating}/{maxRating}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
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
                    {profileData.location}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
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

          {/* Jobs Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Jobs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Current Jobs</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User size={16} className="text-gray-400 mr-2" />
                            <div className="text-sm text-gray-600">{job.client}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${job.statusColor}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar size={14} className="mr-2" />
                            {job.dueDate}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommended Jobs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  View All Recommended Jobs
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid gap-4">
                  {recommendedJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{job.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <DollarSign size={14} className="mr-1" />
                              {job.budget}
                            </div>
                            <div className={`font-medium ${job.matchColor}`}>
                              {job.match} Match
                            </div>
                          </div>
                        </div>
                        
                        <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
                          <Eye size={14} />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;