// src/backend/models/overview.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IOverview extends Document {
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
  lastUpdated: Date;
}

const OverviewSchema: Schema = new Schema({
  totalPatients: { type: Number, default: 0 },
  activePatients: { type: Number, default: 0 },
  newPatientsToday: { type: Number, default: 0 },
  totalAppointments: { type: Number, default: 0 },
  todayAppointments: { type: Number, default: 0 },
  completedAppointments: { type: Number, default: 0 },
  cancelledAppointments: { type: Number, default: 0 },
  pendingResults: { type: Number, default: 0 },
  criticalAlerts: { type: Number, default: 0 },
  totalBeds: { type: Number, default: 0 },
  occupiedBeds: { type: Number, default: 0 },
  availableBeds: { type: Number, default: 0 },
  bedOccupancyRate: { type: Number, default: 0 },
  totalStaff: { type: Number, default: 0 },
  staffOnDuty: { type: Number, default: 0 },
  doctorsAvailable: { type: Number, default: 0 },
  nursesOnDuty: { type: Number, default: 0 },
  averageWaitTime: { type: Number, default: 0 },
  patientSatisfactionScore: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model<IOverview>('Overview', OverviewSchema);