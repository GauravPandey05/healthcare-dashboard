import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { MetricCard } from '../../components/common/MetricCard';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import { dataService } from '../../services/dataService';
import type { AppointmentData, OverviewStatistics } from '../../types/schema';
import { MetricCardSkeleton, ChartSkeleton } from '../../components/common/Skeleton';

// Icons
const AppointmentIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const CompletedIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const CancelledIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const WaitTimeIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

const AppointmentsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [overviewData, setOverviewData] = useState<OverviewStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('monthly');
  // New state for month range selection
  const [monthRangeStart, setMonthRangeStart] = useState<number>(0);

  useEffect(() => {
    const fetchAppointmentsData = async () => {
      setIsLoading(true);
      try {
        // Fetch appointments data
        const [appointments, overview] = await Promise.all([
          dataService.getAppointments(),
          dataService.getOverview()
        ]);
        setAppointmentData(appointments);
        setOverviewData(overview);
        
        // Initialize monthRangeStart to show most recent 6 months
        if (appointments.monthlyTrends.length > 6) {
          setMonthRangeStart(appointments.monthlyTrends.length - 6);
        }
      } catch (err) {
        console.error('Error fetching appointment data:', err);
        setError('Failed to load appointment data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentsData();
  }, []);

  // Handler for moving backward in month ranges
  const handlePrevMonths = () => {
    if (monthRangeStart > 0) {
      setMonthRangeStart(Math.max(0, monthRangeStart - 6));
    }
  };

  // Handler for moving forward in month ranges
  const handleNextMonths = () => {
    if (appointmentData && monthRangeStart + 6 < appointmentData.monthlyTrends.length) {
      setMonthRangeStart(monthRangeStart + 6);
    }
  };

  // Get the current month range for display
  const getCurrentMonthRange = () => {
    if (!appointmentData) return "";
    
    const start = monthRangeStart;
    const end = Math.min(monthRangeStart + 5, appointmentData.monthlyTrends.length - 1);
    
    if (start <= end && appointmentData.monthlyTrends[start] && appointmentData.monthlyTrends[end]) {
      return `${appointmentData.monthlyTrends[start].month} - ${appointmentData.monthlyTrends[end].month}`;
    }
    return "";
  };

  // Get the current month range data
  const getCurrentMonthRangeData = () => {
    if (!appointmentData) return [];
    
    return appointmentData.monthlyTrends.slice(
      monthRangeStart, 
      Math.min(monthRangeStart + 6, appointmentData.monthlyTrends.length)
    );
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <p className="text-gray-500">Monitor and manage patient appointments</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </PageContainer>
    );
  }

  if (error || !appointmentData || !overviewData) {
    return (
      <PageContainer>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error || 'No appointment data available'}</span>
        </div>
      </PageContainer>
    );
  }

  // Calculate percentage change for trend indicators
  const cancelRate = Math.round((overviewData.cancelledAppointments / overviewData.todayAppointments) * 100);
  const completionRate = Math.round((overviewData.completedAppointments / overviewData.todayAppointments) * 100);
  
  // Get the last month's data for comparison
  const lastMonth = appointmentData.monthlyTrends[appointmentData.monthlyTrends.length - 2];
  const currentMonth = appointmentData.monthlyTrends[appointmentData.monthlyTrends.length - 1];
  
  // Calculate monthly trends
  const revenueChange = Math.round(((currentMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100);
  
  // Calculate average wait time from weekly data
  const avgWaitTime = appointmentData.weeklySchedule.reduce(
    (sum, day) => sum + day.waitTime, 0
  ) / appointmentData.weeklySchedule.length;

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <p className="text-gray-500">Monitor and manage patient appointments</p>
        </div>
        <div>
          <button
            onClick={() => navigate('/appointments/new')} 
            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md flex items-center text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            New Appointment
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Appointments"
          value={overviewData.totalAppointments.toString()}
          icon={<AppointmentIcon />}
          trend={{
            value: overviewData.todayAppointments,
            isPositive: true
          }}
          color="primary"
        />
        <MetricCard
          title="Completed"
          value={overviewData.completedAppointments.toString()}
          icon={<CompletedIcon />}
          trend={{
            value: completionRate,
            isPositive: true,
            suffix: '%'
          }}
          color="success"
        />
        <MetricCard
          title="Cancelled"
          value={overviewData.cancelledAppointments.toString()}
          icon={<CancelledIcon />}
          trend={{
            value: cancelRate,
            isPositive: false,
            suffix: '%'
          }}
          color="danger"
        />
        <MetricCard
          title="Average Wait"
          value={`${Math.round(avgWaitTime)} min`}
          icon={<WaitTimeIcon />}
          trend={{
            value: Math.round(overviewData.averageWaitTime - avgWaitTime),
            isPositive: avgWaitTime < overviewData.averageWaitTime
          }}
          color="info"
        />
      </div>

      

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Appointments Trend */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium text-gray-800">Appointment Trends</h3>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setChartView('weekly')}
                className={`px-4 py-2 text-sm ${
                  chartView === 'weekly' 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'bg-white text-gray-600'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setChartView('monthly')}
                className={`px-4 py-2 text-sm ${
                  chartView === 'monthly' 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'bg-white text-gray-600'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          
          {chartView === 'weekly' ? (
            <BarChart
              data={appointmentData.weeklySchedule}
              bars={[
                { dataKey: 'scheduled', name: 'Scheduled', color: '#3b82f6' },
                { dataKey: 'completed', name: 'Completed', color: '#10b981' },
                { dataKey: 'cancelled', name: 'Cancelled', color: '#ef4444' }
              ]}
              xAxisKey="day"
              height={300}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">Monthly Appointments</h4>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handlePrevMonths}
                    disabled={monthRangeStart === 0}
                    className={`p-1 rounded-full ${
                      monthRangeStart === 0 
                        ? 'text-gray-300' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-600">{getCurrentMonthRange()}</span>
                  <button 
                    onClick={handleNextMonths}
                    disabled={!appointmentData || monthRangeStart + 6 >= appointmentData.monthlyTrends.length}
                    className={`p-1 rounded-full ${
                      !appointmentData || monthRangeStart + 6 >= appointmentData.monthlyTrends.length 
                        ? 'text-gray-300' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <LineChart
                data={getCurrentMonthRangeData()}
                lines={[
                  { key: 'appointments', name: 'Total', color: '#3b82f6' },
                  { key: 'completed', name: 'Completed', color: '#10b981' },
                  { key: 'cancelled', name: 'Cancelled', color: '#ef4444' }
                ]}
                xAxisKey="month"
                height={300}
              />
            </>
          )}
        </div>

        {/* Appointment Types */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-md font-medium text-gray-800 mb-4">Appointment Types</h3>
          <BarChart
            data={appointmentData.byType}
            bars={[
              { dataKey: 'count', name: 'Count', color: '#3b82f6' },
              { dataKey: 'avgDuration', name: 'Avg. Duration (min)', color: '#f59e0b', yAxisId: 'right' }
            ]}
            xAxisKey="type"
            height={300}
            showYAxisRight
          />
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Wait Time by Day */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-md font-medium text-gray-800 mb-4">Wait Time by Day</h3>
          <BarChart
            data={appointmentData.weeklySchedule}
            bars={[
              { dataKey: 'waitTime', name: 'Average Wait Time (min)', color: '#f59e0b' }
            ]}
            xAxisKey="day"
            height={250}
          />
        </div>

        {/* Revenue Trend - also update this to use the same month range */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-md font-medium text-gray-800 mb-4">Appointment Revenue</h3>
          <LineChart
            data={getCurrentMonthRangeData()}
            lines={[
              { key: 'revenue', name: 'Revenue ($)', color: '#10b981' }
            ]}
            xAxisKey="month"
            height={250}
          />
        </div>
      </div>

      {/* Actions Panel */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-medium text-gray-800">Appointment Management</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/appointments/list')}
              className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 text-sm"
            >
              View All Appointments
            </button>
            <button
              onClick={() => navigate('/appointments/schedule')}
              className="bg-blue-50 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-100 text-sm"
            >
              Manage Schedule
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center">
            <div className="text-center">
              <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                </svg>
              </div>
              <h4 className="text-gray-800 font-medium mt-2">Patients</h4>
              <p className="text-gray-500 text-sm mt-1">View and manage patients</p>
              <button
                onClick={() => navigate('/patients')}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Go to Patients →
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center">
            <div className="text-center">
              <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h4 className="text-gray-800 font-medium mt-2">Appointments</h4>
              <p className="text-gray-500 text-sm mt-1">View all appointments</p>
              <button
                onClick={() => navigate('/appointments/list')}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                View Appointments →
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center">
            <div className="text-center">
              <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                </svg>
              </div>
              <h4 className="text-gray-800 font-medium mt-2">Reports</h4>
              <p className="text-gray-500 text-sm mt-1">Generate appointment reports</p>
              <button
                onClick={() => { /* This would navigate to reports page */ }}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Generate Reports →
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AppointmentsDashboard;