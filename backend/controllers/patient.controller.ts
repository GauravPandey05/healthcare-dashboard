// src/backend/controllers/patient.controller.ts
import { Request, Response } from 'express';
import Patient from '../models/patient.model';

// Get all patients
export const getPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const patients = await Patient.find({});
    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get secure patients (PII protected)
export const getSecurePatients = async (req: Request, res: Response): Promise<void> => {
  try {
    // Project only the fields needed for secure patient view
    const securePatients = await Patient.find({}, {
      id: 1,
      fullName: 1,
      age: 1,
      gender: 1,
      department: 1,
      doctor: 1,
      status: 1,
      severity: 1,
      admissionDate: 1,
      lastVisit: 1,
      nextAppointment: 1,
      room: 1,
      diagnosis: 1,
      vitals: 1,
      allergies: 1,
      medications: 1,
      _id: 0
    });
    res.json(securePatients);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get patient by ID
export const getPatientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new patient
export const createPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    // Generate unique ID if not provided
    if (!req.body.id) {
      const lastPatient = await Patient.findOne().sort({ id: -1 });
      const lastId = lastPatient ? lastPatient.id : 'P000';
      const numericPart = parseInt(lastId.substring(1)) + 1;
      req.body.id = `P${String(numericPart).padStart(3, '0')}`;
    }

    // Set fullName if not provided
    if (!req.body.fullName && req.body.firstName && req.body.lastName) {
      req.body.fullName = `${req.body.firstName} ${req.body.lastName}`;
    }

    const patient = new Patient(req.body);
    const createdPatient = await patient.save();
    res.status(201).json(createdPatient);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Update patient
export const updatePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    
    if (patient) {
      // Update fullName if firstName or lastName is changing
      if ((req.body.firstName || req.body.lastName) && !req.body.fullName) {
        const firstName = req.body.firstName || patient.firstName;
        const lastName = req.body.lastName || patient.lastName;
        req.body.fullName = `${firstName} ${lastName}`;
      }
      
      Object.assign(patient, req.body);
      const updatedPatient = await patient.save();
      res.json(updatedPatient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Delete patient
export const deletePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    
    if (patient) {
      await Patient.deleteOne({ id: req.params.id });
      res.json({ message: 'Patient removed' });
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};