import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatusBadge } from '../../components/common/StatusBadge';
import { dataService } from '../../services/dataService';
import type { SecurePatient } from '../../types/schema';
import { TableSkeleton } from '../../components/common/Skeleton';

export const PatientsList: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<SecurePatient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [debugMode, setDebugMode] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'mock' | 'unknown'>('unknown');
  
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        // API connection check
        const isConnected = await dataService.checkConnection(true);
        setDataSource(isConnected ? 'api' : 'mock');
        
        // Get patients from API
        const securePatients = await dataService.getSecurePatients();
        console.log(`Received ${securePatients.length} patients`);
        
        // Add this debugging code
        if (securePatients.length > 0) {
          // Log all statuses from the API to debug status filter
          const statuses = [...new Set(securePatients.map(p => p.status))];
          console.log("Available patient statuses:", statuses);
          
          // Log departments to check if they're coming through
          console.log("Sample departments:", securePatients.slice(0, 3).map(p => p.department));
          console.log("Sample doctors:", securePatients.slice(0, 3).map(p => p.doctor));
        }
        
        setPatients(securePatients);
      } catch (err) {
        console.error('Error loading patients:', err);
        setError('Failed to load patients. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPatients();
  }, []);
  
  // Simple patient click handler - use ID directly from API response
  const handlePatientClick = (patient: SecurePatient) => {
    navigate(`/patients/${patient.id}`);
  };
  
  // Filter patients based on search term and status filter
  const filteredPatients = patients.filter(patient => {
    // Status filter
    const statusMatch = statusFilter === 'all' || patient.status === statusFilter;
    
    // If no search term, just use status filter
    if (!searchTerm) return statusMatch;
    
    // Case-insensitive search
    const search = searchTerm.toLowerCase();
    
    // Fields to search
    const nameMatch = patient.fullName?.toLowerCase().includes(search) || false;
    const idMatch = patient.id?.toLowerCase().includes(search) || false;
    const deptMatch = patient.department?.toLowerCase().includes(search) || false;
    const doctorMatch = patient.doctor?.toLowerCase().includes(search) || false;
    
    return (nameMatch || idMatch || deptMatch || doctorMatch) && statusMatch;
  });
  
  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
          <p className="text-gray-500">Loading patient data...</p>
        </div>
        <TableSkeleton />
      </PageContainer>
    );
  }
  
  // Error state
  if (error) {
    return (
      <PageContainer>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
          <p className="text-gray-500">An error occurred</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      {/* Header Section */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
          
        </div>
        <button 
          onClick={() => setDebugMode(!debugMode)}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
        >
          {debugMode ? 'Hide Debug' : 'Debug Mode'}
        </button>
      </div>
      
      {/* Search & Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search field */}
        <div className="flex-1">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="bg-white focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-4 py-2 sm:text-sm border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 transition"
              placeholder="Search by name, ID, department or doctor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minHeight: 40 }}
            />
          </div>
        </div>

        {/* Status filter */}
        <div className="md:w-64">
          <select
            className="bg-white text-gray-700 block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minHeight: 40 }}
          >
            <option value="all">All Statuses</option>
            <option value="Critical">Critical</option>
            <option value="In Treatment">In Treatment</option>
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
                    {/* Patient identity column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {patient.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Status column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={patient.status} />
                    </td>
                    
                    {/* Department column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.department && patient.department !== 'null' && patient.department !== 'undefined' 
                        ? patient.department 
                        : 'Unassigned'}
                    </td>
                    
                    {/* Doctor column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.doctor && patient.doctor !== 'null' && patient.doctor !== 'undefined'
                        ? patient.doctor 
                        : 'Unassigned'}
                    </td>
                    
                    {/* Last Visit column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.lastVisit ? formatDate(patient.lastVisit) : 'Not Available'}
                    </td>
                    
                    {/* Next Appointment column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.nextAppointment === 'TBD' 
                        ? 'To Be Determined' 
                        : (patient.nextAppointment 
                            ? formatDate(patient.nextAppointment)
                            : 'Not Scheduled')}
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
      
      {/* Debug Panel */}
      {debugMode && (
        <div className="mt-6 p-4 bg-gray-100 rounded overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Debug Information</h3>
            <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              Data Source: {dataSource === 'api' ? 'API' : 'Mock Data'}
            </div>
          </div>
          
          {patients.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">First Patient Data:</h4>
                <div className="bg-white p-2 rounded text-xs font-mono overflow-x-auto">
                  <pre>{JSON.stringify(patients[0], null, 2)}</pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Field Types:</h4>
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left">Field</th>
                      <th className="px-2 py-1 text-left">Type</th>
                      <th className="px-2 py-1 text-left">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(patients[0]).map(([key, value]) => (
                      <tr key={key}>
                        <td className="px-2 py-1">{key}</td>
                        <td className="px-2 py-1">{typeof value}</td>
                        <td className="px-2 py-1 truncate max-w-xs">
                          {value === null ? 'null' : 
                           Array.isArray(value) ? `Array(${value.length})` : 
                           typeof value === 'object' ? JSON.stringify(value) :
                           String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
};

// Simple and reliable date formatting function
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    // Simple MM/DD/YYYY format
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    console.error('Date formatting error:', e);
    return 'Date Error';
  }
};

export default PatientsList;