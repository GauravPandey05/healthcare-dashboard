
import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctor: string;
  department: string;
  date: string;
  time: string;
  type: string;
  status: string;
  duration: number;
  notes: string;
  waitTime?: number;
}

const AppointmentSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctor: { type: String, required: true },
  department: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  type: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['Scheduled', 'Completed', 'Cancelled', 'No-show', 'In Progress'] 
  },
  duration: { type: Number, default: 30 },
  notes: { type: String },
  waitTime: { type: Number }
}, {
  timestamps: true
});

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);