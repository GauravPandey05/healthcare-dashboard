import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import { dataService } from './services/dataService';


// Import placeholder pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p>This page is under development</p>
  </div>
);

function App() {
  const [apiStatus, setApiStatus] = useState({
    checked: false,
    connected: false
  });
  
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        // First attempt to get departments
        const departments = await dataService.getDepartments();
        
        // If we got departments successfully, API is connected
        if (departments && Array.isArray(departments) && departments.length > 0) {
          setApiStatus({ checked: true, connected: true });
          console.log('API connected successfully - found departments');
        } else {
          // Fall back to checking another endpoint
          try {
            const patients = await dataService.getSecurePatients();
            if (patients && Array.isArray(patients) && patients.length > 0) {
              setApiStatus({ checked: true, connected: true });
              console.log('API connected successfully - found patients');
            } else {
              throw new Error('No data returned');
            }
          } catch (innerError) {
            console.warn('API connection check failed on second attempt:', innerError);
            setApiStatus({ checked: true, connected: false });
          }
        }
      } catch (error) {
        console.warn('API connection check failed on first attempt:', error);
        
        // Try one more endpoint
        try {
          const staff = await dataService.getSecureStaff();
          if (staff && Array.isArray(staff) && staff.length > 0) {
            setApiStatus({ checked: true, connected: true });
            console.log('API connected successfully - found staff');
          } else {
            throw new Error('No data returned');
          }
        } catch (innerError) {
          console.warn('API connection check failed completely:', innerError);
          setApiStatus({ checked: true, connected: false });
        }
      }
    };
    
    checkApiConnection();
  }, []);

  return (
    <Router>
      <div className="min-h-screen w-full bg-gray-50">
        {apiStatus.checked && !apiStatus.connected && (
          <div className="api-warning-banner">
            Backend API not connected - Running in offline mode with demo data
          </div>
        )}
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
