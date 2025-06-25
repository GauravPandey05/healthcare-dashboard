// First, we need to ensure we're importing from the right path
import axios from 'axios';
import healthcareData from '../data/healthcareData';
import { maskPII, maskPatientId, maskEmail, maskPhoneNumber } from '../utils/privacyUtils';
import type { 
  AppointmentData, 
  EnhancedDepartment,
  StaffStatus,
  Department, 
  OverviewStatistics,
  Patient,
  StaffMember,
  Demographics,
  Financial,
  Quality,
  Inventory,
  RecentActivity,
  VitalSigns,
  Appointment,
  SecurePatient,
  SecureStaffMember,
  PatientVitalHistory,
  VitalSignAlert,
  TimelineEvent,
  GetPatientVitalsResponse,
  PatientStatus,
  PatientSeverity,
  StaffScheduleEntry
} from '../types/schema';

// API Base URL - can be moved to an environment config file
const API_BASE_URL = 'http://localhost:5000/api';

function ensureNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

class DataService {
  private isConnected = false;
  private connectionChecked = false;

  // Check if the backend API is available
  async checkConnection(forceCheck = false): Promise<boolean> {
  // Allow forced checking even if we've checked before
  if (this.connectionChecked && !forceCheck) return this.isConnected;
  
  try {
    // Try the departments endpoint as a more reliable check 
    // than the health endpoint which might not be implemented
    const response = await axios.get(`${API_BASE_URL}/departments`, { timeout: 3000 });
    this.isConnected = response.status === 200;
    console.log('API connection status:', this.isConnected ? 'Connected' : 'Disconnected');
  } catch (error) {
    console.warn('Cannot connect to backend API, using mock data instead');
    this.isConnected = false;
  }
  
  this.connectionChecked = true;
  return this.isConnected;
}

  // Update the checkConnection method to be more reliable
  

  // Helper method to safely fetch data from API with fallback to mock data
  private async safeApiGet<T>(endpoint: string, fallbackData: T): Promise<T> {
    const isConnected = await this.checkConnection();
    
    if (!isConnected) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Keep the mock data delay 
      return fallbackData;
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      return response.data;
    } catch (error) {
      console.error(`API error for ${endpoint}, using fallback data`, error);
      await new Promise(resolve => setTimeout(resolve, 800)); // Keep the mock data delay
      return fallbackData;
    }
  }

  // Get overview statistics
  async getOverview(): Promise<OverviewStatistics> {
    return this.safeApiGet('/overview', healthcareData.overview);
  }

  // Get demographic data
  async getDemographics(): Promise<Demographics> {
    return this.safeApiGet('/demographics', healthcareData.demographics);
  }

  // Add a helper method to normalize appointment data
  private normalizeAppointmentData(data: any): AppointmentData {
    // Create a normalized structure with all fields present
    return {
      monthlyTrends: data.monthlyTrends || data.monthly || [],
      weeklySchedule: data.weeklySchedule || data.weekly || [],
      byType: data.byType || [],
      upcoming: data.upcoming || [],
      completed: data.completed || []
    };
  }

  // Get appointment data
  async getAppointments(): Promise<AppointmentData> {
    // Try to get from the dashboard endpoint first
    if (await this.checkConnection()) {
      try {
        const response = await axios.get(`${API_BASE_URL}/appointments/dashboard`);
        // Normalize the data structure before returning
        return this.normalizeAppointmentData(response.data);
      } catch (apiError) {
        console.error('Error fetching from appointments/dashboard endpoint, falling back:', apiError);
        // Fall through to use the regular endpoint or mock data
      }
    }
    
    // For the fallback case, also normalize
    const fallbackData = await this.safeApiGet('/appointments', healthcareData.appointments);
    return this.normalizeAppointmentData(fallbackData);
  }

  // Get departments
  async getDepartments(): Promise<Department[]> {
    return this.safeApiGet('/departments', healthcareData.departments);
  }

  // Get a specific department by ID
  async getDepartmentById(id: number): Promise<Department | null> {
    return this.safeApiGet(`/departments/${id}`, 
      healthcareData.departments.find(dept => dept.id === id) || null
    );
  }

  // Get secure patient list (no PII)
  async getSecurePatients(): Promise<SecurePatient[]> {
  if (await this.checkConnection()) {
    try {
      console.log('Attempting to fetch patients from API...');
      const response = await axios.get(`${API_BASE_URL}/patients`);
      const patients = response.data;
      
      console.log(`Successfully fetched ${patients.length} patients from API`);
      console.log(patients);
      console.log("First patient from API:", patients[0] ? {
        id: patients[0].id,
        fullName: patients[0].fullName,
        department: patients[0].department,  // ← This matches backend field
        doctor: patients[0].doctor           // ← This matches backend field
      } : 'No patients returned');
      
      // Return the API data directly without transformation
      return patients;
    } catch (error) {
      console.error('Error fetching patients from API:', error);
      // Fall through to mock data
    }
  } else {
    console.warn('API disconnected - using mock data');
  }
  
  // Mock data path - apply masking here since it's not coming from backend
  console.log("Using mock data for patients");
  const securePatients = healthcareData.patients.map(patient => {
    return {
      id: patient.id, // Keep ID intact for routing
      fullName: maskPII(patient.fullName),  // Apply masking to mock data
      age: patient.age,
      gender: patient.gender,
      department: patient.department || 'Unassigned',
      doctor: maskPII(patient.doctor) || 'Unassigned',
      status: patient.status as PatientStatus,
      severity: patient.severity as PatientSeverity,
      admissionDate: this.formatDateForClient(patient.admissionDate) || '',
      lastVisit: this.formatDateForClient(patient.lastVisit) || '',
      nextAppointment: this.formatDateForClient(patient.nextAppointment) || '',
      room: patient.room || '',
      diagnosis: patient.diagnosis || '',
      vitals: patient.vitals || null,
      allergies: patient.allergies || [],
      medications: patient.medications || []
    };
  });

  return securePatients;
}

