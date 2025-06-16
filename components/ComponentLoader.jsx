const ComponentLoader = () => {
    return (
      <div className="w-full h-full min-h-[200px] bg-white flex items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-green-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-green-500 animate-spin" style={{ animationDirection: 'reverse', opacity: 0.7 }}></div>
        </div>
      </div>
    );
  };
  
  export default ComponentLoader;