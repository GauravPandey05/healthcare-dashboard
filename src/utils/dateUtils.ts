/**
 * Utility functions for handling dates in a consistent way
 */

// Format a date string to a display-friendly format
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  // Handle date formats from healthcareData - could be YYYY-MM-DD or MM/DD/YYYY
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateString; // Return original if parsing fails
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format a time string to a consistent format
export const formatTimeForDisplay = (timeString: string): string => {
  if (!timeString) return '';
  
  // Handle various time formats that might be in the data
  if (timeString.includes('AM') || timeString.includes('PM')) {
    return timeString; // Already formatted
  }
  
  // Handle 24-hour format like "14:30"
  const [hours, minutes] = timeString.split(':');
  if (hours && minutes) {
    const hour = parseInt(hours);
    if (hour < 12) {
      return `${hour}:${minutes} AM`;
    } else if (hour === 12) {
      return `12:${minutes} PM`;
    } else {
      return `${hour - 12}:${minutes} PM`;
    }
  }
  
  return timeString; // Return original if parsing fails
};

// Get current date in YYYY-MM-DD format
export const getTodayFormatted = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Compare dates (handles various formats)
export const isSameDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

// Check if a date is in the future
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time portion for comparison
  return date > today;
};

// Format for input date fields (YYYY-MM-DD)
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return '';
  }
  
  return date.toISOString().split('T')[0];
};