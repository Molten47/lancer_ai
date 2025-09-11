import React, { useState, useEffect } from 'react';
import { Star, Calendar, Clock, DollarSign, User, MapPin, Edit3, Eye, Bot } from 'lucide-react';

const DashboardView = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const VITE_API_URL = import.meta.env.VITE_API_URL;

  const StarRating = ({ rating, maxRating = 10 }) => {
    // StarRating component logic...
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

  const handleOpenRightModal = (job) => {
    setSelectedJob(job);
    // This function would likely set state for a modal to become visible
  };

  const calculateDueDate = (initDate, duration) => {
    if (!initDate || !duration) return 'N/A';
    const initialDate = new Date(initDate);
    initialDate.setDate(initialDate.getDate() + duration);
    return initialDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('access_jwt');
        if (!token) {
          throw new Error('Authentication token not found.');
        }

        const response = await fetch(`${VITE_API_URL}/api/jobs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        if (data.well_received && data.jobs) {
          setJobs(data.jobs);
          setError(null);
        } else {
          throw new Error('API response format is incorrect.');
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [VITE_API_URL]);

  const formattedJobs = jobs.map(job => {
    const statusColor = job.status === 'inactive'
      ? 'bg-green-100 text-green-800' // Past jobs
      : 'bg-blue-100 text-blue-800'; // Current/active jobs

    const dueDate = calculateDueDate(job.init_date, job.duration);

    return {
      ...job,
      statusColor,
      dueDate,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">My Jobs</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">Loading jobs...</td></tr>
                    ) : error ? (
                      <tr><td colSpan="4" className="px-6 py-4 text-center text-red-500">Error: {error}</td></tr>
                    ) : formattedJobs.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No jobs found.</td></tr>
                    ) : (
                      formattedJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleOpenRightModal(job)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{job.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User size={16} className="text-gray-400 mr-2" />
                              <div className="text-sm text-gray-600">{job.client_id}</div>
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
                      ))
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
</div>
  );
};

export default DashboardView;