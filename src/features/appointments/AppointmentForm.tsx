import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { formatDateForInput } from '../../utils/dateUtils';
import type { SecurePatient, SecureStaffMember, Appointment } from '../../types/schema';

const AppointmentForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [patients, setPatients] = useState<SecurePatient[]>([]);
  const [doctors, setDoctors] = useState<SecureStaffMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: formatDateForInput(new Date().toISOString()),
    time: '09:00',
    type: 'Check-up',
    notes: '',
    duration: 30
  });
  
  useEffect(() => {
    const fetchFormData = async () => {
      setIsLoading(true);
      try {
        // Get secure patients data (no PII)
        const patientsData = await dataService.getSecurePatients();
        setPatients(patientsData);
        
        // Get doctors (secure staff filtered by role)
        const staffData = await dataService.getSecureStaff();
        setDoctors(staffData.filter(staff => staff.role === 'Doctor'));
        
      } catch (err: any) {
        console.error('Error fetching form data:', err);
        setError(err.message || 'Failed to load form data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFormData();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle number inputs specifically
    if (name === 'duration') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10) || 30
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Get selected patient and doctor for additional data
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      
      if (!selectedPatient || !selectedDoctor) {
        throw new Error('Please select both patient and doctor');
      }
      
      // Format time correctly (ensure AM/PM)
      const formattedTime = formatTimeForUI(formData.time);
      
      // Create appointment data
      const appointmentData = {
        ...formData,
        time: formattedTime,
        patientName: selectedPatient.fullName,
        doctor: selectedDoctor.fullName,
        department: selectedDoctor.department,
        status: 'Scheduled',
      };
      
      // Submit to service
      const result = await dataService.createAppointment(appointmentData);
      
      // Navigate back to appointments list
      navigate('/appointments');
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      setError(err.message || 'Failed to create appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Helper function to ensure time is properly formatted
  const formatTimeForUI = (time: string): string => {
    if (!time) return '9:00 AM';
    
    // If already has AM/PM, return as is
    if (time.includes('AM') || time.includes('PM')) return time;
    
    // Convert 24-hour time to AM/PM format
    const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));
    
    if (isNaN(hours) || isNaN(minutes)) return '9:00 AM';
    
    if (hours < 12) {
      return `${hours}:${minutes.toString().padStart(2, '0')} AM`;
    } else if (hours === 12) {
      return `12:${minutes.toString().padStart(2, '0')} PM`;
    } else {
      return `${hours - 12}:${minutes.toString().padStart(2, '0')} PM`;
    }
  };
  
  // Show loading spinner only on initial load, not during submission
  if (isLoading && (!patients.length || !doctors.length)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">New Appointment</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Patient Selection */}
          <div>
            <label 
              htmlFor="patientId" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Patient
            </label>
            <select
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
              disabled={submitting}
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName}
                </option>
              ))}
            </select>
          </div>
          
          {/* Doctor Selection */}
          <div>
            <label 
              htmlFor="doctorId" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Doctor
            </label>
            <select
              id="doctorId"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
              disabled={submitting}
            >
              <option value="">Select Doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.fullName} - {doctor.department}
                </option>
              ))}
            </select>
          </div>
          
          {/* Date Selection */}
          <div>
            <label 
              htmlFor="date" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
              disabled={submitting}
            />
          </div>
          
          {/* Time Selection */}
          <div>
            <label 
              htmlFor="time" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Time
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
              disabled={submitting}
            />
          </div>
          
          {/* Appointment Type */}
          <div>
            <label 
              htmlFor="type" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Appointment Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
              disabled={submitting}
            >
              <option value="Check-up">Check-up</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Consultation">Consultation</option>
              <option value="Procedure">Procedure</option>
              <option value="Emergency">Emergency</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Lab Work">Lab Work</option>
            </select>
          </div>
          
          {/* Duration */}
          <div>
            <label 
              htmlFor="duration" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min="15"
              step="15"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
              disabled={submitting}
            />
          </div>
        </div>
        
        {/* Notes */}
        <div className="mb-6">
          <label 
            htmlFor="notes" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            disabled={submitting}
          />
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/appointments')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;