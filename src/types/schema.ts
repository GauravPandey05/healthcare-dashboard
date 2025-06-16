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
  monthlyTrends: MonthlyAppointment[];
  weeklySchedule: DailyAppointment[];
  byType: AppointmentType[];
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

export interface PatientVitals {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
}

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

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  department: string;
  status: string;
  shift: string;
  experience: number;
  patients: number;
  phone: string;
  email: string;
  specialty: string;
  rating: number;
}

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

export interface Alert {
  patientId: string;
  type: string;
  value: string | number;
  threshold: string | number;
  timestamp: string;
  severity: string;
}

export interface VitalSigns {
  patientP001: VitalReading[];
  alerts: Alert[];
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

export interface HealthcareData {
  overview: OverviewStatistics;
  demographics: Demographics;
  appointments: AppointmentData;
  departments: Department[];
  patients: Patient[];
  staff: StaffMember[];
  vitalSigns: VitalSigns;
  financial: Financial;
  quality: Quality;
  inventory: Inventory;
  recentActivities: RecentActivity[];
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

export interface SecureStaffMember {
  id: string;
  fullName: string;
  role: string;
  department: string;
  status: string;
  shift: string;
  specialty: string;
  experience: number;
  patients: number;
  rating: number;
}