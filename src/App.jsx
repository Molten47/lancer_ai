import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Signup from './Components/New users/Signup';
import Signin from './Components/Platform Users/signin';
import Landhome from './Components/Landing Page/home';
import Setup from './Pages/Setup/Setup';
import Interview from './Pages/Interview/Interview';
import DashboardCl from './Pages/DashboardClient/DashboardCL';
import DashboardFr from './Pages/DashboardLancer/DashboardFr';
import LancerTaskPage from './Pages/TaskPage/Taskpage'



const App = () => {
 

    return (
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
                    <Route path='/freelancer-dashboard' element={<DashboardFr/>}/>
                    
                   
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
