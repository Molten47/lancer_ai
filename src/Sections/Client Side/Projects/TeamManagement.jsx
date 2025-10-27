import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, UserPlus, Mail } from 'lucide-react';

const TeamManagementDashboard = ({ project = null }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [potentialHires, setPotentialHires] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (project) {
      setProjectData(project);
      setError(null);
      processProjectData(project);
    } else {
      setError('No project data provided');
    }
  }, [project]);

  const processProjectData = (data) => {
    if (!data || !data.jobs) return;

    // Extract employed workers (current team members)
    const employed = [];
    const potential = [];

    data.jobs.forEach(job => {
      // Add employed workers with job info
      job.employed_worker_info?.forEach(worker => {
        const existingMember = employed.find(m => m.id === worker.id);
        if (existingMember) {
          existingMember.tasks += 1;
          existingMember.jobTitles.push(job.title);
        } else {
          employed.push({
            ...worker,
            tasks: 1,
            jobTitles: [job.title],
            role: job.title,
            status: Math.random() > 0.3 ? 'Online' : 'Offline'
          });
        }
      });

      // Add potential hires with job info
      job.potential_hire_info?.forEach(hire => {
        const existingHire = potential.find(h => h.id === hire.id);
        if (!existingHire) {
          potential.push({
            ...hire,
            jobTitle: job.title,
            matchScore: hire.expertise_score ? Math.round(hire.expertise_score * 10) : 85
          });
        }
      });
    });

    setTeamMembers(employed);
    setPotentialHires(potential);
  };

  const getInitials = (firstname, lastname) => {
    const first = firstname?.[0]?.toUpperCase() || '';
    const last = lastname?.[0]?.toUpperCase() || '';
    return `${first}${last}`;
  };

  const getSkillTags = (skill) => {
    const skillMap = {
      'graphics designer': ['Content Strategy', 'SEO', 'Social Media'],
      'seo expert': ['Data Visualization', 'SQL', 'Business Intelligence'],
      'content writer': ['Content Strategy', 'Copywriting', 'SEO'],
      'web developer': ['React', 'Node.js', 'TypeScript'],
      'data analyst': ['Data Visualization', 'SQL', 'Business Intelligence']
    };
    return skillMap[skill?.toLowerCase()] || ['Design', 'Marketing', 'Strategy'];
  };

  const handleAddToTeam = (hire) => {
    console.log('Adding to team:', hire);
    // Add your logic here
  };

  const handleInvite = (hire) => {
    console.log('Inviting:', hire);
    // Add your logic here
  };

  const handleMessage = (member) => {
    console.log('Message:', member);
    // Add your logic here
  };

  const handleDelete = (member) => {
    console.log('Delete:', member);
    // Add your logic here
  };

  if (error || !projectData) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 overflow-y-auto third-font">
      <div className="w-full px-8 py-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
          
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus size={18} />
            Add Team Member
          </button>
        </div>

        {/* Current Team Members */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Current Team</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {getInitials(member.firstname, member.lastname)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {member.firstname} {member.lastname}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-700">{member.role}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-700">{member.tasks} assigned</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          member.status === 'Online'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleMessage(member)}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                        >
                          <MessageSquare size={16} />
                          Message
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDelete(member)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No team members yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Potential Hires */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Potential Hire</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {potentialHires.length > 0 ? (
              potentialHires.map((hire) => (
                <div key={hire.id} className="bg-white border border-[#E5E7EB] rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#7E22CE] font-bold text-lg flex-shrink-0">
                      {getInitials(hire.firstname, hire.lastname)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {hire.firstname} {hire.lastname}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{hire.jobTitle}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {getSkillTags(hire.skill).map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-start gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-600">Match score:</span>
                      <span className="text-xs font-bold text-gray-900">{hire.matchScore}%</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToTeam(hire)}
                      className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Add to Team
                    </button>
                    <button
                      onClick={() => handleInvite(hire)}
                      className="px-4 py-2 bg-white border border-[#E5E7EB] text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                    >
                      Invite
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                No potential hires available
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default TeamManagementDashboard;