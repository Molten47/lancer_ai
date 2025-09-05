import React, { useState } from 'react';
import { Star, Calendar, Clock, DollarSign, User, MapPin, Edit3, Eye, Bot } from 'lucide-react';
import RightSideModal from './RightSidemodal';
//import GroupSideModal from './GroupSideModal';
import AIAssistantModal from '../AIAssistantModal'; // Import the new modal component

const DashboardView = () => {
  const [isRightModalOpen, setIsRightModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isAIAssistantModalOpen, setIsAIAssistantModalOpen] = useState(false); // New state for AI modal
  const [selectedJob, setSelectedJob] = useState(null);

  // Function to open the RightSideModal with specific job data
  const handleOpenRightModal = (job) => {
    setSelectedJob(job);
    setIsRightModalOpen(true);
  };

  
  // New function to open the AI Assistant modal
  const handleOpenAIAssistantModal = () => {
    setIsAIAssistantModalOpen(true);
  };

  // Function to close all modals
  const handleCloseModals = () => {
    setIsRightModalOpen(false);
    setIsAIAssistantModalOpen(false); // Close AI modal
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
          </div>
        </div>
      </div>
      <RightSideModal
        isOpen={isRightModalOpen}
        onClose={handleCloseModals}
        job={selectedJob}
      />      
      {/* New AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIAssistantModalOpen}
        onClose={handleCloseModals}
      />
      {/* AI Assistant Icon - now outside the modal to be a global button */}
      <div className="absolute bottom-6 right-6 group">
        <div className='absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-1 group-hover:translate-y-0'>
          <div className='bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg relative whitespace-nowrap'>
            <p className='text-sm font-medium'>Hey! I'm your AI assistant</p>
            {/* Speech bubble tail */}
            <div className='absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-indigo-600'></div>
          </div>
        </div>
     
      </div>
    </div>
  );
};

export default DashboardView;