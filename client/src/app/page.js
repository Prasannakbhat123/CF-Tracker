// src/app/page.js
'use client';

import { useEffect, useState } from 'react';
import StudentTable from '../components/StudentTable.jsx'; // Update extension to .jsx
import { Loader } from 'lucide-react';
import { useStudents } from '../context/StudentContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import CronSettings from '../components/CronSettings';

export default function DashboardPage() {
  const { students, setStudents, loading, error, fetchStudents } = useStudents();
  const { admin, logout } = useAuth();
  const [showSyncSettings, setShowSyncSettings] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-8 border-gray-200 dark:border-gray-700 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-8 border-indigo-500 dark:border-indigo-400 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Loading Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400">Fetching student data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-6 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Error Loading Dashboard</h2>
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchStudents}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Navbar onOpenSyncSettings={() => setShowSyncSettings(true)} />
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl font-bold mb-6">Student Progress Dashboard</h1>
          <StudentTable students={students} setStudents={setStudents} />
        </main>
        
        {showSyncSettings && (
          <CronSettings onClose={() => setShowSyncSettings(false)} />
        )}
      </div>
    </ProtectedRoute>
  );
}
