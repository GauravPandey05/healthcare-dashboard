import express from 'express';
import * as appointmentController from '../controllers/appointment.controller';

const router = express.Router();

// Get appointment statistics
router.get('/stats', appointmentController.getAppointmentStats);

// Regular CRUD routes
router.route('/')
  .get(appointmentController.getAppointments)
  .post(appointmentController.createAppointment);

router.route('/:id')
  .get(appointmentController.getAppointmentById)
  .put(appointmentController.updateAppointment)
  .delete(appointmentController.deleteAppointment);

export default router;