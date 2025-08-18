import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Signin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(''); // Added for API error handling
  const [isLoading, setIsLoading] = useState(false); // Added for loading state
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate(); // Added for navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
    if (apiError) {
      setApiError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    console.log('Signin: Response status:', response.status);

    let data;
    try {
      data = await response.json();
      console.log('Signin: Response data:', data);
    } catch (jsonError) {
      console.error('Signin: Failed to parse JSON response:', jsonError);
      setApiError('Server returned invalid response format');
      return;
    }

    // Handle API responses based on your documentation
    if (!response.ok) {
      console.error('Signin: API Error:', data);
      
      // Handle 401 error as per API documentation
      if (response.status === 401) {
        setApiError(data.error_message || 'Invalid email or password');
      } else {
        setApiError(data.error_message || 'Sign-in failed. Please try again.');
      }
      return;
    }

    // Success response - check if well_received is true
    if (!data.well_received) {
      console.error('Signin: API returned well_received: false');
      setApiError(data.error_message || 'Sign-in failed. Please try again.');
      return;
    }

    console.log('Signin: Sign-in successful');

    // Store JWT tokens and profile data as per API documentation
    try {
      if (data.access_jwt) {
        localStorage.setItem('access_jwt', data.access_jwt);
      }
      if (data.refresh_jwt) {
        localStorage.setItem('refresh_jwt', data.refresh_jwt);
      }
      
      // Store profile data if provided
      if (data.profile_data) {
        localStorage.setItem('profile_data', JSON.stringify(data.profile_data));
        
        // Extract user role and ID from profile_data if available
        if (data.profile_data.role) {
          localStorage.setItem('userRole', data.profile_data.role);
        }
        if (data.profile_data.user_id) {
          localStorage.setItem('user_id', data.profile_data.user_id.toString());
        }
      }
    } catch (e) {
      console.error('Signin: Failed to save to localStorage:', e);
      setApiError('Failed to save authentication data.');
      return;
    }

    setSubmitted(true);

    // Navigation logic based on stored user role
    const userRole = localStorage.getItem('userRole');
    const profileData = localStorage.getItem('profile_data');
    
    if (userRole === 'freelancer') {
      // Check if profile is complete from stored profile_data
      let isProfileComplete = false;
      if (profileData) {
        try {
          const parsedProfile = JSON.parse(profileData);
          isProfileComplete = parsedProfile.is_complete === true;
        } catch (e) {
          console.error('Signin: Error parsing profile data:', e);
        }
      }

      if (!isProfileComplete) {
        console.log('Signin: Profile incomplete, redirecting to /profile_setup');
        navigate('/profile_setup', { state: { role: userRole } });
      } else {
        console.log('Signin: Profile complete, redirecting to /interview');
        navigate('/interview');
      }
    } else {
      console.log('Signin: Navigating to /client-dashboard');
      navigate('/client-dashboard');
    }

  } catch (error) {
    console.error('Signin: Network or unexpected error during sign-in:', error);
    setApiError('An unexpected error occurred. Please check your internet connection.');
  } finally {
    setIsLoading(false);
  }
};

  const handleGoogleSignIn = () => {
    console.log('Google sign-in initiated');
    // Implement Google OAuth flow here
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center basic-font min-h-screen bg-light p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 w-full max-w-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 new-font">Sign In Successful!</h2>
          <p className="text-gray-600 mb-4 md:mb-6 new-font">You have successfully signed in.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 new-font"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 w-full max-w-md">
        {/* Welcome Message */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary basic-font">Welcome Back!</h1>
          <p className="mt-1 md:mt-2 text-[#6B7280] basic-font text-sm">Let's get back to work</p>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {apiError}</span>
          </div>
        )}

        {/* Log in Form */}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* User Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark basic-font">
              Email Address
            </label>
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
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.email || apiError ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm new-font`}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark basic-font">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-dark" />
              </div>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.password || apiError ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm new-font`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.password && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cta hover:bg-[#00b5b5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 basic-font"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Or continue with */}
        <div className="mt-4 md:mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-[#6B7280] basic-font">Or continue with</span>
          </div>
        </div>

        {/* Google Sign In option */}
        <div className="mt-4 md:mt-6">
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
            Sign in with Google
          </button>
        </div>

        {/* Don't have account link */}
        <div className="mt-4 md:mt-6 text-center">
          <p className="text-sm text-dark basic-font">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-cta hover:text-[#00b5b5] basic-font">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signin;