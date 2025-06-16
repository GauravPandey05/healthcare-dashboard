import { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { StatusType } from '../../components/common/StatusBadge';
import { LineChart } from '../../components/charts/LineChart';
import { PieChart } from '../../components/charts/PieChart';
import { BarChart } from '../../components/charts/BarChart';
import { dataService } from '../../services/dataService';
// Import at the top of the file
// Add this import at the top of your Dashboard.tsx file
import { maskPII, maskPatientId } from '../../utils/privacyUtils';
import type { 
  OverviewStatistics, 
  Demographics, 
  AppointmentData,
  RecentActivity,
  VitalSigns,
  SecurePatient,
  Department  // Add this type
} from '../../types/schema';

// Icons using SVGs
const UserIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const HospitalIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v7h-2V8H9v4H7V5z" clipRule="evenodd" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
  </svg>
);

const LabIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

const StaffIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

export const Dashboard = () => {
  // State management for data
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewStatistics | null>(null);
  const [demographics, setDemographics] = useState<Demographics | null>(null);
  const [appointments, setAppointments] = useState<AppointmentData | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [vitalSigns, setVitalSigns] = useState<VitalSigns | null>(null);
  const [recentPatients, setRecentPatients] = useState<SecurePatient[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showAllDepartments, setShowAllDepartments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Chart configuration states
  const [activeTab, setActiveTab] = useState(0);

  // Fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all required data in parallel
        const [overviewData, demographicsData, appointmentsData, activitiesData, vitalsData, patients, departmentsData] = await Promise.all([
          dataService.getOverview(),
          dataService.getDemographics(),
          dataService.getAppointments(),
          dataService.getRecentActivities(),
          dataService.getVitalSigns(),
          dataService.getSecurePatients(),
          dataService.getDepartments()  // Add this call
        ]);

        // Update state with fetched data
        setOverview(overviewData);
        setDemographics(demographicsData);
        setAppointments(appointmentsData);
        setActivities(activitiesData);
        setVitalSigns(vitalsData);
        setRecentPatients(patients.slice(0, 5));
        setDepartments(departmentsData);  // Store the departments
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-blue-500">
            <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
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

  // No data state
  if (!overview || !demographics || !appointments) {
    return (
      <PageContainer>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">No data available to display.</span>
        </div>
      </PageContainer>
    );
  }

  // Format demographic data for charts
  const ageData = demographics.byAge.map(item => ({
    name: item.label || '',
    value: item.count,
    color: item.color,
    percentage: item.percentage
  }));

  const genderData = demographics.byGender.map(item => ({
    name: item.gender || '',
    value: item.count,
    color: item.color,
    percentage: item.percentage
  }));

  const insuranceData = demographics.byInsurance?.map(item => ({
    name: item.type || '',
    value: item.count,
    color: item.color || getRandomColor(item.type || ''),
    percentage: item.percentage
  })) || [];

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6">Hospital Dashboard</h1>
      
      {/* Key Metrics - First Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <MetricCard
          title="Total Patients"
          value={overview.totalPatients.toLocaleString()}
          icon={<UserIcon />}
          trend={{
            value: overview.newPatientsToday,
            isPositive: overview.newPatientsToday > 0
          }}
          color="info"
        />
        <MetricCard
          title="Appointments Today"
          value={overview.todayAppointments.toLocaleString()}
          icon={<CalendarIcon />}
          trend={{
            value: Math.round((overview.completedAppointments / Math.max(1, overview.todayAppointments)) * 100),
            isPositive: true
          }}
          color="success"
        />
        <MetricCard
          title="Pending Results"
          value={overview.pendingResults.toString()}
          icon={<LabIcon />}
          trend={{
            value: overview.pendingResults,
            isPositive: overview.pendingResults < 30
          }}
          color={overview.pendingResults > 30 ? "warning" : "success"}
        />
        <MetricCard
          title="Critical Alerts"
          value={overview.criticalAlerts.toString()}
          icon={<BellIcon />}
          trend={{
            value: overview.criticalAlerts,
            isPositive: overview.criticalAlerts <= 3
          }}
          color={overview.criticalAlerts > 3 ? 'danger' : 'warning'}
        />
        <MetricCard
          title="Bed Occupancy"
          value={`${overview.bedOccupancyRate}%`}
          icon={<HospitalIcon />}
          trend={{
            value: overview.availableBeds,
            isPositive: overview.availableBeds > 5
          }}
          color={overview.bedOccupancyRate > 90 ? 'danger' : overview.bedOccupancyRate > 80 ? 'warning' : 'primary'}
        />
        <MetricCard
          title="Staff On Duty"
          value={overview.staffOnDuty.toString()}
          icon={<StaffIcon />}
          trend={{
            value: overview.doctorsAvailable,
            isPositive: overview.doctorsAvailable >= 40
          }}
          color="primary"
        />
      </div>

      {/* Charts Section - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Appointment Trends */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Appointment Trends</h2>
          <LineChart
            data={appointments.monthlyTrends}
            lines={[
              { key: 'appointments', name: 'Total', color: '#3b82f6' },
              { key: 'completed', name: 'Completed', color: '#10b981' },
              { key: 'cancelled', name: 'Cancelled', color: '#ef4444' }
            ]}
            xAxisKey="month"
            height={300}
          />
        </div>

        {/* Demographics Card with Tabs */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Patient Demographics</h2>
          
          {/* Tabs for different demographic types */}
          <div className="mb-4 border-b border-gray-200">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
              {['By Age', 'By Gender', 'By Insurance'].map((tab, index) => (
                <li key={index} className="mr-2">
                  <button 
                    onClick={() => setActiveTab(index)}
                    className={`inline-block p-3 rounded-t-lg ${
                      activeTab === index 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'
                    }`}
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Chart Display based on active tab */}
          <div className="flex flex-col">
            <div className="text-sm text-gray-500 mb-4">
              {activeTab === 0 && 'Distribution of patients by age group'}
              {activeTab === 1 && 'Distribution of patients by gender'}
              {activeTab === 2 && 'Distribution of patients by insurance type'}
              <span className="ml-2 text-xs text-gray-400">(Click on legend items to hide/show)</span>
            </div>

            {/* Charts based on active tab */}
            <div className="h-64">
              {activeTab === 0 && (
                <PieChart 
                  data={ageData} 
                  height={250}
                  innerRadius={0}
                  outerRadius={90}
                />
              )}
              {activeTab === 1 && (
                <PieChart 
                  data={genderData} 
                  height={250}
                  innerRadius={0}
                  outerRadius={90}
                />
              )}
              {activeTab === 2 && (
                <PieChart 
                  data={insuranceData} 
                  height={250}
                  innerRadius={0}
                  outerRadius={90}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Department Performance and Appointment Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Department Performance */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Department Performance</h2>
            <button 
              onClick={() => setShowAllDepartments(!showAllDepartments)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showAllDepartments ? 'Show Top 5' : 'Show All'}
            </button>
          </div>
          {departments.length > 0 ? (
            <BarChart
              data={getDepartmentPerformanceData()}
              bars={[
                { dataKey: 'patients', name: 'Patients', color: '#3b82f6' }, 
                { dataKey: 'satisfaction', name: 'Satisfaction (0-5)', color: '#10b981' }
              ]}
              xAxisKey="name"
              height={300}
              showYAxisRight={true}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
              <p className="text-gray-500">No department data available</p>
            </div>
          )}
        </div>

        {/* Appointment Types */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Appointment Types</h2>
          <BarChart
            data={appointments.byType}
            bars={[
              { dataKey: 'count', name: 'Count', color: '#3b82f6' }
            ]}
            xAxisKey="type"
            height={300}
          />
        </div>
      </div>

      {/* Third Row - Vital Signs Monitoring and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vital Signs Monitoring */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Vital Signs Monitoring</h2>
          {vitalSigns && (
            <div>
              <div className="mb-4">
                <h3 className="text-md font-medium mb-2">Patient P001 - Recent Vital Signs</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heart Rate</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BP</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">O2 Sat</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vitalSigns.patientP001.slice(-4).map((reading, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{reading.time}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{reading.heartRate}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{reading.bloodPressure.systolic}/{reading.bloodPressure.diastolic}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{reading.temperature}°F</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{reading.oxygenSat}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <h3 className="text-md font-medium mb-2">Active Alerts</h3>
              <div className="space-y-2">
                {vitalSigns.alerts.length > 0 ? 
                  vitalSigns.alerts.map((alert, index) => (
                    <div 
                      key={index} 
                      className={`flex justify-between p-2 rounded-md ${
                        alert.severity === 'High' ? 'bg-red-50 text-red-700' : 
                        alert.severity === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 
                        'bg-green-50 text-green-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{alert.patientId} - {alert.type}</div>
                        <div className="text-xs">Value: {alert.value} (Threshold: {alert.threshold})</div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alert.severity === 'High' ? 'bg-red-100 text-red-800' : 
                        alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                  ))
                  : <div className="text-sm text-gray-500">No active alerts</div>
                }
              </div>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Activities</h2>
          <div className="overflow-y-auto max-h-[300px]">
            <ul className="divide-y divide-gray-200">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <li key={activity.id} className="py-3">
                    <div className="flex items-start">
                      <div className="shrink-0 mr-3">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(activity.timestamp)}
                          <StatusBadge
                            status={mapPriorityToStatus(activity.priority)}
                          />
                        </p>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-8 text-center text-gray-500">
                  No recent activities
                </li>
              )}
            </ul>
          </div>
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
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPatients.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {maskPII(patient.fullName)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {maskPatientId(patient.id)}
                    </div>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      patient.status === 'Critical' 
                        ? 'bg-red-100 text-red-800'
                        : patient.status === 'Discharged'
                          ? 'bg-green-100 text-green-800'
                          : patient.status === 'In Treatment'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.doctor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Final Row - Resource Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Beds Overview */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Bed Capacity</h2>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-600">{overview.occupiedBeds} / {overview.totalBeds}</div>
            <div className="text-sm text-gray-500 mt-2">Occupied Beds</div>
            <div className="flex justify-between items-center w-full mt-3">
              <span className="text-xs text-gray-500">Occupied</span>
              <span className="text-xs text-gray-500">Available</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3.5 mt-1 overflow-hidden">
              <div 
                className={`h-3.5 ${overview.bedOccupancyRate > 90 ? 'bg-red-500' : overview.bedOccupancyRate > 75 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                style={{ width: `${overview.bedOccupancyRate}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 self-end">{overview.availableBeds} beds available</div>
          </div>
        </div>

        {/* Staff Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Staff On Duty</h2>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="text-3xl font-semibold text-blue-600">{overview.staffOnDuty}</div>
              <div className="text-sm text-gray-500">Total Staff</div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-xl font-medium text-blue-800">{overview.doctorsAvailable}</div>
                <div className="text-xs text-gray-500">Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-green-600">{overview.nursesOnDuty}</div>
                <div className="text-xs text-gray-500">Nurses</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium text-purple-600">{overview.staffOnDuty - overview.doctorsAvailable - overview.nursesOnDuty}</div>
                <div className="text-xs text-gray-500">Support</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-1">Staff utilization</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(overview.staffOnDuty / overview.totalStaff) * 100}%` }}></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">{Math.round((overview.staffOnDuty / overview.totalStaff) * 100)}% of total staff</div>
          </div>
        </div>
        
        {/* Wait Times & Satisfaction */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Patient Experience</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-amber-500">{overview.averageWaitTime} min</div>
              <div className="text-sm text-gray-500 mt-2">Average Wait Time</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                <div 
                  className={`h-2.5 rounded-full ${overview.averageWaitTime < 15 ? 'bg-green-500' : overview.averageWaitTime < 30 ? 'bg-amber-500' : 'bg-red-500'}`} 
                  style={{ width: `${Math.min(100, (overview.averageWaitTime / 60) * 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-green-600">{overview.patientSatisfactionScore}/5</div>
              <div className="flex items-center mt-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg 
                    key={index}
                    className={`w-4 h-4 ${index < Math.round(overview.patientSatisfactionScore) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <div className="text-sm text-gray-500 mt-2">Patient Satisfaction</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-gray-700">Revenue:</div>
              <div className="text-lg font-bold text-green-600">${(overview.revenue/1000).toFixed(1)}k</div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-sm font-medium text-gray-700">Expenses:</div>
              <div className="text-lg font-bold text-red-600">${(overview.expenses/1000).toFixed(1)}k</div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-sm font-medium text-gray-700">Profit:</div>
              <div className="text-lg font-bold text-blue-600">${((overview.revenue - overview.expenses)/1000).toFixed(1)}k</div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
  
  // Function to get department performance data from departmentsData
  function getDepartmentPerformanceData() {
    if (!departments || departments.length === 0) {
      return [];
    }
    
    // Sort departments by performance criteria (satisfaction score)
    const sortedDepartments = [...departments].sort((a, b) => b.satisfaction - a.satisfaction);
    
    // Get top 5 or all departments based on showAllDepartments state
    const filteredDepartments = showAllDepartments 
      ? sortedDepartments 
      : sortedDepartments.slice(0, 5);
    
    // Format data for the chart
    return filteredDepartments.map(dept => ({
      name: dept.name.length > 12 ? dept.name.substring(0, 10) + '..' : dept.name,
      patients: dept.totalPatients,
      satisfaction: dept.satisfaction
    }));
  }
};

// Helper functions
const getActivityIcon = (type: string) => {
  let iconClass = "rounded-md p-2 flex items-center justify-center";
  
  switch (type.toLowerCase()) {
    case 'patient':
    case 'patient admission':
      iconClass += " bg-blue-100 text-blue-600";
      return (
        <div className={iconClass}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case 'alert':
    case 'vital alert':
    case 'equipment alert':
      iconClass += " bg-red-100 text-red-600";
      return (
        <div className={iconClass}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </div>
      );
    case 'system':
      iconClass += " bg-gray-100 text-gray-600";
      return (
        <div className={iconClass}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      );
    case 'appointment':
      iconClass += " bg-green-100 text-green-600";
      return (
        <div className={iconClass}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>          
        </div>
      );
    case 'staff':
    case 'staff update':
      iconClass += " bg-purple-100 text-purple-600";
      return (
        <div className={iconClass}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        </div>
      );
    case 'finance':
      iconClass += " bg-yellow-100 text-yellow-600";
      return (
        <div className={iconClass}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        </div>
      );
    default:
      iconClass += " bg-gray-100 text-gray-600";
      return (
        <div className={iconClass}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
  }
};

// Update the mapPriorityToStatus function to match your StatusBadge component's accepted values
const mapPriorityToStatus = (priority: string): StatusType => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'Critical';
    case 'medium':
      return 'In Treatment';
    case 'low':
      return 'Active'; // Changed from 'Stable' to 'Active' which is an allowed value
    default:
      return 'Pending'; // Changed from 'Stable' to 'Pending' which is an allowed value
  }
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  // If it's today, just show time
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  // If it's yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  // Otherwise show date and time
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper function to generate colors
const getRandomColor = (seed: string) => {
  // Generate a pseudo-random color based on the string seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
};

export default Dashboard;