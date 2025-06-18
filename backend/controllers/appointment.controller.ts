// src/backend/controllers/appointment.controller.ts
import { Request, Response } from 'express';
import Appointment from '../models/appointment.model';
import AppointmentTrend from '../models/appointment-trend.model';
import Overview from '../models/overview.model';
import mongoose from 'mongoose';

// Get all appointments
export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointments = await Appointment.find({});
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get appointment statistics
export const getAppointmentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get monthly trends
    const monthlyTrends = await AppointmentTrend.find({}).sort({ month: 1 });
    
    // Get appointment types with counts
    const appointmentTypes = await Appointment.aggregate([
      { $group: {
          _id: "$type",
          count: { $sum: 1 },
          avgDuration: { $avg: "$duration" }
        }
      },
      { $project: {
          _id: 0,
          type: "$_id",
          count: 1,
          percentage: { $multiply: [{ $divide: ["$count", { $literal: 100 }] }, 100] },
          avgDuration: { $round: ["$avgDuration", 0] },
          color: { $literal: "#3b82f6" } // Default color
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get weekly schedule data
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Create placeholder for weekly schedule
    const weeklySchedule = weekDays.map(day => ({
      day,
      scheduled: 0,
      completed: 0,
      inProgress: 0,
      cancelled: 0,
      waitTime: 0
    }));
    
    // Populate with actual data (simplified - in a real app we'd query by actual dates)
    for (let i = 0; i < weeklySchedule.length; i++) {
      // Mock data based on day of week
      const multiplier = i === dayOfWeek ? 1 : 0.8 + Math.random() * 0.4;
      const scheduled = Math.floor(40 * multiplier) + 10;
      const completed = Math.floor(scheduled * 0.9);
      const inProgress = Math.floor(scheduled * 0.05);
      const cancelled = scheduled - completed - inProgress;
      
      weeklySchedule[i].scheduled = scheduled;
      weeklySchedule[i].completed = completed;
      weeklySchedule[i].inProgress = inProgress;
      weeklySchedule[i].cancelled = cancelled;
      weeklySchedule[i].waitTime = Math.floor(15 + Math.random() * 15);
    }
    
    // Compile and send response
    const appointmentData = {
      monthlyTrends,
      weeklySchedule,
      byType: appointmentTypes
    };
    
    res.json(appointmentData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findOne({ id: req.params.id });
    
    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new appointment
export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    // Generate unique ID if not provided
    if (!req.body.id) {
      const lastAppointment = await Appointment.findOne().sort({ id: -1 });
      const lastId = lastAppointment ? lastAppointment.id : 'APT000';
      const numericPart = parseInt(lastId.substring(3)) + 1;
      req.body.id = `APT${String(numericPart).padStart(3, '0')}`;
    }

    const appointment = new Appointment(req.body);
    const createdAppointment = await appointment.save();
    
    // Update overview statistics
    const overview = await Overview.findOne();
    if (overview) {
      overview.totalAppointments += 1;
      if (new Date(appointment.date).toDateString() === new Date().toDateString()) {
        overview.todayAppointments += 1;
      }
      await overview.save();
    }
    
    res.status(201).json(createdAppointment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Update appointment
export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findOne({ id: req.params.id });
    
    if (appointment) {
      const previousStatus = appointment.status;
      Object.assign(appointment, req.body);
      const updatedAppointment = await appointment.save();
      
      // Update overview statistics if status changed
      if (previousStatus !== updatedAppointment.status) {
        const overview = await Overview.findOne();
        if (overview) {
          if (updatedAppointment.status === 'Completed') {
            overview.completedAppointments += 1;
          } else if (updatedAppointment.status === 'Cancelled') {
            overview.cancelledAppointments += 1;
          }
          await overview.save();
        }
      }
      
      res.json(updatedAppointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Delete appointment
export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findOne({ id: req.params.id });
    
    if (appointment) {
      await Appointment.deleteOne({ id: req.params.id });
      res.json({ message: 'Appointment removed' });
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};