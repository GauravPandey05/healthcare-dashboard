import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';

interface Column<T> {
  key: keyof T | string;
  header: string;
  renderCell?: (value: any, row: T) => React.ReactNode;
  priority: number; // 1 = highest priority (always show), 3 = lowest (hide first on small screens)
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({ 
  columns, 
  data, 
  className = '',
  emptyMessage = 'No data available',
  onRowClick 
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const isTablet = useMediaQuery({ minWidth: 641, maxWidth: 768 });
  
  // Filter columns based on screen size
  const visibleColumns = columns.filter(col => {
    if (isMobile) return col.priority === 1; // Mobile: only highest priority
    if (isTablet) return col.priority <= 2;  // Tablet: medium and high priority
    return true; // Desktop: all columns
  });

  const handleSort = (field: string, sortable?: boolean) => {
    if (!sortable) return;
    
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New sort field
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortField) return data;
    
    return [...data].sort((a: any, b: any) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Handle null or undefined
      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      
      // Handle string comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle numeric comparisons
      return sortDirection === 'asc'
        ? (aValue - bValue)
        : (bValue - aValue);
    });
  }, [data, sortField, sortDirection]);

  // Render empty state
  if (data.length === 0) {
    return (
      <div className={`w-full flex items-center justify-center p-8 text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  // For mobile, render cards instead of table
  if (isMobile) {
    return (
      <div className={`w-full space-y-4 ${className}`}>
        {sortedData.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className={`bg-white rounded-lg p-3 border border-gray-200 shadow-sm ${onRowClick ? 'cursor-pointer' : ''}`}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {visibleColumns.map((column) => (
              <div 
                key={column.key as string} 
                className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm font-medium text-gray-500">{column.header}</span>
                <span className="text-sm text-right">
                  {column.renderCell 
                    ? column.renderCell(getNestedValue(row, column.key as string), row)
                    : getNestedValue(row, column.key as string)
                  }
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // For tablet and above, render traditional table
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {visibleColumns.map((column) => (
              <th
                key={column.key as string}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                onClick={() => handleSort(column.key as string, column.sortable)}
              >
                <div className="flex items-center">
                  {column.header}
                  {sortField === column.key && column.sortable && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {visibleColumns.map((column) => (
                <td key={column.key as string} className="px-4 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {column.renderCell 
                      ? column.renderCell(getNestedValue(row, column.key as string), row)
                      : getNestedValue(row, column.key as string)
                    }
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper function to get values from nested objects using dot notation
// e.g., "staff.doctors" would return row.staff.doctors
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  return keys.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
}