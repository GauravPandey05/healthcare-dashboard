import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { StatusType } from '../../components/common/StatusBadge';
import { dataService } from '../../services/dataService';
import { maskPII } from '../../utils/privacyUtils';
import type { AppointmentData } from '../../types/schema';
import { TableSkeleton } from '../../components/common/Skeleton';
import { useNavigate } from 'react-router-dom';

interface ScheduledAppointment {
  id: string;
  time: string;
  patientName: string;
  doctor: string;
  department: string;
  type: string;
  status: string;
  waitTime?: number;
}

const AppointmentSchedule: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [scheduledAppointments, setScheduledAppointments] = useState<ScheduledAppointment[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await dataService.getAppointments();
        setAppointmentData(data);
        
        // Generate schedule for the selected day
        const dayData = data.weeklySchedule.find(d => d.day === selectedDay);
        if (dayData) {
          setScheduledAppointments(generateDailySchedule(dayData, data));
        }
      } catch (err) {
        console.error('Error fetching appointment data:', err);
        setError('Failed to load appointment data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // When the selected day changes, generate a new schedule
  useEffect(() => {
    if (appointmentData) {
      const dayData = appointmentData.weeklySchedule.find(d => d.day === selectedDay);
      if (dayData) {
        setScheduledAppointments(generateDailySchedule(dayData, appointmentData));
      }
    }
  }, [selectedDay, appointmentData]);
  
  // Helper function to generate a daily schedule
  const generateDailySchedule = (
    dayData: any, 
    data: AppointmentData
  ): ScheduledAppointment[] => {
    const appointments: ScheduledAppointment[] = [];
    const typeOptions = data.byType.map(t => t.type);
    const doctorNames = [
      "Dr. Smith", "Dr. Johnson", "Dr. Williams", "Dr. Jones", "Dr. Brown", 
      "Dr. Davis", "Dr. Miller", "Dr. Wilson", "Dr. Moore", "Dr. Taylor"
    ];
    const departments = [
      "Cardiology", "Orthopedics", "Neurology", "Pediatrics", 
      "Obstetrics", "Psychiatry", "Oncology", "Emergency"
    ];
    
    // Generate appointments based on scheduled count
    for (let i = 0; i < dayData.scheduled; i++) {
      // Calculate time slot (8am to 5pm)
      const hour = Math.floor(i / 4) + 8;  // 4 appointments per hour
      const minute = (i % 4) * 15;         // 15-minute intervals
      const formattedHour = hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const timeString = `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
      
      // Determine status based on day data proportions
      let status = 'Scheduled';
      if (i < dayData.completed) {
        status = 'Completed';
      } else if (i < dayData.completed + dayData.cancelled) {
        status = 'Cancelled';
      } else if (dayData.inProgress && i < dayData.completed + dayData.cancelled + dayData.inProgress) {
        status = 'In Progress';
      }
      
      // Calculate wait time for completed appointments
      let waitTime;
      if (status === 'Completed') {
        // Random variation around the average
        const variationFactor = 0.8 + (Math.random() * 0.4); // 80% to 120% of average
        waitTime = Math.round(dayData.waitTime * variationFactor);
      }
      
      appointments.push({
        id: `APT-${selectedDay}-${i}`,
        time: timeString,
        patientName: `Patient ${i+1}`,
        doctor: doctorNames[Math.floor(Math.random() * doctorNames.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        type: typeOptions[Math.floor(Math.random() * typeOptions.length)],
        status: status,
        waitTime: waitTime
      });
    }
    
    // Sort by time
    return appointments.sort((a, b) => {
      // Extract hour and minute
      const [aTime, aAmPm] = a.time.split(' ');
      const [aHour, aMinute] = aTime.split(':').map(Number);
      const [bTime, bAmPm] = b.time.split(' ');
      const [bHour, bMinute] = bTime.split(':').map(Number);
      
      // Convert to 24-hour format for comparison
      const aHour24 = aHour + (aAmPm === 'PM' && aHour !== 12 ? 12 : 0) - (aAmPm === 'AM' && aHour === 12 ? 12 : 0);
      const bHour24 = bHour + (bAmPm === 'PM' && bHour !== 12 ? 12 : 0) - (bAmPm === 'AM' && bHour === 12 ? 12 : 0);
      
      // Compare hours first, then minutes
      if (aHour24 !== bHour24) return aHour24 - bHour24;
      return aMinute - bMinute;
    });
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
      <div className="mb-6">
        <div className="flex space-x-1 border-b overflow-x-auto">
          {appointmentData.weeklySchedule.map(day => (
            <button
              key={day.day}
              className={`py-2 px-4 text-sm font-medium border-b-2 ${
                selectedDay === day.day 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setSelectedDay(day.day)}
            >
              {day.day}
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {day.scheduled}
              </span>
            </button>
          ))}
        </div>
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
                    {appointment.time}
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
                      `${appointment.waitTime} min` : 
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