// First, we need to ensure we're importing from the right path
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
  // Add these new imports
  PatientVitalHistory,
  VitalSignAlert,
  TimelineEvent,
  GetPatientVitalsResponse,
  PatientStatus,
  PatientSeverity,
  StaffScheduleEntry // New import for StaffScheduleEntry
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
      status: staff.status as StaffStatus,
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
      status: staff.status as StaffStatus,
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
        // Calculate a consistent time based on patient ID
        // This ensures the same patient always gets the same appointment time
        const patientIdSum = patient.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const hour = 8 + (patientIdSum % 8); // Hours between 8 AM and 3 PM
        const minute = (patientIdSum * 3) % 60; // Minutes 0-59
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
          duration: 30 + (patientIdSum % 30), // Duration between 30-60 min
          notes: `Regular check-up for ${patient.diagnosis}`
        });
      }
      
      // Create appointment based on nextAppointment if it exists
      if (patient.nextAppointment) {
        // Similar time calculation but offset by 2 hours
        const patientIdSum = patient.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const hour = 10 + (patientIdSum % 6); // Hours between 10 AM and 3 PM
        const minute = (patientIdSum * 7) % 60; // Different minute calculation
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
          duration: 30 + (patientIdSum % 45), // Duration between 30-75 min
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

  // Add this method to retrieve a specific staff member
  async getStaffById(id: string): Promise<StaffMember | null> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const staff = healthcareData.staff.find(s => s.id === id);
  
  if (!staff) return null;
  
  // Use the spread operator with type assertion
  return {
    ...staff,
    status: staff.status as StaffStatus
  };
}

  // Add this method to retrieve a specific staff member with PII masked
  async getSecureStaffById(id: string): Promise<SecureStaffMember | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const staff = healthcareData.staff.find(s => s.id === id);
    
    if (!staff) return null;
    
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
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const staff = healthcareData.staff.find(s => s.id === staffId);
    if (!staff) return [];
    
    // Filter patients by doctor's name (since healthcareData doesn't have direct staff-patient relationship)
    const assignedPatients = healthcareData.patients.filter(
      patient => patient.doctor === staff.fullName
    );
    
    return assignedPatients.map(patient => ({
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
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const roleMap = new Map<string, number>();
    
    healthcareData.staff.forEach(staff => {
      const role = staff.role.split(' ')[0]; // Get main role like "Cardiologist", "Nurse"
      roleMap.set(role, (roleMap.get(role) || 0) + 1);
    });
    
    return Array.from(roleMap.entries()).map(([role, count]) => ({
      role,
      count
    }));
  }

  // Get staff count by department
  async getStaffCountByDepartment(): Promise<{department: string, count: number}[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const departmentMap = new Map<string, number>();
    
    healthcareData.staff.forEach(staff => {
      departmentMap.set(staff.department, (departmentMap.get(staff.department) || 0) + 1);
    });
    
    return Array.from(departmentMap.entries()).map(([department, count]) => ({
      department,
      count
    }));
  }

  // Update staff status (for future backend integration)
  async updateStaffStatus(id: string, status: string): Promise<{ success: boolean, message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real backend, this would update the database
    return {
      success: true,
      message: `Staff ${id} status updated to ${status}`
    };
  }

  // Add this new method to get staff schedule
  async getStaffSchedule(startDate: string, endDate: string): Promise<StaffScheduleEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // For now, return an empty array since we don't have this data in healthcareData
    // In a real backend, this would fetch from the API
    return [];
  }

  // Add this new method to save staff schedule
  async saveStaffSchedule(scheduleEntries: StaffScheduleEntry[]): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real backend, this would save to the API
    return {
      success: true,
      message: `Schedule updated successfully for ${scheduleEntries.length} entries`
    };
  }

  // Add this new method to retrieve comprehensive department data
  async getEnhancedDepartment(departmentId: number): Promise<EnhancedDepartment | null> {
    const department = await this.getDepartmentById(departmentId);
    if (!department) return null;
    
    const [qualityData, financialData] = await Promise.all([
      this.getQualityMetrics(),
      this.getFinancialData()
    ]);
    
    // Find financial data for this department - PRIORITY SOURCE FOR REVENUE
    const financialDept = financialData.byDepartment.find(
      d => d.department === department.name
    );
    
    // Find quality metrics for this department
    const satisfactionData = qualityData.patientSatisfaction.byDepartment.find(
      d => d.department === department.name
    );
    
    // Find wait time data - PRIORITY SOURCE FOR WAIT TIMES
    const waitTimeData = qualityData.waitTimes.byDepartment.find(
      d => d.department === department.name
    );
    
    const readmissionData = qualityData.readmissionRates.byDepartment.find(
      d => d.department === department.name
    );
    
    return {
      department,
      // For revenue, prioritize financial.byDepartment
      financial: financialDept ? {
        revenue: financialDept.revenue,
        percentage: financialDept.percentage
      } : null,
      quality: {
        // For detailed satisfaction data (including response counts), use quality.patientSatisfaction
        satisfaction: satisfactionData && typeof satisfactionData.score === 'number' ? {
          // Always use quality.patientSatisfaction.score when available
          score: satisfactionData.score,
          // Default to 0 for responses if not available
          responses: typeof satisfactionData.responses === 'number' ? satisfactionData.responses : 0
        } : null,
        
        // For wait time data, prioritize quality.waitTimes
        waitTime: waitTimeData && typeof waitTimeData.avgWait === 'number' ? {
          // Always use quality.waitTimes.avgWait when available
          avgWait: waitTimeData.avgWait,
          // Default to department.avgWaitTime as target if not available
          target: typeof waitTimeData.target === 'number' ? waitTimeData.target : waitTimeData.avgWait + 10
        } : (department ? {
          // Fall back to department data if quality.waitTimes is not available
          avgWait: department.avgWaitTime,
          target: department.avgWaitTime + 10 // Reasonable default target
        } : null),
        
        // For readmission data
        readmission: readmissionData && typeof readmissionData.rate === 'number' ? {
          rate: readmissionData.rate,
          target: typeof readmissionData.target === 'number' ? readmissionData.target : readmissionData.rate - 1
        } : null
      }
    };
  }
}

export const dataService = new DataService();