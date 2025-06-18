// Healthcare Dashboard Data Structure with Fake Data

const healthcareData = {
  
  // 1. OVERVIEW STATISTICS
  overview: {
    totalPatients: 2847,
    activePatients: 1943,
    newPatientsToday: 27,
    totalAppointments: 156,
    todayAppointments: 42,
    completedAppointments: 38,
    cancelledAppointments: 4,
    pendingResults: 23,
    criticalAlerts: 7,
    totalBeds: 350,
    occupiedBeds: 298,
    availableBeds: 52,
    bedOccupancyRate: 85.1,
    totalStaff: 680,
    staffOnDuty: 284,
    doctorsAvailable: 45,
    nursesOnDuty: 128,
    averageWaitTime: 23, // minutes
    patientSatisfactionScore: 4.6,
    revenue: 2847600, // monthly revenue
    expenses: 2234500 // monthly expenses
  },

  // 2. PATIENT DEMOGRAPHICS
  demographics: {
    byAge: [
      { ageGroup: '0-12', label: 'Children', count: 287, percentage: 15.2, color: '#FF6B6B' },
      { ageGroup: '13-17', label: 'Teens', count: 134, percentage: 7.1, color: '#4ECDC4' },
      { ageGroup: '18-35', label: 'Young Adults', count: 567, percentage: 30.1, color: '#45B7D1' },
      { ageGroup: '36-50', label: 'Adults', count: 489, percentage: 25.9, color: '#96CEB4' },
      { ageGroup: '51-65', label: 'Middle Age', count: 298, percentage: 15.8, color: '#FFEAA7' },
      { ageGroup: '65+', label: 'Seniors', count: 112, percentage: 5.9, color: '#DDA0DD' }
    ],
    byGender: [
      { gender: 'Female', count: 1087, percentage: 57.6, color: '#FF6B9D' },
      { gender: 'Male', count: 798, percentage: 42.3, color: '#4A90E2' },
      { gender: 'Other', count: 2, percentage: 0.1, color: '#95A5A6' }
    ],
    byInsurance: [
      { type: 'Private Insurance', count: 945, percentage: 50.1, color: '#2ECC71' },
      { type: 'Medicare', count: 387, percentage: 20.5, color: '#3498DB' },
      { type: 'Medicaid', count: 298, percentage: 15.8, color: '#E74C3C' },
      { type: 'Self-Pay', count: 197, percentage: 10.4, color: '#F39C12' },
      { type: 'Other', count: 60, percentage: 3.2, color: '#9B59B6' }
    ]
  },

  // 3. APPOINTMENT DATA
  appointments: {
    // Monthly trends for the past 12 months
    monthlyTrends: [
      { month: 'Jan 2024', appointments: 1245, completed: 1180, cancelled: 65, noShow: 23, revenue: 298500 },
      { month: 'Feb 2024', appointments: 1187, completed: 1134, cancelled: 53, noShow: 18, revenue: 285600 },
      { month: 'Mar 2024', appointments: 1298, completed: 1242, cancelled: 56, noShow: 21, revenue: 312800 },
      { month: 'Apr 2024', appointments: 1356, completed: 1289, cancelled: 67, noShow: 29, revenue: 327400 },
      { month: 'May 2024', appointments: 1423, completed: 1367, cancelled: 56, noShow: 25, revenue: 341800 },
      { month: 'Jun 2024', appointments: 1389, completed: 1334, cancelled: 55, noShow: 27, revenue: 334200 },
      { month: 'Jul 2024', appointments: 1467, completed: 1398, cancelled: 69, noShow: 31, revenue: 352800 },
      { month: 'Aug 2024', appointments: 1534, completed: 1476, cancelled: 58, noShow: 28, revenue: 369600 },
      { month: 'Sep 2024', appointments: 1498, completed: 1434, cancelled: 64, noShow: 32, revenue: 360400 },
      { month: 'Oct 2024', appointments: 1612, completed: 1548, cancelled: 64, noShow: 29, revenue: 387200 },
      { month: 'Nov 2024', appointments: 1587, completed: 1521, cancelled: 66, noShow: 34, revenue: 381600 },
      { month: 'Dec 2024', appointments: 1634, completed: 1567, cancelled: 67, noShow: 31, revenue: 392400 }
    ],
    
    // Daily appointments for current week
    weeklySchedule: [
      { day: 'Monday', scheduled: 52, completed: 48, inProgress: 4, cancelled: 2, waitTime: 18 },
      { day: 'Tuesday', scheduled: 47, completed: 45, inProgress: 2, cancelled: 1, waitTime: 22 },
      { day: 'Wednesday', scheduled: 59, completed: 54, inProgress: 5, cancelled: 3, waitTime: 25 },
      { day: 'Thursday', scheduled: 61, completed: 58, inProgress: 3, cancelled: 2, waitTime: 19 },
      { day: 'Friday', scheduled: 56, completed: 52, inProgress: 4, cancelled: 1, waitTime: 21 },
      { day: 'Saturday', scheduled: 34, completed: 32, inProgress: 2, cancelled: 1, waitTime: 15 },
      { day: 'Sunday', scheduled: 28, completed: 26, inProgress: 2, cancelled: 0, waitTime: 12 }
    ],

    // Appointment types
    byType: [
      { type: 'Routine Checkup', count: 487, percentage: 31.2, avgDuration: 30, color: '#2ECC71' },
      { type: 'Follow-up', count: 298, percentage: 19.1, avgDuration: 20, color: '#3498DB' },
      { type: 'Emergency', count: 156, percentage: 10.0, avgDuration: 45, color: '#E74C3C' },
      { type: 'Consultation', count: 234, percentage: 15.0, avgDuration: 40, color: '#F39C12' },
      { type: 'Procedure', count: 189, percentage: 12.1, avgDuration: 60, color: '#9B59B6' },
      { type: 'Vaccination', count: 98, percentage: 6.3, avgDuration: 15, color: '#1ABC9C' },
      { type: 'Lab Work', count: 97, percentage: 6.2, avgDuration: 25, color: '#34495E' }
    ]
  },

  // 4. DEPARTMENT DATA
  departments: [
    {
      id: 1,
      name: 'Emergency Department',
      code: 'ED',
      totalPatients: 298,
      todayPatients: 23,
      avgWaitTime: 45,
      satisfaction: 4.2,
      staff: { doctors: 8, nurses: 15, support: 5 },
      revenue: 89400,
      capacity: 50,
      currentOccupancy: 42,
      criticalCases: 3
    },
    {
      id: 2,
      name: 'Cardiology',
      code: 'CARD',
      totalPatients: 187,
      todayPatients: 12,
      avgWaitTime: 28,
      satisfaction: 4.8,
      staff: { doctors: 6, nurses: 8, support: 3 },
      revenue: 124500,
      capacity: 25,
      currentOccupancy: 18,
      criticalCases: 1
    },
    {
      id: 3,
      name: 'Orthopedics',
      code: 'ORTHO',
      totalPatients: 156,
      todayPatients: 9,
      avgWaitTime: 32,
      satisfaction: 4.6,
      staff: { doctors: 5, nurses: 7, support: 2 },
      revenue: 98700,
      capacity: 20,
      currentOccupancy: 15,
      criticalCases: 0
    },
    {
      id: 4,
      name: 'Pediatrics',
      code: 'PED',
      totalPatients: 234,
      todayPatients: 18,
      avgWaitTime: 22,
      satisfaction: 4.9,
      staff: { doctors: 7, nurses: 12, support: 4 },
      revenue: 76800,
      capacity: 30,
      currentOccupancy: 24,
      criticalCases: 0
    },
    {
      id: 5,
      name: 'Internal Medicine',
      code: 'IM',
      totalPatients: 345,
      todayPatients: 21,
      avgWaitTime: 26,
      satisfaction: 4.7,
      staff: { doctors: 9, nurses: 14, support: 6 },
      revenue: 138000,
      capacity: 35,
      currentOccupancy: 28,
      criticalCases: 2
    },
    {
      id: 6,
      name: 'Surgery',
      code: 'SURG',
      totalPatients: 98,
      todayPatients: 6,
      avgWaitTime: 15,
      satisfaction: 4.8,
      staff: { doctors: 12, nurses: 18, support: 8 },
      revenue: 245600,
      capacity: 15,
      currentOccupancy: 12,
      criticalCases: 1
    },
    {
      id: 7,
      name: 'Radiology',
      code: 'RAD',
      totalPatients: 167,
      todayPatients: 14,
      avgWaitTime: 35,
      satisfaction: 4.5,
      staff: { doctors: 4, nurses: 6, support: 8 },
      revenue: 67200,
      capacity: 20,
      currentOccupancy: 16,
      criticalCases: 0
    }
  ],

  // 5. PATIENT RECORDS
  patients: [
    {
      id: 'P001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      fullName: 'Sarah Johnson',
      age: 34,
      gender: 'Female',
      dateOfBirth: '1989-08-15',
      phone: '(555) 123-4567',
      email: 'sarah.johnson@email.com',
      address: '123 Main St, City, State 12345',
      insurance: 'Private Insurance',
      emergencyContact: 'John Johnson - (555) 123-4568',
      department: 'Cardiology',
      doctor: 'Dr. Michael Chen',
      admissionDate: '2024-06-10',
      status: 'In Treatment',
      severity: 'Medium',
      room: 'C-204',
      diagnosis: 'Hypertension monitoring',
      lastVisit: '2024-06-08',
      nextAppointment: '2024-06-15',
      vitals: {
        bloodPressure: '140/90',
        heartRate: 78,
        temperature: 98.6,
        oxygenSaturation: 98,
        weight: 145,
        height: 165
      },
      medications: ['Lisinopril 10mg', 'Aspirin 81mg'],
      allergies: ['Penicillin'],
      notes: 'Patient responding well to treatment'
    },
    {
      id: 'P002',
      firstName: 'Michael',
      lastName: 'Brown',
      fullName: 'Michael Brown',
      age: 45,
      gender: 'Male',
      dateOfBirth: '1978-12-03',
      phone: '(555) 234-5678',
      email: 'michael.brown@email.com',
      address: '456 Oak Ave, City, State 12345',
      insurance: 'Medicare',
      emergencyContact: 'Lisa Brown - (555) 234-5679',
      department: 'Orthopedics',
      doctor: 'Dr. Amanda Wilson',
      admissionDate: '2024-06-11',
      status: 'Scheduled',
      severity: 'Low',
      room: 'O-112',
      diagnosis: 'Knee replacement follow-up',
      lastVisit: '2024-05-28',
      nextAppointment: '2024-06-14',
      vitals: {
        bloodPressure: '125/80',
        heartRate: 72,
        temperature: 98.4,
        oxygenSaturation: 99,
        weight: 180,
        height: 175
      },
      medications: ['Ibuprofen 400mg', 'Physical therapy'],
      allergies: ['None known'],
      notes: 'Recovery progressing well'
    },
    {
      id: 'P003',
      firstName: 'Emma',
      lastName: 'Davis',
      fullName: 'Emma Davis',
      age: 28,
      gender: 'Female',
      dateOfBirth: '1995-04-22',
      phone: '(555) 345-6789',
      email: 'emma.davis@email.com',
      address: '789 Pine St, City, State 12345',
      insurance: 'Private Insurance',
      emergencyContact: 'Robert Davis - (555) 345-6790',
      department: 'Emergency Department',
      doctor: 'Dr. James Rodriguez',
      admissionDate: '2024-06-12',
      status: 'Critical',
      severity: 'High',
      room: 'ER-3',
      diagnosis: 'Severe allergic reaction',
      lastVisit: '2024-06-12',
      nextAppointment: 'TBD',
      vitals: {
        bloodPressure: '110/70',
        heartRate: 95,
        temperature: 99.2,
        oxygenSaturation: 96,
        weight: 135,
        height: 160
      },
      medications: ['Epinephrine', 'Prednisone 20mg'],
      allergies: ['Shellfish', 'Nuts'],
      notes: 'Stable condition, monitoring closely'
    },
    {
      id: 'P004',
      firstName: 'David',
      lastName: 'Wilson',
      fullName: 'David Wilson',
      age: 62,
      gender: 'Male',
      dateOfBirth: '1961-09-18',
      phone: '(555) 456-7890',
      email: 'david.wilson@email.com',
      address: '321 Elm Dr, City, State 12345',
      insurance: 'Medicare',
      emergencyContact: 'Mary Wilson - (555) 456-7891',
      department: 'Internal Medicine',
      doctor: 'Dr. Sarah Martinez',
      admissionDate: '2024-06-09',
      status: 'Discharged',
      severity: 'Low',
      room: 'IM-205',
      diagnosis: 'Annual physical examination',
      lastVisit: '2024-06-09',
      nextAppointment: '2025-06-09',
      vitals: {
        bloodPressure: '130/85',
        heartRate: 68,
        temperature: 98.5,
        oxygenSaturation: 98,
        weight: 190,
        height: 178
      },
      medications: ['Metformin 500mg', 'Vitamin D'],
      allergies: ['Sulfa drugs'],
      notes: 'Routine check-up completed successfully'
    },
    {
      id: 'P005',
      firstName: 'Lisa',
      lastName: 'Anderson',
      fullName: 'Lisa Anderson',
      age: 39,
      gender: 'Female',
      dateOfBirth: '1984-11-07',
      phone: '(555) 567-8901',
      email: 'lisa.anderson@email.com',
      address: '654 Maple Ln, City, State 12345',
      insurance: 'Medicaid',
      emergencyContact: 'Tom Anderson - (555) 567-8902',
      department: 'Pediatrics',
      doctor: 'Dr. Jennifer Lee',
      admissionDate: '2024-06-11',
      status: 'In Treatment',
      severity: 'Medium',
      room: 'P-108',
      diagnosis: 'Child wellness visit',
      lastVisit: '2024-06-11',
      nextAppointment: '2024-09-11',
      vitals: {
        bloodPressure: '118/75',
        heartRate: 74,
        temperature: 98.7,
        oxygenSaturation: 99,
        weight: 142,
        height: 162
      },
      medications: ['Prenatal vitamins'],
      allergies: ['Latex'],
      notes: 'Accompanying child for routine check-up'
    }
  ],

  // 6. MEDICAL STAFF
  staff: [
    {
      id: 'S001',
      firstName: 'Dr. Michael',
      lastName: 'Chen',
      fullName: 'Dr. Michael Chen',
      role: 'Cardiologist',
      department: 'Cardiology',
      status: 'On Duty',
      shift: 'Day Shift (7 AM - 7 PM)',
      experience: 12,
      patients: 8,
      phone: '(555) 111-2222',
      email: 'mchen@hospital.com',
      specialty: 'Interventional Cardiology',
      rating: 4.9
    },
    {
      id: 'S002',
      firstName: 'Dr. Amanda',
      lastName: 'Wilson',
      fullName: 'Dr. Amanda Wilson',
      role: 'Orthopedic Surgeon',
      department: 'Orthopedics',
      status: 'On Duty',
      shift: 'Day Shift (7 AM - 7 PM)',
      experience: 8,
      patients: 6,
      phone: '(555) 222-3333',
      email: 'awilson@hospital.com',
      specialty: 'Joint Replacement',
      rating: 4.7
    },
    {
      id: 'S003',
      firstName: 'Dr. James',
      lastName: 'Rodriguez',
      fullName: 'Dr. James Rodriguez',
      role: 'Emergency Medicine',
      department: 'Emergency Department',
      status: 'On Call',
      shift: 'Night Shift (7 PM - 7 AM)',
      experience: 15,
      patients: 12,
      phone: '(555) 333-4444',
      email: 'jrodriguez@hospital.com',
      specialty: 'Trauma Medicine',
      rating: 4.8
    },
    {
      id: 'S004',
      firstName: 'Nurse Sarah',
      lastName: 'Thompson',
      fullName: 'Nurse Sarah Thompson',
      role: 'Registered Nurse',
      department: 'Internal Medicine',
      status: 'On Duty',
      shift: 'Day Shift (7 AM - 7 PM)',
      experience: 6,
      patients: 15,
      phone: '(555) 444-5555',
      email: 'sthompson@hospital.com',
      specialty: 'Critical Care',
      rating: 4.6
    }
  ],

  // 7. PATIENT VITALS
  patientVitals: {
    'P001': [
      {
        date: '2024-05-20',
        heartRate: 76,
        bloodPressure: '122/80',
        temperature: 98.6,
        oxygenSaturation: 97
      },
      {
        date: '2024-05-25',
        heartRate: 82,
        bloodPressure: '140/88',
        temperature: 99.2,
        oxygenSaturation: 95
      },
      {
        date: '2024-06-01',
        heartRate: 80,
        bloodPressure: '138/86',
        temperature: 99.0,
        oxygenSaturation: 94
      },
      {
        date: '2024-06-07',
        heartRate: 78,
        bloodPressure: '136/84',
        temperature: 98.8,
        oxygenSaturation: 95
      },
      {
        date: '2024-06-14',
        heartRate: 75,
        bloodPressure: '130/82',
        temperature: 98.7,
        oxygenSaturation: 96
      },
      {
        date: '2024-06-21',
        heartRate: 72,
        bloodPressure: '125/80',
        temperature: 98.4,
        oxygenSaturation: 98
      }
    ],
    'P002': [
      {
        date: '2024-05-15',
        heartRate: 88,
        bloodPressure: '145/90',
        temperature: 99.1,
        oxygenSaturation: 93
      },
      {
        date: '2024-05-22',
        heartRate: 90,
        bloodPressure: '150/92',
        temperature: 99.4,
        oxygenSaturation: 92
      },
      {
        date: '2024-05-29',
        heartRate: 86,
        bloodPressure: '142/88',
        temperature: 99.0,
        oxygenSaturation: 94
      },
      {
        date: '2024-06-05',
        heartRate: 82,
        bloodPressure: '138/86',
        temperature: 98.8,
        oxygenSaturation: 95
      },
      {
        date: '2024-06-12',
        heartRate: 78,
        bloodPressure: '130/84',
        temperature: 98.6,
        oxygenSaturation: 96
      },
      {
        date: '2024-06-19',
        heartRate: 75,
        bloodPressure: '128/82',
        temperature: 98.4,
        oxygenSaturation: 97
      }
    ],
    'P003': [
      {
        date: '2024-05-18',
        heartRate: 62,
        bloodPressure: '115/75',
        temperature: 97.8,
        oxygenSaturation: 98
      },
      {
        date: '2024-05-25',
        heartRate: 60,
        bloodPressure: '110/70',
        temperature: 97.6,
        oxygenSaturation: 99
      },
      {
        date: '2024-06-01',
        heartRate: 64,
        bloodPressure: '118/76',
        temperature: 98.0,
        oxygenSaturation: 98
      },
      {
        date: '2024-06-08',
        heartRate: 66,
        bloodPressure: '120/78',
        temperature: 98.2,
        oxygenSaturation: 97
      },
      {
        date: '2024-06-15',
        heartRate: 65,
        bloodPressure: '118/76',
        temperature: 98.0,
        oxygenSaturation: 99
      },
      {
        date: '2024-06-22',
        heartRate: 64,
        bloodPressure: '116/74',
        temperature: 97.9,
        oxygenSaturation: 99
      }
    ],
    'P004': [
      {
        date: '2024-05-16',
        heartRate: 102,
        bloodPressure: '130/85',
        temperature: 100.2,
        oxygenSaturation: 92
      },
      {
        date: '2024-05-18',
        heartRate: 98,
        bloodPressure: '128/82',
        temperature: 99.6,
        oxygenSaturation: 93
      },
      {
        date: '2024-05-20',
        heartRate: 94,
        bloodPressure: '125/80',
        temperature: 99.2,
        oxygenSaturation: 94
      },
      {
        date: '2024-05-23',
        heartRate: 90,
        bloodPressure: '122/78',
        temperature: 98.8,
        oxygenSaturation: 95
      },
      {
        date: '2024-05-26',
        heartRate: 86,
        bloodPressure: '120/76',
        temperature: 98.6,
        oxygenSaturation: 96
      },
      {
        date: '2024-05-29',
        heartRate: 82,
        bloodPressure: '118/74',
        temperature: 98.4,
        oxygenSaturation: 97
      }
    ],
    'P005': [
      {
        date: '2024-06-01',
        heartRate: 72,
        bloodPressure: '118/78',
        temperature: 98.6,
        oxygenSaturation: 99
      },
      {
        date: '2024-06-08',
        heartRate: 74,
        bloodPressure: '120/80',
        temperature: 98.7,
        oxygenSaturation: 98
      },
      {
        date: '2024-06-15',
        heartRate: 70,
        bloodPressure: '118/76',
        temperature: 98.5,
        oxygenSaturation: 99
      },
      {
        date: '2024-06-22',
        heartRate: 72,
        bloodPressure: '122/78',
        temperature: 98.8,
        oxygenSaturation: 98
      },
      {
        date: '2024-06-29',
        heartRate: 75,
        bloodPressure: '125/80',
        temperature: 99.0,
        oxygenSaturation: 97
      },
      {
        date: '2024-07-06',
        heartRate: 73,
        bloodPressure: '120/78',
        temperature: 98.7,
        oxygenSaturation: 98
      }
    ]
  },

  // 8. FINANCIAL DATA
  financial: {
    monthly: [
      { month: 'Jan', revenue: 1245000, expenses: 987000, profit: 258000, patients: 2340 },
      { month: 'Feb', revenue: 1187000, expenses: 945000, profit: 242000, patients: 2234 },
      { month: 'Mar', revenue: 1298000, expenses: 1034000, profit: 264000, patients: 2456 },
      { month: 'Apr', revenue: 1356000, expenses: 1078000, profit: 278000, patients: 2567 },
      { month: 'May', revenue: 1423000, expenses: 1134000, profit: 289000, patients: 2689 },
      { month: 'Jun', revenue: 1389000, expenses: 1105000, profit: 284000, patients: 2613 }
    ],
    
    byDepartment: [
      { department: 'Surgery', revenue: 245600, percentage: 35.2 },
      { department: 'Emergency Department', revenue: 198400, percentage: 28.4 },
      { department: 'Cardiology', revenue: 124500, percentage: 17.8 },
      { department: 'Internal Medicine', revenue: 89300, percentage: 12.8 },
      { department: 'Orthopedics', revenue: 67200, percentage: 9.6 },
      { department: 'Pediatrics', revenue: 45800, percentage: 6.6 },
      { department: 'Radiology', revenue: 32100, percentage: 4.6 }
    ],
    
    paymentMethods: [
      { method: 'Insurance', amount: 487600, percentage: 70.8 },
      { method: 'Credit Card', amount: 134500, percentage: 19.5 },
      { method: 'Cash', amount: 45300, percentage: 6.6 },
      { method: 'Check', amount: 21400, percentage: 3.1 }
    ]
  },
  
  vitalSigns: {
  // Empty object for backward compatibility
  patientP001: [],
  alerts: []
  },

  // 9. QUALITY METRICS
  quality: {
    patientSatisfaction: {
      overall: 4.6,
      byDepartment: [
        { department: 'Pediatrics', score: 4.9, responses: 234 },
        { department: 'Cardiology', score: 4.8, responses: 187 },
        { department: 'Surgery', score: 4.8, responses: 98 },
        { department: 'Internal Medicine', score: 4.7, responses: 345 },
        { department: 'Orthopedics', score: 4.6, responses: 156 },
        { department: 'Radiology', score: 4.5, responses: 167 },
        { department: 'Emergency Department', score: 4.2, responses: 298 }
      ]
    },
    
    waitTimes: {
      average: 23,
      byDepartment: [
        { department: 'Surgery', avgWait: 15, target: 20 },
        { department: 'Pediatrics', avgWait: 22, target: 25 },
        { department: 'Internal Medicine', avgWait: 26, target: 30 },
        { department: 'Cardiology', avgWait: 28, target: 30 },
        { department: 'Orthopedics', avgWait: 32, target: 35 },
        { department: 'Radiology', avgWait: 35, target: 40 },
        { department: 'Emergency Department', avgWait: 45, target: 60 }
      ]
    },
    
    readmissionRates: {
      overall: 8.2,
      byDepartment: [
        { department: 'Surgery', rate: 12.5, target: 10.0 },
        { department: 'Cardiology', rate: 9.8, target: 8.0 },
        { department: 'Internal Medicine', rate: 8.9, target: 7.0 },
        { department: 'Emergency Department', rate: 7.6, target: 12.0 },
        { department: 'Orthopedics', rate: 6.4, target: 5.0 },
        { department: 'Pediatrics', rate: 4.2, target: 3.0 },
        { department: 'Radiology', rate: 2.1, target: 2.0 }
      ]
    }
  },

  // 10. INVENTORY & RESOURCES
  inventory: {
    medical_supplies: [
      { item: 'Surgical Masks', current: 2340, minimum: 1000, status: 'Good', cost: 0.25 },
      { item: 'Gloves (Box)', current: 567, minimum: 200, status: 'Good', cost: 12.50 },
      { item: 'Syringes', current: 1890, minimum: 500, status: 'Good', cost: 0.15 },
      { item: 'Bandages', current: 78, minimum: 100, status: 'Low', cost: 2.30 },
      { item: 'IV Bags', current: 234, minimum: 150, status: 'Good', cost: 8.75 },
      { item: 'Oxygen Tanks', current: 45, minimum: 20, status: 'Good', cost: 125.00 }
    ],
    
    equipment: [
      { equipment: 'MRI Machine', status: 'Operational', lastMaintenance: '2024-05-15', nextMaintenance: '2024-08-15' },
      { equipment: 'CT Scanner', status: 'Operational', lastMaintenance: '2024-04-20', nextMaintenance: '2024-07-20' },
      { equipment: 'X-Ray Machine #1', status: 'Maintenance', lastMaintenance: '2024-06-01', nextMaintenance: '2024-06-15' },
      { equipment: 'X-Ray Machine #2', status: 'Operational', lastMaintenance: '2024-05-10', nextMaintenance: '2024-08-10' },
      { equipment: 'Ultrasound #1', status: 'Operational', lastMaintenance: '2024-03-25', nextMaintenance: '2024-06-25' },
      { equipment: 'Ultrasound #2', status: 'Operational', lastMaintenance: '2024-04-15', nextMaintenance: '2024-07-15' }
    ]
  },

  // 11. RECENT ACTIVITIES/ALERTS
  recentActivities: [
    { id: 1, type: 'Patient Admission', message: 'Emma Davis admitted to Emergency Department', timestamp: '2024-06-12 14:30', priority: 'High' },
    { id: 2, type: 'Equipment Alert', message: 'X-Ray Machine #1 scheduled for maintenance', timestamp: '2024-06-12 14:15', priority: 'Medium' },
    { id: 3, type: 'Staff Update', message: 'Dr. James Rodriguez is now on call', timestamp: '2024-06-12 14:00', priority: 'Low' },
    { id: 4, type: 'Vital Alert', message: 'Patient P001 - High blood pressure reading', timestamp: '2024-06-12 13:45', priority: 'Medium' },
    { id: 5, type: 'Appointment', message: 'Michael Brown scheduled for follow-up', timestamp: '2024-06-12 13:30', priority: 'Low' }
  ],

  // 12. VITAL SIGNS ALERTS
  vitalSignsAlerts: [
    {
      id: 'ALT001',
      patientId: 'P001',
      type: 'Blood Pressure',
      message: 'Elevated blood pressure reading (140/88) requires monitoring',
      severity: 'Medium',
      date: '2024-05-25',
      resolved: true
    },
    {
      id: 'ALT002',
      patientId: 'P002',
      type: 'Blood Pressure',
      message: 'Hypertension alert: 150/92 exceeds threshold',
      severity: 'High',
      date: '2024-05-22',
      resolved: false
    },
    {
      id: 'ALT003',
      patientId: 'P002',
      type: 'Oxygen Saturation',
      message: 'Oxygen level below 94% - monitor respiratory function',
      severity: 'Medium',
      date: '2024-05-15',
      resolved: true
    },
    {
      id: 'ALT004',
      patientId: 'P003',
      type: 'Heart Rate',
      message: 'Heart rate below normal range (60 BPM)',
      severity: 'Low',
      date: '2024-05-25',
      resolved: true
    },
    {
      id: 'ALT005',
      patientId: 'P004',
      type: 'Temperature',
      message: 'Fever alert: 100.2°F',
      severity: 'Medium',
      date: '2024-05-16',
      resolved: true
    },
    {
      id: 'ALT006',
      patientId: 'P004',
      type: 'Heart Rate',
      message: 'Tachycardia: Heart rate elevated at 102 BPM',
      severity: 'High',
      date: '2024-05-16',
      resolved: true
    },
    {
      id: 'ALT007',
      patientId: 'P004',
      type: 'Oxygen Saturation',
      message: 'Oxygen saturation at 92% - below normal',
      severity: 'High',
      date: '2024-05-16',
      resolved: false
    },
    {
      id: 'ALT008',
      patientId: 'P005',
      type: 'Temperature',
      message: 'Slight temperature elevation (99.0°F)',
      severity: 'Low',
      date: '2024-06-29',
      resolved: true
    }
  ],

  // 13. PATIENT TIMELINES
  patientTimelines: {
    'P001': [
      {
        id: 'TL001-P001',
        date: '2024-05-15',
        title: 'Initial Consultation',
        description: 'Initial evaluation for cardiac symptoms',
        type: 'visit'
      },
      {
        id: 'TL002-P001',
        date: '2024-05-20',
        title: 'Hospital Admission',
        description: 'Admitted to Cardiology department under Dr. Sarah Johnson',
        type: 'admission'
      },
      {
        id: 'TL003-P001',
        date: '2024-05-21',
        title: 'Diagnostic Testing',
        description: 'ECG and blood work completed',
        type: 'test'
      },
      {
        id: 'TL004-P001',
        date: '2024-05-22',
        title: 'Medication Prescribed',
        description: 'Started on Lisinopril and Aspirin',
        type: 'medication'
      },
      {
        id: 'TL005-P001',
        date: '2024-06-21',
        title: 'Follow-up Appointment',
        description: 'Follow-up with Dr. Sarah Johnson - condition improving',
        type: 'visit'
      },
      {
        id: 'TL006-P001',
        date: '2024-07-20',
        title: 'Scheduled Follow-up',
        description: 'Next follow-up appointment with Dr. Sarah Johnson',
        type: 'visit'
      }
    ],
    'P002': [
      {
        id: 'TL001-P002',
        date: '2024-05-10',
        title: 'Emergency Room Visit',
        description: 'Presented with severe chest pain and shortness of breath',
        type: 'visit'
      },
      {
        id: 'TL002-P002',
        date: '2024-05-10',
        title: 'Hospital Admission',
        description: 'Admitted to Critical Care Unit',
        type: 'admission'
      },
      {
        id: 'TL003-P002',
        date: '2024-05-11',
        title: 'Diagnostic Testing',
        description: 'Coronary angiography performed',
        type: 'test'
      },
      {
        id: 'TL004-P002',
        date: '2024-05-12',
        title: 'Surgical Procedure',
        description: 'Coronary artery bypass graft surgery',
        type: 'surgery'
      },
      {
        id: 'TL005-P002',
        date: '2024-05-15',
        title: 'Transfer to Standard Care',
        description: 'Transferred from ICU to regular cardiac care unit',
        type: 'other'
      },
      {
        id: 'TL006-P002',
        date: '2024-05-22',
        title: 'Medication Adjustment',
        description: 'Blood pressure medication dosage increased',
        type: 'medication'
      },
      {
        id: 'TL007-P002',
        date: '2024-06-05',
        title: 'Physical Therapy',
        description: 'Started cardiac rehabilitation program',
        type: 'other'
      },
      {
        id: 'TL008-P002',
        date: '2024-06-19',
        title: 'Follow-up Appointment',
        description: 'Post-surgical follow-up with Dr. Michael Chen',
        type: 'visit'
      },
      {
        id: 'TL009-P002',
        date: '2024-07-17',
        title: 'Scheduled Follow-up',
        description: 'Next scheduled appointment with Dr. Michael Chen',
        type: 'visit'
      }
    ],
    'P003': [
      {
        id: 'TL001-P003',
        date: '2024-05-18',
        title: 'Specialist Consultation',
        description: 'Initial consultation with Dr. David Wilson for pregnancy',
        type: 'visit'
      },
      {
        id: 'TL002-P003',
        date: '2024-05-18',
        title: 'Ultrasound',
        description: 'First trimester ultrasound performed',
        type: 'test'
      },
      {
        id: 'TL003-P003',
        date: '2024-05-25',
        title: 'Follow-up Appointment',
        description: 'Follow-up with Dr. David Wilson - prenatal care',
        type: 'visit'
      },
      {
        id: 'TL004-P003',
        date: '2024-06-01',
        title: 'Blood Work',
        description: 'Routine prenatal blood tests',
        type: 'test'
      },
      {
        id: 'TL005-P003',
        date: '2024-06-15',
        title: 'Anatomy Scan',
        description: 'Second trimester detailed ultrasound',
        type: 'test'
      },
      {
        id: 'TL006-P003',
        date: '2024-06-22',
        title: 'Prenatal Check-up',
        description: 'Regular check-up with Dr. David Wilson',
        type: 'visit'
      },
      {
        id: 'TL007-P003',
        date: '2024-07-06',
        title: 'Scheduled Appointment',
        description: 'Next prenatal check-up',
        type: 'visit'
      }
    ],
    'P004': [
      {
        id: 'TL001-P004',
        date: '2024-05-16',
        title: 'Emergency Room Visit',
        description: 'Admitted with high fever, cough, and difficulty breathing',
        type: 'admission'
      },
      {
        id: 'TL002-P004',
        date: '2024-05-16',
        title: 'Diagnostic Testing',
        description: 'Chest X-ray and COVID-19 test performed',
        type: 'test'
      },
      {
        id: 'TL003-P004',
        date: '2024-05-17',
        title: 'Medication Started',
        description: 'Started on antibiotics and supportive care',
        type: 'medication'
      },
      {
        id: 'TL004-P004',
        date: '2024-05-20',
        title: 'Condition Improvement',
        description: 'Fever reduced, breathing improved',
        type: 'other'
      },
      {
        id: 'TL005-P004',
        date: '2024-05-26',
        title: 'Discharge',
        description: 'Discharged with home care instructions',
        type: 'discharge'
      },
      {
        id: 'TL006-P004',
        date: '2024-05-29',
        title: 'Follow-up Appointment',
        description: 'Post-discharge follow-up with Dr. Emily Rodriguez',
        type: 'visit'
      }
    ],
    'P005': [
      {
        id: 'TL001-P005',
        date: '2024-06-01',
        title: 'Annual Physical',
        description: 'Routine annual check-up',
        type: 'visit'
      },
      {
        id: 'TL002-P005',
        date: '2024-06-01',
        title: 'Blood Work',
        description: 'Standard blood panel for annual physical',
        type: 'test'
      },
      {
        id: 'TL003-P005',
        date: '2024-06-08',
        title: 'Test Results Review',
        description: 'Review of physical examination results with Dr. James Taylor',
        type: 'visit'
      },
      {
        id: 'TL004-P005',
        date: '2024-06-15',
        title: 'Nutrition Consultation',
        description: 'Meeting with nutritionist for diet optimization',
        type: 'other'
      },
      {
        id: 'TL005-P005',
        date: '2024-06-29',
        title: 'Follow-up Appointment',
        description: 'Follow-up with Dr. James Taylor',
        type: 'visit'
      },
      {
        id: 'TL006-P005',
        date: '2024-07-13',
        title: 'Scheduled Check-up',
        description: 'Next scheduled wellness check',
        type: 'visit'
      }
    ]
  }
};

export default healthcareData;