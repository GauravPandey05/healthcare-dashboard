import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './features/dashboard/Dashboard';
import DepartmentDashboard from './features/department/DepartmentDashboard';
import { PatientDashboard } from './features/patients/PatientDashboard';
import PatientsList from './features/patients/PatientsList';
import StaffList from './features/staff/StaffList';
import StaffDashboard from './features/staff/StaffDashboard';
import StaffSchedule from './features/staff/StaffSchedule';
import AppointmentsDashboard from './features/appointments/AppointmentsDashboard';
import AppointmentsList from './features/appointments/AppointmentsList';
import AppointmentSchedule from './features/appointments/AppointmentSchedule';
import AppointmentForm from './features/appointments/AppointmentForm';

// Import placeholder pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p>This page is under development</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full bg-gray-50">
        <AppShell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/departments" element={<DepartmentDashboard />} />
            <Route path="/departments/:departmentId" element={<DepartmentDashboard />} />
            <Route path="/patients" element={<PatientsList />} />
            <Route path="/patients/:patientId" element={<PatientDashboard />} />
            
            {/* Appointment routes */}
            <Route path="/appointments" element={<AppointmentsDashboard />} />
            <Route path="/appointments/list" element={<AppointmentsList />} />
            <Route path="/appointments/schedule" element={<AppointmentSchedule />} />
            <Route path="/appointments/new" element={<AppointmentForm />} />
            <Route path="/appointments/edit/:appointmentId" element={<AppointmentForm />} />
            
            <Route path="/staff" element={<StaffList />} />
            {/* Fixed route order - specific routes first */}
            <Route path="/staff/schedule" element={<StaffSchedule />} />
            <Route path="/staff/:staffId" element={<StaffDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </div>
    </Router>
  );
}

export default App;
