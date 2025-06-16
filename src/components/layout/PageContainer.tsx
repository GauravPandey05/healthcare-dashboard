import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`w-full px-4 sm:px-6 md:px-8 max-w-full mx-auto ${className}`}>
      {children}
    </div>
  );
};