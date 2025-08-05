import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Signup from './Components/Users/Signup';
import Signin from './Components/Return/signin';
import Landhome from './Components/LandHome/home';
import Setup from './Pages/Setup/Setup';
import Interview from './Pages/Interview/Interview';
import DashboardCl from './Pages/DashboardClient/DashboardCL';
import DashboardFr from './Pages/DashboardLancer/DashboardFr';
import LancerTaskPage from './Pages/TaskPage/Taskpage'


const App = () => {
 

    return (
        <Router basename='/lancer_ai'> 
        
            <div>
                <Routes>
                    <Route path="/" element={<Landhome />} /> 
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/signin" element={<Signin />} />
                    <Route path="/setup" element={<Setup/>} />
                    <Route path="/interview" element={<Interview/>}/>
                    <Route path="/tasks" element={<LancerTaskPage/>}/>
                    <Route path="/dashboardcl" element={<DashboardCl/>}/>
                    <Route path='/freelancer-dashboard' element={<DashboardFr/>}/>
                    


                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
