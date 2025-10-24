import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  LayoutDashboard, 
  List,
  Code,
  ShoppingCart,
  Utensils,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle,
  ChevronRight,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FullJobsDashboard from './FullJobsDashboard';

// Mock project data
const MOCK_PROJECTS = [
  {
    id: 1,
    title: 'E-commerce Operations',
    company: 'Fashion Boutique Inc.',
    description: 'End-to-end management of e-commerce operations including inventory, order processing customer service, payment systems, logistics, and...',
    price: 4500,
    duration: '3 - 4weeks',
    status: 'In Progress',
    progress: 65,
    teamMembers: [
      { id: 1, initials: 'SC', color: 'bg-pink-200' },
      { id: 2, initials: 'JL', color: 'bg-blue-200' },
      { id: 3, initials: 'MT', color: 'bg-green-200' }
    ]
  }
];

// Project Detail View
const ProjectDetailView = ({ project, onBack }) => {
  return (
    <div className="w-full bg-gray-50 overflow-y-auto">
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.title}</h1>
              <p className="text-sm text-gray-600">{project.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium text-blue-600">{project.status}</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-12 h-12 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h2>
              <p className="text-lg text-gray-600 mb-6">{project.company}</p>
              <p className="text-gray-600 leading-relaxed mb-8">{project.description}</p>
              
              {/* Key Details */}
              <div className="grid grid-cols-2 gap-6 py-6 border-y border-gray-200">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Budget</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${project.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Fixed price</p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Duration</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{project.duration}</p>
                  <p className="text-xs text-gray-500 mt-1">Estimated timeline</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Members</h3>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {project.teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`w-14 h-14 ${member.color} rounded-full border-4 border-white flex items-center justify-center text-sm font-semibold text-gray-700 shadow-sm`}
                    title={member.initials}
                  >
                    {member.initials}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{project.teamMembers.length} Team Members Assigned</p>
                <p className="text-xs text-gray-500 mt-1">Working on this project</p>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="border-t border-gray-200 mt-8 pt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
              <span className="text-2xl font-bold text-gray-900">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-3">On track for on-time completion</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
            Edit Project
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            View Full Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyProjectsState = () => {
  return (
    <div className="w-full h-full bg-[#F9FAFB] overflow-y-auto">
      <div className="w-[90%] px-6 py-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Jobs</h1>
            <p className="text-sm text-gray-600">Manage your jobs and track your progress.</p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[500px] bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <FileText className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="text-gray-500 text-base font-medium mb-2">
                Space is empty. Project card would render here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function ProjectsDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('tile');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showFullDashboard, setShowFullDashboard] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState(MOCK_PROJECTS);

  // Handle navigation to full job details
  const handleViewFullDetails = (project) => {
    setShowFullDashboard(true);
    setSelectedProject(project);
  };

  // Handle back from full dashboard
  const handleBackFromFullDashboard = () => {
    setShowFullDashboard(false);
    setSelectedProject(null);
  };

  // Filter projects
  useEffect(() => {
    let filtered = [...MOCK_PROJECTS];

    if (activeTab === 'active') {
      filtered = filtered.filter(p => p.status === 'Active' || p.status === 'In Progress');
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(p => p.status === 'Completed');
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  }, [activeTab, searchQuery]);

  // Show full dashboard if requested
  if (showFullDashboard && selectedProject) {
    return <FullJobsDashboard project={selectedProject} onBack={handleBackFromFullDashboard} />;
  }

  if (selectedProject) {
    return (
      <ProjectDetailView 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)} 
      />
    );
  }

  if (MOCK_PROJECTS.length === 0) {
    return <EmptyProjectsState />;
  }

  return (
    <div className="w-full h-full bg-[#F9FAFB] overflow-y-auto third-font">
      <div className="w-full px-6 py-6 pb-24">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Jobs</h1>
            <p className="text-sm text-gray-600">Manage your jobs and track your progress.</p>
          </div>
        </div>
        <section className='main-section rounded-lg h-[100vh] w-full bg-white'>
                 {/* Tabs and Controls */}
        <div className="bg-white mb-6 border-b-2 border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                  activeTab === 'all'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                All Job
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                  activeTab === 'active'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Active Job
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                  activeTab === 'completed'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Completed
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search Jobs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter size={18} className="text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode('tile')}
                className={`p-2 border rounded-lg transition-colors ${
                  viewMode === 'tile'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard size={18} className={viewMode === 'tile' ? 'text-blue-600' : 'text-gray-600'} />
              </button>
              <button
                onClick={() => setViewMode('line')}
                className={`p-2 border rounded-lg transition-colors ${
                  viewMode === 'line'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <List size={18} className={viewMode === 'line' ? 'text-blue-600' : 'text-gray-600'} />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12  bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500">No projects found</p>
          </div>
        ) : viewMode === 'tile' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex flex-row items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                    <Clock className="text-[#2255D7]" size={18}/>
                      <span className="text-xs font-medium text-[#2255D7]">{project.status}</span>
                    </div>
                  </div>

                  {/* Title and Company */}
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{project.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{project.company}</p>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-4"></div>

                  {/* Details and Team Members Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">${project.price.toLocaleString()}</span>
                        <span className="text-gray-500">fixed price</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-gray-600">Duration: {project.duration}</span>
                      </div>
                    </div>

                    {/* Team Members Avatars */}
                    <div className="flex -space-x-2">
                      {project.teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className={`w-8 h-8 ${member.color} rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700`}
                          title={member.initials}
                        >
                          {member.initials}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Progress</span>
                      <span className="text-sm font-semibold text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button - Right Aligned */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleViewFullDetails(project)}
                      className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Project Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Progress</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{project.title}</p>
                          <p className="text-xs text-gray-500">{project.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">${project.price.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{project.duration}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm text-blue-600 font-medium">{project.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewFullDetails(project)}
                        className="inline-flex items-center justify-center text- hover:text-blue-700 transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        </section>
 
      </div>
    </div>
  );
}