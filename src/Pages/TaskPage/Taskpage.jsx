import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Upload, CheckCircle, User, MessageSquare, Timer, XCircle } from 'lucide-react'; // Added XCircle for error
import { useNavigate } from 'react-router-dom'; // Added for navigation

const LancerTaskPage = () => {
  const [isTaskStarted, setIsTaskStarted] = useState(false);
  const [duration, setDuration] = useState(0); // Time elapsed since task started
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [taskInstructions, setTaskInstructions] = useState(null); // To store task details from API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigation hook
  // const [startTime, setStartTime] = useState(null); // Store actual start time for API
  // const [submissionTime, setSubmissionTime] = useState(null); // Store actual submission time for API

  // Countdown timer settings (in seconds) - you can adjust this
  // This will be ideally loaded from the taskInstructions from the backend
  const DEFAULT_TASK_DURATION = 7200; // 2 hours = 7200 seconds
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TASK_DURATION);

  // Effect for the timers (elapsed and countdown)
  useEffect(() => {
    let interval;
    if (isTaskStarted && !isTaskCompleted) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
        setTimeLeft(prev => {
          const newTimeLeft = prev - 1;
          if (newTimeLeft <= 0) {
            clearInterval(interval); // Stop timer when time's up
            setIsTaskCompleted(true); // Optionally auto-complete or notify
            return 0;
          }
          return newTimeLeft;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTaskStarted, isTaskCompleted]);

  // Function to format time for display
  const formatTime = (seconds) => {
    if (seconds < 0) seconds = 0; // Ensure no negative time display
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeLeftColor = () => {
    if (timeLeft > DEFAULT_TASK_DURATION * 0.5) return 'text-green-600'; // More than 50% left
    if (timeLeft > DEFAULT_TASK_DURATION * 0.2) return 'text-yellow-600'; // More than 20% left
    return 'text-red-600'; // Less than 20% left
  };

  const getTimeLeftBgColor = () => {
    if (timeLeft > DEFAULT_TASK_DURATION * 0.5) return 'bg-green-50 border-green-200';
    if (timeLeft > DEFAULT_TASK_DURATION * 0.2) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  // Frontend-only: Simulate task start
  const handleStartTask = useCallback(() => {
    setLoading(true);
    setError(null);
    // const currentStartTime = new Date().toISOString();
    // setStartTime(currentStartTime); // Store actual start time

    // Simulate API call delay
    setTimeout(() => {
      setTaskInstructions({
        description: "Design a landing page for a new creative agency, 'Innovate & Create Co.' The page should be visually appealing, user-friendly, and showcase their services. Include a hero section, services offered, a portfolio showcase, testimonials, and a contact form.",
        deliverables: ["High-fidelity mockups (Figma/Sketch/Adobe XD file)", "Exported JPG/PNG images of the final design", "Brief explanation of design choices"],
        guidelines: "Use a modern, clean aesthetic. Incorporate a color palette with shades of blue and green. Ensure responsiveness for mobile and desktop. Brand personality: innovative, professional, and approachable."
      });
      setTimeLeft(DEFAULT_TASK_DURATION); // Use default duration for now
      setIsTaskStarted(true);
      setLoading(false);
    }, 1500); // Simulate 1.5 seconds loading time
  }, [DEFAULT_TASK_DURATION]);

  // Frontend-only: Simulate task completion with navigation
  const handleCompleteTask = useCallback(() => {
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one file before completing the task.');
      return;
    }

    setLoading(true);
    setError(null);
    // const currentSubmissionTime = new Date().toISOString();
    // setSubmissionTime(currentSubmissionTime); // Store actual submission time

    // Simulate API call delay
    setTimeout(() => {
      setIsTaskCompleted(true);
      setLoading(false);
      
  
      
      // Navigate to freelancer dashboard after a short delay
      setTimeout(() => {
        navigate('/freelancer-dashboard', {
          state: {
            taskCompleted: true,
            completionTime: duration,
            filesSubmitted: uploadedFiles.length
          }
        });
      }, 2000); // 2 second delay to show completion state
      
    }, 1500); // Simulate 1.5 seconds loading time
  }, [uploadedFiles, duration, navigate]);

  // Navigate to dashboard function (can be used for a manual "Go to Dashboard" button)
  const handleGoToDashboard = () => {
    navigate('/freelancer-dashboard', {
      state: {
        taskCompleted: true,
        completionTime: duration,
        filesSubmitted: uploadedFiles.length
      }
    });
  };

  // Modified handleFileUpload to store actual File objects if possible
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    // You should store the actual File objects if you want to send them via FormData
    setUploadedFiles(prev => [...prev, ...files]); // Store actual File objects
  };

  return (
    <div className="min-h-screen bg-gray-50 basic-font">

      {/* Timer Header - Only show when task is started and not completed */}
      {isTaskStarted && !isTaskCompleted && (
        <div className={`sticky top-0 z-10 border-b-2 p-3 md:p-4 ${getTimeLeftBgColor()}`}>
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 md:space-x-4">
              <Timer className={`w-5 h-5 md:w-6 md:h-6 ${getTimeLeftColor()}`} />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Time Remaining</p>
                <p className={`text-xl md:text-2xl font-mono font-bold ${getTimeLeftColor()}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:space-x-4">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Time Elapsed</p>
                <p className="text-lg md:text-xl font-mono font-bold text-cyan-600">
                  {formatTime(duration)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Your Current Task</h2>
          <p className="text-sm md:text-base text-gray-600">Complete the design task below and upload your work when finished</p>
        </div>

        {/* Loading and Error Messages */}
        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
            <p className="font-bold">Processing...</p>
            <p className="text-sm">Please wait while we handle your request.</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 flex items-center" role="alert">
            <XCircle className="w-5 h-5 mr-3" />
            <div>
              <p className="font-bold">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-700 hover:text-red-900"
              aria-label="Close alert"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Task Message - Conditional rendering based on taskInstructions */}
        {taskInstructions ? (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 md:p-8 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 gap-2">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-cta rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-cta text-white rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 shadow-sm ">
                  <p className="text-base md:text-lg leading-relaxed">
                    {taskInstructions.description || 'No task description provided.'}
                  </p>
                </div>
                {taskInstructions.deliverables && taskInstructions.deliverables.length > 0 && (
                  <div className="bg-gray-50 rounded-lg md:rounded-xl p-4 md:p-5 mb-3 md:mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Deliverables needed:</h4>
                    <ul className="space-y-2 text-sm md:text-base text-gray-700">
                      {taskInstructions.deliverables.map((item, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0"></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {taskInstructions.guidelines && (
                  <div className="text-sm md:text-base text-gray-600">
                    <strong className="text-gray-900">Brand Guidelines:</strong> {taskInstructions.guidelines}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 md:p-8 mb-6 md:mb-8 text-center text-gray-600">
            <p>Awaiting task instructions. Please click 'Start Task' to load them.</p>
          </div>
        )}

        {/* Task Duration Info - Show before starting */}
        {!isTaskStarted && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 gap-2.5">
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto sm:mx-0 " />
              <div className="text-center sm:text-left">
                <h3 className="text-base md:text-lg font-semibold text-blue-900 ml-4">Task Duration</h3>
                <p className="text-sm md:text-base text-blue-700">
                  You have <span className="font-mono font-bold text-lg md:text-xl">{formatTime(DEFAULT_TASK_DURATION)}</span> to complete this task
                </p>
                <p className="text-xs md:text-sm text-blue-600 mt-1">Timer will start when you click "Start Task"</p>
              </div>
            </div>
          </div>
        )}

        {/* Task Controls - Row Layout on Large Screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column - Start Task / Upload */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 md:p-8">
            {!isTaskStarted ? (
              <div className="text-center py-6 md:py-8">
                <h3 className="text-lg md:text-[1.2rem] font-semibold text-gray-900 mb-4 md:mb-6">Ready to Begin?</h3>
                <button
                  onClick={handleStartTask}
                  className="bg-cta hover:bg-cyan-600 text-white px-6 py-3 mt-3 rounded-xl text-base md:text-lg font-medium transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading} // Disable button while loading
                >
                  {loading ? 'Starting...' : 'Start Task'}
                </button>
                <p className="text-sm md:text-base text-gray-500 mt-4">Timer will begin when you start the task</p>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {/* Upload Section */}
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">Upload Your Work</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg md:rounded-xl p-6 md:p-8 text-center hover:border-cyan-400 transition-all hover:bg-cyan-50">
                    <Upload className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm md:text-base text-gray-600 mb-4">Drag and drop your files here, or click to browse</p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".jpg,.jpeg,.png,.pdf,.ai,.psd,.sketch,.fig"
                      disabled={isTaskCompleted || loading}
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl cursor-pointer inline-block transition-all transform hover:scale-105 shadow-md text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Choose Files
                    </label>
                    <p className="text-xs md:text-sm text-gray-500 mt-3">
                      Supported formats: JPG, PNG, PDF, AI, PSD, Sketch, Figma
                    </p>
                  </div>
                </div>

                {/* Complete Task Button */}
                {uploadedFiles.length > 0 && !isTaskCompleted && (
                  <div className="text-center pt-4">
                    <button
                      onClick={handleCompleteTask}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 md:px-10 py-3 md:py-4 rounded-xl text-base md:text-lg font-medium transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading || uploadedFiles.length === 0} // Disable if no files or loading
                    >
                      {loading ? 'Submitting...' : 'Complete Task'}
                    </button>
                    <p className="text-xs md:text-sm text-gray-500 mt-2">You can submit anytime after uploading files</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Progress / Results */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 md:p-8">
            {!isTaskStarted ? (
              <div className="text-center py-6 md:py-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Task Progress</h3>
                <p className="text-sm md:text-base text-gray-500">Progress will be shown here once you start the task</p>
              </div>
            ) : !isTaskCompleted ? (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-lg md:text-[1.2rem] font-semibold text-gray-900 mb-4 md:mb-6">Task Progress</h3>

                {/* Progress Stats */}
                <div className="grid grid-cols-2 gap-3 md:gap-4 mt-3">
                  <div className="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-cyan-500 mx-auto mb-2" />
                    <p className="text-xs md:text-sm text-gray-600">Time Elapsed</p>
                    <p className="text-base md:text-lg font-mono font-bold text-cyan-600">{formatTime(duration)}</p>
                  </div>
                  <div className={`rounded-lg md:rounded-xl p-3 md:p-4 text-center ${getTimeLeftBgColor()}`}>
                    <Timer className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 ${getTimeLeftColor()}`} />
                    <p className="text-xs md:text-sm text-gray-600">Time Left</p>
                    <p className={`text-base md:text-lg font-mono font-bold ${getTimeLeftColor()}`}>{formatTime(timeLeft)}</p>
                  </div>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="bg-gray-50 rounded-lg md:rounded-xl p-4 md:p-6">
                    <h4 className="font-semibold text-gray-900 mb-3 md:mb-4">Uploaded Files:</h4>
                    <div className="space-y-2 md:space-y-3 max-h-32 md:max-h-40 overflow-y-auto">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 md:space-x-3 text-gray-700">
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                          <span className="font-medium text-xs md:text-sm break-all">{file.name}</span> {/* Display file.name */}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadedFiles.length === 0 && (
                  <div className="text-center py-6 md:py-8">
                    <Upload className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm md:text-base text-gray-500">No files uploaded yet</p>
                  </div>
                )}
              </div>
            ) : (
              /* Task Completed State */
              <div className="text-center py-6 md:py-8">
                <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500 mx-auto mb-4 md:mb-6" />
                <h3 className="text-lg md:text-[1.2rem] font-bold text-gray-900 mb-3 md:mb-4">Task Completed!</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                  Excellent work! Your submission has been sent for review.
                </p>
                <div className="bg-gray-50 rounded-lg md:rounded-xl p-4 md:p-6 mb-4">
                  <div className="grid grid-cols-2 gap-3 md:gap-4 text-center">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Total Time</p>
                      <p className="font-mono font-bold text-lg md:text-xl text-cyan-600">{formatTime(duration)}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Time Saved</p>
                      <p className="font-mono font-bold text-base md:text-lg text-green-600">{formatTime(timeLeft)}</p>
                    </div>
                  </div>
                  <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
                    <p className="text-xs md:text-sm text-gray-600">Files Submitted: <span className="font-bold">{uploadedFiles.length}</span></p>
                  </div>
                </div>
                {/* Manual Dashboard Navigation Button */}
                <button
                  onClick={handleGoToDashboard}
                  className="bg-cta hover:bg-cyan-600 text-white px-6 py-3 rounded-xl text-base md:text-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                >
                  Go to Dashboard
                </button>
                <p className="text-xs md:text-sm text-gray-500 mt-3">Redirecting automatically...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LancerTaskPage;