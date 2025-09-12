import React, { useState, useEffect } from 'react';
import { FileText, Upload, Clock, CheckCircle, AlertCircle, Loader, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Main component for the Job Task.
// Manages task flow from job_id fetching to task submission.
const JobTask = ({ task_type = 'job_interviewer' }) => {
  const navigate = useNavigate();
  
  // State variables to manage the component's UI and data
  const [taskState, setTaskState] = useState('initial'); // initial, loading, jobs_loading, started, submitting, submitted, error
  const [taskData, setTaskData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null); // New state for the dynamically fetched job_id
  const [taskIdentifier, setTaskIdentifier] = useState(task_type); // State to hold the dynamically fetched task type

  // Timer effect to count down the remaining time
  useEffect(() => {
    if (taskState !== 'started' || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [taskState, timeRemaining]);

  // Effect to fetch job_id and construct the dynamic task type when the component mounts
  useEffect(() => {
    const fetchJobId = async () => {
      setTaskState('jobs_loading');
      setError(null);
      const API_URL = import.meta.env.VITE_API_URL; // Hardcoded URL to fix the `import.meta` issue
      const token = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      
      if (!token) {
        setError('No token found. Please log in again.');
        setTaskState('error');
        return;
      }

      try {
        // Fetch the list of jobs to get a valid job_id
        const response = await fetch(`${API_URL}/api/jobs`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch jobs: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Jobs API Response:', data);

        // Check if jobs exist and grab the ID, client_id, and project_id of the first one
        if (data.jobs && data.jobs.length > 0) {
          const firstJob = data.jobs[0];
          const newJobId = firstJob.id;
          const clientId = firstJob.client_id;
          const projectId = firstJob.project_id;

          setJobId(newJobId);
          // Construct the new task type from the fetched data
          const newIdentifier = `task_${clientId}_${projectId}_${newJobId}`;
          setTaskIdentifier(newIdentifier);
          
          console.log(`Successfully fetched job_id: ${newJobId}`);
          console.log(`Constructed dynamic task_type: ${newIdentifier}`);
          setTaskState('initial'); // Ready to start
        } else {
          throw new Error('No available jobs found.');
        }

      } catch (err) {
        console.error('Error fetching job_id:', err);
        setError(err.message || 'Failed to fetch job details. Please try again.');
        setTaskState('error');
      }
    };

    fetchJobId();
  }, []);

  // Helper function to format seconds into a readable time string
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to navigate to dashboard
  const goToDashboard = () => {
    navigate('/freelancer-dashboard');
  };

  // API call to start the task (initiation stage)
  const startTask = async () => {
    if (!jobId) {
      setError('Job ID is not available. Please try again.');
      setTaskState('error');
      return;
    }
    
    setTaskState('loading');
    setError(null);

    try {
      const start_time = new Date().toISOString();
      setStartTime(start_time);

      const token = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      console.log('Token:', token ? `${token.slice(0, 10)}...${token.slice(-10)}` : 'NO_TOKEN');
      
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      // Decode JWT for debugging
      let user_id = null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', {
          exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiry',
          iss: payload.iss || 'No issuer',
          sub: payload.sub || 'No subject',
          scope: payload.scope || 'No scope'
        });
        user_id = payload.sub || payload.user_id;
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          throw new Error('Token is expired. Please log in again.');
        }
      } catch (e) {
        console.error('Failed to decode token:', e.message);
      }

      const API_URL = 'http://localhost:8000'; // Hardcoded URL to fix the `import.meta` issue
      console.log('API_URL:', API_URL);

      // INITIATION REQUEST: Send status, start_time, and the dynamically fetched job_id
      const formData = new FormData();
      formData.append('status', 'initiation');
      formData.append('start_time', start_time);
      formData.append('job_id', jobId); // Add the job_id here

      console.log('Sending initiation request (POST) to:', `${API_URL}/api/task/${taskIdentifier}`);
      console.log('FormData fields:', { 
        status: 'initiation', 
        start_time: start_time,
        job_id: jobId
      });

      const response = await fetch(`${API_URL}/api/task/${taskIdentifier}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        mode: 'cors',
        credentials: 'include'
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        let errorMessage;
        let errorData;
        const responseText = await response.text();
        console.error('Full error response text:', responseText);
        
        try {
          errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorData.detail || `HTTP error! status: ${response.status}`;
          console.error('Detailed error response:', errorData);
        } catch (e) {
          errorMessage = responseText || `HTTP error! status: ${response.status}`;
          console.error('Error response text:', responseText);
        }
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 400) {
          throw new Error(`Bad request: ${errorMessage}`);
        } else if (response.status === 422) {
          throw new Error(`Validation failed: ${errorMessage}`);
        } else if (response.status === 500) {
          throw new Error(`Server error: ${errorMessage}. Please contact support if this persists.`);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Initiation response:', data);
      
      setTaskData({
        instruction: data.Instruction || data.instruction,
        completion_time: data.completion_time
      });
      setTimeRemaining(data.completion_time * 60);
      setTaskState('started');
    } catch (err) {
      console.error('Error starting task:', err);
      setError(err.message || 'Failed to start task. Please try again.');
      setTaskState('error');
    }
  };

  // API call to submit the task (submission stage)
  const submitTask = async () => {
    // Basic validation
    if (!uploadedFile) {
      setError('Please upload a file to submit.');
      return;
    }

    setTaskState('submitting');
    setError(null);

    try {
      const submission_time = new Date().toISOString();
      const elapsed_time = Math.floor(((taskData.completion_time * 60) - timeRemaining) / 60);

      const token = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      // SUBMISSION REQUEST: Correctly format the FormData based on API documentation
      const formData = new FormData();
      formData.append('status', 'submission'); 
      formData.append('submission_time', submission_time);
      formData.append('elapsed_time', elapsed_time.toString());
      formData.append('file', uploadedFile, uploadedFile.name); // Correct way to append a file

      const API_URL = 'http://localhost:8000'; // Hardcoded URL to fix the `import.meta` issue
      console.log('Sending submission request to:', `${API_URL}/api/task/${taskIdentifier}`);
      console.log('Submission FormData fields:', { 
        status: 'submission',
        submission_time, 
        elapsed_time, 
        file: `${uploadedFile.name} (${uploadedFile.size} bytes)`
      });

      const response = await fetch(`${API_URL}/api/task/${taskIdentifier}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        mode: 'cors',
        credentials: 'include'
      });

      console.log('Submission API Response status:', response.status);

      if (!response.ok) {
        let errorMessage;
        let errorData;
        const responseText = await response.text();
        console.error('Full submission error response text:', responseText);
        
        try {
          errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorData.detail || `HTTP error! status: ${response.status}`;
          console.error('Detailed error response:', errorData);
        } catch (e) {
          errorMessage = responseText || `HTTP error! status: ${response.status}`;
          console.error('Error response text:', responseText);
        }
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 400) {
          throw new Error(`Bad request: ${errorMessage}`);
        } else if (response.status === 422) {
          throw new Error(`Validation failed: ${errorMessage}`);
        } else if (response.status === 500) {
          throw new Error(`Server error: ${errorMessage}. Please contact support if this persists.`);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Submission response:', result);
      
      setSubmissionResult({
        message: result.well_received || result.message,
        review: result.review,
        elapsed_time: elapsed_time
      });
      setTaskState('submitted');
    } catch (err) {
      console.error('Error submitting task:', err);
      setError(err.message || 'Failed to submit task. Please try again.');
      setTaskState('started');
    }
  };

  // Handler for file input change
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setUploadedFile(file);
      setError(null);
    }
  };

  // Handler for drag-and-drop file
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Handler for file drop
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setUploadedFile(file);
      setError(null);
    }
  };

  // Function to clear the uploaded file
  const removeFile = () => {
    setUploadedFile(null);
  };

  // UI rendering based on taskState
  // Success screen
  if (taskState === 'submitted') {
    return (
      <div className="w-full basic-font min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center">
        <div className="text-center space-y-6 max-w-2xl px-4">
          <div className="flex justify-center">
            <div className="bg-green-100 rounded-full p-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Task Submitted Successfully!
            </h1>
            <p className="text-gray-600">
              {submissionResult?.message || 'Your task has been submitted for review.'}
            </p>
            <p className="text-gray-600">
              Completed in {submissionResult?.elapsed_time} minutes
            </p>
            {submissionResult?.review && (
              <div className="mt-6 p-6 bg-blue-50 rounded-lg text-left max-w-md mx-auto">
                <h3 className="text-lg font-medium text-blue-900 mb-3">Review Feedback</h3>
                <p className="text-blue-800 whitespace-pre-wrap">
                  {submissionResult.review}
                </p>
              </div>
            )}
            <div className="mt-8">
              <button
                onClick={goToDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error screen
  if (taskState === 'error') {
    return (
      <div className="w-full min-h-screen basic-font bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="bg-red-100 rounded-full p-6">
              <AlertCircle className="w-16 h-16 text-red-600" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              Something went wrong
            </h1>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => {
                setTaskState('initial');
                setError(null);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen for both task initiation and jobs fetching
  if (taskState === 'loading' || taskState === 'jobs_loading') {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center">
        <div className="text-center space-y-6">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800">
            {taskState === 'jobs_loading' ? 'Fetching job details...' : 'Loading your task...'}
          </h2>
        </div>
      </div>
    );
  }

  // Initial screen - Ready to begin
  if (taskState === 'initial') {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b new-font from-blue-50 to-white flex flex-col items-center justify-center">
        <div className='w-full max-w-6xl flex flex-col rounded-xl overflow-hidden shadow-xl'>
          <div className="bg-blue-600 text-white px-8 py-6">
            <h1 className="text-2xl font-semibold">Job Interviewer Task</h1>
            <p className="text-blue-100 mt-1">Complete this task to demonstrate your skills</p>
          </div>
        
          <div className="flex flex-col items-center justify-center px-8 py-20">
            <div className="bg-blue-100 rounded-full p-8 mb-8">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
          
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Ready to begin your job task?
            </h2>
          
            <p className="text-gray-600 text-center max-w-md mb-8 leading-relaxed">
              When you click "Start Task", you'll receive your task instructions and a timer will begin. You'll have a limited time to complete and submit your work.
            </p>
          
            <button
              onClick={startTask}
              disabled={!jobId}
              className={`px-8 py-3 rounded-lg font-medium transition-colors duration-200 ${
                jobId
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Start Task
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Task in progress screen
  return (
    <div className="w-full min-h-screen new-font bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center items-center basic-font">
      <div className='w-full max-w-6xl flex flex-col rounded-xl overflow-hidden shadow-xl'>
        <div className="bg-blue-600 text-white px-8 py-6">
          <h1 className="text-2xl font-semibold">Job Interviewer Task</h1>
          <p className="text-blue-100 mt-1">Complete this task to demonstrate your skills</p>
        </div>
      
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Timer and task info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Task Instructions</h2>
              <div className={`flex items-center font-medium ${
                timeRemaining <= 300 ? 'text-red-600' : 'text-blue-600'
              }`}>
                <Clock className="w-5 h-5 mr-2" />
                {formatTime(timeRemaining)}
              </div>
            </div>
          
            <div className="space-y-4 text-gray-700">
              <div className="whitespace-pre-wrap">
                {taskData?.instruction || 'Loading task instructions...'}
              </div>
            
              <div>
                <strong>Time limit:</strong> {taskData?.completion_time} minutes
              </div>
            </div>
          </div>
      
          {/* File upload section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Submit Your Work</h3>
          
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-600 transition-colors duration-200"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {uploadedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-800">{uploadedFile.name}</div>
                      <div className="text-sm text-gray-500">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-600 mb-2">Drag and drop your file here, or</p>
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                      browse to upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".pdf,.png,.jpg,.jpeg,.zip,.html,.css,.js,.txt,.docx"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Supports: PDF, PNG, JPG, ZIP, HTML, CSS, JS, TXT, DOCX files up to 10MB
                  </p>
                </div>
              )}
            </div>
          
            <div className="mt-8 flex justify-end">
              <button
                onClick={submitTask}
                disabled={!uploadedFile || taskState === 'submitting'}
                className={`px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                  uploadedFile && taskState !== 'submitting'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {taskState === 'submitting' && (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                <span>
                  {taskState === 'submitting' ? 'Submitting...' : 'Submit Task'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobTask;
