import React from 'react'
import Signup from './Components/Users/Signup'
import Signin from './Components/Return/signin'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          {/* Redirect to signup by default */}
          <Route path="/" element={<Navigate to="/signup" replace />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App