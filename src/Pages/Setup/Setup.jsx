import React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, AlertCircle } from 'lucide-react'; // Added AlertCircle for error display

// Auto-expanding textarea component
const AutoExpandingTextarea = ({ value, onChange, placeholder, name, id, error }) => {
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
      className={`mt-1 block w-full border ${error ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm min-h-[100px] overflow-hidden`}
      placeholder={placeholder}
    />
  );
};

// Input field component with consistent styling
const FormInput = ({ label, id, name, value, onChange, placeholder, type = "text", error }) => {
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
        className={`w-full px-4 py-2 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 ease-in-out text-gray-700`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

const Setup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = location.state?.role || sessionStorage.getItem('userRole') || 'freelancer'; // Default to freelancer if not found

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    stateProvince: '',
    jobTitle: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(''); // New state for API errors
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator
  const [profileSaved, setProfileSaved] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false); // State for signup success alert

  const isFreelancer = userRole === 'freelancer';

  // Job title options for freelancers
  const jobTitleOptions = [
    'Web Developer', 'Mobile App Developer', 'UI/UX Designer', 'Graphic Designer',
    'Digital Marketing Specialist', 'Content Writer', 'Copywriter', 'SEO Specialist',
    'Social Media Manager', 'Video Editor', 'Photographer', 'Data Analyst',
    'Virtual Assistant', 'Translator', 'Voice Over Artist', 'Consultant',
    'Project Manager', 'Software Engineer', 'DevOps Engineer', 'Database Administrator',
    'Cybersecurity Specialist', 'AI/ML Engineer', 'Blockchain Developer', 'Game Developer',
    'WordPress Developer', 'E-commerce Specialist', 'Email Marketing Specialist',
    'PPC Specialist', 'Brand Designer', '3D Artist', 'Animation Specialist', 'Other'
  ];

  useEffect(() => {
    // Check if coming from signup with a success flag
    if (location.state?.showSuccessAlert) {
      setSignupSuccess(true);
      // Clear the alert after a few seconds
      const timer = setTimeout(() => {
        setSignupSuccess(false);
        // It's good practice to clear the state in location once used
        navigate(location.pathname, { replace: true, state: { ...location.state, showSuccessAlert: false } });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]);


const handleSubmit = async (e) => {
  e.preventDefault();
  setApiError(''); // Clear any previous API errors
  setErrors({}); // Clear previous client-side errors

  // Basic validation (ensure profileBio validation is removed if the field is also removed from UI/state)
  const newErrors = {};
  if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
  if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
  if (!formData.country.trim()) newErrors.country = 'Country is required';
  if (!formData.stateProvince.trim()) newErrors.stateProvince = 'State/Province is required';
  if (isFreelancer && !formData.jobTitle) newErrors.jobTitle = 'Job title is required';

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setIsLoading(true); // Start loading

  // --- JWT Authentication Check ---
  const jwtToken = localStorage.getItem('jwtToken'); // Get token from local storage
  if (!jwtToken) {
    setApiError('Authentication token missing. Please sign in again.');
    setIsLoading(false);
    navigate('/setup'); 
    return;
  }

  try {
    // Prepare the payload for the API
    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      country: formData.country,
      state_province: formData.stateProvince,
      role: userRole, // Send the user's role here
    };

    // Add job_title only if it's a freelancer
    if (isFreelancer) {
      payload.job_title = formData.jobTitle;
    }

    const response = await fetch('/api/profile_setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}` // Attach the JWT token
      },
      body: JSON.stringify(payload)
    });

    const data = await await response.json();

    if (!response.ok) {
  
      setApiError(data.description || 'Profile setup failed. Please try again.');
      return;
    }

    console.log('Profile setup successful:', data);

    // --- Success Logic ---
    if (userRole === 'freelancer') {
      setProfileSaved(true); // Show the "Start Interview" section
    } else {
      navigate('/dashboardcl'); // Navigate client to their dashboard
    }

  } catch (error) {
    console.error('Network or unexpected error during profile setup:', error);
    setApiError('An unexpected error occurred. Please check your internet connection.');
  } finally {
    setIsLoading(false); // Stop loading regardless of success or failure
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear API error if user starts typing after an API error
    if (apiError) {
      setApiError('');
    }
  };

  const startInterview = () => {
    navigate('/interview');
  };

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
          {/* Signup Success Alert */}
          {signupSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Your account has been created. Now, let's set up your profile.</span>
            </div>
          )}

          {/* API Error Display */}
          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center" role="alert">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="block sm:inline">{apiError}</span>
            </div>
          )}

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
                    error={errors.firstName} // Pass error prop
                  />

                  <FormInput
                    label="Last Name"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    error={errors.lastName} // Pass error prop
                  />

                  <FormInput
                    label="Country"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="United States"
                    error={errors.country} // Pass error prop
                  />

                  <FormInput
                    label="State/Province"
                    id="stateProvince"
                    name="stateProvince"
                    value={formData.stateProvince}
                    onChange={handleChange}
                    placeholder="California"
                    error={errors.stateProvince} // Pass error prop
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
                    <select
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      className={`block w-full pl-3 pr-3 py-2 border ${errors.jobTitle ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-dark basic-font`}
                    >
                      <option value="">Select Job Title</option>
                      {jobTitleOptions.map((title, index) => (
                        <option key={index} value={title}>
                          {title}
                        </option>
                      ))}
                    </select>
                    {errors.jobTitle && <p className="mt-2 text-sm text-red-600">{errors.jobTitle}</p>}
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
                  disabled={isLoading} // Disable button when loading
                >
                  {isLoading ? 'Saving Profile...' : (isFreelancer ? 'Save Profile Information' : 'Create Client Profile')}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-[#F4F6FB] p-4 sm:p-6 rounded-xl border border-green-100 text-center">
                <div className="flex justify-center mb-3 sm:mb-4 ">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 text-white" fill="#00d4d4" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 basic-font mb-2">Profile Information Saved!</h3>
                <p className="text-sm sm:text-base text-dark basic-font mb-4 sm:mb-6">
                  {isFreelancer
                    ? "Now let's complete a short interview to help us understand your experience and working style better."
                    : "Your client profile is complete! You can now start Browse freelancers and posting projects."
                  }
                </p>

                {isFreelancer ? (
                  <button
                    onClick={startInterview}
                    className="py-2 sm:py-3 px-6 sm:px-8 bg-cta hover:bg-[#00b5b5] text-white font-medium text-base sm:text-lg rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 animate-pulse basic-font"
                  >
                    Start Interview
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/dashboardcl')} // Direct clients to their dashboard
                    className="py-2 sm:py-3 px-6 sm:px-8 bg-cta hover:bg-[#00b5b5] text-white font-medium text-base sm:text-lg rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 basic-font"
                  >
                    Go to Dashboard
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Setup;