import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import Patient from '../models/patient.model';
import Staff from '../models/staff.model';
import Department from '../models/department.model';
import Appointment from '../models/appointment.model';
import Overview from '../models/overview.model';
import AppointmentTrend from '../models/appointment-trend.model';

// Import the data from healthcareData.js
import healthcareData from '../../src/data/healthcareData';

const seedDatabase = async () => {
  console.log('Seeding database...');
  
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await Patient.deleteMany({});
    await Staff.deleteMany({});
    await Department.deleteMany({});
    await Appointment.deleteMany({});
    await Overview.deleteMany({});
    await AppointmentTrend.deleteMany({});
    
    console.log('Existing data cleared');
    
    // Seed overview statistics
    await Overview.create(healthcareData.overview);
    console.log('Overview statistics seeded');
    
    // Seed departments
    await Department.insertMany(healthcareData.departments);
    console.log('Department data seeded');
    
    // Seed patients
    await Patient.insertMany(healthcareData.patients);
    console.log('Patient data seeded');
    
    // Seed staff
    await Staff.insertMany(healthcareData.staff);
    console.log('Staff data seeded');
    
    // Seed monthly appointment trends
    await AppointmentTrend.insertMany(healthcareData.appointments.monthlyTrends);
    console.log('Monthly appointment trends seeded');
    
    // Generate and seed sample appointments based on appointment types and trends
    const sampleAppointments = generateSampleAppointments();
    await Appointment.insertMany(sampleAppointments);
    console.log('Sample appointments seeded');
    
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Helper function to generate sample appointments
const generateSampleAppointments = () => {
  const appointments = [];
  const patients = healthcareData.patients;
  const staff = healthcareData.staff;
  const types = healthcareData.appointments.byType;
  
  // Generate 50 sample appointments
  for (let i = 1; i <= 50; i++) {
    const patientIndex = Math.floor(Math.random() * patients.length);
    const patient = patients[patientIndex];
    
    const staffIndex = Math.floor(Math.random() * staff.length);
    const doctor = staff[staffIndex];
    
    const typeIndex = Math.floor(Math.random() * types.length);
    const appointmentType = types[typeIndex];
    
    const statusTypes = ['Scheduled', 'Completed', 'Cancelled', 'No-show', 'In Progress'];
    const statusIndex = Math.floor(Math.random() * statusTypes.length);
    const status = statusTypes[statusIndex];
    
    // Generate random date in the next 30 days
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
    const date = futureDate.toISOString().split('T')[0];
    
    // Generate random time
    const hours = Math.floor(Math.random() * 9) + 8; // 8 AM to 5 PM
    const minutes = Math.random() < 0.5 ? '00' : '30'; // 30-minute intervals
    const time = `${hours}:${minutes}`;
    
    appointments.push({
      id: `APT${String(i).padStart(3, '0')}`,
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doctor.id,
      doctor: doctor.fullName,
      department: doctor.department,
      date: date,
      time: time,
      type: appointmentType.type,
      status: status,
      duration: appointmentType.avgDuration,
      notes: `Auto-generated appointment for ${patient.fullName}`,
      waitTime: status === 'Completed' ? Math.floor(Math.random() * 45) + 5 : undefined
    });
  }
  
  return appointments;
};

// Execute seed function
seedDatabase();