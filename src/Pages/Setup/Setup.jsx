import React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Auto-expanding textarea component
const AutoExpandingTextarea = ({ value, onChange, placeholder, name, id }) => {
  const textareaRef = useRef(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to get proper scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set new height based on scrollHeight
      textareaRef.current.style.height = `${Math.max(100, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);
  
  return (
    <textarea
      ref={textareaRef}
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm min-h-[100px] overflow-hidden"
      placeholder={placeholder}
    />
  );
};

// Input field component with consistent styling
const FormInput = ({ label, id, name, value, onChange, placeholder, type = "text" }) => {
  return (
    <div className="flex-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 ease-in-out text-gray-700"
      />
    </div>
  );
};

const Setup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    stateProvince: '',
    profileBio: '',
    jobTitle: '',
  });
  
  const [profileSaved, setProfileSaved] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = location.state?.role || sessionStorage.getItem('userRole') || 'freelancer';

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    
    // Save the form data (in a real app, this would go to a database)
    sessionStorage.setItem('profileData', JSON.stringify(formData));
    
    if (userRole === 'freelancer') {
      // Instead of redirecting, show the interview button
      setProfileSaved(true);
    } else {
      navigate('/client-profile');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startInterview = () => {
    navigate('/interview');
  };

  const isFreelancer = userRole === 'freelancer';
  
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white flex justify-center items-center py-6 px-4 sm:py-12 sm:px-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header with conditional styling based on role */}
        <div className={`px-4 py-5 sm:px-8 sm:py-6 ${isFreelancer ? 'bg-light' : 'bg-light'}`}>
          <h2 className="text-2xl sm:text-3xl font-bold basic-font primary">
            {isFreelancer ? "Freelancer Profile Setup" : "Client Profile Setup"}
          </h2>
          <p className="mt-2 text-base sm:text-lg opacity-90 basic-font primary">
            {isFreelancer 
              ? "Complete your profile to start finding opportunities" 
              : "Tell us about yourself to connect with talented freelancers"}
          </p>
        </div>
        
        {/* Form content */}
        <div className="p-4 sm:p-8">
          {!profileSaved ? (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Basic info section */}
              <div className="bg-light p-4 sm:p-5 rounded-lg border border-gray-100">
                <h3 className="text-base sm:text-lg font-medium text-gray-800 basic-font mb-3 sm:mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:gap-5">
                  <FormInput 
                    label="First Name"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                  />
                  
                  <FormInput 
                    label="Last Name"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                  />
                
                  <FormInput 
                    label="Country"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="United States"
                  />
                  
                  <FormInput 
                    label="State/Province"
                    id="stateProvince"
                    name="stateProvince"
                    value={formData.stateProvince}
                    onChange={handleChange}
                    placeholder="California"
                  />
                </div>
              </div>
              
              {/* Conditional freelancer section */}
              {isFreelancer && (
                <div className="bg-light p-4 sm:p-5 rounded-lg border border-indigo-100">
                  <h3 className="text-base sm:text-lg font-medium text-dark mb-3 sm:mb-4 basic-font">Professional Details</h3>
                  
                  <div className="mb-4 sm:mb-5">
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1 basic-font">
                      Job Title
                    </label>
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      placeholder="e.g. Senior Graphics Designer"
                      className="w-full px-4 py-2 border border-indigo-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all duration-200 ease-in-out text-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="profileBio" className="block text-sm font-medium basic-font text-gray-700 mb-1">
                      Professional Bio
                    </label>
                    <AutoExpandingTextarea
                      id="profileBio"
                      name="profileBio"
                      value={formData.profileBio}
                      onChange={handleChange}
                      placeholder="Describe your skills, experience, and what you're looking for in your next opportunity..."
                    />
                    <p className="text-xs text-gray-500 mt-1">This bio will be visible to potential clients</p>
                  </div>
                </div>
              )}
              
              {/* Client-specific section if needed */}
              {!isFreelancer && (
                <div className="bg-teal-50 p-4 sm:p-5 rounded-lg border border-teal-100">
                  <h3 className="text-base sm:text-lg font-medium basic-font text-teal-800 mb-3 sm:mb-4">Looking For Talent</h3>
                  <p className="text-sm text-gray-600 basic-font">
                    As a client, you'll be able to browse profiles, post projects, and connect with skilled freelancers after completing your profile.
                  </p>
                </div>
              )}
              
              {/* Submit button */}
              <div className="pt-2 sm:pt-4">
                <button
                  type="submit"
                  className={`w-full py-2 sm:py-3 px-4 sm:px-6 text-white font-medium text-base sm:text-lg rounded-lg shadow-md transition-all duration-300 ease-in-out ${
                    isFreelancer 
                      ? 'bg-cta hover:bg-[#00b5b5] basic-font focus:ring-indigo-500' 
                      : 'bg-cta hover:bg-[#00b5b5] basic-font focus:ring-teal-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  {isFreelancer ? 'Save Profile Information' : 'Create Client Profile'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-green-50 p-4 sm:p-6 rounded-xl border border-green-100 text-center">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 basic-font mb-2">Profile Information Saved!</h3>
                <p className="text-sm sm:text-base text-gray-600 basic-font mb-4 sm:mb-6">
                  Now let's complete a short interview to help us understand your experience and working style better.
                </p>
                
                <button
                  onClick={startInterview}
                  className="py-2 sm:py-3 px-6 sm:px-8 bg-cta hover:bg-[#00b5b5] text-white font-medium text-base sm:text-lg rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 animate-pulse"
                >
                  Start Interview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Setup;