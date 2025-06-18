// First, we need to ensure we're importing from the right path
import healthcareData from '../data/healthcareData';
import { maskPII, maskPatientId, maskEmail, maskPhoneNumber } from '../utils/privacyUtils';
import type { 
  AppointmentData, 
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
  // Add these new imports
  PatientVitalHistory,
  VitalSignAlert,
  TimelineEvent,
  GetPatientVitalsResponse,
  PatientStatus,
  PatientSeverity
} from '../types/schema';



class DataService {
  // Get overview statistics
  async getOverview(): Promise<OverviewStatistics> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return healthcareData.overview;
  }

  // Get demographic data
  async getDemographics(): Promise<Demographics> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return healthcareData.demographics;
  }

  // Get appointment data
  async getAppointments(): Promise<AppointmentData> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return healthcareData.appointments;
  }

  // Get departments
  async getDepartments(): Promise<Department[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return healthcareData.departments;
  }

  // Get a specific department by ID
  async getDepartmentById(id: number): Promise<Department | null> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const department = healthcareData.departments.find(dept => dept.id === id);
    return department || null;
  }

  // Get secure patient list (no PII)
  async getSecurePatients(): Promise<SecurePatient[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const securePatients = healthcareData.patients.map(patient => {
      return {
        id: maskPatientId(patient.id),
        fullName: maskPII(patient.fullName),
        age: patient.age,
        gender: patient.gender,
        department: patient.department,
        doctor: patient.doctor,
        status: patient.status as PatientStatus, // Fix #1: Cast to PatientStatus
        severity: patient.severity as PatientSeverity, // Fix #1: Cast to PatientSeverity
        admissionDate: patient.admissionDate,
        lastVisit: patient.lastVisit,
        nextAppointment: patient.nextAppointment,
        room: patient.room,
        diagnosis: patient.diagnosis,
        vitals: patient.vitals,
        allergies: patient.allergies,
        medications: patient.medications
      };
    });
    return securePatients;
  }

  // Get a patient by ID (full data with PII)
  async getPatientById(id: string): Promise<Patient | null> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const patient = healthcareData.patients.find(p => p.id === id);
    return patient as Patient || null;
  }

  // Get a secure patient by ID (no PII)
  async getSecurePatientById(id: string): Promise<SecurePatient | null> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const patient = healthcareData.patients.find(p => p.id === id);
    if (!patient) return null;
    
    return {
      id: maskPatientId(patient.id),
      fullName: maskPII(patient.fullName),
      age: patient.age,
      gender: patient.gender,
      department: patient.department,
      doctor: patient.doctor,
      status: patient.status as PatientStatus, // Fix: Cast to PatientStatus
      severity: patient.severity as PatientSeverity, // Fix: Cast to PatientSeverity
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
    await new Promise(resolve => setTimeout(resolve, 800));
    const department = healthcareData.departments.find(dept => dept.id === departmentId);
    if (!department) return [];

    const departmentPatients = healthcareData.patients.filter(
      patient => patient.department === department.name
    );
    
    return departmentPatients.map(patient => ({
      id: maskPatientId(patient.id),
      fullName: maskPII(patient.fullName),
      age: patient.age,
      gender: patient.gender,
      department: patient.department,
      doctor: patient.doctor,
      status: patient.status as PatientStatus, // Fix: Cast to PatientStatus
      severity: patient.severity as PatientSeverity, // Fix: Cast to PatientSeverity
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

  // Get secure staff list (no PII)
  async getSecureStaff(): Promise<SecureStaffMember[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const secureStaff = healthcareData.staff.map(staff => ({
      id: staff.id,
      fullName: maskPII(staff.fullName),
      role: staff.role,
      department: staff.department,
      status: staff.status,
      shift: staff.shift,
      specialty: staff.specialty,
      experience: staff.experience,
      patients: staff.patients,
      rating: staff.rating
    }));
    return secureStaff;
  }

  // Get staff by department (no PII)
  async getSecureStaffByDepartment(departmentId: number): Promise<SecureStaffMember[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const department = healthcareData.departments.find(dept => dept.id === departmentId);
    if (!department) return [];

    const departmentStaff = healthcareData.staff.filter(
      staff => staff.department === department.name
    );
    
    return departmentStaff.map(staff => ({
      id: staff.id,
      fullName: maskPII(staff.fullName),
      role: staff.role,
      department: staff.department,
      status: staff.status,
      shift: staff.shift,
      specialty: staff.specialty,
      experience: staff.experience,
      patients: staff.patients,
      rating: staff.rating
    }));
  }

  // Get recent activities
  async getRecentActivities(): Promise<RecentActivity[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return healthcareData.recentActivities;
  }

  // Get financial data
  async getFinancialData(): Promise<Financial> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return healthcareData.financial;
  }

  // Get quality metrics
  async getQualityMetrics(): Promise<Quality> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return healthcareData.quality;
  }

  // Get inventory data
  async getInventory(): Promise<Inventory> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return healthcareData.inventory;
  }

  // Get vital signs
  async getVitalSigns(): Promise<VitalSigns> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return healthcareData.vitalSigns;
  }

  // Get demographics with mapped structure for charts
  async getDemographicsMapped(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      age: healthcareData.demographics.byAge.map(item => ({
        name: item.label || item.ageGroup,
        value: item.count,
        percentage: item.percentage,
        color: item.color
      })),
      gender: healthcareData.demographics.byGender.map(item => ({
        name: item.gender,
        value: item.count,
        percentage: item.percentage,
        color: item.color
      })),
      insurance: healthcareData.demographics.byInsurance.map(item => ({
        name: item.type,
        value: item.count,
        percentage: item.percentage,
        color: item.color
      }))
    };
  }

  // New method to get individual appointments based on healthcareData
  async getAllAppointments(): Promise<Appointment[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const appointments: Appointment[] = [];
    const patients = healthcareData.patients;
    
    // Create appointments based on patient data in healthcareData
    patients.forEach(patient => {
      // Create appointment based on lastVisit if it exists
      if (patient.lastVisit) {
        appointments.push({
          id: `APT-${patient.id}-LV`,
          patientId: patient.id,
          patientName: patient.fullName,
          date: patient.lastVisit,
          time: "09:00 AM",
          department: patient.department,
          doctor: patient.doctor,
          type: "Check-up",
          status: "Completed",
          duration: 30,
          notes: `Regular check-up for ${patient.diagnosis}`
        });
      }
      
      // Create appointment based on nextAppointment if it exists
      if (patient.nextAppointment) {
        appointments.push({
          id: `APT-${patient.id}-NA`,
          patientId: patient.id,
          patientName: patient.fullName,
          date: patient.nextAppointment,
          time: "10:30 AM",
          department: patient.department,
          doctor: patient.doctor,
          type: "Follow-up",
          status: "Scheduled",
          duration: 45,
          notes: `Follow-up for ${patient.diagnosis}`
        });
      }
    });
    
    return appointments;
  }
  
  // Get appointments for a specific day
  async getAppointmentsForDay(date: string): Promise<Appointment[]> {
    const allAppointments = await this.getAllAppointments();
    return allAppointments.filter(apt => apt.date === date);
  }
  
  // Get appointments for a specific patient
  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    const allAppointments = await this.getAllAppointments();
    return allAppointments.filter(apt => apt.patientId === patientId);
  }
  
  // Create a new appointment
  async createAppointment(appointmentData: Partial<Appointment>): Promise<Appointment> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate a deterministic ID based on patient and timestamp
    const timestamp = Date.now();
    const id = `APT-${appointmentData.patientId}-${timestamp.toString().substring(timestamp.toString().length - 6)}`;
    
    const newAppointment = {
      id,
      ...appointmentData,
    } as Appointment;
    
    return newAppointment;
  }
  
  // Update appointment status
  async updateAppointmentStatus(id: string, status: string): Promise<{ success: boolean, message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      success: true, 
      message: `Appointment ${id} status updated to ${status}` 
    };
  }
  
  // Get patient vitals history
  async getPatientVitals(patientId: string): Promise<GetPatientVitalsResponse | null> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const patient = await this.getPatientById(patientId);
    
    if (!patient) {
      return null;
    }
    
    // Fix #2: Use type assertion for accessing patientVitals
    const vitalsHistory = (healthcareData.patientVitals as Record<string, PatientVitalHistory[]>)[patientId] || [];
    
    // Fix #3: Cast VitalSignAlert severity
    const patientAlerts = (healthcareData.vitalSignsAlerts?.filter(
      alert => alert.patientId === patientId
    ) || []).map(alert => ({
      ...alert,
      severity: alert.severity as PatientSeverity // Fix: Cast to PatientSeverity
    }));
    
    return {
      vitals: vitalsHistory,
      currentReading: patient.vitals,
      alerts: patientAlerts
    };
  }

  // New method to get patient timeline
  async getPatientTimeline(patientId: string): Promise<TimelineEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fix #4: Use type assertion for accessing patientTimelines
    return (healthcareData.patientTimelines as Record<string, TimelineEvent[]>)[patientId] || [];
  }
}

export const dataService = new DataService();