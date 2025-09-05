import React, { useState, useEffect } from 'react';

const AssociatedJobs = () => {
    // State to hold the project data and the loading status
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <div className="p-6 md:p-10 bg-gray-100 font-inter">
            <div className="max-w-6xl mx-auto">
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                    
                    {/* Jobs Section */}
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Associated Jobs</h3>
                    <div className="space-y-6">
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
                                    
                                    {/* Freelancers Section */}
                                    {job.employed_worker_info && job.employed_worker_info.length > 0 ? (
                                        <>
                                            <h4 className="text-md font-medium text-gray-600 mb-2">Assigned Freelancers:</h4>
                                            <ul className="space-y-2">
                                                {job.employed_worker_info.map(worker => (
                                                    <li key={worker.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200">
                                                        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                                            {worker.firstname ? worker.firstname.charAt(0).toUpperCase() : ''}{worker.lastname ? worker.lastname.charAt(0).toUpperCase() : ''}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{worker.firstname} {worker.lastname} ({worker.username || 'No Username'})</p>
                                                            <p className="text-sm text-gray-500">{worker.skill} - Expertise: {worker.expertise_score || 'N/A'}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <p className="text-gray-500">No freelancers assigned yet.</p>
                                    )}
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
