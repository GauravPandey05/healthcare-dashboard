// Create a new component for skeleton loading states

import React from 'react';

interface SkeletonProps {
  height?: string;
  width?: string;
  className?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height = 'h-4',
  width = 'w-full',
  className = '',
  rounded = true
}) => {
  return (
    <div 
      className={`bg-gray-200 animate-pulse ${height} ${width} ${rounded ? 'rounded' : ''} ${className}`}
    />
  );
};

export const MetricCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm h-full">
      <div className="flex items-start justify-between">
        <div className="w-full">
          <Skeleton className="mb-2" height="h-4" width="w-24" />
          <Skeleton className="mb-4" height="h-8" width="w-20" />
          <div className="flex items-center">
            <Skeleton height="h-4" width="w-16" />
          </div>
        </div>
        <div className="bg-gray-200 animate-pulse h-10 w-10 rounded-full" />
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-64' }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <Skeleton className="mb-4" height="h-6" width="w-32" />
      <div className={`${height} w-full flex items-center justify-center`}>
        <div className="text-gray-400">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-2 text-sm text-center">Loading chart data...</p>
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <Skeleton className="mb-4" height="h-6" width="w-32" />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[...Array(4)].map((_, i) => (
                <th key={i} scope="col" className="px-6 py-3 text-left">
                  <Skeleton height="h-4" width="w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(rows)].map((_, i) => (
              <tr key={i}>
                {[...Array(4)].map((_, j) => (
                  <td key={j} className="px-6 py-4 whitespace-nowrap">
                    <Skeleton height="h-4" width={j === 0 ? "w-32" : "w-24"} />
                    {j === 0 && <Skeleton className="mt-1" height="h-3" width="w-16" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};