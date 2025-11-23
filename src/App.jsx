import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { setAuthData } from './store/userSlice';
import { initializeSocket, disconnectSocket, getConnectionStatus, isSocketConnected, isSocketConnecting } from './Components/socket';
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
    
    // ✅ NEW: Refs to prevent race conditions
    const socketInitPromiseRef = useRef(null);
    const isInitializingRef = useRef(false);
    const initTimeoutRef = useRef(null);
    const lastAuthStateRef = useRef(null);
    
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
    
    // ✅ FIXED: Debounced socket initialization with race condition prevention
    useEffect(() => {
        // Create a stable auth state identifier
        const currentAuthState = {
            isAuthenticated: auth.isAuthenticated,
            userId: auth.user_id,
            hasToken: !!auth.tokens.access
        };
        
        const authStateKey = JSON.stringify(currentAuthState);
        const lastAuthStateKey = JSON.stringify(lastAuthStateRef.current || {});
        
        // Skip if auth state hasn't actually changed
        if (authStateKey === lastAuthStateKey) {
            console.log('⏭️ Auth state unchanged, skipping socket initialization');
            return;
        }
        
        console.log('🔄 Auth state changed:', currentAuthState);
        lastAuthStateRef.current = currentAuthState;
        
        // Clear any pending initialization timeout
        if (initTimeoutRef.current) {
            console.log('🧹 Clearing pending initialization timeout');
            clearTimeout(initTimeoutRef.current);
            initTimeoutRef.current = null;
        }
        
        // Case 1: User is authenticated - initialize socket
        if (auth.isAuthenticated && auth.user_id && auth.tokens.access) {
            console.log('✅ User authenticated, scheduling socket initialization');
            
            // Debounce initialization by 100ms to handle rapid state changes
            initTimeoutRef.current = setTimeout(() => {
                initTimeoutRef.current = null;
                
                // Check if already connected or connecting
                if (isSocketConnected()) {
                    console.log('✅ Socket already connected');
                    setSocketInitialized(true);
                    return;
                }
                
                if (isSocketConnecting() || isInitializingRef.current) {
                    console.log('⏳ Socket initialization already in progress');
                    
                    // Wait for existing promise if available
                    if (socketInitPromiseRef.current) {
                        socketInitPromiseRef.current
                            .then(() => {
                                console.log('✅ Existing socket initialization completed');
                                setSocketInitialized(true);
                            })
                            .catch((error) => {
                                console.error('❌ Existing socket initialization failed:', error);
                                setSocketInitialized(false);
                            });
                    }
                    return;
                }
                
                console.log('🔌 Starting socket initialization for user:', auth.user_id);
                isInitializingRef.current = true;
                
                // Store the promise to prevent duplicate calls
                socketInitPromiseRef.current = initializeSocket()
                    .then(() => {
                        console.log('✅ Socket initialized successfully');
                        setSocketInitialized(true);
                        isInitializingRef.current = false;
                        
                        // Log connection status
                        const status = getConnectionStatus();
                        console.log('📊 Socket status:', status);
                        
                        socketInitPromiseRef.current = null;
                    })
                    .catch((error) => {
                        console.error('❌ Socket initialization failed:', error);
                        setSocketInitialized(false);
                        isInitializingRef.current = false;
                        socketInitPromiseRef.current = null;
                        
                        // Optional: Retry logic
                        console.log('🔄 Will retry socket initialization in 3s...');
                        setTimeout(() => {
                            if (auth.isAuthenticated && auth.user_id) {
                                console.log('🔄 Retrying socket initialization');
                                isInitializingRef.current = false;
                                socketInitPromiseRef.current = null;
                                // Trigger re-initialization by updating a dummy state
                                lastAuthStateRef.current = null;
                            }
                        }, 3000);
                    });
            }, 100); // 100ms debounce
        } 
        // Case 2: User is NOT authenticated - disconnect socket
        else {
            console.log('❌ User not authenticated, disconnecting socket');
            
            // Cancel any pending initialization
            if (socketInitPromiseRef.current) {
                console.log('🛑 Cancelling pending socket initialization');
                socketInitPromiseRef.current = null;
            }
            
            isInitializingRef.current = false;
            disconnectSocket();
            setSocketInitialized(false);
        }
        
        // Cleanup function
        return () => {
            if (initTimeoutRef.current) {
                console.log('🧹 Cleanup: Clearing initialization timeout');
                clearTimeout(initTimeoutRef.current);
                initTimeoutRef.current = null;
            }
        };
    }, [auth.isAuthenticated, auth.user_id, auth.tokens.access]);
    
    // ✅ NEW: Separate cleanup effect for app unmount
    useEffect(() => {
        return () => {
            console.log('🧹 App unmounting - final cleanup');
            
            // Clear timeout
            if (initTimeoutRef.current) {
                clearTimeout(initTimeoutRef.current);
            }
            
            // Disconnect socket
            disconnectSocket();
            
            // Clear refs
            socketInitPromiseRef.current = null;
            isInitializingRef.current = false;
            lastAuthStateRef.current = null;
        };
    }, []); // Run only on unmount

    // ✅ IMPROVED: Visibility change handler with better checks
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && auth.isAuthenticated) {
                console.log('👁️ Tab became visible, checking socket connection...');
                
                // Prevent race condition - don't reconnect if already initializing
                if (isInitializingRef.current || socketInitPromiseRef.current) {
                    console.log('⏳ Socket initialization in progress, skipping reconnect');
                    return;
                }
                
                const status = getConnectionStatus();
                console.log('📊 Socket status on visibility:', status);
                
                if (!status.isConnected && !status.isConnecting) {
                    console.log('🔄 Socket disconnected while away, reinitializing...');
                    
                    // Reset the last auth state to trigger reinitialization
                    lastAuthStateRef.current = null;
                    isInitializingRef.current = false;
                    socketInitPromiseRef.current = null;
                    
                    // Small delay to avoid collision with other effects
                    setTimeout(() => {
                        if (!isSocketConnected() && !isInitializingRef.current) {
                            initializeSocket()
                                .then(() => {
                                    console.log('✅ Socket reconnected on visibility change');
                                    setSocketInitialized(true);
                                })
                                .catch(err => {
                                    console.error('❌ Failed to reconnect on visibility change:', err);
                                    setSocketInitialized(false);
                                });
                        }
                    }, 200);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [auth.isAuthenticated]);
    
    // ✅ NEW: Optional debug logging effect
    useEffect(() => {
        const interval = setInterval(() => {
            const status = getConnectionStatus();
            console.log('🔍 Periodic status check:', {
                socketInitialized,
                isInitializing: isInitializingRef.current,
                hasPendingPromise: !!socketInitPromiseRef.current,
                connectionStatus: status
            });
        }, 10000); // Every 10 seconds
        
        return () => clearInterval(interval);
    }, [socketInitialized]);

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