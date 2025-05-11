import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Essay.js (Modified)// Essay.js (Modified)
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
    <div className='bg-light w-full min-h-screen flex flex-col justify-center items-center pt-8'>
      <div className='w-[50%] h-[85vh] shadow-lg flex flex-col pt-4'>
        <div className='flex flex-col justify-center items-center'>
          <h2 className='basic-font text-[32px] text-primary font-bold'>We need to know more about you</h2>
          <p className='basic-font text-[1.2rem] font-normal text-[#6B7280]'>
            Write a short essay about yourself - This will help us in creating a proper profile for you.
          </p>
          <p className='basic-font text-[1rem] font-medium text-primary mt-2'>
            You are registered as a <span className='capitalize font-bold'>{userRole}</span>
          </p>
          <p className='basic-font text-[0.9rem] text-gray-500 mt-1'>
            (Minimum {minWordCount} words required)
          </p>
        </div>

        <form onSubmit={handleEssaySubmit} className='flex flex-col flex-1'>
          <div className='p-5 items-center flex justify-center flex-1'>
            <textarea
              id="essay"
              value={essayText}
              name="essay"
              onChange={handleChange}
              className={`h-full p-4 w-full border-2 rounded-md ${error ? 'border-red-300' : 'border-[#cccccc]'}`}
              placeholder={placeholders[userRole]}
            />
          </div>
          {error && (
            <div className='px-5 -mt-3 mb-2'>
              <p className='text-red-500 text-sm'>{error}</p>
            </div>
          )}
          <div className='px-5 mb-4 flex justify-between'>
            <div>
              <span className={`text-sm font-medium ${currentWordCount < minWordCount ? 'text-red-500' : 'text-green-500'}`}>
                {currentWordCount} / {minWordCount} words
              </span>
            </div>
            <button
              type="submit"
              className='px-4 py-2 rounded-md text-light basic-font bg-cta hover:bg-[#00b5b5] cursor-pointer'
            >
              Submit Your Essay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default Essay
