import React, { useState, useEffect } from "react";
import { Check, AlertCircle, Loader2, Globe, Building, Mail, Link2, Briefcase } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

// Input field component with consistent styling
const FormInput = ({ label, id, name, value, onChange, placeholder, type = "text", error, className = "", required = false }) => {
  return (
    <div className={`flex-1 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 basic-font">
        {label} {required && <span className="text-red-500">*</span>}
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
const FormSelect = ({ label, id, name, value, onChange, options, placeholder, error, icon, required = false }) => {
  return (
    <div className="flex-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 basic-font">
        {label} {required && <span className="text-red-500">*</span>}
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

// Textarea component
const FormTextarea = ({ label, id, name, value, onChange, placeholder, error, required = false }) => {
  return (
    <div className="flex-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 basic-font">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows="4"
        className={`w-full px-4 py-3 border ${error ? 'border-red-300' : 'border-gray-200'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out text-gray-700 bg-white resize-none`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

const Setup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const initialRole = location.state?.role?.toLowerCase() === 'client' ? 'client' : 'freelancer';
  const [selectedRole] = useState(initialRole);
  
  const FORM_STORAGE_KEY = `setup_form_data_${initialRole}`;
  
  const loadPersistedFormData = () => {
    try {
      const savedData = localStorage.getItem(FORM_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (initialRole === 'freelancer' && Array.isArray(parsedData.skills)) {
          parsedData.skill = parsedData.skills.length > 0 ? parsedData.skills[0] : '';
          delete parsedData.skills;
        }
        console.log('Loaded persisted form data:', parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('Error loading persisted form data:', error);
      localStorage.removeItem(FORM_STORAGE_KEY);
    }
    return null;
  };

const getInitialFormData = () => {
  const persistedData = loadPersistedFormData();
  if (persistedData) {
    return persistedData;
  }
  
  const baseData = {
    firstname: '',
    lastname: '',
    country: '',
    state: '',
    user_mail: '',           // Add this
    business_name: '',       // Add this
    description: '',         // Add this
    industry_category: '',   // Add this
    address: '',             // Add this
    contact_email: '',       // Add this
    website_url: '',        // Add this
    operational_role: '',    // Add this
    skill: '',               // Add this
  };

  return baseData;
};

  const [formData, setFormData] = useState(getInitialFormData);
  const [countryData, setCountryData] = useState({});
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(location.state?.showSuccessAlert || false);
  const [showDataRestored, setShowDataRestored] = useState(false);
  
  const isFreelancer = selectedRole === 'freelancer';
  const countries = Object.keys(countryData);
  const availableStates = formData.country ? countryData[formData.country] || [] : [];

  const freelancerSkills = [
    "frontend development",
    "backend development",
    "Mobile App Development",
    "graphics designer",
    "UI/UX Design",
    "creative Writing",
    "ebook writing",
    "copy writter",
    "Digital Marketing",
    "seo expert",
    "Social Media Management",
    "Data Analysis",
    "data engineering",
    "Customer Service",
    "content stategy",
    "video editing",
    "shopify marketing",
    "ml engineering",
    "qa engineering",
    "cloud computing",
    "devops engineering",
    "cyber security"
  ];

  const industryCategories = [
    "Software as a Service", 
    "Design as a Service",
    "Digital Marketting and Advertising", 
    "Business Intelligence and Data Analytics", 
    "IT infrastructure Design and Consulting", 
    "Digital Content and Media", "E-commerce", 
    "Financial Technology","Education Technology", 
    "Healthcare Technology", 
    "Enterprise AI/ML consulting", 
    "other..."
  ];

  const operationalRoles = [
 "CEO", "CTO", "CPO", "CMO", "CFO", "Director", "Manager", "other.."
  ];

  const saveFormDataToStorage = (data) => {
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }
  };

  const clearPersistedFormData = () => {
    try {
      localStorage.removeItem(FORM_STORAGE_KEY);
      console.log('Cleared persisted form data');
    } catch (error) {
      console.error('Error clearing persisted form data:', error);
    }
  };

  useEffect(() => {
    const persistedData = loadPersistedFormData();
    if (persistedData && !location.state?.showSuccessAlert) {
      const hasContent = Object.values(persistedData).some(val => val?.toString().trim());
      if (hasContent) {
        setShowDataRestored(true);
        setTimeout(() => {
          setShowDataRestored(false);
        }, 5000);
      }
    }
  }, []);

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
    if (!profileSaved) {
      saveFormDataToStorage(formData);
    }
    console.log('Saving form data:', formData, 'Role:', selectedRole);
  }, [formData, selectedRole, profileSaved]);

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

const validateForm = () => {
  const newErrors = {};
  
  // Helper function to safely check if a field is empty
  const isEmpty = (value) => !value || value.toString().trim() === '';
  
  // Common validations
  if (isEmpty(formData.firstname)) newErrors.firstname = 'First name is required';
  if (isEmpty(formData.lastname)) newErrors.lastname = 'Last name is required';
  if (isEmpty(formData.country)) newErrors.country = 'Country is required';
  if (isEmpty(formData.state)) newErrors.state = 'State/Province is required';

  if (isFreelancer) {
    if (isEmpty(formData.skill)) newErrors.skill = 'Please select a skill';
  } else {
    // Client validations
    if (isEmpty(formData.user_mail)) newErrors.user_mail = 'Email is required';
    if (isEmpty(formData.business_name)) newErrors.business_name = 'Business name is required';
    if (isEmpty(formData.description)) newErrors.description = 'Business description is required';
    if (isEmpty(formData.industry_category)) newErrors.industry_category = 'Industry category is required';
    if (isEmpty(formData.address)) newErrors.address = 'Address is required';
    if (isEmpty(formData.contact_email)) newErrors.contact_email = 'Contact email is required';
    if (isEmpty(formData.contact_email) || !formData.contact_email.includes('@')) {
      newErrors.contact_email = 'Valid email is required';
    }
    if (isEmpty(formData.operational_role)) newErrors.operational_role = 'Operational role is required';
  }

  return newErrors;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setApiError('Authentication token not found. Please sign in again.');
        navigate('/signin');
        return;
      }

      let requestBody;
      
      if (isFreelancer) {
        requestBody = {
          firstname: formData.firstname.trim(),
          lastname: formData.lastname.trim(),
          country: formData.country,
          state: formData.state,
          //email: formData.email.trim(),
          skill: formData.skill
        };
      } else {
        requestBody = {
          firstname: formData.firstname.trim(),
          lastname: formData.lastname.trim(),
          country: formData.country,
          state: formData.state,
          user_mail: formData.user_mail.trim(),
          business_name: formData.business_name.trim(),
          description: formData.description.trim(),
          industry_category: formData.industry_category,
          address: formData.address.trim(),
          contact_email: formData.contact_email.trim(),
           website_url: formData.website_url ? formData.website_url.trim() : '',
          operational_role: formData.operational_role
        };
          
        
      }

      const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_URL}/api/profile_setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(data.error_message || 'Profile setup failed. Please try again.');
        
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('user_id');
          clearPersistedFormData();
          navigate('/signin');
        }
        return;
      }

      console.log('Profile setup successful:', data);

      if (data.well_received) {
        if (data.profile_data) {
          console.log('Profile data received:', data.profile_data);
          
          if (data.profile_data.user_id) {
            localStorage.setItem('user_id', data.profile_data.user_id.toString());
          }
        }

        if (data.access_jwt) {
          localStorage.setItem('access_token', data.access_jwt);
          localStorage.setItem('access_jwt', data.access_jwt);
        } else {
          const existingToken = localStorage.getItem('access_token');
          if (existingToken) {
            localStorage.setItem('access_jwt', existingToken);
          }
        }

        if (data.refresh_jwt) {
          localStorage.setItem('refresh_token', data.refresh_jwt);
          localStorage.setItem('refresh_jwt', data.refresh_jwt);
        } else {
          const existingRefreshToken = localStorage.getItem('refresh_token');
          if (existingRefreshToken) {
            localStorage.setItem('refresh_jwt', existingRefreshToken);
          }
        }
        
        localStorage.setItem('profileCompleted', 'true');
        clearPersistedFormData();
        
        if (selectedRole === 'freelancer') {
          setProfileSaved(true);
        } else {
          navigate('/client-dashboard', { 
            state: { 
              profileCompleted: true,
              userRole: 'client',
              userName: `${formData.firstname} ${formData.lastname}`
            }
          });
        }
      } else {
        setApiError('Profile setup was not successful. Please try again.');
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

  const startInterview = () => {
    navigate('/interview', { 
      state: { 
        profileCompleted: true,
        interviewCompleted: true,
        userRole: 'freelancer',
        userName: `${formData.firstname} ${formData.lastname}`,
        skill: formData.skill
      }
    });
  };

  const handleClearSavedData = () => {
    clearPersistedFormData();
    setFormData(getInitialFormData());
    setShowDataRestored(false);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex justify-center items-center py-6 px-4 sm:py-12 sm:px-6 basic-font">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 py-8 text-blue-600">
          <h1 className="text-3xl font-bold mb-2">Complete Your {isFreelancer ? 'Freelancer' : 'Client'} Profile</h1>
          <p className="text-gray-700 text-lg">
            {isFreelancer 
              ? "Tell us about yourself so we can match you with the right opportunities"
              : "Tell us about your business so we can help you find the right freelancers"
            }
          </p>
        </div>

        <div className="px-8 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
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

          {showDataRestored && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <div>
                  <strong className="font-semibold">Data Restored!</strong>
                  <span className="block sm:inline"> Your previously entered information has been restored.</span>
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
                      required
                    />

                    <FormInput
                      label="Last Name"
                      id="lastname"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      placeholder="Doe"
                      error={errors.lastname}
                      required
                    />

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
                      required
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
                      required
                    />

                    {isFreelancer && (
                      <FormSelect
                        label="Primary Skill"
                        id="skill"
                        name="skill"
                        value={formData.skill}
                        onChange={handleChange}
                        options={freelancerSkills}
                        placeholder="Select your main skill"
                        error={errors.skill}
                        icon={<Building className="h-5 w-5 text-gray-400" />}
                        required
                      />
                    )}
                  </div>
                </div>

                {isFreelancer && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Professional Information
                    </h2>
                    
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        <strong>Selected Skill:</strong> {formData.skill || 'None selected'}
                      </p>
                      <p className="text-gray-600 text-xs mt-2">
                        You can add more skills and showcase your portfolio after completing the setup process.
                      </p>
                    </div>
                  </div>
                )}

                {!isFreelancer && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-6">
                        Business Information
                      </h2>
                      
                      <div className="space-y-6">
                        <FormInput
                          label="Business Name"
                          id="business_name"
                          name="business_name"
                          value={formData.business_name}
                          onChange={handleChange}
                          placeholder="Your Business Name"
                          error={errors.business_name}
                          required
                        />

                    <FormInput
                      label="Email"
                      id="email"
                      name="user_mail"
                      type="email"
                      value={formData.user_mail}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      error={errors.user_mail}
                      required
                    />

                        <FormTextarea
                          label="Business Description"
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Tell us about your business, what you do, and what you're looking for..."
                          error={errors.description}
                          required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormSelect
                            label="Industry Category"
                            id="industry_category"
                            name="industry_category"
                            value={formData.industry_category}
                            onChange={handleChange}
                            options={industryCategories}
                            placeholder="Select industry"
                            error={errors.industry_category}
                            icon={<Briefcase className="h-5 w-5 text-gray-400" />}
                            required
                          />

                          <FormSelect
                            label="Operational Role"
                            id="operational_role"
                            name="operational_role"
                            value={formData.operational_role}
                            onChange={handleChange}
                            options={operationalRoles}
                            placeholder="Select your role"
                            error={errors.operational_role}
                            required
                          />
                        </div>

                        <FormInput
                          label="Business Address"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="31, Lancer Av. City"
                          error={errors.address}
                          required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormInput
                            label="Contact Email"
                            id="contact_email"
                            name="contact_email"
                            type="email"
                            value={formData.contact_email}
                            onChange={handleChange}
                            placeholder="contact@business.com"
                            error={errors.contact_email}
                            required
                          />

                          <FormInput
                            label="Website (Optional)"
                            id="website_url"
                            name="website_url"
                            type="url"
                            value={formData.website_url}
                            onChange={handleChange}
                            placeholder="https://www.yourbusiness.com"
                            error={errors.website_url}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        This information helps us match you with qualified freelancers who best fit your business needs. You can update your profile anytime.
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
                    onClick={isFreelancer ? startInterview : () => navigate('/client-dashboard', { state: { profileCompleted: true, userRole: 'client' } })}
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