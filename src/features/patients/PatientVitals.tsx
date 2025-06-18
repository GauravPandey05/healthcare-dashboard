import React, { useState, useEffect } from 'react';
import { LineChart } from '../../components/charts/LineChart';
import type{ 
  PatientVitalHistory, 
  VitalSignAlert, 
  GetPatientVitalsResponse 
} from '../../types/schema';
import { dataService } from '../../services/dataService';
import { formatDateForDisplay } from '../../utils/dateUtils';

interface PatientVitalsProps {
  patientId: string;
}

const PatientVitals: React.FC<PatientVitalsProps> = ({ patientId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [vitalHistory, setVitalHistory] = useState<PatientVitalHistory[]>([]);
  const [activeChart, setActiveChart] = useState<'bloodPressure' | 'heartRate' | 'temperature' | 'oxygenSaturation'>('heartRate');
  const [alerts, setAlerts] = useState<VitalSignAlert[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchVitalsData = async () => {
      setIsLoading(true);
      try {
        // Use the dataService method for this patient
        const vitalsData = await dataService.getPatientVitals(patientId);
        
        if (!vitalsData) {
          throw new Error('No vitals data found for this patient');
        }
        
        setVitalHistory(vitalsData.vitals);
        setAlerts(vitalsData.alerts || []);
      } catch (err: any) {
        console.error('Error fetching vitals data:', err);
        setError(err.message || 'Failed to load vitals data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (patientId) {
      fetchVitalsData();
    }
  }, [patientId]);
  
  // Process data for blood pressure chart - make sure to handle PatientVitalHistory type
  const processBloodPressureData = () => {
    return vitalHistory.map(v => {
      const bp = v.bloodPressure.split('/');
      return { 
        ...v, 
        systolic: parseInt(bp[0], 10) || 120 // Default if parsing fails
      };
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Get recent vitals
  const recentVitals = vitalHistory.length > 0 ? vitalHistory[vitalHistory.length - 1] : null;
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Vital Signs History</h2>
      
      {/* Chart Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveChart('heartRate')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeChart === 'heartRate' 
                ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-500' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Heart Rate
          </button>
          
          <button
            onClick={() => setActiveChart('bloodPressure')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeChart === 'bloodPressure' 
                ? 'bg-red-100 text-red-800 ring-2 ring-red-500' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Blood Pressure
          </button>
          
          <button
            onClick={() => setActiveChart('temperature')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeChart === 'temperature' 
                ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-500' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Temperature
          </button>
          
          <button
            onClick={() => setActiveChart('oxygenSaturation')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeChart === 'oxygenSaturation' 
                ? 'bg-green-100 text-green-800 ring-2 ring-green-500' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Oxygen Saturation
          </button>
        </div>
        
        {/* Vitals History Chart */}
        <h3 className="text-md font-medium text-gray-800 mb-4">
          {activeChart === 'heartRate' && 'Heart Rate History'}
          {activeChart === 'bloodPressure' && 'Blood Pressure History'}
          {activeChart === 'temperature' && 'Temperature History'}
          {activeChart === 'oxygenSaturation' && 'Oxygen Saturation History'}
        </h3>
        
        {vitalHistory.length > 0 ? (
          <LineChart
            data={activeChart === 'bloodPressure' ? processBloodPressureData() : vitalHistory}
            lines={[
              {
                key: activeChart === 'bloodPressure' ? 'systolic' : activeChart,
                name: activeChart === 'heartRate' ? 'Heart Rate' :
                      activeChart === 'bloodPressure' ? 'Systolic' :
                      activeChart === 'temperature' ? 'Temperature' : 'O₂ Saturation',
                color: activeChart === 'heartRate' ? '#3b82f6' :
                      activeChart === 'bloodPressure' ? '#ef4444' :
                      activeChart === 'temperature' ? '#f59e0b' : '#10b981'
              }
            ]}
            xAxisKey="date"
            height={300}
          />
        ) : (
          <p className="text-gray-500 text-center py-10">No vital history available</p>
        )}
      </div>
      
      {/* Health Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-md font-medium text-gray-800 mb-4">Health Alerts</h3>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`p-3 rounded-md ${
                  alert.severity === 'High' ? 'bg-red-600 text-white' :
                  alert.severity === 'Medium' ? 'bg-yellow-500 text-white' :
                  'bg-blue-600 text-white'
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">
                    {alert.type}
                  </span>
                  <span className="text-white text-opacity-90 text-sm">
                    {formatDateForDisplay(alert.date)}
                  </span>
                </div>
                <p className="text-sm mt-1 text-white text-opacity-95">
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientVitals;