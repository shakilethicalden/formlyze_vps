'use client'
import { useSession } from 'next-auth/react';
import React from 'react';

const LoadingPage = () => {
  const session = useSession();
  const user = session?.data?.user;

  return (
    <div className={`flex ${user ? '' : ''} flex-col items-center justify-center min-h-screen bg-white`}>
      {/* Minimal Spinner */}
      <div className="w-12 h-12 border-4 border-[#1A1466] border-t-transparent rounded-full animate-spin mb-4"></div>
      
      {/* Simple Text */}
      <p className="text-[#1A1466] font-medium">Loading...</p>
      
      {/* Subtle Progress Indicator */}
      <div className="w-40 h-1 bg-gray-100 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-[#1A1466] rounded-full animate-progress"></div>
      </div>
    </div>
  );
};

export default LoadingPage;