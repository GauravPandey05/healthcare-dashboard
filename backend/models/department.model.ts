
import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
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

const DepartmentSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  totalPatients: { type: Number, default: 0 },
  todayPatients: { type: Number, default: 0 },
  avgWaitTime: { type: Number, default: 0 },
  satisfaction: { type: Number, min: 0, max: 5, default: 0 },
  staff: {
    doctors: { type: Number, default: 0 },
    nurses: { type: Number, default: 0 },
    support: { type: Number, default: 0 }
  },
  revenue: { type: Number, default: 0 },
  capacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },
  criticalCases: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<IDepartment>('Department', DepartmentSchema);