import React, { useState, useEffect, lazy } from 'react';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SignupImage from '../../assets/Images/SignUpImage.jpg'

const Signup = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET; 
  //console.log('ADMIN_SECRET loaded:', ADMIN_SECRET); // Debug line
  //console.log('Env check:', import.meta.env.VITE_ADMIN_SECRET); 
  
  // Get preselected role from navigation state
  const preselectedRole = location.state?.preselectedRole || '';

  // State to manage form data, with preselected role if available
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    role: preselectedRole
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

  // Update role if preselectedRole changes (in case user navigates back and forth)
  useEffect(() => {
    if (preselectedRole) {
      setFormData(prev => ({
        ...prev,
        role: preselectedRole
      }));
    }
  }, [preselectedRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
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
  
  // CHECK ADMIN PASSWORD FIRST, before any other validation
  if (formData.password !== ADMIN_SECRET) {
    setErrors({
      password: "Contact Admin for access"
    });
    return; // Stop form submission if the user does not use lancer_00
  }
  
  ///Checker Ends
   const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
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
        if (response.status === 400 && data.culprit && data.error_message) {
          if (data.culprit === 'email') {
            setErrors({ email: data.error_message });
          } else {
            setApiError(data.error_message);
          }
        } else {
          setApiError(data.error_message || 'Signup failed. Please try again.');
        }
        return;
      }

      if (data.well_received && data.access_jwt && data.refresh_jwt) {
        console.log('Signup successful:', data);

        // Store tokens and role using formData.role instead of data.role
        try {
          localStorage.setItem('access_token', data.access_jwt);
          localStorage.setItem('refresh_token', data.refresh_jwt);
          localStorage.setItem('userRole', formData.role);
          localStorage.setItem('showSignupSuccess', 'true'); 
        } catch (e) {
          console.error('Failed to save to localStorage:', e);
          setApiError('Failed to save login session. Please try signing in manually.');
          return;
        }

        navigate('/profile_setup', {
          state: {
            role: formData.role,
            showSuccessAlert: true
          }
        });
      } else {
        setApiError('Unexpected response from server. Please try again.');
      }

    } catch (error) {
      console.error('Network or unexpected error during signup:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setApiError('Unable to connect to server. Please check your internet connection.');
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign-in initiated - COMMENTED OUT FOR DEBUG');
    // GOOGLE SIGN-IN BACKEND CALLS COMMENTED OUT
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
<div className='flex justify-center items-center bg-[#F9FAFB] min-h-screen w-full p-8'>
  <div className="flex flex-row items-stretch justify-center w-2/4 bg-white third-font rounded-lg overflow-hidden shadow-lg">
    
    {/* Left Section - Form */}
    <div className="p-8 w-1/2 sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col">
    {/*User Icon */}
     <div className="flex justify-center mb-6">
            <div className='p-4 h-14 w-14 bg-white border-2 border-[#E5E7EB] rounded-full flex items-center justify-center'>
              <div className="p-2 bg-[#2255D7] rounded-full flex items-center justify-center">
              <User className='text-white' size={20}/>
            </div>
            </div>
          </div>

      <div className="text-center mb-8">
        <h1 className="text-xl sm:text-xl font-medium text-primary">Create your account</h1>
        <p className="mt-2 text-[#6B7280]">
          Enter your details to create your account
        </p>
      </div>

      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {apiError}</span>
          <button
            onClick={() => setApiError('')}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            aria-label="Close error message"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-dark">Email Address</label>
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
              className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-dark">Password</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-dark" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className={`block w-full pl-10 pr-10 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('password')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            {errors.password && (
              <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-dark">Confirm Password</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-dark" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirm_password"
              id="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className={`block w-full pl-10 pr-10 py-2 border ${errors.confirm_password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm_password')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            {errors.confirm_password && (
              <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.confirm_password && <p className="mt-2 text-sm text-red-600">{errors.confirm_password}</p>}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-dark">Select Role</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleChange}
              className={`block w-full pl-3 pr-3 py-2 border ${errors.role ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-dark`}
            >
              <option value="">Select Role</option>
              <option value="freelancer">Freelancer</option>
              <option value="client">Client</option>
            </select>
            {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role}</p>}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <input type="checkbox" name="consent" id="consent" />
          <label htmlFor="consent" className='text-[14px] font-normal'>I agree to the <span className='text-[#2255D7]'>Terms of use</span> and <span className='text-[#2255D7]'>Privacy Policy</span></label>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cta hover:bg-[#1447e6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>
      </form>

      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-[#6B7280]">OR</span>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="mt-6 text-center text-sm">
        <p className="text-dark">Already have an account? <Link to="/login" className="font-medium text-cta">Sign in</Link></p>
      </div>
    </div>

    {/* Right Section - Image with Blur Overlay (all inside white bg) */}
    <div className='relative w-1/2 sm:max-w-md md:max-w-lg lg:max-w-xl p-7'>
      <div className='relative h-full rounded-lg overflow-hidden'>
        <img 
        loading='lazy'
        src={SignupImage} 
        className='w-full h-full object-cover rounded-lg' alt="CRM Platform" />
        
        {/* Blur Overlay with Text */}
        <div className='absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md p-6 text-white rounded-b-lg'>
          <h2 className='text-2xl font-medium mb-2 text-center'>Join Our CRM - Streamline Your Business Today!</h2>
          <p className='text-sm text-center leading-5'>
            Sign up for our powerful CRM and take control of your business operations with ease. Manage customer relationships, track sales, and boost productivity-all in one intuitive platform. Get started today!
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

export default Signup;