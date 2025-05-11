// app/not-found.js
export default function NotFound() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="text-center space-y-6 animate-fade-in">
          {/* Animated 404 text */}
          <div className="relative">
            <h1 className="text-9xl font-bold text-[#1A1466] opacity-10">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-5xl font-bold text-[#1A1466]">Page Not Found</h2>
            </div>
          </div>
          
          {/* Error message */}
          <p className="text-lg text-gray-600 max-w-md">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          
          {/* Home button with hover effect */}
          <div className="pt-4">
            <a 
              href="/" 
              className="relative inline-flex items-center px-6 py-3 bg-[#1A1466] text-white rounded-lg shadow-md hover:bg-[#0f0b4d] transition-all duration-300 group"
            >
              <span className="relative z-10">Return Home</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#1A1466] to-[#3a34a0] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }