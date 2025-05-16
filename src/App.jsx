import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Signup from './Components/Users/Signup';
import Signin from './Components/Return/signin';
import Landhome from './Components/LandHome/home';
import Essay from './Pages/Essay/Essay';
import Setup from './Pages/Setup/Setup';
import Interview from './Pages/Interview/Interview';
import DashboardCl from './Pages/DashboardClient/DashboardCL';
import DashboardFr from './Pages/DashboardLancer/DashboardFr';



const App = () => {
 

    return (
        <Router> 
        
            <div>
                <Routes>
                    <Route path="/" element={<Landhome />} /> 
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/signin" element={<Signin />} />
                    <Route path="/essay" element={<Essay/>} /> 
                    <Route path="/setup" element={<Setup/>} />
                    <Route path="/interview" element={<Interview/>}/>
                    <Route path="/dashboardcl" element={<DashboardCl/>}/>
                    <Route path='/freelancer-dashboard' element={<DashboardFr/>}/>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
