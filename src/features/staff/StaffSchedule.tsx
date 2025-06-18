import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { dataService } from '../../services/dataService';
import { maskPII, maskStaffId } from '../../utils/privacyUtils';
import type { SecureStaffMember, Department, StaffScheduleEntry } from '../../types/schema';

// Define a type for our schedule data structure
type ScheduleData = {
  [staffId: string]: {
    [date: string]: string;
  };
};

const StaffSchedule: React.FC = () => {
  const [staff, setStaff] = useState<SecureStaffMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('current');

  // Get dates for the current week
  const getCurrentWeekDates = () => {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Start date will be previous Sunday (or today if today is Sunday)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - day);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const [weekDates, setWeekDates] = useState(getCurrentWeekDates());

  // Get unique shifts from staff data
  const getUniqueShifts = (staffData: SecureStaffMember[]): string[] => {
    const shiftsSet = new Set<string>();
    staffData.forEach(member => shiftsSet.add(member.shift));
    shiftsSet.add('Off');
    shiftsSet.add('On Call');
    return Array.from(shiftsSet);
  };

  useEffect(() => {
    const fetchStaffData = async () => {
      setIsLoading(true);
      try {
        // Fetch staff and departments in parallel
        const [staffData, departmentsData] = await Promise.all([
          dataService.getSecureStaff(),
          dataService.getDepartments()
        ]);
        
        setStaff(staffData);
        setDepartments(departmentsData);
        setShifts(getUniqueShifts(staffData));
        
        // Create initial schedule data based on their current shifts
        const initialScheduleData: ScheduleData = {};
        staffData.forEach(staffMember => {
          initialScheduleData[staffMember.id] = {};
          weekDates.forEach(date => {
            const dateString = date.toISOString().split('T')[0];
            // Set shift based on staff member's current status and shift pattern
            const day = date.getDay();
            
            // Simple logic: Mon-Fri they work their shift, weekends they're off
            // This matches with our sample data where staff members have specific shifts
            if (day >= 1 && day <= 5 && staffMember.status === 'On Duty') {
              initialScheduleData[staffMember.id][dateString] = staffMember.shift;
            } else if (staffMember.status === 'On Call') {
              // On call staff might be called in on any day
              initialScheduleData[staffMember.id][dateString] = 'On Call';
            } else {
              initialScheduleData[staffMember.id][dateString] = 'Off';
            }
          });
        });
        
        setScheduleData(initialScheduleData);
      } catch (err) {
        console.error('Error loading staff data:', err);
        setError('Failed to load staff data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffData();
  }, [weekDates]);

  // Update schedule for a staff member on a specific date
  const handleShiftChange = (staffId: string, date: string, shift: string) => {
    setScheduleData((prev: ScheduleData) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [date]: shift
      }
    }));
  };

  // Save schedule to backend
  const saveSchedule = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Convert schedule data to the format expected by the backend
      const scheduleEntries: StaffScheduleEntry[] = [];
      
      Object.entries(scheduleData).forEach(([staffId, dates]) => {
        Object.entries(dates).forEach(([date, shift]) => {
          scheduleEntries.push({
            staffId,
            date,
            shift
          });
        });
      });
      
      // Call the service to save
      const result = await dataService.saveStaffSchedule(scheduleEntries);
      
      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Schedule saved successfully!' });
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save schedule.' });
      }
    } catch (err) {
      console.error('Error saving schedule:', err);
      setSaveMessage({ type: 'error', text: 'An error occurred while saving the schedule.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Navigate to previous week
  const previousWeek = () => {
    const newDates = weekDates.map(date => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() - 7);
      return newDate;
    });
    setWeekDates(newDates);
    setSelectedWeek('custom');
  };

  // Navigate to next week
  const nextWeek = () => {
    const newDates = weekDates.map(date => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + 7);
      return newDate;
    });
    setWeekDates(newDates);
    setSelectedWeek('custom');
  };

  // Reset to current week
  const goToCurrentWeek = () => {
    setWeekDates(getCurrentWeekDates());
    setSelectedWeek('current');
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // Filter staff by department
  const filteredStaff = selectedDepartment === 'all' 
    ? staff 
    : staff.filter(s => s.department === selectedDepartment);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Staff Schedule</h1>
          <p className="text-gray-500">Manage staff shifts and assignments</p>
        </div>
        
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-5 w-full"></div>
          <div className="h-96 bg-gray-200 rounded w-full"></div>
        </div>
      </PageContainer>
    );
  }

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

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Schedule</h1>
        <p className="text-gray-500">Manage staff shifts and assignments</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
        <div className="flex space-x-2">
          <button
            onClick={previousWeek}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
          >
            &larr; Previous Week
          </button>
          <button
            onClick={goToCurrentWeek}
            className={`px-4 py-2 ${selectedWeek === 'current' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} rounded-md`}
          >
            Current Week
          </button>
          <button
            onClick={nextWeek}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
          >
            Next Week &rarr;
          </button>
        </div>
        
        <div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Staff
                </th>
                {weekDates.map((date) => (
                  <th key={date.toISOString()} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {formatDate(date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map(staffMember => (
                <tr key={staffMember.id}>
                  <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {staffMember.role.includes('Doctor') || staffMember.role.includes('Cardiologist') || staffMember.role.includes('Surgeon') ? (
                          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        ) : (
                          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{maskPII(staffMember.fullName)}</div>
                        <div className="text-xs text-gray-500">{staffMember.role}</div>
                        <div className="text-xs text-gray-400">ID: {maskStaffId(staffMember.id)}</div>
                      </div>
                    </div>
                  </td>
                  {weekDates.map((date) => {
                    const dateKey = date.toISOString().split('T')[0];
                    return (
                      <td key={dateKey} className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={scheduleData[staffMember.id]?.[dateKey] || 'Off'}
                          onChange={(e) => handleShiftChange(staffMember.id, dateKey, e.target.value)}
                          className={`block w-full text-sm rounded-md p-1 border text-black ${
                            scheduleData[staffMember.id]?.[dateKey]?.includes('Day')
                              ? 'bg-blue-50 border-blue-200'
                              : scheduleData[staffMember.id]?.[dateKey]?.includes('Night')
                                ? 'bg-indigo-50 border-indigo-200'
                                : scheduleData[staffMember.id]?.[dateKey] === 'On Call'
                                  ? 'bg-yellow-50 border-yellow-200'
                                  : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          {shifts.map(shift => (
                            <option key={shift} value={shift}>{shift}</option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No staff members found in this department
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button and Message */}
      <div className="mt-6 flex justify-end">
        <button
          className={`px-6 py-2 ${
            isSaving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          onClick={saveSchedule}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
      
      {saveMessage && (
        <div className={`mt-4 p-3 rounded-md ${
          saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {saveMessage.text}
        </div>
      )}
    </PageContainer>
  );
};

export default StaffSchedule;