import React from 'react';

const ErrorPage = ({ message = "Something went wrong!" }) => {
  return (
    <div className="flex flex-col  items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
      {/* Error Icon */}
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-10 w-10 text-red-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </div>
      
      {/* Error Message */}
      <h1 className="text-2xl font-medium text-gray-800 mb-2">Oops!</h1>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      
      {/* Action Button */}
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-[#1A1466] text-white cursor-pointer rounded hover:bg-opacity-90 transition"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorPage;