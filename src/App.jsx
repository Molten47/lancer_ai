import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { setAuthData } from './store/userSlice';
import { initializeSocket, disconnectSocket, getConnectionStatus } from './Components/socket';
import Signup from './Components/New users/Signup';
import Signin from './Components/Platform Users/signin';
import Landhome from './Components/Landing Page/home';
import Setup from './Pages/Setup/Setup';
import Interview from './Pages/Interview/Interview';
import DashboardCl from './Pages/DashboardClient/DashboardCL';
import DashboardFr from './Pages/DashboardLancer/DashboardFr';
import LancerTaskPage from './Pages/TaskPage/Taskpage';
import ClientAssistant from './Sections/Client Side/Client Assistant/DashboardClient';
import Interviewee from './Sections/Freelancer Side/Interview/jobInterview';
import ProjectDashboard from './Sections/Client Side/Projects/Projects';
import AssistantModal from './Sections/Client Side/Client Assistant/AssistantModal';

const App = () => {
    const dispatch = useDispatch();
    const { auth } = useSelector(state => state.user);
    const [socketInitialized, setSocketInitialized] = useState(false);
    
    // ✅ CHANGE #1: Rehydrate Redux from localStorage on mount
    // This runs ONCE when app loads and syncs localStorage auth data to Redux
    useEffect(() => {
        console.log('🚀 App mounted - Rehydrating auth from localStorage');
        
        const accessToken = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_jwt') || localStorage.getItem('refresh_token');
        const userId = localStorage.getItem('user_id');

        if (accessToken && userId) {
            console.log('✅ Found auth data in localStorage, updating Redux');
            dispatch(setAuthData({
                user_id: userId,
                tokens: {
                    access: accessToken,
                    refresh: refreshToken
                },
                isAuthenticated: true
            }));
        } else {
            console.log('ℹ️ No auth data in localStorage');
        }
    }, []); // Run ONCE on mount
    
    // FIXED: Initialize socket when auth is ready
    useEffect(() => {
        console.log('Auth state changed:', {
            isAuthenticated: auth.isAuthenticated,
            userId: auth.user_id,
            hasToken: !!auth.tokens.access
        });
        
        if (auth.isAuthenticated && auth.user_id && auth.tokens.access) {
            console.log('🔌 Initializing socket for user:', auth.user_id);
            
            initializeSocket()
                .then(() => {
                    console.log('✅ Socket initialized successfully');
                    setSocketInitialized(true);
                    
                    // Log connection status
                    const status = getConnectionStatus();
                    console.log('Socket status:', status);
                })
                .catch((error) => {
                    console.error('❌ Socket initialization failed:', error);
                    setSocketInitialized(false);
                });
        } else {
            console.log('🔌 Disconnecting socket - user not authenticated');
            disconnectSocket();
            setSocketInitialized(false);
        }
        
        // Cleanup on unmount
        return () => {
            console.log('🧹 App unmounting - cleaning up socket');
            disconnectSocket();
        };
    }, [auth.isAuthenticated, auth.user_id, auth.tokens.access]);

    // OPTIONAL: Add visibility change handler for reconnection on tab focus
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && auth.isAuthenticated) {
                console.log('👁️ Tab became visible, checking socket connection...');
                const status = getConnectionStatus();
                
                if (!status.isConnected && !status.isConnecting) {
                    console.log('🔄 Socket disconnected while away, reinitializing...');
                    initializeSocket().catch(err => {
                        console.error('Failed to reconnect on visibility change:', err);
                    });
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [auth.isAuthenticated]);

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
                        <Route path="/client-assistant" element={<ClientAssistant />} />
                        <Route path="/assistant-modal" element={<AssistantModal />} />
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