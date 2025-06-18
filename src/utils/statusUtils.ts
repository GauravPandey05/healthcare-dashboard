// Status badge types - should match your StatusBadge component
export type StatusType = 'In Treatment' | 'Critical' | 'Completed' | 'Cancelled' | 'No-show' | 'Pending';

// Maps appointment status from data to UI display status
export const mapAppointmentStatusToStatusType = (status: string): StatusType => {
  switch (status?.toLowerCase()) {
    case 'scheduled': 
      return 'Pending';
    case 'in progress': 
      return 'In Treatment';
    case 'completed': 
      return 'Completed';
    case 'cancelled': 
      return 'Cancelled';
    case 'no-show': 
      return 'No-show';
    default: 
      return 'Pending';
  }
};

// Maps patient status from data to UI display status
export const mapPatientStatusToStatusType = (status: string): StatusType => {
  switch (status?.toLowerCase()) {
    case 'in treatment': 
      return 'In Treatment';
    case 'critical': 
      return 'Critical';
    case 'discharged': 
      return 'Completed';
    case 'scheduled': 
      return 'Pending';
    default: 
      return 'Pending';
  }
};

// Get appropriate color for a status
export const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'discharged':
      return 'green';
    case 'in treatment':
    case 'in progress':
      return 'blue';
    case 'pending':
    case 'scheduled':
      return 'yellow';
    case 'cancelled':
    case 'no-show':
      return 'red';
    case 'critical':
      return 'red';
    default:
      return 'gray';
  }
};

// Get background color class based on status
export const getStatusBgClass = (status: string): string => {
  const color = getStatusColor(status);
  return `bg-${color}-100`;
};

// Get text color class based on status
export const getStatusTextClass = (status: string): string => {
  const color = getStatusColor(status);
  return `text-${color}-800`;
};