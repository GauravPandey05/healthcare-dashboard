
import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
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
  status: string;
  severity: string;
  room: string;
  diagnosis: string;
  lastVisit: string;
  nextAppointment: string;
  vitals: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    oxygenSaturation: number;
    weight: number;
    height: number;
  };
  medications: string[];
  allergies: string[];
  notes: string;
}

const PatientSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  insurance: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  department: { type: String, required: true },
  doctor: { type: String, required: true },
  admissionDate: { type: String, required: true },
  status: { type: String, required: true, enum: ['In Treatment', 'Scheduled', 'Critical', 'Discharged'] },
  severity: { type: String, required: true, enum: ['High', 'Medium', 'Low'] },
  room: { type: String, required: true },
  diagnosis: { type: String, required: true },
  lastVisit: { type: String, required: true },
  nextAppointment: { type: String, required: true },
  vitals: {
    bloodPressure: { type: String, required: true },
    heartRate: { type: Number, required: true },
    temperature: { type: Number, required: true },
    oxygenSaturation: { type: Number, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  medications: { type: [String], default: [] },
  allergies: { type: [String], default: [] },
  notes: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IPatient>('Patient', PatientSchema);