import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import { dataService } from '../../services/dataService';
import { maskPII, maskPatientId, maskEmail, maskPhoneNumber, conditionallyMaskPII } from '../../utils/privacyUtils';
import type { SecurePatient, VitalReading, Alert } from '../../types/schema';
import { MetricCardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/common/Skeleton';

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

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const MedicationIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M17.064 4.656l-2.05-2.035a3 3 0 00-4.242 0L4.656 8.737a3 3 0 000 4.242l2.05 2.035a3 3 0 004.242 0l6.116-6.116a3 3 0 000-4.242zM9.95 16.95l-2.05-2.035 6.116-6.116 2.05 2.035-6.116 6.116z" clipRule="evenodd" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
  </svg>
);

export const PatientDashboard: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  const [patients, setPatients] = useState<SecurePatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<SecurePatient | null>(null);
  const [vitalHistory, setVitalHistory] = useState<VitalReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    const fetchPatientData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch patients list
        const patientsData = await dataService.getSecurePatients();
        setPatients(patientsData);
        
        // If patientId provided, find that patient
        let patient: SecurePatient | null = null;
        if (patientId) {
          patient = await dataService.getSecurePatientById(patientId);
        } else if (patientsData.length > 0) {
          // If no patientId, select the first patient
          patient = patientsData[0];
          // Update URL without refreshing
          navigate(`/patients/${patient.id}`, { replace: true });
        }
        
        if (patient) {
          setSelectedPatient(patient);
          
          // Load patient-specific data
          const vitalsData = await dataService.getVitalSigns();
          // Assuming vitals data will be structured by patient ID
          // For now, we'll use the sample data we have
          setVitalHistory(vitalsData.patientP001);
          
          // Get alerts for this patient
          const patientAlerts = vitalsData.alerts.filter(alert => 
            alert.patientId === patient.id
          );
          setAlerts(patientAlerts);
          
        } else {
          setError(`Patient with ID ${patientId} not found.`);
        }
      } catch (err) {
        console.error('Error loading patient details:', err);
        setError('Failed to load patient details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId, navigate]);

  // Handle patient change
  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pid = e.target.value;
    navigate(`/patients/${pid}`);
  };

  // Format vital signs data for charts
  const formatVitalSignsData = () => {
    if (!vitalHistory || vitalHistory.length === 0) return [];
    
    return vitalHistory.map(reading => ({
      time: reading.time,
      heartRate: reading.heartRate,
      systolic: reading.bloodPressure.systolic,
      diastolic: reading.bloodPressure.diastolic,
      temperature: reading.temperature,
      oxygenSat: reading.oxygenSat
    }));
  };
  
  // Format alert severity for styling
  const getAlertSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
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
            value={selectedPatient.id}
            onChange={handlePatientChange}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {maskPII(patient.fullName)} ({maskPatientId(patient.id)})
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
            <p className="text-md font-medium">{maskPII(selectedPatient.fullName)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Patient ID</p>
            <p className="text-md font-medium">{maskPatientId(selectedPatient.id)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Age / Gender</p>
            <p className="text-md font-medium">{selectedPatient.age} / {selectedPatient.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="text-md font-medium">{selectedPatient.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Doctor</p>
            <p className="text-md font-medium">{selectedPatient.doctor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div className="mt-1">
              <StatusBadge status={selectedPatient.status} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Admission Date</p>
            <p className="text-md font-medium">{new Date(selectedPatient.admissionDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Appointment</p>
            <p className="text-md font-medium">
              {selectedPatient.nextAppointment === 'TBD' 
                ? 'To Be Determined' 
                : new Date(selectedPatient.nextAppointment).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Heart Rate"
          value={`${selectedPatient.vitals?.heartRate || '--'} bpm`}
          icon={<HeartIcon />}
          color={
            (selectedPatient.vitals?.heartRate || 0) > 100 ? 'danger' : 
            (selectedPatient.vitals?.heartRate || 0) < 60 ? 'warning' : 'info'
          }
        />
        <MetricCard
          title="Blood Pressure"
          value={selectedPatient.vitals?.bloodPressure || '--'}
          icon={<UserIcon />}
          color={selectedPatient.vitals?.bloodPressure.includes('140') ? 'warning' : 'info'}
        />
        <MetricCard
          title="Temperature"
          value={`${selectedPatient.vitals?.temperature || '--'}°F`}
          icon={<UserIcon />}
          color={
            (selectedPatient.vitals?.temperature || 0) > 99.5 ? 'danger' : 
            (selectedPatient.vitals?.temperature || 0) < 97.0 ? 'warning' : 'success'
          }
        />
        <MetricCard
          title="Oxygen Saturation"
          value={`${selectedPatient.vitals?.oxygenSaturation || '--'}%`}
          icon={<UserIcon />}
          color={
            (selectedPatient.vitals?.oxygenSaturation || 0) < 95 ? 'danger' : 
            (selectedPatient.vitals?.oxygenSaturation || 0) < 97 ? 'warning' : 'success'
          }
        />
      </div>

      {/* Vital Signs Chart and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Vital Signs Trend</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeRange('daily')}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === 'daily'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimeRange('weekly')}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === 'weekly'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeRange('monthly')}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === 'monthly'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          <LineChart
            data={formatVitalSignsData()}
            height={300}
            xAxisKey="time"
            lines={[
              { key: 'heartRate', name: 'Heart Rate', color: '#EF4444' },
              { key: 'systolic', name: 'Systolic', color: '#3B82F6' },
              { key: 'diastolic', name: 'Diastolic', color: '#10B981' },
              { key: 'oxygenSat', name: 'Oxygen Sat.', color: '#8B5CF6' }
            ]}
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Health Alerts</h2>
          <div className="overflow-auto max-h-80">
            {alerts.length > 0 ? (
              <ul className="space-y-3">
                {alerts.map((alert, index) => (
                  <li key={index} className="border-l-4 border-red-500 bg-red-50 p-3 rounded">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800">{alert.type}</p>
                        <div className="flex items-center mt-1">
                          <p className="text-xs text-gray-600">Value: {alert.value} (Threshold: {alert.threshold})</p>
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getAlertSeverityClass(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{formatTimestamp(alert.timestamp)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No alerts at this time</p>
              </div>
            )}
          </div>
        </div>
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

          <div>
            <p className="text-sm font-medium text-gray-700">Treatment Timeline</p>
            <div className="mt-2 space-y-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Admission</h4>
                  <p className="mt-1 text-xs text-gray-500">{new Date(selectedPatient.admissionDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Last Visit</h4>
                  <p className="mt-1 text-xs text-gray-500">{new Date(selectedPatient.lastVisit).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Next Appointment</h4>
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedPatient.nextAppointment === 'TBD' 
                      ? 'To Be Determined' 
                      : new Date(selectedPatient.nextAppointment).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};