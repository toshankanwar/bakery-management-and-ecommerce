const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      {/* Simple professional spinner */}
      <div className="flex flex-col items-center">
        {/* Minimal spinning ring */}
        <div className="h-12 w-12 border-4 border-gray-200 rounded-full border-t-4 border-green-500 animate-spin"></div>
        {/* Loading text */}
        <div className="mt-4 text-lg font-semibold text-gray-700 tracking-wide">Loading...</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;