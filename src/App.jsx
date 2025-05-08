import React from 'react'
import Signup from './Components/Users/Signup'
import Signin from './Components/Return/signin'
import Landhome from './Components/LandHome/home'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'


const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Landhome/>}/>
          <Route path="/signin" element={<Signin />} />
          {/* Redirect to signup by default */}
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App