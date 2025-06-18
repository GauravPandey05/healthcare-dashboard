
import express from 'express';
import * as patientController from '../controllers/patient.controller';

const router = express.Router();

// Get secure patient list (PII protected)
router.get('/secure', patientController.getSecurePatients);

// Regular CRUD routes
router.route('/')
  .get(patientController.getPatients)
  .post(patientController.createPatient);

router.route('/:id')
  .get(patientController.getPatientById)
  .put(patientController.updatePatient)
  .delete(patientController.deletePatient);

export default router;