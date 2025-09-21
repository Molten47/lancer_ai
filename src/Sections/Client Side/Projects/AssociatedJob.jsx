import React, { useState, useEffect } from 'react';
import P2PChatComponent from '../Projects/IndividualChat'; // Adjust the import path as needed

const AssociatedJobs = () => {
    // State to hold the project data and the loading status
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Chat-related state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [clientId, setClientId] = useState(null);

    // useEffect hook to run the fetch operation when the component mounts
    useEffect(() => {
        const fetchProjects = async () => {
            // Placeholder for the real API endpoint and JWT token
            const API_URL = import.meta.env.VITE_API_URL; // Replace with your actual endpoint
            const token = localStorage.getItem('access_jwt'); // Replace with the user's actual JWT token

            try {
                const response = await fetch(`${API_URL}/api/projects`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Pass the JWT for authentication
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.well_received) {
                    // Assuming the data structure is as you provided
                    const projectKey = Object.keys(data.projects[0])[0];
                    const project = data.projects[0][projectKey];
                    setProjects([project]); // Store the single project in an array for consistent rendering
                    setClientId(project.client_id); // Set the client ID for chat
                } else {
                    setError('Failed to fetch projects.');
                }
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError('Could not fetch projects. Please check your network connection.');
            } finally {
                setLoading(false); // Set loading to false once the fetch is complete
            }
        };

        fetchProjects();
    }, []); // The empty array [] ensures this effect runs only once, like componentDidMount

    // Open chat with selected user
    const openChat = (user, userType) => {
        setSelectedUser({ 
            id: user.id,
            name: `${user.firstname} ${user.lastname}`,
            username: user.username,
            userType: userType 
        });
        setIsChatOpen(true);
    };

    // Close chat
    const closeChat = () => {
        setIsChatOpen(false);
        setSelectedUser(null);
    };

    // Render a loading state while fetching data
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-500 text-lg animate-pulse">Loading projects...</p>
            </div>
        );
    }

    // Render an error state if the fetch failed
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-red-500 text-lg">{error}</p>
            </div>
        );
    }
    
    // Check if the payload is valid and has projects after fetching
    if (!projects || projects.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-500">No projects found.</p>
            </div>
        );
    }

    const project = projects[0];

    // If chat is open, render the full-screen chat component
    if (isChatOpen && selectedUser && clientId) {
        return (
            <div className="min-h-screen bg-gray-100">
                {/* Chat Header with Back Button */}
                <div className="bg-white shadow-sm border-b px-4 py-3">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <button 
                            onClick={closeChat}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Back to Projects</span>
                        </button>
                        <h1 className="text-lg font-semibold text-gray-800">
                            Chat with {selectedUser.name}
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({selectedUser.userType === 'employed' ? 'Assigned Worker' : 'Potential Hire'})
                            </span>
                        </h1>
                    </div>
                </div>
                
                {/* Chat Component */}
                <div className="h-[calc(100vh-80px)]">
                    <P2PChatComponent
                        ownId={clientId}
                        recipientId={selectedUser.id}
                        recipientName={selectedUser.name}
                        chatType="human"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 font-inter overflow-auto relative">
            <div className="p-6 md:p-10 max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Projects & Jobs Dashboard</h1>

                <div className="bg-white shadow-lg rounded-xl p-6 mb-8 transform transition duration-300 hover:scale-[1.01]">
                    {/* Project Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{project.project_title}</h2>
                        <span className={`text-sm font-semibold uppercase px-3 py-1 rounded-full text-white ${project.status === 'ongoing' ? 'bg-blue-500' : 'bg-green-500'}`}>
                            {project.status}
                        </span>
                    </div>

                    {/* Project Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600 mb-6">
                        <div className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                            </svg>
                            <span>Start Date: {new Date(project.init_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Duration: {project.duration} months</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span>ID: {project.id}</span>
                        </div>
                    </div>
                    
                    {/* Jobs Section with Scrollable Container */}
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Associated Jobs</h3>
                    <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
                        {project.jobs && project.jobs.length > 0 ? (
                            project.jobs.map(job => (
                                <div key={job.id} className="bg-gray-50 rounded-lg p-5 shadow-inner border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-lg font-semibold text-gray-800">{job.title}</h4>
                                        <span className={`text-xs font-medium uppercase px-2 py-1 rounded-full text-white ${job.status === 'inactive' ? 'bg-red-500' : 'bg-green-500'}`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        <span className="font-medium">Metrics:</span> {job.metrics}
                                    </p>
                                    
                                    {/* Two-Row Grid Layout for Workers and Potential Hires */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Employed Workers Section */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <h5 className="text-md font-medium text-gray-700">Assigned Workers</h5>
                                                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                    {job.employed_worker_info ? job.employed_worker_info.length : 0}
                                                </span>
                                            </div>
                                            
                                            {job.employed_worker_info && job.employed_worker_info.length > 0 ? (
                                                <div className="max-h-32 overflow-y-auto space-y-2">
                                                    {job.employed_worker_info.map(worker => (
                                                        <div 
                                                            key={worker.id} 
                                                            className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-100 cursor-pointer hover:bg-green-50 hover:border-green-200 transition-all duration-200"
                                                            onClick={() => openChat(worker, 'employed')}
                                                        >
                                                            <div className="flex-shrink-0 w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
                                                                {worker.firstname ? worker.firstname.charAt(0).toUpperCase() : ''}{worker.lastname ? worker.lastname.charAt(0).toUpperCase() : ''}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-gray-800 text-sm truncate">{worker.firstname} {worker.lastname}</p>
                                                                <p className="text-xs text-gray-500 truncate">@{worker.username || 'No Username'}</p>
                                                                <p className="text-xs text-gray-600">{worker.skill} - Score: {worker.expertise_score || 'N/A'}</p>
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                    </svg>
                                                    <p className="text-gray-400 text-sm">No workers assigned yet</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Potential Hires Section */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                                <h5 className="text-md font-medium text-gray-700">Potential Hires</h5>
                                                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                    {job.potential_hire_info ? job.potential_hire_info.length : 0}
                                                </span>
                                            </div>
                                            
                                            {job.potential_hire_info && job.potential_hire_info.length > 0 ? (
                                                <div className="max-h-32 overflow-y-auto space-y-2">
                                                    {job.potential_hire_info.map(candidate => (
                                                        <div 
                                                            key={candidate.id} 
                                                            className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                                                            onClick={() => openChat(candidate, 'potential')}
                                                        >
                                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                                                                {candidate.firstname ? candidate.firstname.charAt(0).toUpperCase() : ''}{candidate.lastname ? candidate.lastname.charAt(0).toUpperCase() : ''}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-gray-800 text-sm truncate">{candidate.firstname} {candidate.lastname}</p>
                                                                <p className="text-xs text-gray-500 truncate">@{candidate.username || 'No Username'}</p>
                                                                <p className="text-xs text-gray-600">{candidate.skill} - Score: {candidate.expertise_score || 'N/A'}</p>
                                                                <p className="text-xs text-gray-500">{candidate.state}, {candidate.country}</p>
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                    <p className="text-gray-400 text-sm">No potential hires yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 mt-4">No jobs have been created for this project yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssociatedJobs;