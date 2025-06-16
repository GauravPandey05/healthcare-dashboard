import React from 'react';

export type StatusType = 'In Treatment' | 'Scheduled' | 'Critical' | 'Discharged' | 'Active' | 'Inactive' | 'Recovered' | 'Pending' | 'Completed' | 'Cancelled' | 'No-show';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status,
  size = 'md'
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Active':
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Critical':
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Recovered':
      case 'Discharged':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Pending':
      case 'Scheduled':
      case 'In Treatment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'No-show':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'lg':
        return 'text-sm px-3 py-1.5';
      case 'md':
      default:
        return 'text-xs px-2.5 py-1';
    }
  };

  return (
    <span 
      className={`
        inline-flex items-center rounded-full border 
        ${getStatusStyles()} ${getSizeStyles()}
      `}
    >
      <span className="mr-1 rounded-full h-1.5 w-1.5 bg-current"></span>
      {status}
    </span>
  );
};