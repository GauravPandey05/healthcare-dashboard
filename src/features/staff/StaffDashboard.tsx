import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { StatusType } from '../../components/common/StatusBadge';
import { dataService } from '../../services/dataService';
import { maskPII, maskPatientId, maskStaffId } from '../../utils/privacyUtils';
import type { SecureStaffMember, SecurePatient, StaffStatus, Department } from '../../types/schema';
import { MetricCardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/common/Skeleton';

// SVG icons
const UserIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
  </svg>
);

// Function to map staff status to StatusType using StaffStatus type
const mapStatusToStatusType = (status: StaffStatus): StatusType => {
  switch(status) {
    case 'On Duty': return 'Active';
    case 'On Call': return 'Pending';
    case 'Off Duty': return 'Inactive';
    case 'On Leave': return 'Inactive';
    default: return 'Active'; // Default fallback
  }
};

const StaffDashboard: React.FC = () => {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();

  const [staff, setStaff] = useState<SecureStaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<SecureStaffMember | null>(null);
  const [assignedPatients, setAssignedPatients] = useState<SecurePatient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentData, setDepartmentData] = useState<Department | null>(null);

  useEffect(() => {
    const fetchStaffData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // If no staffId provided, fetch all staff and redirect to first one
        if (!staffId) {
          const staffData = await dataService.getSecureStaff();
          
          if (staffData.length > 0) {
            navigate(`/staff/${staffData[0].id}`, { replace: true });
            return;
          } else {
            throw new Error('No staff members found');
          }
        }

        // Use the dedicated method to get a specific staff member
        const staffMember = await dataService.getSecureStaffById(staffId);
        
        if (!staffMember) {
          setError(`Staff member with ID ${staffId} not found.`);
          return;
        }
        
        setSelectedStaff(staffMember);

        // Get all staff for the dropdown
        const allStaff = await dataService.getSecureStaff();
        setStaff(allStaff);

        // Get department data for this staff member's department
        const allDepartments = await dataService.getDepartments();
        const staffDepartment = allDepartments.find(
          dept => dept.name === staffMember.department
        );
        setDepartmentData(staffDepartment || null);

        // Use the dedicated method to get patients for this staff member
        if (staffMember.role.includes('Doctor') || 
            staffMember.role.includes('Cardiologist') || 
            staffMember.role.includes('Surgeon')) {
          const patients = await dataService.getPatientsByStaffId(staffId);
          setAssignedPatients(patients);
        }
      } catch (err) {
        console.error('Error loading staff details:', err);
        setError('Failed to load staff details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffData();
  }, [staffId, navigate]);

  // Handle staff selection change
  const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sid = e.target.value;
    navigate(`/staff/${sid}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <div className="bg-gray-200 animate-pulse h-8 w-48 rounded mb-2"></div>
            <div className="bg-gray-200 animate-pulse h-4 w-64 rounded"></div>
          </div>
          <div className="mt-3 sm:mt-0">
            <div className="bg-gray-200 animate-pulse h-10 w-40 rounded"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array(4).fill(0).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <TableSkeleton />
        </div>
      </PageContainer>
    );
  }

  // Error state
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

  if (!selectedStaff) {
    return (
      <PageContainer>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">No staff member selected. Please select a staff member.</span>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Staff Selection & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff Dashboard</h1>
          <p className="text-gray-500">
            {selectedStaff.role}: {maskPII(selectedStaff.fullName)}
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <select
            value={selectedStaff.id}
            onChange={handleStaffChange}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {staff.map(s => (
              <option key={s.id} value={s.id}>
                {maskPII(s.fullName)} ({s.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Info Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Staff Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-md font-medium text-black">{maskPII(selectedStaff.fullName)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">ID</p>
            <p className="text-md font-medium text-black">{maskStaffId(selectedStaff.id)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-md font-medium text-black">{selectedStaff.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="text-md font-medium text-black">{selectedStaff.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div className="mt-1">
              <StatusBadge status={mapStatusToStatusType(selectedStaff.status)} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Shift</p>
            <p className="text-md font-medium text-black">{selectedStaff.shift}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Experience</p>
            <p className="text-md font-medium text-black">{selectedStaff.experience} years</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Specialty</p>
            <p className="text-md font-medium text-black">{selectedStaff.specialty}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Assigned Patients"
          value={selectedStaff.patients.toString()}
          icon={<UserIcon />}
          color="info"
        />
        <MetricCard
          title="Experience"
          value={`${selectedStaff.experience} years`}
          icon={<ClockIcon />}
          color="success"
        />
        <MetricCard
          title="Current Shift"
          value={selectedStaff.shift.split(' ')[0]} // Just show Day/Night/Evening
          icon={<CalendarIcon />}
          color="warning"
        />
        <MetricCard
          title="Rating"
          value={selectedStaff.rating.toFixed(1)}
          icon={<StarIcon />}
          color={selectedStaff.rating > 4.5 ? 'success' : 'info'}
        />
      </div>

      {/* Department Information */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Department Information</h2>
        
        {departmentData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-700">Total Patients</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{departmentData.totalPatients}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-700">Department Staff</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {departmentData.staff ? 
                  (departmentData.staff.doctors + departmentData.staff.nurses + departmentData.staff.support) : 
                  '-'}
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-700">Satisfaction Score</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{departmentData.satisfaction}%</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-700">Average Wait Time</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{departmentData.avgWaitTime} min</p>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 p-4 text-center">No department information available</div>
        )}
      </div>

      {/* Assigned Patients */}
      {(selectedStaff.role.includes('Doctor') || selectedStaff.role.includes('Cardiologist') || selectedStaff.role.includes('Surgeon')) && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Assigned Patients</h2>
            {assignedPatients.length > 0 && (
              <button
                onClick={() => navigate('/patients')}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                View All Patients
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Appointment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignedPatients.length > 0 ? (
                  assignedPatients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{maskPII(patient.fullName)}</div>
                            <div className="text-sm text-gray-500">ID: {maskPatientId(patient.id)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={patient.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.nextAppointment === 'TBD' 
                          ? 'To Be Determined' 
                          : new Date(patient.nextAppointment).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No patients currently assigned
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Information */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Schedule</h2>
        <p className="text-gray-600 mb-4">Current shift assignment: {selectedStaff.shift}</p>
        
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
            // Determine if this staff member works on this day
            const isWorkDay = selectedStaff.status === 'On Duty' && index > 0 && index < 6;
            const shiftLabel = selectedStaff.shift.split(' ')[0];
            
            return (
              <div 
                key={day} 
                className={`p-3 rounded-md ${
                  isWorkDay 
                    ? shiftLabel === 'Day' 
                      ? 'bg-blue-100 text-blue-800' 
                      : shiftLabel === 'Night'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-purple-100 text-purple-800'
                    : 'bg-gray-50 text-gray-400'
                }`}
              >
                <div className="text-sm font-medium">{day}</div>
                <div className="mt-1 text-xs">
                  {isWorkDay ? selectedStaff.shift.match(/\(([^)]+)\)/)?.[1] || selectedStaff.shift : 'Off'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
};

export default StaffDashboard;