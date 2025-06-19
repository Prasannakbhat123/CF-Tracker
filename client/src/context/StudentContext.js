"use client"

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { getStudents, getStudent, getContestHistory, getProblemSolving } from '../services/api';

const StudentContext = createContext();

export function StudentProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cache using useRef so it doesn't trigger re-renders
  const cache = useRef({
    students: {},
    details: {},
    timestamp: {}
  });
  
  // Track ongoing requests to prevent duplicate calls
  const pendingRequests = useRef({});

  const fetchStudents = useCallback(async () => {
    // Check if we have cached data less than 2 minutes old
    const now = Date.now();
    if (cache.current.timestamp.students && (now - cache.current.timestamp.students < 2 * 60 * 1000)) {
      console.log('Using cached students list');
      return students;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching students from API');
      const data = await getStudents();
      setStudents(data);
      
      // Update cache
      cache.current.students = data;
      cache.current.timestamp.students = now;
      
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch students';
      setError(errorMsg);
      console.error('Error fetching students:', err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [students]);

  const fetchStudentDetails = useCallback(async (id) => {
    console.log(`Request to fetch details for student ${id}`);
    
    // Return ongoing request if one exists
    if (pendingRequests.current[id]) {
      console.log(`Returning pending request for student ${id}`);
      return pendingRequests.current[id];
    }
    
    // Check cache for recently fetched data (5 minute TTL)
    const now = Date.now();
    if (
      cache.current.details[id] && 
      cache.current.timestamp[id] && 
      (now - cache.current.timestamp[id] < 5 * 60 * 1000)
    ) {
      console.log(`Using cached data for student ${id}`);
      return cache.current.details[id];
    }
    
    console.log(`Fetching fresh data for student ${id}`);
    setLoading(true);
    
    // Create promise for this request
    const fetchPromise = (async () => {
      try {
        // Fetch student data in parallel
        const [student, contestHistory, problemData] = await Promise.all([
          getStudent(id),
          getContestHistory(id),
          getProblemSolving(id)
        ]);
        
        // Ensure ratings are properly formatted as numbers
        if (student) {
          student.currentRating = student.currentRating !== undefined ? Number(student.currentRating) : null;
          student.maxRating = student.maxRating !== undefined ? Number(student.maxRating) : null;
        }
        
        const result = { student, contestHistory, problemData };
        
        // Cache the result
        cache.current.details[id] = result;
        cache.current.timestamp[id] = now;
        
        return result;
      } catch (err) {
        const errorMsg = err.message || 'Failed to fetch student details';
        setError(errorMsg);
        console.error('Error fetching student details:', err);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
        // Remove from pending requests
        delete pendingRequests.current[id];
      }
    })();
    
    // Store promise in pending requests
    pendingRequests.current[id] = fetchPromise;
    
    return fetchPromise;
  }, []);

  const clearCache = useCallback(() => {
    cache.current = { students: {}, details: {}, timestamp: {} };
  }, []);

  return (
    <StudentContext.Provider value={{ 
      students, 
      setStudents, 
      loading, 
      error, 
      fetchStudents,
      fetchStudentDetails,
      clearCache
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export const useStudents = () => useContext(StudentContext);