// Update the formatDateForClient method
private formatDateForClient(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  
  // Handle "TBD" case
  if (dateStr === 'TBD') return dateStr;
  
  try {
    // First check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Convert to a properly formatted date string
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date in formatDateForClient: ${dateStr}`);
      return '';
    }
    
    // Format as YYYY-MM-DD for consistent parsing on frontend
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.warn('Error in formatDateForClient:', dateStr, e);
    return '';
  }
}
  // Get a patient by ID (full data with PII)
  async getPatientById(id: string): Promise<Patient | null> {
    // Use direct API call without ID manipulation
    const patient = await this.safeApiGet(`/patients/${id}/full`, 
      healthcareData.patients.find(p => p.id === id) || null
    );
    
    if (!patient) return null;
    
    // Ensure consistent field names and format
    if (patient && typeof patient === 'object') {
      return {
        id: patient.id,
        firstName: patient.firstName ,
        lastName: patient.lastName ,
        fullName: patient.fullName || `${patient.firstName} ${patient.lastName}`,
        age: patient.age,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        insurance: patient.insurance,
        emergencyContact: patient.emergencyContact ,
        department: patient.department ,
        doctor: patient.doctor ,
        admissionDate: patient.admissionDate ,
        status: patient.status as PatientStatus,
        severity: patient.severity as PatientSeverity,
        room: patient.room,
        diagnosis: patient.diagnosis,
        lastVisit: patient.lastVisit ,
        nextAppointment: patient.nextAppointment,
        vitals: patient.vitals,
        medications: patient.medications || [],
        allergies: patient.allergies || [],
        notes: patient.notes
      } as Patient;
    }
    
    return patient as Patient | null;
  }

  // Get a secure patient by ID (no PII)
  async getSecurePatientById(id: string): Promise<SecurePatient | null> {
    // First check if we're connected to the API
    if (await this.checkConnection()) {
      try {
        // API returns PII-masked data with real ID
        const response = await axios.get(`${API_BASE_URL}/patients/${id}`);
        return response.data as SecurePatient;
      } catch (apiError) {
        console.error(`API error for patient ${id}:`, apiError);
        // Fall through to mock data
      }
    }
    
    // Using fallback mock data
    const patient = healthcareData.patients.find(p => p.id === id);
    if (!patient) return null;
    
    // Mask PII for mock data
    return {
      id: maskPatientId(patient.id),
      fullName: maskPII(patient.fullName),
      age: patient.age,
      gender: patient.gender,
      department: patient.department,
      doctor: patient.doctor,
      status: patient.status as PatientStatus,
      severity: patient.severity as PatientSeverity,
      admissionDate: patient.admissionDate,
      lastVisit: patient.lastVisit,
      nextAppointment: patient.nextAppointment,
      room: patient.room,
      diagnosis: patient.diagnosis,
      vitals: patient.vitals,
      allergies: patient.allergies,
      medications: patient.medications
    };
  }

  // Get patients by department ID (no PII)
  async getSecurePatientsByDepartment(departmentId: number): Promise<SecurePatient[]> {
    const patients = await this.safeApiGet(`/departments/${departmentId}/patients`,
      healthcareData.patients.filter(patient => {
        const department = healthcareData.departments.find(dept => dept.id === departmentId);
        return department && patient.department === department.name;
      })
    );
    
    // If using real API, data is already in the right format
    if (this.isConnected) {
      return patients as SecurePatient[];
    }
    
    // For mock data, mask PII
    return patients.map(patient => ({
      id: maskPatientId(patient.id),
      fullName: maskPII(patient.fullName),
      age: patient.age,
      gender: patient.gender,
      department: patient.department,
      doctor: patient.doctor,
      status: patient.status as PatientStatus,
      severity: patient.severity as PatientSeverity,
      admissionDate: patient.admissionDate,
      lastVisit: patient.lastVisit,
      nextAppointment: patient.nextAppointment,
      room: patient.room,
      diagnosis: patient.diagnosis,
      vitals: patient.vitals,
      allergies: patient.allergies || [],
      medications: patient.medications || []
    }));
  }

  // Get secure staff list (no PII)
  async getSecureStaff(): Promise<SecureStaffMember[]> {
    const staff = await this.safeApiGet('/staff', healthcareData.staff);
    
    if (staff && staff.length > 0) {
      console.group('Staff Rating Debug');
      console.log('First staff rating (raw):', staff[0].rating);
      console.log('Type:', typeof staff[0].rating);
      console.groupEnd();
    }
    
    return staff as SecureStaffMember[];
  }

  // Get staff by department (no PII)
  async getSecureStaffByDepartment(departmentId: number): Promise<SecureStaffMember[]> {
    const staff = await this.safeApiGet(`/departments/${departmentId}/staff`,
      healthcareData.staff.filter(staffMember => {
        const department = healthcareData.departments.find(dept => dept.id === departmentId);
        return department && staffMember.department === department.name;
      })
    );
    
    // If using real API, data is already in the right format
    if (this.isConnected) {
      return staff as SecureStaffMember[];
    }
    
    // For mock data, mask PII
    return staff.map(staffMember => ({
      id: staffMember.id,
      fullName: maskPII(staffMember.fullName),
      role: staffMember.role,
      department: staffMember.department,
      status: staffMember.status as StaffStatus,
      shift: staffMember.shift,
      specialty: staffMember.specialty,
      experience: staffMember.experience,
      patients: staffMember.patients,
      rating: staffMember.rating
    }));
  }

  // Get recent activities
  async getRecentActivities(): Promise<RecentActivity[]> {
    return this.safeApiGet('/activities/recent', healthcareData.recentActivities);
  }

  // Get financial data
  async getFinancialData(): Promise<Financial> {
    return this.safeApiGet('/financial', healthcareData.financial);
  }

  // Get quality metrics
  async getQualityMetrics(): Promise<Quality> {
    return this.safeApiGet('/quality', healthcareData.quality);
  }

  // Get inventory data
  async getInventory(): Promise<Inventory> {
    return this.safeApiGet('/inventory', healthcareData.inventory);
  }

  // Get vital signs
  async getVitalSigns(): Promise<VitalSigns> {
    return this.safeApiGet('/vitals', healthcareData.vitalSigns);
  }

  // Get demographics with mapped structure for charts
  async getDemographicsMapped(): Promise<any> {
    const demographics = await this.getDemographics();
    
    return {
      age: demographics.byAge.map(item => ({
        name: item.label || item.ageGroup,
        value: item.count,
        percentage: item.percentage,
        color: item.color
      })),
      gender: demographics.byGender.map(item => ({
        name: item.gender,
        value: item.count,
        percentage: item.percentage,
        color: item.color
      })),
      insurance: demographics.byInsurance.map(item => ({
        name: item.type,
        value: item.count,
        percentage: item.percentage,
        color: item.color
      }))
    };
  }

  // Get all appointments
  async getAllAppointments(): Promise<Appointment[]> {
    // Use appointment data from API or mock data
    const appointmentData = await this.safeApiGet('/appointments', healthcareData.appointments);
    
    // Check if the data has the 'upcoming' property, if not, use the mock helper
    if (Array.isArray((appointmentData as any).upcoming)) {
      return (appointmentData as any).upcoming;
    } else {
      // If the structure doesn't match, get from local data
      return await this.getAllAppointmentsFromLocalData();
    }
  }
  
  // Get appointments for a specific day
  async getAppointmentsForDay(date: string): Promise<Appointment[]> {
    return this.safeApiGet(`/appointments/day/${date}`, 
      (await this.getAllAppointmentsFromLocalData()).filter(apt => apt.date === date)
    );
  }
  
  // Get appointments for a specific patient
  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    return this.safeApiGet(`/appointments/patient/${patientId}`,
      (await this.getAllAppointmentsFromLocalData()).filter(apt => apt.patientId === patientId)
    );
  }
  
  // Private helper to generate appointments from local data if needed
  private async getAllAppointmentsFromLocalData(): Promise<Appointment[]> {
    const patients = healthcareData.patients;
    const appointments: Appointment[] = [];
    
    // Create appointments based on patient data in healthcareData
    patients.forEach(patient => {
      // Create appointment based on lastVisit if it exists
      if (patient.lastVisit) {
        // Calculate a consistent time based on patient ID
        // This ensures the same patient always gets the same appointment time
        const patientIdSum = patient.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const hour = 8 + (patientIdSum % 8);
        const minute = (patientIdSum * 3) % 60;
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour > 12 ? hour - 12 : hour;
        const time = `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
        
        appointments.push({
          id: `APT-${patient.id}-LV`,
          patientId: patient.id,
          patientName: patient.fullName,
          date: patient.lastVisit,
          time: time,
          department: patient.department,
          doctor: patient.doctor,
          type: "Check-up",
          status: "Completed",
          duration: 30 + (patientIdSum % 30),
          notes: `Regular check-up for ${patient.diagnosis}`
        });
      }
      
      // Create appointment based on nextAppointment if it exists
      if (patient.nextAppointment) {
        // Similar time calculation but offset by 2 hours
        const patientIdSum = patient.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const hour = 10 + (patientIdSum % 6);
        const minute = (patientIdSum * 7) % 60;
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour > 12 ? hour - 12 : hour;
        const time = `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
        
        appointments.push({
          id: `APT-${patient.id}-NA`,
          patientId: patient.id,
          patientName: patient.fullName,
          date: patient.nextAppointment,
          time: time,
          department: patient.department,
          doctor: patient.doctor,
          type: "Follow-up",
          status: "Scheduled",
          duration: 30 + (patientIdSum % 45),
          notes: `Follow-up for ${patient.diagnosis}`
        });
      }
    });
    
    return appointments;
  }
  
  // Create a new appointment
  async createAppointment(appointmentData: Partial<Appointment>): Promise<Appointment> {
    const isConnected = await this.checkConnection();
    
    if (!isConnected) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Keep the mock data delay
      
      // Generate a deterministic ID based on patient and timestamp
      const timestamp = Date.now();
      const id = `APT-${appointmentData.patientId}-${timestamp.toString().substring(timestamp.toString().length - 6)}`;
      
      const newAppointment = {
        id,
        ...appointmentData,
      } as Appointment;
      
      return newAppointment;
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/appointments`, appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment, using fallback:', error);
      
      // Fallback to mock behavior
      const timestamp = Date.now();
      const id = `APT-${appointmentData.patientId}-${timestamp.toString().substring(timestamp.toString().length - 6)}`;
      
      return {
        id,
        ...appointmentData,
      } as Appointment;
    }
  }
  
  // Update appointment status
  async updateAppointmentStatus(id: string, status: string): Promise<{ success: boolean, message: string }> {
    const isConnected = await this.checkConnection();
    
    if (!isConnected) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Keep the mock data delay
      return { 
        success: true, 
        message: `Appointment ${id} status updated to ${status}` 
      };
    }
    
    try {
      const response = await axios.put(`${API_BASE_URL}/appointments/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating appointment status, using fallback:', error);
      return { 
        success: true, 
        message: `Appointment ${id} status updated to ${status}` 
      };
    }
  }
  
  // Get patient vitals history
  async getPatientVitals(patientId: string): Promise<GetPatientVitalsResponse | null> {
    // Fix the type casting for patientVitals
    const patientVitalsRecord = healthcareData.patientVitals as Record<string, PatientVitalHistory[]>;
    const vitalSignsRecord = healthcareData.vitalSigns as Record<string, any>;
    
    return this.safeApiGet(`/vitals/patient/${patientId}`, {
      vitals: patientVitalsRecord[patientId] || [],
      currentReading: vitalSignsRecord[patientId] || null,
      alerts: (healthcareData.vitalSignsAlerts?.filter(
        alert => alert.patientId === patientId
      ) || []).map(alert => ({
        ...alert,
        severity: alert.severity as PatientSeverity
      }))
    });
  }

  // Get patient timeline
  async getPatientTimeline(patientId: string): Promise<TimelineEvent[]> {
    const patientTimelinesRecord = healthcareData.patientTimelines as Record<string, TimelineEvent[]>;
    
    return this.safeApiGet(`/patients/${patientId}/timeline`, 
      patientTimelinesRecord[patientId] || []
    );
  }

  // Get a specific staff member
  async getStaffById(id: string): Promise<StaffMember | null> {
    const staff = await this.safeApiGet(`/staff/${id}/full`, 
      healthcareData.staff.find(s => s.id === id) || null
    );
    
    if (!staff) return null;
    
    // Cast the status to StaffStatus to ensure type compatibility
    if (staff && typeof staff === 'object') {
      return {
        ...staff,
        status: staff.status as StaffStatus
      } as StaffMember;
    }
    
    return staff as StaffMember | null;
  }

  // Get a specific staff member with PII masked
  async getSecureStaffById(id: string): Promise<SecureStaffMember | null> {
    const staff = await this.safeApiGet(`/staff/${id}`, 
      healthcareData.staff.find(s => s.id === id) || null
    );
    
    if (!staff) return null;
    
    // If we're using real API data, it's already secure. If using fallback, mask PII
    if (this.isConnected) {
      return staff as SecureStaffMember;
    }
    
    // Using fallback data, so we need to mask PII
    return {
      id: staff.id,
      fullName: maskPII(staff.fullName),
      role: staff.role,
      department: staff.department,
      status: staff.status as StaffStatus,
      shift: staff.shift,
      specialty: staff.specialty,
      experience: staff.experience,
      patients: staff.patients,
      rating: staff.rating
    };
  }

  // Get patients assigned to a specific staff member
  async getPatientsByStaffId(staffId: string): Promise<SecurePatient[]> {
    const patients = await this.safeApiGet(`/staff/${staffId}/patients`,
      healthcareData.patients.filter(patient => {
        const staff = healthcareData.staff.find(s => s.id === staffId);
        return staff && patient.doctor === staff.fullName;
      })
    );
    
    // If we're using real API data, it's already secure. If using fallback, mask PII
    if (this.isConnected) {
      return patients as SecurePatient[];
    }
    
    // Using fallback data, so we need to mask PII
    return patients.map(patient => ({
      id: maskPatientId(patient.id),
      fullName: maskPII(patient.fullName),
      age: patient.age,
      gender: patient.gender,
      department: patient.department,
      doctor: patient.doctor,
      status: patient.status as PatientStatus,
      severity: patient.severity as PatientSeverity,
      admissionDate: patient.admissionDate,
      lastVisit: patient.lastVisit,
      nextAppointment: patient.nextAppointment,
      room: patient.room,
      diagnosis: patient.diagnosis,
      vitals: patient.vitals,
      allergies: patient.allergies,
      medications: patient.medications
    }));
  }

  // Get staff count by role
  async getStaffCountByRole(): Promise<{role: string, count: number}[]> {
    const generateRoleCount = (): {role: string, count: number}[] => {
      const roleMap = new Map<string, number>();
      
      healthcareData.staff.forEach(staff => {
        const role = staff.role.split(' ')[0]; 
        roleMap.set(role, (roleMap.get(role) || 0) + 1);
      });
      
      return Array.from(roleMap.entries()).map(([role, count]) => ({
        role,
        count
      }));
    };
    
    return this.safeApiGet('/staff/count-by-role', generateRoleCount());
  }

  // Get staff count by department
  async getStaffCountByDepartment(): Promise<{department: string, count: number}[]> {
    const generateDepartmentCount = (): {department: string, count: number}[] => {
      const departmentMap = new Map<string, number>();
      
      healthcareData.staff.forEach(staff => {
        departmentMap.set(staff.department, (departmentMap.get(staff.department) || 0) + 1);
      });
      
      return Array.from(departmentMap.entries()).map(([department, count]) => ({
        department,
        count
      }));
    };
    
    return this.safeApiGet('/staff/count-by-department', generateDepartmentCount());
  }

  // Update staff status
  async updateStaffStatus(id: string, status: string): Promise<{ success: boolean, message: string }> {
    const isConnected = await this.checkConnection();
    
    if (!isConnected) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        message: `Staff ${id} status updated to ${status}`
      };
    }
    
    try {
      const response = await axios.put(`${API_BASE_URL}/staff/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating staff status, using fallback:', error);
      return {
        success: true,
        message: `Staff ${id} status updated to ${status}`
      };
    }
  }

  // Get staff schedule
  async getStaffSchedule(startDate: string, endDate: string): Promise<StaffScheduleEntry[]> {
    return this.safeApiGet(`/staff/schedule?startDate=${startDate}&endDate=${endDate}`, []);
  }

  // Save staff schedule
  async saveStaffSchedule(scheduleEntries: StaffScheduleEntry[]): Promise<{ success: boolean; message: string }> {
    const isConnected = await this.checkConnection();
    
    if (!isConnected) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        success: true,
        message: `Schedule updated successfully for ${scheduleEntries.length} entries`
      };
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/staff/schedule`, scheduleEntries);
      return response.data;
    } catch (error) {
      console.error('Error saving staff schedule, using fallback:', error);
      return {
        success: true,
        message: `Schedule updated successfully for ${scheduleEntries.length} entries`
      };
    }
  }

  // Record patient vital signs
  async recordPatientVitals(patientId: string, vitals: any): Promise<{ success: boolean, currentReading: any, alerts?: any[] }> {
    const isConnected = await this.checkConnection();
    
    if (!isConnected) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return {
        success: true,
        currentReading: vitals,
        alerts: [] // No alerts in fallback mode
      };
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/vitals/patient/${patientId}`, vitals);
      return response.data;
    } catch (error) {
      console.error('Error recording vital signs, using fallback:', error);
      return {
        success: true,
        currentReading: vitals,
        alerts: [] // No alerts in fallback mode
      };
    }
  }

  // Get enhanced department
  async getEnhancedDepartment(departmentId: number): Promise<EnhancedDepartment | null> {
    // When using API, directly fetch from the enhanced endpoint
    if (await this.checkConnection()) {
      try {
        const response = await axios.get(`${API_BASE_URL}/departments/${departmentId}/enhanced`);
        
        // Process response data to ensure correct types
        const data = response.data;
        
        // Normalize department data
        if (data.department) {
          data.department.totalPatients = ensureNumber(data.department.totalPatients);
          data.department.todayPatients = ensureNumber(data.department.todayPatients);
          data.department.avgWaitTime = ensureNumber(data.department.avgWaitTime);
          data.department.satisfaction = ensureNumber(data.department.satisfaction);
          data.department.revenue = ensureNumber(data.department.revenue);
          data.department.capacity = ensureNumber(data.department.capacity);
          data.department.currentOccupancy = ensureNumber(data.department.currentOccupancy);
          data.department.criticalCases = ensureNumber(data.department.criticalCases);
          
          // Staff numbers
          if (data.department.staff) {
            data.department.staff.doctors = ensureNumber(data.department.staff.doctors);
            data.department.staff.nurses = ensureNumber(data.department.staff.nurses);
            data.department.staff.support = ensureNumber(data.department.staff.support);
          }
        }
        
        // Normalize quality metrics
        if (data.quality) {
          if (data.quality.satisfaction) {
            data.quality.satisfaction.score = ensureNumber(data.quality.satisfaction.score);
            data.quality.satisfaction.responses = ensureNumber(data.quality.satisfaction.responses);
          }
          
          if (data.quality.waitTime) {
            data.quality.waitTime.avgWait = ensureNumber(data.quality.waitTime.avgWait);
            data.quality.waitTime.target = ensureNumber(data.quality.waitTime.target);
          }
          
          if (data.quality.readmission) {
            data.quality.readmission.rate = ensureNumber(data.quality.readmission.rate);
            data.quality.readmission.target = ensureNumber(data.quality.readmission.target);
          }
        }
        
        // Normalize financial data
        if (data.financial) {
          data.financial.revenue = ensureNumber(data.financial.revenue);
          data.financial.percentage = ensureNumber(data.financial.percentage);
        }
        
        return data as EnhancedDepartment;
      } catch (error) {
        console.error(`Error fetching enhanced department data for ${departmentId}:`, error);
        // Fall back to mock data generation if API fails
      }
    }

    // Fallback to mock data generation
    const generateEnhancedDept = async (): Promise<EnhancedDepartment | null> => {
      const department = await this.getDepartmentById(departmentId);
      if (!department) return null;
      
      const [qualityData, financialData] = await Promise.all([
        this.getQualityMetrics(),
        this.getFinancialData()
      ]);
      
      // Find financial data for this department
      const financialDept = financialData.byDepartment.find(
        d => d.department === department.name
      );
      
      // Find quality metrics for this department
      const satisfactionData = qualityData.patientSatisfaction.byDepartment.find(
        d => d.department === department.name
      );
      
      // Find wait time data
      const waitTimeData = qualityData.waitTimes.byDepartment.find(
        d => d.department === department.name
      );
      
      const readmissionData = qualityData.readmissionRates.byDepartment.find(
        d => d.department === department.name
      );
      
      // Ensure all values are numbers in the fallback data as well
      return {
        department,
        financial: financialDept ? {
          revenue: ensureNumber(financialDept.revenue),
          percentage: ensureNumber(financialDept.percentage)
        } : null,
        quality: {
          satisfaction: satisfactionData && (typeof satisfactionData.score === 'number' || satisfactionData.score) ? {
            score: ensureNumber(satisfactionData.score),
            responses: ensureNumber(satisfactionData.responses)
          } : null,
          
          waitTime: waitTimeData && (typeof waitTimeData.avgWait === 'number' || waitTimeData.avgWait) ? {
            avgWait: ensureNumber(waitTimeData.avgWait),
            target: ensureNumber(waitTimeData.target || (waitTimeData.avgWait + 10))
          } : (department ? {
            avgWait: ensureNumber(department.avgWaitTime),
            target: ensureNumber(department.avgWaitTime + 10)
          } : null),
          
          readmission: readmissionData && (typeof readmissionData.rate === 'number' || readmissionData.rate) ? {
            rate: ensureNumber(readmissionData.rate),
            target: ensureNumber(readmissionData.target || (readmissionData.rate - 1))
          } : null
        }
      };
    };

    return await generateEnhancedDept();
  }

  // Add this debugging function to your DataService class
  private logPatientFields(patient: any, source: string) {
    if (!patient) {
      console.warn(`${source}: No patient data available`);
      return;
    }
    
    console.log(`${source} patient:`, {
      id: patient.id,
      fullName: patient.fullName || patient.full_name, 
      rawName: JSON.stringify(patient.fullName || patient.full_name),
      department: patient.department || patient.department_name,
      doctor: patient.doctor || patient.doctor_name
    });
  }
}

export const dataService = new DataService();