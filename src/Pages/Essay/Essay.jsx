import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Essay = () => {
  const [essayText, setEssayText] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = location.state?.role || 'freelancer'; // Get user role, default to 'freelancer'

  // Define placeholder texts based on role
  const placeholders = {
    freelancer: "Your name [begin with first name], age, country of origin, the state/province and city/town you're based in, the specific skill you are bringing to the platform as a freelancer and any other information you believe would help in better setting up your profile. (No less than 50 words)",
    client: "Your name [begin with first name], age, country of origin, the state/province and city/town you're based in, an overview of what you wish to achieve the type of jobs or roles you are seeking. (No less than 20 words)"
  };

  // Calculate minimum word requirement based on role
  const minWordCount = userRole === 'client' ? 20 : 50;
  const [error, setError] = useState('');

  // Get current word count
  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word !== '').length;
  };

  const currentWordCount = getWordCount(essayText);

  // Handle textarea change
  const handleChange = (e) => {
    setEssayText(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handleEssaySubmit = (e) => {
    e.preventDefault();
    if (!essayText.trim()) {
      setError('You cannot leave this field blank, please fill it in.');
      return;
    } else if (getWordCount(essayText) < minWordCount) {
      setError(`You must write at least ${minWordCount} words.`);
      return;
    }
    // Store essay text and role in session storage.
    sessionStorage.setItem('essayText', essayText);
    sessionStorage.setItem('userRole', userRole); //store the role
    navigate('/setup', { state: { role: userRole } }); // Pass role
  };

  return (
    <div className='bg-light w-full min-h-screen flex flex-col justify-center items-center pt-4 sm:pt-8 px-4 sm:px-0'>
      <div className='w-full sm:w-4/5 md:w-3/4 lg:w-[65%] xl:w-[50%] h-[85vh] shadow-lg flex flex-col pt-3 sm:pt-4 bg-white rounded-lg'>
        <div className='flex flex-col justify-center items-center px-4 sm:px-6'>
          <h2 className='basic-font text-xl sm:text-2xl md:text-3xl lg:text-[32px] text-primary font-bold text-center'>We need to know more about you</h2>
          <p className='basic-font text-sm sm:text-base md:text-lg lg:text-[1.2rem] font-normal text-[#6B7280] text-center mt-1 sm:mt-2'>
            Write a short essay about yourself - This will help us in creating a proper profile for you.
          </p>
          <p className='basic-font text-sm sm:text-base md:text-[1rem] font-medium text-primary mt-1 sm:mt-2 text-center'>
            You are registered as a <span className='capitalize font-bold'>{userRole}</span>
          </p>
          <p className='basic-font text-xs sm:text-sm md:text-[0.9rem] text-gray-500 mt-1 text-center'>
            (Minimum {minWordCount} words required)
          </p>
        </div>

        <form onSubmit={handleEssaySubmit} className='flex flex-col flex-1 mt-2 sm:mt-0'>
          <div className='p-3 sm:p-5 items-center flex justify-center flex-1'>
            <textarea
              id="essay"
              value={essayText}
              name="essay"
              onChange={handleChange}
              className={`h-full p-3 sm:p-4 w-full border-2 rounded-md ${error ? 'border-red-300' : 'border-[#cccccc]'}`}
              placeholder={placeholders[userRole]}
            />
          </div>
          {error && (
            <div className='px-3 sm:px-5 -mt-2 sm:-mt-3 mb-1 sm:mb-2'>
              <p className='text-red-500 text-xs sm:text-sm'>{error}</p>
            </div>
          )}
          <div className='px-3 sm:px-5 mb-3 sm:mb-4 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between'>
            <div>
              <span className={`text-xs sm:text-sm font-medium ${currentWordCount < minWordCount ? 'text-red-500' : 'text-green-500'}`}>
                {currentWordCount} / {minWordCount} words
              </span>
            </div>
            <button
              type="submit"
              className='px-3 sm:px-4 py-2 rounded-md text-light basic-font bg-cta hover:bg-[#00b5b5] cursor-pointer text-sm sm:text-base'
            >
              Submit Your Essay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Essay;