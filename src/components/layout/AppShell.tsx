import React, { useState, Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { Dialog, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { BreakpointIndicator } from '../common/BreakpointIndicator';


interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Update the navItems array to include Staff Schedule
  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: <HomeIcon className="h-6 w-6 md:h-5 md:w-5" /> },
    { name: 'Patients', path: '/patients', icon: <UserGroupIcon className="h-6 w-6 md:h-5 md:w-5" /> },
    { name: 'Appointments', path: '/appointments', icon: <ClipboardDocumentListIcon className="h-6 w-6 md:h-5 md:w-5" /> },
    { name: 'Staff', path: '/staff', icon: <UserIcon className="h-6 w-6 md:h-5 md:w-5" /> },
  ];

  // Add a staffScheduleItem
  const staffScheduleItem: NavItem = {
    name: 'Staff Schedule',
    path: '/staff/schedule',
    icon: <ClockIcon className="h-6 w-6 md:h-5 md:w-5" />
  };

  // Separate departments item for better control
  const departmentsItem: NavItem = {
    name: 'Departments',
    path: '/departments',
    icon: <ChartBarIcon className="h-6 w-6 md:h-5 md:w-5" />
  };

  // Styles for mobile navigation
  const mobileNavStyles = {
    nav: "md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2",
    link: "flex flex-col items-center justify-center",
    icon: "h-6 w-6",
    text: "text-xs mt-1 truncate max-w-[4rem]" // Limit width to prevent overflow
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-lg font-semibold text-gray-900">Health Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button type="button" className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
            AD
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 md:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center justify-between">
                    <div className="flex items-center">
                      <span className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold">
                        H
                      </span>
                      <span className="ml-2 text-xl font-semibold text-gray-900">Health Dashboard</span>
                    </div>
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Mobile navigation menu */}
                  <nav className="flex flex-1 flex-col">
                    <ul className="flex flex-1 flex-col gap-y-2">
                      {navItems.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.path}
                            className={`${
                              location.pathname === item.path
                                ? 'bg-primary-50 text-primary-600'
                                : 'text-gray-600 hover:bg-gray-50'
                            } group flex gap-x-3 rounded-md p-3 text-sm font-medium`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <div className="text-gray-400 group-hover:text-primary-600">
                              {item.icon}
                            </div>
                            {item.name}
                          </Link>
                        </li>
                      ))}
                      
                      {/* Add Departments item to mobile menu */}
                      <li>
                        <Link
                          to={departmentsItem.path}
                          className={`${
                            location.pathname.includes('/departments')
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-600 hover:bg-gray-50'
                          } group flex gap-x-3 rounded-md p-3 text-sm font-medium`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="text-gray-400 group-hover:text-primary-600">
                            {departmentsItem.icon}
                          </div>
                          {departmentsItem.name}
                        </Link>
                      </li>

                      {/* Add Staff Schedule to mobile menu */}
                      <li>
                        <Link
                          to={staffScheduleItem.path}
                          className={`${
                            location.pathname === staffScheduleItem.path
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-600 hover:bg-gray-50'
                          } group flex gap-x-3 rounded-md p-3 text-sm font-medium`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="text-gray-400 group-hover:text-primary-600">
                            {staffScheduleItem.icon}
                          </div>
                          {staffScheduleItem.name}
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop Sidebar (fixed) */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex items-center justify-center px-4">
              <span className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold">
                H
              </span>
              <span className="ml-2 text-xl font-semibold text-gray-900">Health Dashboard</span>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  } group flex items-center px-2 py-2 rounded-md font-medium`}
                >
                  <div className="mr-3 text-gray-400 group-hover:text-gray-500">{item.icon}</div>
                  {item.name}
                </Link>
              ))}

              {/* Desktop Departments Link */}
              <Link
                to={departmentsItem.path}
                className={`${
                  location.pathname.includes('/departments')
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                } group flex items-center px-2 py-2 rounded-md font-medium`}
              >
                <div className="mr-3 text-gray-400 group-hover:text-gray-500">{departmentsItem.icon}</div>
                {departmentsItem.name}
              </Link>

              {/* Desktop Staff Schedule Link */}
              <Link
                to={staffScheduleItem.path}
                className={`${
                  location.pathname === staffScheduleItem.path
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                } group flex items-center px-2 py-2 rounded-md font-medium`}
              >
                <div className="mr-3 text-gray-400 group-hover:text-gray-500">{staffScheduleItem.icon}</div>
                {staffScheduleItem.name}
              </Link>
            </nav>
          </div>
          {/* User Profile Section */}
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
                AD
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs font-medium text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="md:pl-64">
        {/* Desktop Header */}
        <header className="hidden md:flex bg-white shadow-sm px-4 py-3 justify-between items-center w-full">
          <h1 className="text-xl font-semibold text-gray-900">Health Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button type="button" className="text-gray-500 hover:text-gray-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="pb-20 md:pb-10">
          {children}
        </div>

        {/* Mobile bottom navigation */}
        <nav className={mobileNavStyles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`${
                location.pathname === item.path
                  ? 'text-primary-600'
                  : 'text-gray-500'
              } ${mobileNavStyles.link}`}
            >
              <div className={mobileNavStyles.icon}>{item.icon}</div>
              <span className={mobileNavStyles.text}>{item.name}</span>
            </Link>
          ))}
          
          {/* More compact Departments tab for mobile nav */}
          <Link
            to={departmentsItem.path}
            className={`${
              location.pathname.includes('/departments')
                ? 'text-primary-600'
                : 'text-gray-500'
            } ${mobileNavStyles.link}`}
          >
            <div className={mobileNavStyles.icon}>
              {departmentsItem.icon}
            </div>
            <span className={mobileNavStyles.text}>Depts</span> {/* Shortened for mobile */}
          </Link>

          {/* Add Staff Schedule to mobile bottom nav */}
          <Link
            to={staffScheduleItem.path}
            className={`${
              location.pathname === staffScheduleItem.path
                ? 'text-primary-600'
                : 'text-gray-500'
            } ${mobileNavStyles.link}`}
          >
            <div className={mobileNavStyles.icon}>
              {staffScheduleItem.icon}
            </div>
            <span className={mobileNavStyles.text}>Schedule</span> {/* Shortened for mobile */}
          </Link>
        </nav>
      </main>
      
      {/* Only show breakpoint indicator in development */}
      <BreakpointIndicator />
    </div>
  );
};