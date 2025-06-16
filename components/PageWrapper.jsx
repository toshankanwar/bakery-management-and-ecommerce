'use client';

import { useState, useEffect } from 'react';
import ComponentLoader from './ComponentLoader';

const PageWrapper = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Adjust time as needed

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ComponentLoader />;
  }

  return children;
};

export default PageWrapper;