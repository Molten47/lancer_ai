import React, { useState, useEffect } from 'react';
import { FileText, Upload, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const PlatformTask = ({ taskType = 'platform_interview' }) => {
  const [taskState, setTaskState] = useState('initial'); // initial, loading, started, submitting, submitted, error
  const [taskData, setTaskData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');

  // Timer effect
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

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // API call to start task (initiation)
  const startTask = async () => {
    setTaskState('loading');
    setError(null);

    try {
      const start_time = new Date().toISOString();
      setStartTime(start_time);

      // INITIATION REQUEST - sends status, start_time, job_id
      const response = await fetch(`https://lancer-web-service.onrender.com/api/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'initiation',
          start_time,
          job_id: null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Server responds with: instruction, completion_time, 200
      setTaskData({
        instruction: data.instruction,
        completion_time: data.completion_time // assuming this is in minutes
      });
      
      // Set timer (convert minutes to seconds)
      setTimeRemaining(data.completion_time * 60);
      setTaskState('started');

    } catch (err) {
      console.error('Error starting task:', err);
      setError('Failed to start task. Please try again.');
      setTaskState('error');
    }
  };

  // API call to submit task (submission)
  const submitTask = async () => {
    if (!uploadedFile || !title.trim()) {
      setError('Please provide a title and upload a file.');
      return;
    }

    setTaskState('submitting');
    setError(null);

    try {
      const submission_time = new Date().toISOString();
      const elapsed_time = Math.floor(((taskData.completion_time * 60) - timeRemaining) / 60); // in minutes

      // SUBMISSION REQUEST - sends title, submission_time, elapsed_time, file
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('submission_time', submission_time);
      formData.append('elapsed_time', elapsed_time.toString());
      formData.append('file', uploadedFile);

      const response = await fetch(`https://lancer-web-service.onrender.com/task`, {
        method: 'POST',
        body: formData // No Content-Type header - let browser set it for FormData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Server responds with: well_received, review, 200
      setSubmissionResult({
        message: result.well_received,
        review: result.review,
        elapsed_time: elapsed_time
      });
      setTaskState('submitted');

    } catch (err) {
      console.error('Error submitting task:', err);
      setError('Failed to submit task. Please try again.');
      setTaskState('started'); // Return to started state to allow retry
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setUploadedFile(file);
      setError(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

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

  const removeFile = () => {
    setUploadedFile(null);
  };

  // Success screen
  if (taskState === 'submitted') {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="bg-green-100 rounded-full p-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          <div className="space-y-3">
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
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Review:</strong> {submissionResult.review}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error screen
  if (taskState === 'error') {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center">
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
              onClick={() => setTaskState('initial')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (taskState === 'loading') {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center">
        <div className="text-center space-y-6">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800">
            Loading your task...
          </h2>
        </div>
      </div>
    );
  }

  // Initial screen - Ready to begin
  if (taskState === 'initial') {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center">
        <div className='w-full max-w-6xl flex flex-col rounded-xl overflow-hidden shadow-xl'>
          <div className="bg-blue-600 text-white px-8 py-6">
            <h1 className="text-2xl font-semibold">Platform Interview Task</h1>
            <p className="text-blue-100 mt-1">Complete this task to demonstrate your skills</p>
          </div>
        
          <div className="flex flex-col items-center justify-center px-8 py-20">
            <div className="bg-blue-100 rounded-full p-8 mb-8">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
          
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Ready to begin your platform task?
            </h2>
          
            <p className="text-gray-600 text-center max-w-md mb-8 leading-relaxed">
              When you click "Start Task", you'll receive your task instructions and a timer will begin. You'll have a limited time to complete and submit your work.
            </p>
          
            <button
              onClick={startTask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
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
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center items-center">
      <div className='w-full max-w-6xl flex flex-col rounded-xl overflow-hidden shadow-xl'>
        <div className="bg-blue-600 text-white px-8 py-6">
          <h1 className="text-2xl font-semibold">Platform Interview Task</h1>
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

          {/* Title input */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Task Title</h3>
            <input
              type="text"
              placeholder="Enter a descriptive title for your submission"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              maxLength={100}
            />
            <p className="text-sm text-gray-500 mt-2">
              {title.length}/100 characters
            </p>
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
                disabled={!uploadedFile || !title.trim() || taskState === 'submitting'}
                className={`px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                  uploadedFile && title.trim() && taskState !== 'submitting'
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

export default PlatformTask;