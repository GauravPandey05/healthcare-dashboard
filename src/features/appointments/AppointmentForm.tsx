import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { dataService } from '../../services/dataService';
import { maskPII } from '../../utils/privacyUtils';
import type { SecureStaffMember, SecurePatient, AppointmentData } from '../../types/schema';
import { TableSkeleton } from '../../components/common/Skeleton';

interface FormData {
  patientId: string;
  doctorId: string;
  department: string;
  date: string;
  time: string;
  type: string;
  notes: string;
}

const AppointmentForm: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const isEditing = !!appointmentId;
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<SecurePatient[]>([]);
  const [doctors, setDoctors] = useState<SecureStaffMember[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    doctorId: '',
    department: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'Check-up',
    notes: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all required data
        const [patientsData, staffData, appointmentsData] = await Promise.all([
          dataService.getSecurePatients(),
          dataService.getSecureStaff(),
          dataService.getAppointments()
        ]);
        
        // Set patients data
        setPatients(patientsData);
        
        // Filter staff to only include doctors
        const doctorsOnly = staffData.filter(staff => 
          staff.role.includes('Doctor') || 
          staff.role.includes('Surgeon') || 
          staff.role.includes('Specialist')
        );
        setDoctors(doctorsOnly);
        
        // Set appointment types
        setAppointmentTypes(appointmentsData.byType.map(type => type.type));
        
        // If editing an existing appointment, fetch its data
        if (isEditing && appointmentId) {
          // In a real app, this would fetch the appointment data from an API
          // For now, we'll simulate with mock data
          const mockAppointment = {
            patientId: patientsData[0]?.id || '',
            doctorId: doctorsOnly[0]?.id || '',
            department: doctorsOnly[0]?.department || '',
            date: new Date().toISOString().split('T')[0],
            time: '10:00',
            type: appointmentsData.byType[0].type,
            notes: 'Follow-up appointment'
          };
          
          setFormData(mockAppointment);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load necessary data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [appointmentId, isEditing]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'doctorId') {
      // When doctor changes, update department automatically
      const selectedDoctor = doctors.find(doc => doc.id === value);
      setFormData({
        ...formData,
        doctorId: value,
        department: selectedDoctor?.department || formData.department
      });
    } else if (name === 'patientId') {
      // When patient changes, could potentially pre-fill related data
      const selectedPatient = patients.find(patient => patient.id === value);
      setFormData({
        ...formData,
        patientId: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.patientId || !formData.doctorId || !formData.date || !formData.time || !formData.type) {
      alert('Please fill in all required fields');
      return;
    }
    
    // In a real app, this would make an API call to save the appointment
    console.log('Submitting appointment data:', formData);
    
    // Show success message
    alert(`Appointment successfully ${isEditing ? 'updated' : 'created'}!`);
    
    // Navigate back to appointments list
    navigate('/appointments/list');
  };
  
  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit Appointment' : 'New Appointment'}
          </h1>
          <p className="text-gray-500">
            {isEditing ? 'Update appointment details' : 'Schedule a new appointment'}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg">
          <div className="animate-pulse p-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
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
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit Appointment' : 'New Appointment'}
          </h1>
          <p className="text-gray-500">
            {isEditing ? 'Update appointment details' : 'Schedule a new appointment'}
          </p>
        </div>
        <button
          onClick={() => navigate('/appointments/list')}
          className="text-gray-600 hover:text-gray-800 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to List
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Patient Selection */}
            <div className="sm:col-span-3">
              <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                Patient <span className="text-red-500">*</span>
              </label>
              <select
                id="patientId"
                name="patientId"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md text-black"
                value={formData.patientId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {maskPII(patient.fullName)} ({patient.id})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Doctor Selection */}
            <div className="sm:col-span-3">
              <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-1">
                Doctor <span className="text-red-500">*</span>
              </label>
              <select
                id="doctorId"
                name="doctorId"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md text-black"
                value={formData.doctorId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {maskPII(doctor.fullName)} - {doctor.role}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Department - Auto-filled based on doctor selection */}
            <div className="sm:col-span-3">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                id="department"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md text-black bg-gray-50"
                value={formData.department}
                readOnly
              />
            </div>
            
            {/* Appointment Type */}
            <div className="sm:col-span-3">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md text-black"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select appointment type</option>
                {appointmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Date */}
            <div className="sm:col-span-3">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                id="date"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md text-black"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            {/* Time */}
            <div className="sm:col-span-3">
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="time"
                id="time"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md text-black"
                value={formData.time}
                onChange={handleInputChange}
                required
                step="900" // 15-minute intervals
              />
            </div>
            
            {/* Notes */}
            <div className="sm:col-span-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md text-black"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional information about the appointment"
              />
            </div>
          </div>
          
          <div className="pt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => navigate('/appointments/list')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isEditing ? 'Update Appointment' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default AppointmentForm;