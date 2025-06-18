import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointmentTrend extends Document {
  month: string;
  appointments: number;
  completed: number;
  cancelled: number;
  noShow: number;
  revenue: number;
}

const AppointmentTrendSchema: Schema = new Schema({
  month: { type: String, required: true, unique: true },
  appointments: { type: Number, default: 0 },
  completed: { type: Number, default: 0 },
  cancelled: { type: Number, default: 0 },
  noShow: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 }
});

export default mongoose.model<IAppointmentTrend>('AppointmentTrend', AppointmentTrendSchema);