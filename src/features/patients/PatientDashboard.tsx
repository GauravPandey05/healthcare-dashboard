import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { dataService } from '../../services/dataService';
import { maskPII, maskPatientId } from '../../utils/privacyUtils';
import type { 
  SecurePatient, 
  Patient, 
  TimelineEvent,
  // Rename the type import to avoid naming conflict with the component
  PatientVitals as PatientVitalsType
} from '../../types/schema';
import { MetricCardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/common/Skeleton';
// Import the component with its default name
import PatientVitals from './PatientVitals';
import { PatientTimeline } from './PatientTimeline';

// Icons
const UserIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

const ThermometerIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1.323l-1.427 1.19A6 6 0 105.85 13.91l.159.129A1 1 0 007 14.5V16a1 1 0 001 1h4a1 1 0 001-1v-1.5a1 1 0 00-.99-.98l.159-.13a6 6 0 10-1.722-8.578L10 4.323V3a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const OxygenIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

// Interface for enhanced patient with original ID
interface EnhancedSecurePatient extends SecurePatient {
  originalId: string;
}

export const PatientDashboard: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  const [patients, setPatients] = useState<EnhancedSecurePatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<EnhancedSecurePatient | null>(null);
  // Fix the state type to use the renamed type
  const [currentVitals, setCurrentVitals] = useState<PatientVitalsType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  // Simplified patient fetching in useEffect
  useEffect(() => {
    const fetchPatientData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get the patient by ID
        const patientData = await dataService.getSecurePatientById(patientId || "");
        
        if (!patientData) {
          throw new Error(`Patient with ID ${patientId} not found`);
        }
        
        // Add the originalId property to create an EnhancedSecurePatient
        const enhancedPatient: EnhancedSecurePatient = {
          ...patientData,
          originalId: patientId || ""  // Store the original ID used for lookup
        };
        
        // Get all patients for the dropdown menu and enhance them
        const allPatients = await dataService.getSecurePatients();
        const enhancedPatients: EnhancedSecurePatient[] = allPatients.map(p => ({
          ...p,
          originalId: p.id  // Store the original ID for each patient
        }));
        
        setPatients(enhancedPatients);
        setSelectedPatient(enhancedPatient);
        
        // Get vitals and timeline
        setCurrentVitals(patientData.vitals);
        
        // Fetch timeline data using the original ID
        try {
          const timelineData = await dataService.getPatientTimeline(patientId || "");
          console.log('Timeline data fetched:', timelineData); // Add this log
          setTimelineEvents(timelineData || []); // Ensure it's never null
        } catch (timelineErr) {
          console.error('Error loading timeline data:', timelineErr);
          setTimelineEvents([]);
        }
        
      } catch (err: any) {
        console.error('Error loading patient details:', err);
        setError(err.message || 'Failed to load patient details. Please try again later.');
        
        // If we have patients list but specific patient not found, navigate to first one
        try {
          const allPatients = await dataService.getSecurePatients();
          if (allPatients.length > 0) {
            // Also enhance these patients
            const enhancedPatients: EnhancedSecurePatient[] = allPatients.map(p => ({
              ...p,
              originalId: p.id
            }));
            setPatients(enhancedPatients);
            navigate(`/patients/${allPatients[0].id}`, { replace: true });
          }
        } catch (fallbackErr) {
          console.error('Error loading fallback patients:', fallbackErr);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId, navigate]);

  // Handle patient change from dropdown (simplified)
  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPatientId = e.target.value;
    navigate(`/patients/${selectedPatientId}`);
  };

  // Loading state with skeleton UI
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TableSkeleton />
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

  if (!selectedPatient) {
    return (
      <PageContainer>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">No patient selected. Please select a patient.</span>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Patient Selection & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Patient Dashboard</h1>
          <p className="text-gray-500">Monitoring {selectedPatient.fullName}</p>
        </div>
        <div className="mt-3 sm:mt-0">
          <select
            value={selectedPatient.originalId}
            onChange={handlePatientChange}
            className="bg-white text-gray-700 block w-full pl-3 pr-10 py-2 text-base border-gray-200 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            {patients.map(patient => (
              <option key={patient.originalId} value={patient.originalId}>
                {patient.fullName} ({patient.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-md font-medium text-black">{selectedPatient.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Patient ID</p>
            <p className="text-md font-medium text-black">{selectedPatient.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Age / Gender</p>
            <p className="text-md font-medium text-black">{selectedPatient.age} / {selectedPatient.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="text-md font-medium text-black">{selectedPatient.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Doctor</p>
            <p className="text-md font-medium text-black">{selectedPatient.doctor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div className="mt-1">
              <StatusBadge status={selectedPatient.status} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Admission Date</p>
            <p className="text-md font-medium text-black">{new Date(selectedPatient.admissionDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Appointment</p>
            <p className="text-md font-medium text-black">
              {selectedPatient.nextAppointment === 'TBD' 
                ? 'To Be Determined' 
                : new Date(selectedPatient.nextAppointment).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics - Use currentVitals from the patient object */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Heart Rate"
          value={`${currentVitals?.heartRate || '--'} bpm`}
          icon={<HeartIcon />}
          color={
            (currentVitals?.heartRate || 0) > 100 ? 'danger' : 
            (currentVitals?.heartRate || 0) < 60 ? 'warning' : 'info'
          }
        />
        <MetricCard
          title="Blood Pressure"
          value={currentVitals?.bloodPressure || '--'}
          icon={<UserIcon />}
          color={(currentVitals?.bloodPressure || '').includes('140') ? 'warning' : 'info'}
        />
        <MetricCard
          title="Temperature"
          value={`${currentVitals?.temperature || '--'}°F`}
          icon={<ThermometerIcon />}
          color={
            (currentVitals?.temperature || 0) > 99.5 ? 'danger' : 
            (currentVitals?.temperature || 0) < 97.0 ? 'warning' : 'success'
          }
        />
        <MetricCard
          title="Oxygen Saturation"
          value={`${currentVitals?.oxygenSaturation || '--'}%`}
          icon={<OxygenIcon />}
          color={
            (currentVitals?.oxygenSaturation || 0) < 95 ? 'danger' : 
            (currentVitals?.oxygenSaturation || 0) < 97 ? 'warning' : 'success'
          }
        />
      </div>

      {/* Patient Vitals Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Patient Vitals</h2>
        {selectedPatient && !isLoading ? (
          // Pass the correct ID to PatientVitals component
          <PatientVitals patientId={patientId || selectedPatient.id} />
        ) : isLoading ? (
          <ChartSkeleton height="300" />
        ) : (
          <div className="text-center text-gray-500 py-4">No vitals data available</div>
        )}
      </div>

      {/* Medications and Diagnosis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Current Medications</h2>
          {selectedPatient.medications && selectedPatient.medications.length > 0 ? (
            <ul className="space-y-2">
              {selectedPatient.medications.map((medication, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">{medication}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No current medications</p>
          )}

          <h2 className="text-lg font-medium text-gray-800 mt-6 mb-4">Allergies</h2>
          {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
            <ul className="space-y-2">
              {selectedPatient.allergies.map((allergy, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">{allergy}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No known allergies</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Diagnosis & Notes</h2>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Diagnosis</p>
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <p className="text-gray-800">{selectedPatient.diagnosis}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Room Assignment</p>
            <div className="mt-2 p-3 bg-gray-50 rounded-md flex items-center">
              <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-gray-800">{selectedPatient.room}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Timeline - using the real timeline data */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Patient Timeline
          <span className="ml-2 text-sm text-gray-500">
            ({timelineEvents.length} events)
          </span>
        </h2>
        
        {/* Add this debug section */}
        {timelineEvents.length === 0 && (
          <div className="bg-yellow-50 p-4 mb-4 rounded-md">
            <p className="text-yellow-700">No timeline events found for this patient.</p>
            <p className="text-sm mt-1 text-yellow-600">
              The backend might not be returning any timeline data. Check the getPatientTimeline
              method in patientController.js.
            </p>
          </div>
        )}
        
        <PatientTimeline events={timelineEvents} />
      </div>
    </PageContainer>
  );
};

export default PatientDashboard;