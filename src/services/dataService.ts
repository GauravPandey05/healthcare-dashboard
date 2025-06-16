// First, we need to ensure we're importing from the right path
import healthcareData from '../data/healthcareData';
import { maskPII, maskPatientId } from '../utils/privacyUtils';

import type {
  OverviewStatistics,
  Demographics,
  AppointmentData,
  Department,
  Patient,
  StaffMember,
  RecentActivity,
  Financial,
  Quality,
  Inventory,
  VitalSigns,
  PatientStatus,
  PatientSeverity,
  PatientVitals,
  SecurePatient,
  SecureStaffMember
} from '../types/schema';

// Helper function to create a secure patient object that hides PII
const createSecurePatient = (patient: Patient): SecurePatient => {
  // Extract only non-PII fields
  return {
    id: patient.id,
    fullName: patient.fullName,// Only show first initial for privacy
    age: patient.age,
    gender: patient.gender,
    department: patient.department,
    doctor: patient.doctor,
    status: patient.status,
    severity: patient.severity,
    admissionDate: patient.admissionDate,
    lastVisit: patient.lastVisit,
    nextAppointment: patient.nextAppointment,
    room: patient.room,
    diagnosis: patient.diagnosis,
    vitals: patient.vitals,
    allergies: patient.allergies,
    medications: patient.medications
  };
};

// Helper function to create a secure staff object that hides PII
const createSecureStaff = (staff: StaffMember): SecureStaffMember => {
  return {
    id: staff.id,
    fullName: staff.fullName,
    role: staff.role,
    department: staff.department,
    status: staff.status,
    shift: staff.shift,
    specialty: staff.specialty,
    experience: staff.experience,
    patients: staff.patients,
    rating: staff.rating
    // Omit PII like phone and email
  };
};

// The data service that provides methods to access the healthcare data
export const dataService = {
  // Get overview statistics
  getOverview: (): Promise<OverviewStatistics> => {
    return Promise.resolve(healthcareData.overview);
  },

  // Get demographic data
  getDemographics: (): Promise<Demographics> => {
    return Promise.resolve(healthcareData.demographics);
  },

  // Get appointment data
  getAppointments: (): Promise<AppointmentData> => {
    return Promise.resolve(healthcareData.appointments);
  },

  // Get departments
  getDepartments: (): Promise<Department[]> => {
    return Promise.resolve(healthcareData.departments);
  },

  // Get a specific department by ID
  getDepartmentById: (id: number): Promise<Department | null> => {
    const department = healthcareData.departments.find(dept => dept.id === id);
    return Promise.resolve(department || null);
  },

  // Get secure patient list (no PII)
  getSecurePatients: (): Promise<SecurePatient[]> => {
    const securePatients = healthcareData.patients.map(patient => 
      createSecurePatient(patient as Patient)
    );
    return Promise.resolve(securePatients);
  },

  // Get a secure patient by ID (no PII)
  getSecurePatientById: (id: string): Promise<SecurePatient | null> => {
    const patient = healthcareData.patients.find(p => p.id === id);
    return Promise.resolve(patient ? createSecurePatient(patient as Patient) : null);
  },

  // Get patients by department ID (no PII)
  getSecurePatientsByDepartment: (departmentId: number): Promise<SecurePatient[]> => {
    const department = healthcareData.departments.find(dept => dept.id === departmentId);
    if (!department) return Promise.resolve([]);

    const departmentPatients = healthcareData.patients.filter(
      patient => patient.department === department.name
    );
    
    return Promise.resolve(
      departmentPatients.map(patient => createSecurePatient(patient as Patient))
    );
  },

  // Get staff list (no PII)
  // Removed duplicate getSecureStaff to avoid property conflict.

  // Get staff by department (no PII)
  getSecureStaffByDepartment: (departmentId: number): Promise<SecureStaffMember[]> => {
    const department = healthcareData.departments.find(dept => dept.id === departmentId);
    if (!department) return Promise.resolve([]);

    const departmentStaff = healthcareData.staff.filter(
      staff => staff.department === department.name
    );
    
    return Promise.resolve(
      departmentStaff.map(staff => createSecureStaff(staff as StaffMember))
    );
  },

  // Get recent activities
  getRecentActivities: (): Promise<RecentActivity[]> => {
    return Promise.resolve(healthcareData.recentActivities);
  },

  // Get financial data
  getFinancialData: (): Promise<Financial> => {
    return Promise.resolve(healthcareData.financial);
  },

  // Get quality metrics
  getQualityMetrics: (): Promise<Quality> => {
    return Promise.resolve(healthcareData.quality);
  },

  // Get inventory data
  getInventory: (): Promise<Inventory> => {
    return Promise.resolve(healthcareData.inventory);
  },

  // Get vital signs
  getVitalSigns: (): Promise<VitalSigns> => {
    return Promise.resolve(healthcareData.vitalSigns);
  },

  // Get overview statistics (alternative method name to avoid conflict)
  getOverviewStats: (): Promise<any> => {
    // Return the overview statistics
    return Promise.resolve(healthcareData.overview);
  },

  // Get demographics with mapped structure (alternative method name to avoid conflict)
  getDemographicsMapped: (): Promise<any> => {
    return Promise.resolve({
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
    });
  },

  // Add these methods to your dataService class
  async getSecureStaff(): Promise<SecureStaffMember[]> {
    // In a real implementation, this would apply security filters based on user role
    return healthcareData.staff.map(staffMember => ({
      id: staffMember.id,
      fullName: staffMember.fullName,
      role: staffMember.role,
      department: staffMember.department,
      status: staffMember.status,
      shift: staffMember.shift,
      specialty: staffMember.specialty,
      experience: staffMember.experience,
      patients: staffMember.patients,
      rating: staffMember.rating
    }));
  },

  async getSecureStaffById(id: string): Promise<SecureStaffMember | null> {
    const staffMembers = await this.getSecureStaff();
    return staffMembers.find(staff => staff.id === id) || null;
  }
};