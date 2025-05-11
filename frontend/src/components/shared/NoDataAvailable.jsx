import React from 'react';

const NoDataAvailable = ({ message = 'No data available' }) => {
  return (
    <div className="flex   mt-52 flex-col items-center justify-center p-8 text-center">
      {/* Illustration */}
      <div className="w-24 h-24 mb-4 text-gray-400">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </div>
      
      {/* Message */}
      <h3 className="text-lg font-medium text-gray-600 mb-1">
        {message}
      </h3>
      <p className="text-gray-500 text-sm">
        Check back later or create a new form
      </p>
    </div>
  );
};

export default NoDataAvailable;