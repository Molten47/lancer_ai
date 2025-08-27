import React, { useState } from 'react';
import { Star, Calendar, Clock, DollarSign, User, MapPin, Edit3, Eye } from 'lucide-react';
import RightSideModal from './RightSidemodal';
import GroupSideModal from './GroupSideModal';

const DashboardView = () => {
  const [isRightModalOpen, setIsRightModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Function to open the RightSideModal with specific job data
  const handleOpenRightModal = (job) => {
    setSelectedJob(job);
    setIsRightModalOpen(true);
  };

  // Function to open the GroupSideModal with specific job data
  const handleOpenGroupModal = (job) => {
    setSelectedJob(job);
    setIsGroupModalOpen(true);
  };

  // Function to close the modals
  const handleCloseModals = () => {
    setIsRightModalOpen(false);
    setIsGroupModalOpen(false);
    setSelectedJob(null);
  };

  const currentJobs = [
    {
      id: 1,
      title: "E-commerce Website Redesign",
      client: "FashionForward",
      status: "In Progress",
      dueDate: "Nov 15, 2024",
      statusColor: "bg-yellow-100 text-yellow-800",
      description: "Complete redesign of an existing e-commerce site to improve user experience and conversion rates. The project involves new wireframes, a modern visual design, and a responsive layout for mobile and desktop."
    }
  ];

  const groupJobs = [
    {
      id: 1,
      title: "Magazine for Fashion Blog",
      description: "Creating cool graphics for the online fashion blog",
      budget: "",
      members: 5,
      membersColor: "text-green-600"
    }
  ];

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
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Current Job</h2>
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
                      <tr key={job.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleOpenRightModal(job)}>
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Your group project</h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  Get back in your workspace
                </button>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {groupJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOpenGroupModal(job)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{job.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <DollarSign size={14} className="mr-1" />
                              {job.budget}
                            </div>
                            <div className={`font-medium ${job.membersColor}`}>
                              {job.members} Members
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

      <RightSideModal
        isOpen={isRightModalOpen}
        onClose={handleCloseModals}
        job={selectedJob}
      />

      <GroupSideModal
        isOpen={isGroupModalOpen}
        onClose={handleCloseModals}
        job={selectedJob}
      />
    </div>
  );
};

export default DashboardView;