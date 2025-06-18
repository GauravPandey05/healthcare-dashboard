// src/backend/app.ts
import express, { Express } from 'express';
import cors from 'cors';
import { env } from './config/env';

// Import routes
import patientRoutes from './routes/patient.routes';
import appointmentRoutes from './routes/appointment.routes';
// Import other routes as needed

const app: Express = express();

// Middleware
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
// Use other routes as needed

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Healthcare API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message,
    stack: env.NODE_ENV === 'production' ? '📚' : err.stack,
  });
});

export default app;