import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async'
import { connectSocket, disconnectSocket } from './Components/socket';
import Signup from './Components/New users/Signup';
import Signin from './Components/Platform Users/signin';
import Landhome from './Components/Landing Page/home';
import Setup from './Pages/Setup/Setup';
import Interview from './Pages/Interview/Interview';
import DashboardCl from './Pages/DashboardClient/DashboardCL';
import DashboardFr from './Pages/DashboardLancer/DashboardFr';
import LancerTaskPage from './Pages/TaskPage/Taskpage'
import ThreePanelWorkspace from './Sections/Client Side/Projects/ProjectDashboard';
import Interviewee from './Sections/Freelancer Side/Interview/jobInterview';
import ProjectDashboard from './Sections/Client Side/Projects/Projects';

const App = () => {
    const { auth } = useSelector(state => state.user);
    
    useEffect(() => {
        console.log('Auth state changed:', auth);
        
        if (auth.isAuthenticated && auth.user_id && auth.tokens.access) {
            console.log('Connecting socket for user:', auth.user_id);
            connectSocket();
        } else {
            console.log('Disconnecting socket - user not authenticated');
            disconnectSocket();
        }
        
        return () => {
            disconnectSocket();
        };
    }, [auth.isAuthenticated, auth.user_id, auth.tokens.access]);

    return (
        <HelmetProvider>
            <Router> 
                <div>
                    <Routes>
                        <Route path="/" element={<Landhome />} /> 
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/login" element={<Signin />} />
                        <Route path="/profile_setup" element={<Setup/>} />
                        <Route path="/interview" element={<Interview/>}/>
                        <Route path="/task" element={<LancerTaskPage/>}/>
                        <Route path="/client-dashboard" element={<DashboardCl/>}/>
                        <Route path="/job-interview" element={<Interviewee />} />
                        <Route path="/workspace" element={<ThreePanelWorkspace />} />
                        <Route path='/freelancer-dashboard' element={<DashboardFr/>}/>
                        <Route path='/full-project' element={<ProjectDashboard/>}/>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </Router>
        </HelmetProvider>
    );
};

export default App;