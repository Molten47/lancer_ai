import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {useDispatch} from 'react-redux'
import { setUserData, setAuthData } from '../../store/userSlice';
import useAuthService from '../auth'
import SignupImage from '../../assets/Images/group-people-holding-laptop-template@3x.png'


const Signin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setTokens } = useAuthService();
  const dispatch = useDispatch()

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
    // Clear API error when user starts typing
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
    console.log('Setting isLoading to true');
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      {/*Added for debugging purpose*/}
      console.log('Sending login data:', { email: formData.email, password: '***' });

      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      console.log('HTTP Status Code:', response.status);
      console.log('Response is OK:', response.ok);

      const data = await response.json();

      // Add debugging to see the actual response structure
      console.log('Login response:', data);

      if (!response.ok || !data?.well_received) {
        // Handle login failure (401 or other errors)
        setApiError(data?.error_message || 'Login failed. Please check your credentials.');
        return;
      }

      // Dispatch user data to Redux store
      
           
      // Login successful - store tokens and user info with safe access
      const accessJwt = data?.access_jwt;
      const refreshJwt = data?.refresh_jwt;
      const userId = data?.user_id; 
      const role = data?.role; // Safely access role
      const firstname = data?.firstname;
      const lastname = data?.lastname;
      const username = data?.username;
      
dispatch(setUserData(data));

// Now dispatch auth data (variables are declared above)
dispatch(setAuthData({
  user_id: userId,
  tokens: { 
    access: accessJwt, 
    refresh: refreshJwt 
  },
  isAuthenticated: true
}));
      // Validate required fields
      if (!accessJwt || !refreshJwt || !userId) {
        setApiError('Invalid response from server. Missing required authentication data.');
        return;
      }

      // Store tokens using the auth service
      setTokens(accessJwt, refreshJwt, userId);

      // Store user data in localStorage with error handling
      try {
        localStorage.setItem('user_id', String(userId));
        
        // Store additional user info if available
        if (role) {
          localStorage.setItem('user_role', role);
        }
        if (firstname) {
          localStorage.setItem('user_firstname', firstname);
        }
        if (lastname) {
          localStorage.setItem('user_lastname', lastname);
        }
        if (username) {
          localStorage.setItem('user_username', username);
        }
      } catch (e) {
        console.error('Failed to save user data to localStorage:', e);
      }

      console.log('Login successful:', data);

      // Navigate based on the user's role
      if (role === 'freelancer') {
        navigate('/freelancer-dashboard', { replace: true });
      } else if (role === 'client') {
        navigate('/client-dashboard', { replace: true });
      } else if (role) {
        // Handle any other roles
        console.warn('Unknown role:', role);
        navigate('/default-dashboard', { replace: true });
      } else {
        // If no role is provided, you might need to fetch it separately
        console.warn('No role provided in login response');
        // You could either:
        // 1. Navigate to a default page
        navigate('/dashboard', { replace: true });
        // 2. Or fetch user profile to get the role
        // fetchUserProfile();
      }

    } catch (error) {
      console.error('Network or unexpected error during login:', error);
      setApiError('An unexpected error occurred. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign-in initiated');
    // This would typically involve redirecting to a Google OAuth flow
  };

  return (
    <div className='flex justify-center items-center bg-[#F9FAFB] min-h-screen w-full p-4 sm:p-6 md:p-8'>
  <div className="flex flex-row items-stretch justify-center w-full max-w-md lg:w-2/4 lg:max-w-5xl bg-white third-font rounded-lg overflow-hidden shadow-lg">
    
    {/* Left Section - Sign In Form */}
    <div className="p-6 sm:p-8 w-full lg:w-1/2 flex flex-col">
      {/* User Icon */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <div className='p-3 sm:p-4 h-12 w-12 sm:h-14 sm:w-14 bg-white border-2 border-[#E5E7EB] rounded-full flex items-center justify-center'>
          <div className="p-1.5 sm:p-2 bg-[#2255D7] rounded-full flex items-center justify-center">
          <User className='text-white' size={18}/>
        </div>
        </div>
      </div>

      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl font-medium text-primary">Login to your account</h1>
        <p className="mt-2 text-sm sm:text-base text-[#6B7280]">
          Welcome back, please enter your details
        </p>
      </div>

      {/* API Error Display */}
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative mb-4 text-sm" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {apiError}</span>
          <button
            onClick={() => setApiError('')}
            className="absolute top-0 bottom-0 right-0 px-3 sm:px-4 py-2 sm:py-3"
            aria-label="Close error message"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-dark">Email Address</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-dark" />
            </div>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={`block w-full pl-9 sm:pl-10 pr-3 py-2 border ${errors.email || apiError ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm`}
              placeholder="user@example.com"
            />
            {errors.email && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.email && <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-dark">Password</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-dark" />
            </div>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className={`block w-full pl-9 sm:pl-10 pr-3 py-2 border ${errors.password || apiError ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm`}
              placeholder="••••••••"
            />
            {errors.password && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.password && <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600">{errors.password}</p>}
        </div>

        {/* Keep me login & Forget password */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              name="keepLogin" 
              id="keepLogin" 
              className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="keepLogin" className="text-xs sm:text-sm font-normal text-dark">Keep me logged in</label>
          </div>
          <div>
            <Link to="/forgot-password" className="text-xs sm:text-sm text-dark underline hover:text-blue-600">
              Forget password?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-cta hover:bg-[#1447e6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="mt-4 sm:mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className="px-2 bg-white text-[#6B7280]">OR</span>
        </div>
      </div>

      {/* Google Sign In Button */}
      <div className="mt-4 sm:mt-6">
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 24 24">
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

      {/* Sign Up Link */}
      <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm">
        <p className="text-dark">Not registered yet? <Link to="/signup" className="font-medium text-dark underline hover:text-blue-600">Create an account</Link></p>
      </div>
    </div>

    {/* Right Section - Image with Blur Overlay (hidden on mobile/tablet) */}
    <div className='hidden lg:block relative w-1/2 p-8'>
      <div className='relative h-full rounded-lg overflow-hidden'>
        <img 
        loading='lazy'
        src={SignupImage} 
        className='w-full h-full object-cover object-center rounded-lg ' alt="CRM Platform" />
        
        {/* Blur Overlay with Text */}
        <div className='absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md p-6 text-white rounded-b-lg gap-2'>
          <h2 className='text-2xl font-medium mb-2 text-center'>Join Lancer - Streamline Your Business Today!</h2>
          <p className='text-sm text-center leading-5'>
            Sign up to use our AI-powerered tools and agent to grow your business and people grow thiers. Get started today!
          </p>
          
          {/* Carousel Dots */}
          <div className='flex justify-center gap-2 mt-4'>
            <div className='w-2 h-2 rounded-full bg-white'></div>
            <div className='w-2 h-2 rounded-full bg-white/50'></div>
            <div className='w-2 h-2 rounded-full bg-white/50'></div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</div>
  );
};

export default Signin;