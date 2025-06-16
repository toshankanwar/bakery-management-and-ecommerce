const LoadingSpinner = () => {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        {/* Main spinner container */}
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="h-32 w-32 rounded-full border-8 border-gray-200 animate-spin">
            <div className="absolute top-0 left-0 h-full w-full rounded-full border-t-8 border-green-500 animate-spin" 
                 style={{ animationDuration: '1.5s' }}></div>
          </div>
  
          {/* Middle spinning ring */}
          <div className="absolute top-4 left-4 h-24 w-24 rounded-full border-8 border-gray-200">
            <div className="absolute top-0 left-0 h-full w-full rounded-full border-t-8 border-green-600 animate-spin" 
                 style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
          </div>
  
          {/* Inner spinning ring */}
          <div className="absolute top-8 left-8 h-16 w-16 rounded-full border-8 border-gray-200">
            <div className="absolute top-0 left-0 h-full w-full rounded-full border-t-8 border-green-700 animate-spin" 
                 style={{ animationDuration: '2.5s' }}></div>
          </div>
  
          {/* Center pulsing circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="h-8 w-8 rounded-full bg-green-500 animate-ping"></div>
            <div className="absolute top-0 left-0 h-8 w-8 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
  
        {/* Loading text container */}
        <div className="mt-12 text-center">
          <div className="text-2xl font-semibold text-gray-800 mb-2">Loading</div>
          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-bounce" 
                 style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 rounded-full bg-green-500 animate-bounce" 
                 style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 rounded-full bg-green-500 animate-bounce" 
                 style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
  
        {/* Progress bar */}
        <div className="absolute bottom-20 w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full animate-progressBar"></div>
        </div>
      </div>
    );
  };
  
  export default LoadingSpinner;