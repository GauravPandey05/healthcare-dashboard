import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { StatusType } from '../../components/common/StatusBadge';
import type { Appointment, AppointmentData } from '../../types/schema';
import { dataService } from '../../services/dataService';
import { formatTimeForDisplay } from '../../utils/dateUtils';
import { TableSkeleton } from '../../components/common/Skeleton';
import { useNavigate } from 'react-router-dom';
import { maskPII } from '../../utils/privacyUtils';

// Create an interface that extends Appointment for the wait time data
interface EnhancedAppointment extends Appointment {
  waitTime?: number;
}

const AppointmentSchedule: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduledAppointments, setScheduledAppointments] = useState<EnhancedAppointment[]>([]);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get appointment data for stats
        const data = await dataService.getAppointments();
        setAppointmentData(data);
        
        // Initially select Monday
        setSelectedDay('Monday');
      } catch (err) {
        console.error('Error fetching appointment data:', err);
        setError('Failed to load appointment data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Add this effect to handle day selection
  useEffect(() => {
    if (selectedDay) {
      processAppointmentsForDay(selectedDay);
    }
  }, [selectedDay]);
  
  // Process appointments for the selected day - using data from healthcareData
  const processAppointmentsForDay = async (day: string) => {
    try {
      setIsLoading(true);
      // Get all appointments from dataService
      const allAppointments = await dataService.getAllAppointments();
      
      // Days of the week
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const selectedDayIndex = daysOfWeek.indexOf(day);
      
      // Filter appointments for the selected day by checking the date
      const dayAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getDay() === selectedDayIndex;
      }).map(apt => {
        // Calculate wait time based on the selected day's average from appointmentData
        const avgWaitTime = appointmentData?.weeklySchedule.find(d => d.day === day)?.waitTime || 0;
        
        // Only add waitTime for completed appointments
        const waitTime = apt.status === 'Completed' ? avgWaitTime : undefined;
        
        // Return enhanced appointment with wait time
        return { ...apt, waitTime } as EnhancedAppointment;
      });
      
      setScheduledAppointments(dayAppointments);
    } catch (err) {
      console.error('Error processing appointments for day:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to map appointment status to StatusBadge type
  const mapStatusToStatusType = (status: string): StatusType => {
    switch (status) {
      case 'Scheduled': 
        return 'Scheduled' as StatusType;
      case 'In Progress': 
        return 'In Treatment' as StatusType;
      case 'Completed': 
        return 'Completed' as StatusType;
      case 'Cancelled': 
        return 'Cancelled' as StatusType;
      case 'No-show': 
        return 'No-show' as StatusType;
      default: 
        return 'Scheduled' as StatusType;
    }
  };
  
  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Appointment Schedule</h1>
          <p className="text-gray-500">Daily appointment schedule by day of week</p>
        </div>
        <TableSkeleton />
      </PageContainer>
    );
  }
  
  if (error || !appointmentData) {
    return (
      <PageContainer>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error || 'No appointment data available'}</span>
        </div>
      </PageContainer>
    );
  }
  
  const selectedDayData = appointmentData.weeklySchedule.find(d => d.day === selectedDay)!;

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Appointment Schedule</h1>
          <p className="text-gray-500">Daily appointment schedule by day of week</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/appointments')}
            className="border border-gray-300 bg-white text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 text-sm"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/appointments/list')}
            className="border border-gray-300 bg-white text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 text-sm"
          >
            All Appointments
          </button>
        </div>
      </div>
      
      {/* Day selection tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-6">
          {appointmentData.weeklySchedule.map(day => (
            <button
              key={day.day}
              type="button" // Add this to prevent form submission
              onClick={(e) => {
                e.preventDefault(); // Prevent default browser action
                e.stopPropagation(); // Stop event bubbling
                setSelectedDay(day.day);
              }}
              className={`
                whitespace-nowrap py-2 px-4 font-medium text-sm rounded-md transition-colors
                ${selectedDay === day.day
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' // Subtle blue for selected tab
                  : 'text-gray-600 hover:bg-gray-50 border border-transparent'  // Gray with hover effect
                }
              `}
            >
              {day.day}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Day statistics */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-800 font-medium">Scheduled</div>
            <div className="text-2xl font-bold text-blue-900">{selectedDayData.scheduled}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-800 font-medium">Completed</div>
            <div className="text-2xl font-bold text-green-900">{selectedDayData.completed}</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-sm text-red-800 font-medium">Cancelled</div>
            <div className="text-2xl font-bold text-red-900">{selectedDayData.cancelled}</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-sm text-yellow-800 font-medium">Average Wait</div>
            <div className="text-2xl font-bold text-yellow-900">{selectedDayData.waitTime} min</div>
          </div>
        </div>
      </div>
      
      {/* Schedule Actions */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800">
          Schedule for {selectedDay}
        </h2>
        <button
          onClick={() => {/* Would open add appointment modal */}}
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md flex items-center text-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Appointment
        </button>
      </div>
      
      {/* Appointments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wait Time
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scheduledAppointments.map((appointment, index) => (
                <tr 
                  key={appointment.id} 
                  className={`hover:bg-gray-50 ${
                    appointment.status === 'Cancelled' ? 'bg-red-50' : 
                    appointment.status === 'In Progress' ? 'bg-blue-50' :
                    appointment.status === 'Completed' ? 'bg-green-50' :
                    ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatTimeForDisplay(appointment.time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {maskPII(appointment.patientName).charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3 text-sm font-medium text-gray-900">
                        {maskPII(appointment.patientName)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {maskPII(appointment.doctor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={mapStatusToStatusType(appointment.status)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {appointment.status === 'Completed' ? 
                      `${appointment.waitTime || '-'} min` : 
                      appointment.status === 'In Progress' ?
                      'In progress' :
                      '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2 justify-center">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => alert(`Edit appointment ${appointment.id}`)}
                        title="Edit Appointment"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => alert(`Cancel appointment ${appointment.id}`)}
                          title="Cancel Appointment"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {scheduledAppointments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No appointments scheduled for {selectedDay}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Time slot legend */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-md font-medium text-gray-800 mb-2">Time Slot Legend</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
            <span className="text-sm text-gray-600">Cancelled</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AppointmentSchedule;