import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const preprocessData = (data) => {
    if (!data || !data.projects || data.projects.length === 0) {
        return {
            projects: [],
            freelancers: []
        };
    }

    const projectsArray = data.projects.map(projectObj => {
        const key = Object.keys(projectObj)[0];
        return { ...projectObj[key] };
    });

    const freelancers = [];
    projectsArray.forEach(project => {
        project.jobs.forEach(job => {
            job.employed_worker_info.forEach(freelancer => {
                freelancers.push({
                    ...freelancer,
                    jobTitle: job.title
                });
            });
        });
    });

    return {
        projects: projectsArray,
        freelancers: freelancers
    };
};

// Function to calculate job status for the chart
const getJobStatusData = (jobs) => {
    if (!jobs) return [];
    const statusCounts = jobs.reduce((acc, job) => {
        const status = job.status.toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});
    return Object.keys(statusCounts).map(status => ({
        status,
        count: statusCounts[status]
    }));
};

const getUniqueFreelancers = (freelancers) => {
    const uniqueFreelancers = {};
    freelancers.forEach(f => {
        if (!uniqueFreelancers[f.id]) {
            uniqueFreelancers[f.id] = {
                ...f,
                jobsCount: 1
            };
        } else {
            uniqueFreelancers[f.id].jobsCount += 1;
        }
    });
    return Object.values(uniqueFreelancers);
};

export default function Analytics() {
    // State to hold the fetched data
    const [projectData, setProjectData] = useState([]);
    const [freelancerData, setFreelancerData] = useState([]);
    
    // State to handle loading and errors
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the authentication token
   

    // useEffect hook to fetch data when the component mounts
    useEffect(() => {
        const fetchData = async () => {

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('access_jwt');
            try {
                // Replace with your actual API endpoint URL
                const response = await fetch(`${API_URL}/api/projects`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }); 
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const rawData = await response.json();
                
                // Preprocess and set the fetched data
                const { projects, freelancers } = preprocessData(rawData);
                setProjectData(projects);
                setFreelancerData(freelancers);

                setIsLoading(false); // Set loading to false on success
            } catch (e) {
                console.error("Failed to fetch data:", e);
                setError(e.message); // Set the error message
                setIsLoading(false); // Set loading to false on error
            }
        };

        fetchData();
    }, []); // Re-run effect if the token changes

    const firstProject = projectData[0];
    const jobStatusChartData = firstProject ? getJobStatusData(firstProject.jobs) : [];
    const uniqueFreelancers = getUniqueFreelancers(freelancerData);

    // Conditional rendering based on state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-xl text-gray-700 font-semibold">Loading analytics data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 text-center p-4">
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-red-200">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-700">Failed to load data: {error}</p>
                    <p className="text-sm text-gray-500 mt-2">Please check the network connection and the API endpoint.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans p-6 md:p-10">
            <header className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Analytics Dashboard</h1>
                <p className="text-xl text-gray-500 mt-2">Insights for Client Projects & Freelancers</p>
            </header>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Project Overview Card */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Project Overview: <span className="font-bold">{firstProject?.project_title}</span></h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-gray-600 mb-2">
                                **Status:** <span className="font-medium text-blue-600">{firstProject?.status}</span>
                            </p>
                            <p className="text-gray-600 mb-2">
                                **Duration:** {firstProject?.duration} months
                            </p>
                            <p className="text-gray-600">
                                **Total Jobs:** {firstProject?.jobs?.length || 0}
                            </p>
                            <p className="text-sm italic text-gray-400 mt-4">
                                Data from all jobs within this project.
                            </p>
                        </div>
                        <div className="h-64 md:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={jobStatusChartData}>
                                    <XAxis dataKey="status" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#4f46e5" radius={[10, 10, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Freelancer Insights Card */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Freelancer Insights</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 rounded-xl">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Skill
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Expertise Score
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Jobs
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {uniqueFreelancers.map((freelancer) => (
                                    <tr key={freelancer.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {freelancer.firstname} {freelancer.lastname}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {freelancer.skill}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {freelancer.expertise_score || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {freelancer.jobsCount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Job Overview Card */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Job Overview</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 rounded-xl">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Job Title
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Freelancers Assigned
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {firstProject?.jobs?.map((job) => (
                                    <tr key={job.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {job.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.status === 'ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {job.employed_worker_info.length > 0 ? job.employed_worker_info.map(worker => worker.username).join(', ') : 'No freelancers'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
