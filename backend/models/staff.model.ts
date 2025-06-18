
import mongoose, { Document, Schema } from 'mongoose';

export interface IStaff extends Document {
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

const StaffSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  status: { type: String, required: true },
  shift: { type: String, required: true },
  experience: { type: Number, required: true },
  patients: { type: Number, default: 0 },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  specialty: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 }
}, {
  timestamps: true
});

export default mongoose.model<IStaff>('Staff', StaffSchema);