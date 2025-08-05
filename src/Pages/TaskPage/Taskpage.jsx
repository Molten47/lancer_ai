import React, { useState, useEffect } from 'react';
import { FileText, Upload, Clock, CheckCircle } from 'lucide-react';

const SkillsAssessmentTask = () => {
  const [taskStarted, setTaskStarted] = useState(false);
  const [taskSubmitted, setTaskSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(150 * 60); // 150 minutes in seconds
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submissionTime, setSubmissionTime] = useState('');

  // Timer effect
  useEffect(() => {
    if (!taskStarted || taskSubmitted) return;

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
  }, [taskStarted, taskSubmitted]);

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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const handleSubmitTask = () => {
    // Calculate completion time
    const completedInSeconds = (150 * 60) - timeRemaining;
    const completionTime = formatTime(completedInSeconds);
    setSubmissionTime(completionTime);
    setTaskSubmitted(true);

    // Simulate redirect after 3 seconds
    setTimeout(() => {
      // In a real app, this would redirect to the dashboard
      console.log('Redirecting to dashboard...');
    }, 3000);
  };

  if (taskSubmitted) {
    // Success screen
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="bg-green-100 rounded-full p-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              Task Submitted Successfully!
            </h1>
            <p className="text-gray-600">
              Your task has been submitted for review. You completed the task in {submissionTime}
            </p>
            <p className="text-gray-600">
              You'll be redirected to your dashboard shortly
            </p>
          </div>

          {/* Redirecting Message */}
          <div className="pt-4">
            <p className="text-blue-600 font-medium">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!taskStarted) {
    // Initial screen - Ready to begin
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center">
        <div className='w-full max-w-6xl flex flex-col rounded-xl overflow-hidden shadow-xl'>
          <div className="bg-blue-600 text-white px-8 py-6">
            <h1 className="text-2xl font-semibold">Skills Assessment Task</h1>
            <p className="text-blue-100 mt-1">Complete this task to demonstrate your skills</p>
          </div>
        
          <div className="flex flex-col items-center justify-center px-8 py-20">
            <div className="bg-blue-100 rounded-full p-8 mb-8">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
          
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Ready to begin your skills assessment?
            </h2>
          
            <p className="text-gray-600 text-center max-w-md mb-8 leading-relaxed">
              When you click "Start Task", you'll see the task details and a timer will begin. You'll have a limited time to complete and submit your work.
            </p>
          
            <button
              onClick={() => setTaskStarted(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Start Task
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Task details screen
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center items-center">
      <div className='w-full max-w-6xl flex flex-col rounded-xl overflow-hidden shadow-xl'>
        <div className="bg-blue-600 text-white px-8 py-6">
          <h1 className="text-2xl font-semibold">Skills Assessment Task</h1>
          <p className="text-blue-100 mt-1">Complete this task to demonstrate your skills</p>
        </div>
      
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Task Details</h2>
              <div className="flex items-center text-blue-600 font-medium">
                <Clock className="w-5 h-5 mr-2" />
                {formatTime(timeRemaining)}
              </div>
            </div>
          
            <div className="space-y-4 text-gray-700">
              <div>
                <strong>Task:</strong> Create a responsive landing page for a fictional startup
              </div>
            
              <div>
                <strong>Requirements:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 ml-4">
                  <li>Design a clean, modern landing page for a tech startup called "InnovateTech"</li>
                  <li>Include the following sections: Hero, Features, Testimonials, and Contact</li>
                  <li>Make sure the design is responsive and works well on mobile devices</li>
                  <li>Use appropriate color schemes and typography</li>
                </ol>
              </div>
            
              <div>
                <strong>Deliverable:</strong>
                <div className="mt-1 text-gray-600">
                  - HTML/CSS files or a design mockup (PDF, PNG, or Figma link)
                </div>
              </div>
            
              <div>
                <strong>Time limit:</strong> 150 minutes
              </div>
            </div>
          </div>
        
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Submit Your Work</h3>
          
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
                        {(uploadedFile.size / 1024).toFixed(2)} KB
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
                        accept=".pdf,.png,.jpg,.jpeg,.zip,.html,.css,.js"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Supports: PDF, PNG, JPG, ZIP, HTML files up to 10MB
                  </p>
                </div>
              )}
            </div>
          
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSubmitTask}
                className={`px-8 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  uploadedFile
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!uploadedFile}
              >
                Submit Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsAssessmentTask;