import React, { useState, useEffect } from "react";
import { Check, AlertCircle, Loader2, Plus, X, Globe, Building } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom'; // Add useLocation and useNavigate

// Input field component with consistent styling
const FormInput = ({ label, id, name, value, onChange, placeholder, type = "text", error, className = "" }) => {
  return (
    <div className={`flex-1 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 basic-font">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border ${error ? 'border-red-300' : 'border-gray-200'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out text-gray-700 bg-white`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Select component for dropdowns
const FormSelect = ({ label, id, name, value, onChange, options, placeholder, error, icon }) => {
  return (
    <div className="flex-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 basic-font">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 border ${error ? 'border-red-300' : 'border-gray-200'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out text-gray-700 bg-white appearance-none`}
        >
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Skills input component
const SkillsInput = ({ skills, onAddSkill, onRemoveSkill, error }) => {
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onAddSkill(newSkill.trim());
      setNewSkill('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="col-span-2 basic-font">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Skills
      </label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add your skills (e.g., JavaScript, Graphic Design)"
          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out text-gray-700 bg-white"
        />
        <button
          type="button"
          onClick={handleAddSkill}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {skill}
              <button
                type="button"
                onClick={() => onRemoveSkill(skill)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

const Setup = () => {
  const location = useLocation(); // Access navigation state
  const navigate = useNavigate(); // Add navigation hook
  // Initialize selectedRole based on the role from Signup (convert to lowercase to match expected values)
  const initialRole = location.state?.role?.toLowerCase() === 'client' ? 'client' : 'freelancer';
  const [selectedRole] = useState(initialRole); // Remove setSelectedRole since we don't want to change it
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    country: '',
    state: '',
    skills: [],
    // Client-specific fields
    companyName: '',
    industry: '',
  });
  const [countryData, setCountryData] = useState({});
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(location.state?.showSuccessAlert || false); // Use showSuccessAlert from state

  const isFreelancer = selectedRole === 'freelancer';
  const countries = Object.keys(countryData);
  const availableStates = formData.country ? countryData[formData.country] || [] : [];

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Marketing & Advertising",
    "E-commerce",
    "Manufacturing",
    "Real Estate",
    "Consulting",
    "Media & Entertainment",
    "Non-profit",
    "Government",
    "Automotive",
    "Food & Beverage",
    "Travel & Tourism",
    "Energy",
    "Construction",
    "Fashion",
    "Sports & Recreation",
    "Other"
  ];

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        setDataLoading(true);
        setCountryData({
          "United States": ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
          "Canada": ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"],
          "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
          "Australia": ["New South Wales", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia", "Australian Capital Territory", "Northern Territory"],
          "Germany": ["Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"],
          "France": ["Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Brittany", "Centre-Val de Loire", "Corsica", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandy", "Nouvelle-Aquitaine", "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur"]
        });
      } catch (error) {
        console.error('Error setting up country data:', error);
        setDataError('Failed to load country and state data.');
      } finally {
        setDataLoading(false);
      }
    };
    fetchCountryData();
  }, []);

  useEffect(() => {
    console.log('Saving form data:', formData, 'Role:', selectedRole);
  }, [formData, selectedRole]);

  useEffect(() => {
    if (formData.country && !availableStates.includes(formData.state)) {
      setFormData(prev => ({ ...prev, state: '' }));
    }
  }, [formData.country, formData.state, availableStates]);

  useEffect(() => {
    if (signupSuccess) {
      const timer = setTimeout(() => {
        setSignupSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [signupSuccess]);

// 
const handleSubmit = async (e) => {
  e.preventDefault();
  setApiError('');
  setErrors({});

  const newErrors = {};
  if (!formData.firstname.trim()) newErrors.firstname = 'First name is required';
  if (!formData.lastname.trim()) newErrors.lastname = 'Last name is required';
  if (!formData.country.trim()) newErrors.country = 'Country is required';
  if (!formData.state.trim()) newErrors.state = 'State/Province is required';
  if (isFreelancer && formData.skills.length === 0) newErrors.skills = 'At least one skill is required';
  if (!isFreelancer && !formData.industry.trim()) newErrors.industry = 'Industry is required';

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setIsLoading(true);

  try {
    // Get the access token from localStorage
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setApiError('Authentication token not found. Please sign in again.');
      navigate('/signin');
      return;
    }

    // Prepare the request body according to API specification
    const requestBody = {
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      country: formData.country,
      state: formData.state,
      // Convert skills array to comma-separated string for API
      skill: isFreelancer ? formData.skills.join(', ') : formData.industry
    };

    // API call to the backend profile setup endpoint
    const response = await fetch('https://lancer-web-service.onrender.com/api/profile_setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}` // Include JWT token
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle error response (likely 401 for invalid token or 400 for validation)
      setApiError(data.error_message || 'Profile setup failed. Please try again.');
      
      // If token is invalid, redirect to signin
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userRole');
        navigate('/signin');
      }
      return;
    }

    // If profile setup is successful (200 OK)
    console.log('Profile setup successful:', data);
    
    // Store profile completion status
    localStorage.setItem('profileCompleted', 'true');
    
    if (selectedRole === 'freelancer') {
      setProfileSaved(true);
    } else {
      // Navigate directly to dashboard for clients
      navigate('/client-dashboard', { 
        state: { 
          profileCompleted: true,
          userRole: 'client',
          userName: `${formData.firstname} ${formData.lastname}`
        }
      });
    }
  } catch (error) {
    console.error('Network or unexpected error during profile setup:', error);
    setApiError('An unexpected error occurred. Please check your internet connection.');
  } finally {
    setIsLoading(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleAddSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, skill]
    }));
    if (errors.skills) {
      setErrors(prev => ({ ...prev, skills: '' }));
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const startInterview = () => {
    // Navigate to tasks page after interview completion
    navigate('/interview', { 
      state: { 
        profileCompleted: true,
        interviewCompleted: true,
        userRole: 'freelancer',
        userName: `${formData.firstname} ${formData.lastname}`,
        skills: formData.skills
      }
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex justify-center items-center py-6 px-4 sm:py-12 sm:px-6 basic-font">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 py-8 text-blue-600">
          <h1 className="text-3xl font-bold mb-2">Complete Your {isFreelancer ? 'Freelancer' : 'Client'} Profile</h1>
          <p className="text-gray-700 text-lg">
            {isFreelancer 
              ? "Tell us about yourself so we can match you with the right opportunities"
              : "Tell us about yourself so we can help you find the right freelancers"
            }
          </p>
        </div>

        {/* Role indicator - shows current role but doesn't allow switching */}
        <div className="px-8 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-600 mr-3">Setting up profile as:</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isFreelancer 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {isFreelancer ? 'Freelancer' : 'Client'}
            </span>
          </div>
        </div>

        <div className="p-8">
          {signupSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-2" />
                <div>
                  <strong className="font-semibold">Success!</strong>
                  <span className="block sm:inline"> Your account has been created. Now, let's set up your profile.</span>
                </div>
              </div>
            </div>
          )}

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg relative mb-6 flex items-center" role="alert">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {dataError && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg relative mb-6 flex items-center" role="alert">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{dataError}</span>
            </div>
          )}

          {dataLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
              <span className="ml-2 text-gray-700">Loading country and state data...</span>
            </div>
          ) : (
            !profileSaved ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-8">
                  <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Basic Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                    <FormInput
                      label="First Name"
                      id="firstname"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      placeholder="John"
                      error={errors.firstname}
                    />

                    <FormInput
                      label="Last Name"
                      id="lastname"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      placeholder="Doe"
                      error={errors.lastname}
                    />

                    {!isFreelancer && (
                      <>
                        <FormInput
                          label="Company Name (Optional)"
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Your Company"
                          error={errors.companyName}
                        />

                        <FormSelect
                          label="Industry"
                          id="industry"
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                          options={industries}
                          placeholder="Select your industry"
                          error={errors.industry}
                          icon={<Building className="h-5 w-5 text-gray-400" />}
                        />
                      </>
                    )}

                    <FormSelect
                      label="Country"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      options={countries}
                      placeholder="Select a country"
                      error={errors.country}
                      icon={<Globe className="h-5 w-5 text-gray-400" />}
                    />

                    <FormSelect
                      label="State/Province"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      options={availableStates}
                      placeholder="Select a state"
                      error={errors.state}
                    />
                  </div>
                </div>

                {isFreelancer && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Professional Skills
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <SkillsInput
                        skills={formData.skills}
                        onAddSkill={handleAddSkill}
                        onRemoveSkill={handleRemoveSkill}
                        error={errors.skills}
                      />
                    </div>
                  </div>
                )}

                {!isFreelancer && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Looking For Talent
                    </h2>
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        As a client, you'll be able to browse profiles, post projects, and connect with skilled freelancers after completing your profile.
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Saving Profile...
                      </div>
                    ) : (
                      `Continue to ${isFreelancer ? 'Interview' : 'Dashboard'}`
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="bg-green-50 p-8 rounded-xl border border-green-200">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Profile Information Saved!</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {isFreelancer
                      ? "Now let's complete a short interview to help us understand your experience and working style better."
                      : "Your client profile is complete! You can now start browsing freelancers and posting projects."
                    }
                  </p>

                  <button
                    onClick={isFreelancer ? startInterview : () => alert('Redirecting to client dashboard...')}
                    className="py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {isFreelancer ? 'Start Interview' : 'Go to Dashboard'}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Setup;