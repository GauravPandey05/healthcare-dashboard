import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { MetricCard } from '../../components/common/MetricCard';
import { BarChart } from '../../components/charts/BarChart';
import { PieChart } from '../../components/charts/PieChart';
import { dataService } from '../../services/dataService';
import type { 
  Department, EnhancedDepartment, 
  SecurePatient, SecureStaffMember 
} from '../../types/schema';
import { MetricCardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/common/Skeleton';
import { maskPII } from '../../utils/privacyUtils';
import { ensureNumber } from '../../utils/dataUtils';

// Icons
const PatientIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const DoctorIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export const DepartmentDashboard: React.FC = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [staff, setStaff] = useState<SecureStaffMember[]>([]);
  const [patients, setPatients] = useState<SecurePatient[]>([]);
  const [enhancedDepartment, setEnhancedDepartment] = useState<EnhancedDepartment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load department data on component mount or departmentId change
  useEffect(() => {
    const fetchDepartmentData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch departments list
        const departmentsData = await dataService.getDepartments();
        setDepartments(departmentsData);

        // If departmentId is provided, load that department
        if (departmentId) {
          const deptId = parseInt(departmentId);
          await loadDepartmentData(deptId, departmentsData);
        } else if (departmentsData.length > 0) {
          // If no department is specified, load the first one
          await loadDepartmentData(departmentsData[0].id, departmentsData);
          // Update URL to reflect the selected department
          navigate(`/departments/${departmentsData[0].id}`);
        }
      } catch (err) {
        console.error('Error loading department data:', err);
        setError('Failed to load department data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentData();
  }, [departmentId, navigate]);

  // Helper function to load department data
  const loadDepartmentData = async (deptId: number, deptList: Department[]) => {
    try {
      // Find department in the list first to save an API call
      let department = deptList.find(d => d.id === deptId);
      
      // If not found in list, try to fetch it
      if (!department) {
        const fetchedDepartment = await dataService.getDepartmentById(deptId);
        if (fetchedDepartment === null) {
          throw new Error(`Department with ID ${deptId} not found.`);
        }
        department = fetchedDepartment;
      }
      
      // At this point department should never be null, but let's add a safety check
      if (!department) {
        throw new Error(`Department with ID ${deptId} not found.`);
      }
      
      setSelectedDepartment(department);
      
      // Load enhanced department data directly from API
      const enhancedDept = await dataService.getEnhancedDepartment(deptId);
      setEnhancedDepartment(enhancedDept);
      
      // Load staff and patients in parallel for better performance
      const [staffData, patientData] = await Promise.all([
        dataService.getSecureStaffByDepartment(deptId),
        dataService.getSecurePatientsByDepartment(deptId)
      ]);
      
      setStaff(staffData);
      setPatients(patientData);
    } catch (err: any) {
      console.error('Error loading department details:', err);
      setError(err.message || 'Failed to load department details. Please try again later.');
    }
  };

  // Handle department change
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptId = parseInt(e.target.value);
    navigate(`/departments/${deptId}`);
  };

  // Calculate staff distribution by role
  const getStaffByRole = () => {
    if (!staff || staff.length === 0) return [];
    
    const roles: Record<string, number> = {};
    staff.forEach(member => {
      // Extract just the primary role (e.g., "Doctor" from "Senior Doctor")
      const primaryRole = member.role.split(' ')[0];
      roles[primaryRole] = (roles[primaryRole] || 0) + 1;
    });

    return Object.entries(roles).map(([role, count]) => ({
      name: role,
      value: count,
      percentage: Math.round((count / staff.length) * 100),
      color: getRandomColor(role)
    }));
  };

  // Calculate patient status distribution
  const getPatientsByStatus = () => {
    if (!patients || patients.length === 0) return [];

    const statuses: Record<string, number> = {};
    patients.forEach(patient => {
      statuses[patient.status] = (statuses[patient.status] || 0) + 1;
    });

    return Object.entries(statuses).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: Math.round((count / patients.length) * 100),
      color: getStatusColor(status)
    }));
  };

  // Get monthly admissions data
  const getMonthlyAdmissionData = () => {
    // Generate sample data if not available from API
    if (!enhancedDepartment?.department) {
      return [
        { name: 'Jan', value: 0 },
        { name: 'Feb', value: 0 },
        { name: 'Mar', value: 0 },
      ];
    }
    
    // Each month gets a value proportional to department metrics
    const baseValue = enhancedDepartment.department.todayPatients * 20;
    const variance = baseValue * 0.4;
    
    return [
      { name: 'Jan', value: Math.round(baseValue - variance * 0.5) },
      { name: 'Feb', value: Math.round(baseValue - variance * 0.2) },
      { name: 'Mar', value: Math.round(baseValue) },
      { name: 'Apr', value: Math.round(baseValue + variance * 0.3) },
      { name: 'May', value: Math.round(baseValue + variance * 0.5) },
      { name: 'Jun', value: Math.round(baseValue + variance * 0.2) }
    ];
  };

  // Get staff performance data
  const getStaffPerformanceData = () => {
    if (!staff || staff.length === 0) return [];
    
    return staff
      .filter(s => typeof s.rating === 'number')
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map(s => {
        // Use actual staff member's first name
        const firstName = s.fullName.split(' ')[0];
        return { 
          name: firstName,
          value: s.rating
        };
      });
  };

  // Helper function for random but consistent colors
  const getRandomColor = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  // Helper function for status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical': return '#EF4444';  // red
      case 'In Treatment': return '#3B82F6';  // blue
      case 'Scheduled': return '#F59E0B';  // amber
      case 'Discharged': return '#10B981';  // green
      default: return '#6B7280';  // gray
    }
  };

  // Loading state with skeleton UI
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <div className="bg-gray-200 animate-pulse h-8 w-48 rounded mb-2"></div>
            <div className="bg-gray-200 animate-pulse h-4 w-64 rounded"></div>
          </div>
          <div className="mt-3 sm:mt-0">
            <div className="bg-gray-200 animate-pulse h-10 w-40 rounded"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array(4).fill(0).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {Array(3).fill(0).map((_, i) => (
            <ChartSkeleton key={i} height="h-48" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TableSkeleton />
          <TableSkeleton />
        </div>
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </PageContainer>
    );
  }

  if (!selectedDepartment) {
    return (
      <PageContainer>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">No department selected. Please select a department.</span>
        </div>
      </PageContainer>
    );
  }

  // Calculate occupancy rate for display
  const occupancyRate = Math.round((selectedDepartment.currentOccupancy / Math.max(1, selectedDepartment.capacity)) * 100);
  
  // Top performing staff
  const topPerformingStaff = [...staff]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <PageContainer>
      {/* Department Selection & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Department Dashboard</h1>
          <p className="text-gray-500 mt-1">View performance metrics and statistics by department</p>
        </div>
        
        <div className="mt-3 sm:mt-0">
          <select
            className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedDepartment.id}
            onChange={handleDepartmentChange}
          >
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Department Overview */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{selectedDepartment.name}</h2>
            <p className="text-gray-500">Department Code: {selectedDepartment.code}</p>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedDepartment.criticalCases > 0 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {selectedDepartment.criticalCases > 0 
                ? `${selectedDepartment.criticalCases} Critical Cases` 
                : 'No Critical Cases'}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Patients"
          value={selectedDepartment.totalPatients.toString()}
          icon={<PatientIcon />}
          trend={{
            value: selectedDepartment.todayPatients,
            isPositive: true,
            label: "today"
          }}
          color="info"
        />
        <MetricCard
          title="Staff Members"
          value={(selectedDepartment.staff.doctors + selectedDepartment.staff.nurses + selectedDepartment.staff.support).toString()}
          icon={<DoctorIcon />}
          trend={{
            value: selectedDepartment.staff.doctors,
            isPositive: true,
            label: "doctors"
          }}
          color="primary"
        />
        <MetricCard
          title="Avg. Wait Time"
          value={`${ensureNumber(enhancedDepartment?.quality.waitTime?.avgWait) || selectedDepartment.avgWaitTime} min`}
          icon={<ClockIcon />}
          trend={{
            value: enhancedDepartment?.quality.waitTime?.target 
              ? (ensureNumber(enhancedDepartment.quality.waitTime.target) - ensureNumber(enhancedDepartment.quality.waitTime.avgWait)) 
              : 0,
            isPositive: enhancedDepartment?.quality.waitTime
              ? (ensureNumber(enhancedDepartment.quality.waitTime.avgWait) <= ensureNumber(enhancedDepartment.quality.waitTime.target))
              : true,
            label: enhancedDepartment?.quality.waitTime?.target ? `vs ${ensureNumber(enhancedDepartment.quality.waitTime.target)} target` : undefined
          }}
          color={(ensureNumber(enhancedDepartment?.quality.waitTime?.avgWait) || selectedDepartment.avgWaitTime) <= 20 ? 'success' : 'warning'}
        />
        <MetricCard
          title="Patient Satisfaction"
          value={
            enhancedDepartment?.quality.satisfaction?.score !== undefined
              ? (typeof enhancedDepartment.quality.satisfaction.score === 'number' 
                 ? enhancedDepartment.quality.satisfaction.score.toFixed(1) 
                 : Number(enhancedDepartment.quality.satisfaction.score).toFixed(1))
              : selectedDepartment.satisfaction.toFixed(1)
          }
          icon={<StarIcon />}
          trend={{
            value: Math.round(((
              enhancedDepartment?.quality.satisfaction?.score !== undefined
                ? Number(enhancedDepartment.quality.satisfaction.score)
                : selectedDepartment.satisfaction
            ) / 5) * 100),
            isPositive: (
              enhancedDepartment?.quality.satisfaction?.score !== undefined
                ? Number(enhancedDepartment.quality.satisfaction.score)
                : selectedDepartment.satisfaction
            ) >= 4.0,
            label: "%"
          }}
          color={(
            enhancedDepartment?.quality.satisfaction?.score !== undefined
              ? Number(enhancedDepartment.quality.satisfaction.score)
              : selectedDepartment.satisfaction
          ) >= 4.0 ? 'success' : 'warning'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Patient Status Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Patient Status Distribution</h2>
          {patients.length > 0 ? (
            <PieChart 
              data={getPatientsByStatus()} 
              height={300} 
              innerRadius={0}
              outerRadius={90}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No patient data available
            </div>
          )}
        </div>

        {/* Staff Breakdown */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Staff Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center border-r border-gray-200">
              <p className="text-sm text-gray-500">Doctors</p>
              <p className="text-2xl font-bold text-blue-600">{selectedDepartment.staff.doctors}</p>
            </div>
            <div className="text-center border-r border-gray-200">
              <p className="text-sm text-gray-500">Nurses</p>
              <p className="text-2xl font-bold text-green-600">{selectedDepartment.staff.nurses}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Support</p>
              <p className="text-2xl font-bold text-purple-600">{selectedDepartment.staff.support}</p>
            </div>
          </div>
          <div className="mt-4">
            <PieChart 
              data={[
                {
                  name: 'Doctors',
                  value: selectedDepartment.staff.doctors,
                  percentage: Math.round((selectedDepartment.staff.doctors / 
                    Math.max(1, selectedDepartment.staff.doctors + selectedDepartment.staff.nurses + selectedDepartment.staff.support)) * 100),
                  color: '#3B82F6' // blue
                },
                {
                  name: 'Nurses',
                  value: selectedDepartment.staff.nurses,
                  percentage: Math.round((selectedDepartment.staff.nurses / 
                    Math.max(1, selectedDepartment.staff.doctors + selectedDepartment.staff.nurses + selectedDepartment.staff.support)) * 100),
                  color: '#10B981' // green
                },
                {
                  name: 'Support',
                  value: selectedDepartment.staff.support,
                  percentage: Math.round((selectedDepartment.staff.support / 
                    Math.max(1, selectedDepartment.staff.doctors + selectedDepartment.staff.nurses + selectedDepartment.staff.support)) * 100),
                  color: '#8B5CF6' // purple
                }
              ]} 
              height={250} 
              innerRadius={0}
              outerRadius={90}
            />
          </div>
        </div>
      </div>

      {/* Bar Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Admissions */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Monthly Patient Trend</h2>
          <BarChart 
            data={getMonthlyAdmissionData()} 
            height={300} 
            xAxisKey="name"
            bars={[{ dataKey: "value", name: "Patients", color: "#3B82F6" }]}
          />
        </div>

        {/* Staff Performance */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Staff Performance Ratings</h2>
          {staff.length > 0 ? (
            <BarChart 
              data={getStaffPerformanceData()} 
              height={300} 
              xAxisKey="name"
              bars={[{ dataKey: "value", name: "Rating", color: "#10B981" }]}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No staff performance data available
            </div>
          )}
        </div>
      </div>

      {/* Department KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Capacity & Occupancy */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Capacity & Occupancy</h2>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-500">Current Occupancy</p>
              <p className="text-3xl font-bold text-blue-600">
                {selectedDepartment.currentOccupancy} <span className="text-sm text-gray-500">/ {selectedDepartment.capacity}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Occupancy Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {occupancyRate}%
              </p>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                occupancyRate > 90
                  ? 'bg-red-500' 
                  : occupancyRate > 70
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`} 
              style={{ width: `${occupancyRate}%` }}
            ></div>
          </div>
        </div>
        
        {/* Financials */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Financial Performance</h2>
          <div className="flex flex-col">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ${enhancedDepartment?.financial?.revenue 
                  ? ensureNumber(enhancedDepartment.financial.revenue).toLocaleString() 
                  : selectedDepartment.revenue.toLocaleString()}
              </p>
            </div>
            {enhancedDepartment?.financial && (
              <div>
                <p className="text-sm text-gray-500">Contribution to Hospital</p>
                <p className="text-2xl font-bold text-blue-600">
                  {ensureNumber(enhancedDepartment.financial.percentage).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Quality Metrics */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Quality Metrics</h2>
          <div className="space-y-4">
            {enhancedDepartment?.quality.readmission && (
              <div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Readmission Rate</p>
                  <p className={`text-sm font-medium ${
                    ensureNumber(enhancedDepartment.quality.readmission.rate) <= ensureNumber(enhancedDepartment.quality.readmission.target) 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {ensureNumber(enhancedDepartment.quality.readmission.rate).toFixed(1)}% vs {ensureNumber(enhancedDepartment.quality.readmission.target).toFixed(1)}% Target
                  </p>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      ensureNumber(enhancedDepartment.quality.readmission.rate) <= ensureNumber(enhancedDepartment.quality.readmission.target) 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`} 
                    style={{ width: `${Math.min(100, (ensureNumber(enhancedDepartment.quality.readmission.rate) / Math.max(0.1, ensureNumber(enhancedDepartment.quality.readmission.target) * 1.5)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {enhancedDepartment?.quality.waitTime && (
              <div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Wait Time</p>
                  <p className={`text-sm font-medium ${
                    ensureNumber(enhancedDepartment.quality.waitTime.avgWait) <= ensureNumber(enhancedDepartment.quality.waitTime.target) 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {ensureNumber(enhancedDepartment.quality.waitTime.avgWait)} min vs {ensureNumber(enhancedDepartment.quality.waitTime.target)} min Target
                  </p>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      ensureNumber(enhancedDepartment.quality.waitTime.avgWait) <= ensureNumber(enhancedDepartment.quality.waitTime.target) 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`} 
                    style={{ width: `${Math.min(100, (ensureNumber(enhancedDepartment.quality.waitTime.avgWait) / ensureNumber(enhancedDepartment.quality.waitTime.target)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {enhancedDepartment?.quality.satisfaction && (
              <div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Patient Satisfaction</p>
                  <p className="text-sm font-medium text-blue-600">
                    {ensureNumber(enhancedDepartment.quality.satisfaction.score).toFixed(1)}/5 ({ensureNumber(enhancedDepartment.quality.satisfaction.responses)} responses)
                  </p>
                </div>
                <div className="flex items-center mt-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <svg 
                      key={index}
                      className={`w-4 h-4 ${index < Math.round(ensureNumber(enhancedDepartment?.quality.satisfaction?.score)) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Staff Performance & Patient Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Performance */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Top Performing Staff</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patients
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topPerformingStaff.map((staffMember) => (
                  <tr key={staffMember.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{staffMember.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{staffMember.role}</div>
                      <div className="text-xs text-gray-500">{staffMember.specialty}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {staffMember.patients}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">{typeof staffMember.rating === 'number' 
                          ? staffMember.rating.toFixed(1) 
                          : ensureNumber(staffMember.rating).toFixed(1)}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <svg 
                              key={index}
                              className={`w-4 h-4 ${index < Math.floor(staffMember.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {topPerformingStaff.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No staff data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Patients</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.slice(0, 5).map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{patient.fullName}</div>
                      <div className="text-xs text-gray-500">ID: {patient.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        patient.status === 'Critical' 
                          ? 'bg-red-100 text-red-800'
                          : patient.status === 'In Treatment' 
                            ? 'bg-blue-100 text-blue-800'
                            : patient.status === 'Discharged'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.room}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.doctor}
                    </td>
                  </tr>
                ))}
                {patients.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No patient data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DepartmentDashboard;