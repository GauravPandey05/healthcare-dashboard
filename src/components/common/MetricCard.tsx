import React from 'react';

export interface MetricCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
    suffix?: string; // Added suffix property
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'primary', 
  trend 
}) => {
  // Get the correct color classes based on the color prop
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return {
          bgLight: 'bg-primary-100',
          textColor: 'text-primary-700'
        };
      case 'secondary':
        return {
          bgLight: 'bg-purple-100',
          textColor: 'text-purple-700'
        };
      case 'success':
        return {
          bgLight: 'bg-green-100',
          textColor: 'text-green-700'
        };
      case 'danger':
        return {
          bgLight: 'bg-red-100',
          textColor: 'text-red-700'
        };
      case 'warning':
        return {
          bgLight: 'bg-yellow-100',
          textColor: 'text-yellow-700'
        };
      case 'info':
        return {
          bgLight: 'bg-blue-100',
          textColor: 'text-blue-700'
        };
      default:
        return {
          bgLight: 'bg-primary-100',
          textColor: 'text-primary-700'
        };
    }
  };

  const { bgLight, textColor } = getColorClasses();

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${bgLight}`}>
            <div className={textColor}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {trend && (
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm flex items-center">
            <div className="mr-2">
              {trend.isPositive ? (
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
            </div>
            <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
              {trend.value}{trend.suffix || ''}
            </span>
            <span className="text-gray-500 ml-1">from previous period</span>
          </div>
        </div>
      )}
    </div>
  );
};