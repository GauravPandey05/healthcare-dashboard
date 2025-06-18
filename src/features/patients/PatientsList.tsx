import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatusBadge } from '../../components/common/StatusBadge';
import { dataService } from '../../services/dataService';
import type { SecurePatient } from '../../types/schema';
import { TableSkeleton } from '../../components/common/Skeleton';

// Interface for enhanced patient with original ID
interface EnhancedPatient extends SecurePatient {
  originalId: string;
}

export const PatientsList: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<EnhancedPatient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        // Get secure patients for display
        const secureData = await dataService.getSecurePatients();
        
        // Unmask patient IDs - this is the key step
        const enhancedPatients: EnhancedPatient[] = await Promise.all(
          secureData.map(async (securePatient) => {
            // Extract the pattern from the masked ID
            const maskedId = securePatient.id; // e.g., "P••1"
            
            // Extract the first character (P) and last digit (1)
            const prefix = maskedId.charAt(0);
            const suffix = maskedId.charAt(maskedId.length - 1);
            
            // Try a series of potential original IDs
            // Most common patterns would be P0001, P0002, etc.
            let originalId = '';
            
            // Potential ID patterns to try
            const potentialIds = [
              `${prefix}000${suffix}`,  // P0001
              `${prefix}00${suffix}`,   // P001
              `${prefix}0${suffix}`,    // P01
              `${prefix}${suffix}`      // P1
            ];
            
            // Try each potential ID
            for (const id of potentialIds) {
              const patient = await dataService.getPatientById(id);
              if (patient) {
                // Check if this patient matches our secure patient
                // by comparing non-masked fields
                if (
                  patient.age === securePatient.age &&
                  patient.gender === securePatient.gender &&
                  patient.department === securePatient.department &&
                  patient.doctor === securePatient.doctor
                ) {
                  originalId = patient.id;
                  break;
                }
              }
            }
            
            return {
              ...securePatient,
              originalId: originalId || securePatient.id
            };
          })
        );
        
        setPatients(enhancedPatients);
      } catch (err) {
        console.error('Error loading patients:', err);
        setError('Failed to load patients. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPatients();
  }, []);
  
  const handlePatientClick = (patient: EnhancedPatient) => {
    console.log(`Navigating to patient: ${patient.originalId} (was: ${patient.id})`);
    navigate(`/patients/${patient.originalId}`);
  };
  
  // Filter patients based on search term and status filter
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.doctor.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
          <p className="text-gray-500">View and manage patient records</p>
        </div>
        <div className="mb-6">
          <div className="bg-gray-200 animate-pulse h-10 w-full rounded mb-4"></div>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
        <p className="text-gray-500">View and manage patient records</p>
      </div>
      
      {/* Search and Filter with white background styling */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="bg-white focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-200 rounded-md"
              placeholder="Search patients by name, ID, department or doctor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-shrink-0">
          <select
            className="bg-white text-gray-700 block w-full pl-3 pr-10 py-2 text-base border-gray-200 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="In Treatment">In Treatment</option>
            <option value="Critical">Critical</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Discharged">Discharged</option>
          </select>
        </div>
      </div>
      
      {/* Patients Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
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
                  Doctor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Appointment
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handlePatientClick(patient)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.fullName}</div>
                          <div className="text-sm text-gray-500">ID: {patient.id}</div>
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
                      {patient.doctor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(patient.lastVisit).toLocaleDateString()}
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
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No patients found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
};

export default PatientsList;