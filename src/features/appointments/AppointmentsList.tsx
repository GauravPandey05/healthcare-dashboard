import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { StatusType } from '../../components/common/StatusBadge';
import { dataService } from '../../services/dataService';
import { maskPII, maskPatientId } from '../../utils/privacyUtils';
import type { SecurePatient, AppointmentData } from '../../types/schema';
import { TableSkeleton } from '../../components/common/Skeleton';

// Define the appointment interface that matches the expected data structure
interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  department: string;
  doctor: string;
  type: string;
  status: string;
}

// Helper function to map appointment status to StatusType
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

const AppointmentsList: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<SecurePatient[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch appointment and patient data
        const [apptData, patientsData] = await Promise.all([
          dataService.getAppointments(),
          dataService.getSecurePatients()
        ]);
        
        setAppointmentData(apptData);
        setPatients(patientsData);
        
        // Generate appointments based on the data
        const generatedAppointments = generateAppointmentsFromData(apptData, patientsData);
        setAppointments(generatedAppointments);
        
      } catch (err) {
        console.error('Error fetching appointment data:', err);
        setError('Failed to load appointment data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Generate appointments from data
  const generateAppointmentsFromData = (
    apptData: AppointmentData, 
    patientsData: SecurePatient[]
  ): Appointment[] => {
    const appointments: Appointment[] = [];
    const today = new Date();
    
    // Generate past, current, and future appointments
    patientsData.forEach(patient => {
      // Create appointments based on patient's next appointment (if exists)
      if (patient.nextAppointment && patient.nextAppointment !== 'TBD') {
        const appointmentDate = new Date(patient.nextAppointment);
        
        // Future appointment is scheduled
        if (appointmentDate >= today) {
          appointments.push({
            id: `APT-${Math.floor(Math.random() * 100000)}`,
            patientId: patient.id,
            patientName: patient.fullName,
            date: patient.nextAppointment,
            time: `${9 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
            department: patient.department,
            doctor: patient.doctor,
            type: apptData.byType[Math.floor(Math.random() * apptData.byType.length)].type,
            status: 'Scheduled'
          });
        }
      }
      
      // Create appointments based on patient's last visit
      if (patient.lastVisit) {
        const lastVisitDate = new Date(patient.lastVisit);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // If last visit is today, create an appointment with either "In Progress" or "Completed" status
        if (lastVisitDate.toDateString() === today.toDateString()) {
          appointments.push({
            id: `APT-${Math.floor(Math.random() * 100000)}`,
            patientId: patient.id,
            patientName: patient.fullName,
            date: patient.lastVisit,
            time: `${9 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
            department: patient.department,
            doctor: patient.doctor,
            type: apptData.byType[Math.floor(Math.random() * apptData.byType.length)].type,
            status: Math.random() > 0.5 ? 'Completed' : 'In Progress'
          });
        }
        // If last visit is in the past but not today, create a "Completed" appointment
        else if (lastVisitDate < today) {
          appointments.push({
            id: `APT-${Math.floor(Math.random() * 100000)}`,
            patientId: patient.id,
            patientName: patient.fullName,
            date: patient.lastVisit,
            time: `${9 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
            department: patient.department,
            doctor: patient.doctor,
            type: apptData.byType[Math.floor(Math.random() * apptData.byType.length)].type,
            status: Math.random() > 0.15 ? 'Completed' : (Math.random() > 0.5 ? 'Cancelled' : 'No-show')
          });
        }
      }
    });
    
    // Add some additional random appointments
    for (let i = 0; i < 10; i++) {
      const randomPatient = patientsData[Math.floor(Math.random() * patientsData.length)];
      
      // Random date in the range of +/- 14 days from today
      const dateDelta = Math.floor(Math.random() * 29) - 14;
      const randomDate = new Date();
      randomDate.setDate(today.getDate() + dateDelta);
      
      // Status based on date
      let status;
      if (randomDate < today) {
        // Past appointment
        status = Math.random() > 0.8 ? (Math.random() > 0.5 ? 'Cancelled' : 'No-show') : 'Completed';
      } else if (randomDate.toDateString() === today.toDateString()) {
        // Today's appointment
        status = Math.random() > 0.7 ? 'Completed' : (Math.random() > 0.5 ? 'In Progress' : 'Scheduled');
      } else {
        // Future appointment
        status = 'Scheduled';
      }
      
      appointments.push({
        id: `APT-${Math.floor(Math.random() * 100000)}`,
        patientId: randomPatient.id,
        patientName: randomPatient.fullName,
        date: randomDate.toISOString().split('T')[0],
        time: `${9 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        department: randomPatient.department,
        doctor: randomPatient.doctor,
        type: apptData.byType[Math.floor(Math.random() * apptData.byType.length)].type,
        status: status
      });
    }
    
    return appointments.sort((a, b) => {
      // Sort by date, most recent first
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appointment => {
    // Search term filter
    if (searchTerm && 
        !appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !appointment.department.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !appointment.id.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && appointment.status !== statusFilter) {
      return false;
    }
    
    // Department filter
    if (departmentFilter !== 'all' && appointment.department !== departmentFilter) {
      return false;
    }
    
    // Date filter
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    switch (dateFilter) {
      case 'today':
        return appointmentDate.toDateString() === today.toDateString();
      case 'tomorrow':
        return appointmentDate.toDateString() === tomorrow.toDateString();
      case 'next7Days':
        return appointmentDate >= today && appointmentDate <= nextWeek;
      case 'past':
        return appointmentDate < today;
      case 'custom':
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);  // Include entire end day
        return appointmentDate >= start && appointmentDate <= end;
      default:
        return true;
    }
  });
  
  // Get unique departments from appointments for the filter
  const departmentOptions = Array.from(new Set(appointments.map(a => a.department)));

  // Group appointments by date
  const groupedAppointments: Record<string, Appointment[]> = {};
  filteredAppointments.forEach(appointment => {
    const formattedDate = new Date(appointment.date).toDateString();
    if (!groupedAppointments[formattedDate]) {
      groupedAppointments[formattedDate] = [];
    }
    groupedAppointments[formattedDate].push(appointment);
  });

  // Sort dates from most recent to oldest
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Appointments List</h1>
          <p className="text-gray-500">View and manage all patient appointments</p>
        </div>
        <TableSkeleton />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Appointments List</h1>
          <p className="text-gray-500">View and manage all patient appointments</p>
        </div>
        <div>
          <button
            onClick={() => navigate('/appointments/schedule')} 
            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md flex items-center text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            New Appointment
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                placeholder="Patient, doctor, or ID"
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="statusFilter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-black"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No-show">No-show</option>
            </select>
          </div>
          
          {/* Department Filter */}
          <div>
            <label htmlFor="departmentFilter" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              id="departmentFilter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-black"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departmentOptions.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          {/* Date Filter */}
          <div>
            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              id="dateFilter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-black"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="next7Days">Next 7 Days</option>
              <option value="past">Past Appointments</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {/* Scheduling Button */}
          <div className="flex items-end">
            <button
              onClick={() => navigate('/appointments/schedule')}
              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 w-full"
            >
              View Schedule
            </button>
          </div>
          
          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Count Summary */}
      <div className="flex items-center mb-4 text-sm">
        <span className="text-gray-600">
          Showing {filteredAppointments.length} {filteredAppointments.length === 1 ? 'appointment' : 'appointments'}
        </span>
        {searchTerm && (
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            Search: {searchTerm}
          </span>
        )}
        {statusFilter !== 'all' && (
          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
            Status: {statusFilter}
          </span>
        )}
        {departmentFilter !== 'all' && (
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            Department: {departmentFilter}
          </span>
        )}
        {dateFilter !== 'all' && (
          <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            Date: {dateFilter === 'custom' ? `${startDate} to ${endDate}` : dateFilter}
          </span>
        )}
        {(searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' || dateFilter !== 'all') && (
          <button 
            className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDepartmentFilter('all');
              setDateFilter('all');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Appointments List */}
      {sortedDates.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No appointments match your filter criteria.
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => navigate('/appointments/schedule')}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create an appointment
            </button>
          </div>
        </div>
      ) : (
        sortedDates.map(dateString => {
          const date = new Date(dateString);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const isToday = date.toDateString() === today.toDateString();
          const isPast = date < today;
          const isFuture = date > today;
          
          const formattedDate = new Intl.DateTimeFormat('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }).format(date);
          
          return (
            <div key={dateString} className="mb-6">
              <div className="flex items-center mb-4">
                <h2 className={`text-lg font-medium ${isPast ? 'text-gray-500' : 'text-gray-800'}`}>
                  {formattedDate}
                </h2>
                
                {isToday && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Today
                  </span>
                )}
                
                {isPast && !isToday && (
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    Past
                  </span>
                )}
                
                {isFuture && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Upcoming
                  </span>
                )}
                
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                  {groupedAppointments[dateString].length} {groupedAppointments[dateString].length === 1 ? 'appointment' : 'appointments'}
                </span>
              </div>
              
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groupedAppointments[dateString]
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((appointment, idx) => (
                      <tr 
                        key={appointment.id}
                        className={`hover:bg-gray-50 ${
                          appointment.status === 'Cancelled' ? 'bg-red-50' : 
                          appointment.status === 'No-show' ? 'bg-orange-50' :
                          appointment.status === 'Completed' ? 'bg-green-50' :
                          appointment.status === 'In Progress' ? 'bg-blue-50' :
                          ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                          {appointment.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="font-medium text-blue-700">{maskPII(appointment.patientName).charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {maskPII(appointment.patientName)}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {maskPatientId(appointment.patientId)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {maskPII(appointment.doctor)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={mapStatusToStatusType(appointment.status)} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          <div className="flex space-x-2 justify-center">
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => navigate(`/patients/${appointment.patientId}`)}
                              title="View Patient"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
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
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </PageContainer>
  );
};

export default AppointmentsList;