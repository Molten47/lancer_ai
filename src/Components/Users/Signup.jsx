import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  // State persistence key for this form
  const FORM_STORAGE_KEY = 'signup_form_data';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    role: ''
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load persisted form data on component mount
  useEffect(() => {
    const savedFormData = sessionStorage.getItem(FORM_STORAGE_KEY);
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        // Don't restore passwords for security reasons
        setFormData(prev => ({
          ...prev,
          email: parsedData.email || '',
          role: parsedData.role || ''
          // Intentionally not restoring password fields
        }));
      } catch (error) {
        console.error('Error loading saved form data:', error);
        // Clear corrupted data
        sessionStorage.removeItem(FORM_STORAGE_KEY);
      }
    }
  }, []);

  // Save form data to sessionStorage whenever it changes
  useEffect(() => {
    // Only save non-sensitive data
    const dataToSave = {
      email: formData.email,
      role: formData.role,
      // Don't save password fields for security
      timestamp: new Date().toISOString()
    };
    
    // Only save if there's actual data to save
    if (formData.email || formData.role) {
      sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [formData.email, formData.role]);

  // Clear persisted data when form is successfully submitted
  const clearPersistedData = () => {
    sessionStorage.removeItem(FORM_STORAGE_KEY);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    // Clear API error if any when user starts typing
    if (apiError) {
      setApiError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL
      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(data.error_message || 'Signup failed. Please try again.');
        return;
      }

      console.log('Signup successful:', data);

      // Store JWT tokens with BOTH keys for compatibility
      if (data.access_jwt) {
        localStorage.setItem('access_token', data.access_jwt);
        localStorage.setItem('access_jwt', data.access_jwt);
      }
      
      if (data.refresh_jwt) {
        localStorage.setItem('refresh_token', data.refresh_jwt);
        localStorage.setItem('refresh_jwt', data.refresh_jwt);
      }

      if (data.user_id) {
        localStorage.setItem('user_id', data.user_id.toString());
      }
      
      localStorage.setItem('userRole', data.role || formData.role);
      localStorage.setItem('showSignupSuccess', 'true');

      // Clear persisted form data on successful submission
      clearPersistedData();

      // Navigate to setup page
      navigate('/profile_setup', {
        state: {
          role: data.role || formData.role,
          showSuccessAlert: true
        }
      });

    } catch (error) {
      console.error('Network or unexpected error during signup:', error);
      setApiError('An unexpected error occurred. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign-in initiated');
    // Clear persisted data when switching to OAuth
    clearPersistedData();
  };

  // Show indicator if data was restored
  const hasRestoredData = sessionStorage.getItem(FORM_STORAGE_KEY) !== null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full sm:max-w-md md:max-w-lg lg:max-w-xl">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-2xl font-bold text-primary basic-font">Welcome to Lancer.ai</h1>
          <p className="mt-2 text-[#6B7280] basic-font">Sign up to get started with your new account</p>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {apiError}</span>
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark basic-font">Email Address</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-dark" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${errors.email || apiError ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="user@example.com"
              />
              {errors.email && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark basic-font">Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-dark" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={`block w-full pl-10 pr-10 py-2 border ${errors.password || apiError ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="••••••••"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-dark basic-font">Confirm Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-dark" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                id="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={`block w-full pl-10 pr-10 py-2 border ${errors.confirm_password || apiError ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="••••••••"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirm_password && (
                <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.confirm_password && <p className="mt-2 text-sm text-red-600">{errors.confirm_password}</p>}
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-dark basic-font">Select Role</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <select
                name="role"
                id="role"
                value={formData.role}
                onChange={handleChange}
                className={`block w-full pl-3 pr-3 py-2 border ${errors.role ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-dark basic-font`}
              >
                <option value="">Select Role</option>
                <option value="freelancer">Freelancer</option>
                <option value="client">Client</option>
              </select>
              {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cta hover:bg-[#00b5b5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 basic-font"
              disabled={isLoading}
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white basic-font text-[#6B7280]">Or continue with</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <div className="mt-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 basic-font"
            disabled={isLoading}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Sign In Link */}
        <div className="mt-6 text-center text-sm">
          <p className="text-dark basic-font">Already have an account? <Link to="/login" className="font-medium text-cta basic-font">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;