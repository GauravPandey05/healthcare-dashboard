export interface OverviewStatistics {
  totalPatients: number;
  activePatients: number;
  newPatientsToday: number;
  totalAppointments: number;
  todayAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingResults: number;
  criticalAlerts: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  bedOccupancyRate: number;
  totalStaff: number;
  staffOnDuty: number;
  doctorsAvailable: number;
  nursesOnDuty: number;
  averageWaitTime: number;
  patientSatisfactionScore: number;
  revenue: number;
  expenses: number;
}

export interface DemographicItem {
  ageGroup?: string;
  gender?: string;
  type?: string;
  label?: string;
  count: number;
  percentage: number;
  color: string;
}

export interface Demographics {
  byAge: DemographicItem[];
  byGender: DemographicItem[];
  byInsurance: DemographicItem[];
}

export interface MonthlyAppointment {
  month: string;
  appointments: number;
  completed: number;
  cancelled: number;
  noShow: number;
  revenue: number;
}

export interface DailyAppointment {
  day: string;
  scheduled: number;
  completed: number;
  inProgress: number;
  cancelled: number;
  waitTime: number;
}

export interface AppointmentType {
  type: string;
  count: number;
  percentage: number;
  avgDuration: number;
  color: string;
}

export interface AppointmentData {
  // Original properties from mock data
  monthlyTrends: MonthlyAppointment[];
  weeklySchedule: DailyAppointment[];
  byType: AppointmentType[];
  upcoming: Appointment[];
  completed: Appointment[];
  
  // Add compatibility with API data structure
  // These fields allow the API to use different field names
  monthly?: MonthlyAppointment[];    // API might use this instead of monthlyTrends
  weekly?: DailyAppointment[];       // API might use this instead of weeklySchedule
  // We'll normalize these in the data service
}

export interface Department {
  id: number;
  name: string;
  code: string;
  totalPatients: number;
  todayPatients: number;
  avgWaitTime: number;
  satisfaction: number;
  staff: {
    doctors: number;
    nurses: number;
    support: number;
  };
  revenue: number;
  capacity: number;
  currentOccupancy: number;
  criticalCases: number;
}

export type PatientStatus = 'In Treatment' | 'Scheduled' | 'Critical' | 'Discharged';
export type PatientSeverity = 'High' | 'Medium' | 'Low';

// Definition for current vitals as stored in patient records
export interface PatientVitals {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
}

// Definition for historical vitals from patientVitals collection
export interface PatientVitalHistory {
  date: string;
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  oxygenSaturation: number;
}

// Vital sign alerts definition
export interface VitalSignAlert {
  id: string;
  patientId: string;
  type: string;
  message: string;
  severity: PatientSeverity;
  date: string;
  resolved: boolean;
}

// Timeline event definition
export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'admission' | 'visit' | 'test' | 'medication' | 'discharge' | 'surgery' | 'other';
}

// Patient interface
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  insurance: string;
  emergencyContact: string;
  department: string;
  doctor: string;
  admissionDate: string;
  status: PatientStatus;
  severity: PatientSeverity;
  room: string;
  diagnosis: string;
  lastVisit: string;
  nextAppointment: string;
  vitals: PatientVitals;
  medications: string[];
  allergies: string[];
  notes: string;
}

export type StaffStatus = 'On Duty' | 'Off Duty' | 'On Call' | 'On Leave';

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  department: string;
  status: StaffStatus;
  shift: string;
  experience: number;
  patients: number;
  phone: string;
  email: string;
  specialty: string;
  rating: number;
}

// Legacy vital reading format - kept for backward compatibility
export interface VitalReading {
  time: string;
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  temperature: number;
  oxygenSat: number;
}

// Legacy alert format - kept for backward compatibility
export interface Alert {
  patientId: string;
  type: string;
  value: string | number;
  threshold: string | number;
  timestamp: string;
  severity: string;
}

/**
 * @deprecated This interface exists for backward compatibility.
 * Use PatientVitalHistory and VitalSignAlert instead.
 */
export interface VitalSigns {
  // This structure is kept for backward compatibility
  // but actual data now uses patientVitals and vitalSignsAlerts
  patientP001?: VitalReading[];
  alerts?: Alert[];
}

export interface FinancialMonthly {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  patients: number;
}

export interface DepartmentFinancial {
  department: string;
  revenue: number;
  percentage: number;
}

export interface PaymentMethod {
  method: string;
  amount: number;
  percentage: number;
}

export interface Financial {
  monthly: FinancialMonthly[];
  byDepartment: DepartmentFinancial[];
  paymentMethods: PaymentMethod[];
}

export interface DepartmentQuality {
  department: string;
  score?: number;
  responses?: number;
  avgWait?: number;
  target?: number;
  rate?: number;
}

export interface Quality {
  patientSatisfaction: {
    overall: number;
    byDepartment: DepartmentQuality[];
  };
  waitTimes: {
    average: number;
    byDepartment: DepartmentQuality[];
  };
  readmissionRates: {
    overall: number;
    byDepartment: DepartmentQuality[];
  };
}

export interface MedicalSupply {
  item: string;
  current: number;
  minimum: number;
  status: string;
  cost: number;
}

export interface Equipment {
  equipment: string;
  status: string;
  lastMaintenance: string;
  nextMaintenance: string;
}

export interface Inventory {
  medical_supplies: MedicalSupply[];
  equipment: Equipment[];
}

export interface RecentActivity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  priority: string;
}

// Response type for getPatientVitals method
export interface GetPatientVitalsResponse {
  vitals: PatientVitalHistory[];
  currentReading: PatientVitals;
  alerts: VitalSignAlert[];
}

export interface SecurePatient {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  department: string;
  doctor: string;
  status: PatientStatus;
  severity: PatientSeverity;
  admissionDate: string;
  lastVisit: string;
  nextAppointment: string;
  room: string;
  diagnosis: string;
  vitals: PatientVitals;
  allergies: string[];
  medications: string[];
}

export interface StaffScheduleEntry {
  staffId: string;
  date: string;
  shift: string;
}

export interface SecureStaffMember {
  id: string;
  fullName: string;
  role: string;
  department: string;
  status: StaffStatus;
  shift: string;
  specialty: string;
  experience: number;
  patients: number;
  rating: number;
}

// Appointment interface
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  department: string;
  doctor: string;
  type: string;
  status: string;
  duration: number;
  notes?: string;
}

// Complete HealthcareData interface with proper properties
export interface HealthcareData {
  overview: OverviewStatistics;
  demographics: Demographics;
  appointments: AppointmentData;
  departments: Department[];
  patients: Patient[];
  staff: StaffMember[];
  vitalSigns: VitalSigns; // Kept for backward compatibility
  financial: Financial;
  quality: Quality;
  inventory: Inventory;
  recentActivities: RecentActivity[];
  
  // New data structures that are actually used
  patientVitals: Record<string, PatientVitalHistory[]>;
  vitalSignsAlerts: VitalSignAlert[];
  patientTimelines: Record<string, TimelineEvent[]>;
}

// Add this new interface for enhanced department data
export interface EnhancedDepartment {
  department: Department;
  financial: {
    revenue: number;
    percentage: number;
  } | null;
  quality: {
    satisfaction: {
      score: number;
      responses: number;
    } | null;
    waitTime: {
      avgWait: number;
      target: number;
    } | null;
    readmission: {
      rate: number;
      target: number;
    } | null;
  };
}