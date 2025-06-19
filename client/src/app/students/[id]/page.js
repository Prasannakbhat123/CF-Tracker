// src/app/students/[id]/page.js
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import ProfileView from '../../../components/ProfileView.jsx';
import { Loader } from 'lucide-react';
import { useStudents } from '../../../context/StudentContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useTheme } from '../../../context/ThemeContext';

export default function StudentProfilePage() {
  const params = useParams();
  const { id } = params;
  const { fetchStudentDetails } = useStudents();
  const { dark } = useTheme();
  
  // Use refs to store state that shouldn't trigger re-renders
  const loadingRef = useRef(true);
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);
  
  // State for UI
  const [student, setStudent] = useState(null);
  const [contestHistory, setContestHistory] = useState([]);
  const [problemData, setProblemData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch data only once on mount
  useEffect(() => {
    mountedRef.current = true;
    loadData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [id]);
    const loadData = async () => {
    // Prevent multiple concurrent requests
    if (fetchingRef.current) return;
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      
      console.log(`Fetching data for student ${id}...`);
      const data = await fetchStudentDetails(id);
      
      // Add a small delay to ensure smooth loading transitions
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        if (data.student) setStudent(data.student);
        if (Array.isArray(data.contestHistory)) setContestHistory(data.contestHistory);
        if (Array.isArray(data.problemData)) setProblemData(data.problemData);
        setError(null);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      if (mountedRef.current) {
        setError(err.message || 'Failed to load profile data');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        loadingRef.current = false;
      }
      fetchingRef.current = false;
    }
  };
  
  // Refresh button handler
  const handleRefresh = () => {
    if (!fetchingRef.current) {
      loadData();
    }
  };  if (loading && loadingRef.current) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative w-24 h-24">
          <div className={`absolute top-0 left-0 w-full h-full border-8 ${dark ? 'border-gray-700' : 'border-gray-200'} rounded-full`}></div>
          <div className={`absolute top-0 left-0 w-full h-full border-8 ${dark ? 'border-indigo-400' : 'border-indigo-500'} rounded-full animate-spin border-t-transparent`}></div>
          <div className={`absolute top-0 left-0 w-full h-full border-2 ${dark ? 'border-indigo-600' : 'border-indigo-300'} rounded-full loader-ring`}></div>
        </div>
        <div className="mt-6 text-center">
          <h2 className={`text-xl font-semibold ${dark ? 'text-white' : 'text-gray-800'} mb-2`}>Loading Profile</h2>
          <p className={`${dark ? 'text-gray-400' : 'text-gray-500'}`}>Please wait while we fetch student data...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className={`${dark ? 'bg-red-900/30' : 'bg-red-100'} rounded-full p-6`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${dark ? 'text-red-400' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="mt-6 text-center">
          <h2 className={`text-xl font-semibold ${dark ? 'text-white' : 'text-gray-800'} mb-2`}>Error Loading Data</h2>
          <p className={`${dark ? 'text-red-400' : 'text-red-500'} mb-4`}>{error}</p>
          <button 
            onClick={handleRefresh}
            className={`px-4 py-2 ${dark ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-lg shadow-lg transition-colors duration-200`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className={`${dark ? 'bg-yellow-900/30' : 'bg-yellow-100'} rounded-full p-6`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${dark ? 'text-yellow-400' : 'text-yellow-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <div className="mt-6 text-center">
          <h2 className={`text-xl font-semibold ${dark ? 'text-white' : 'text-gray-800'} mb-2`}>No Student Found</h2>
          <p className={`${dark ? 'text-gray-400' : 'text-gray-500'} mb-4`}>Could not find the requested student profile</p>
          <button 
            onClick={handleRefresh}
            className={`px-4 py-2 ${dark ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-lg shadow-lg transition-colors duration-200`}
          >
            Reload Data
          </button>
        </div>
      </div>
    );
  }    return (
    <ProtectedRoute>
      <main>
        {loading && (
          <div className={`fixed top-4 right-4 z-50 ${dark ? 'bg-indigo-600' : 'bg-indigo-600'} text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse`}>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Refreshing data...</span>
          </div>
        )}
        
        
        <ProfileView
          student={student}
          contestHistory={contestHistory}
          problemData={problemData}
          isLoading={loading}
          onRefresh={handleRefresh}
        />
      </main>
    </ProtectedRoute>
  );
}
