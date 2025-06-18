import api from '../apiService';
import type { 
  AppointmentData, 
  Department, 
  OverviewStatistics,
  Patient,
  StaffMember,
  SecurePatient,
  SecureStaffMember,
  Appointment
} from '../../types/schema';

// Overview adapter
export const fetchOverview = async (): Promise<OverviewStatistics> => {
  const response = await api.get('/dashboard/overview');
  return response.data;
};

// Department adapters
export const fetchDepartments = async (): Promise<Department[]> => {
  const response = await api.get('/departments');
  return response.data;
};

export const fetchDepartmentById = async (id: number): Promise<Department> => {
  const response = await api.get(`/departments/${id}`);
  return response.data;
};

// Patient adapters
export const fetchSecurePatients = async (): Promise<SecurePatient[]> => {
  const response = await api.get('/patients/secure');
  return response.data;
};

export const fetchPatientById = async (id: string): Promise<Patient> => {
  const response = await api.get(`/patients/${id}`);
  return response.data;
};

export const fetchPatientVitals = async (id: string): Promise<any> => {
  const response = await api.get(`/patients/${id}/vitals`);
  return response.data;
};

// Staff adapters
export const fetchSecureStaff = async (): Promise<SecureStaffMember[]> => {
  const response = await api.get('/staff/secure');
  return response.data;
};

export const fetchStaffById = async (id: string): Promise<StaffMember> => {
  const response = await api.get(`/staff/${id}`);
  return response.data;
};

// Appointment adapters
export const fetchAppointmentsData = async (): Promise<AppointmentData> => {
  const response = await api.get('/appointments/stats');
  return response.data;
};

export const fetchAllAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get('/appointments');
  return response.data;
};

export const fetchAppointmentById = async (id: string): Promise<Appointment> => {
  const response = await api.get(`/appointments/${id}`);
  return response.data;
};

export const createAppointment = async (data: any): Promise<Appointment> => {
  const response = await api.post('/appointments', data);
  return response.data;
};

export const updateAppointment = async (id: string, data: any): Promise<Appointment> => {
  const response = await api.put(`/appointments/${id}`, data);
  return response.data;
};

export const deleteAppointment = async (id: string): Promise<any> => {
  const response = await api.delete(`/appointments/${id}`);
  return response.data;
};

export const updateAppointmentStatus = async (id: string, status: string): Promise<any> => {
  const response = await api.patch(`/appointments/${id}/status`, { status });
  return response.data;
};