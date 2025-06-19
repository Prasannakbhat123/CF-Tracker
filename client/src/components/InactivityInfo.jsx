import { useState, useEffect } from 'react';
import { Calendar, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

export default function InactivityInfo({ studentId }) {
  const [loading, setLoading] = useState(true);
  const [problemData, setProblemData] = useState([]);
  const [student, setStudent] = useState(null);
  const { dark } = useTheme();

  useEffect(() => {
    if (studentId) {
      fetchData();
    }
  }, [studentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch student data
      const studentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}`);
      const studentData = await studentRes.json();
      
      // Fetch problem solving data
      const problemsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}/problems`);
      const problemsData = await problemsRes.json();
      
      setStudent(studentData);
      setProblemData(problemsData);
    } catch (error) {
      console.error('Error fetching student activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailNotifications: !student.emailNotifications }),
      });
      
      if (res.ok) {
        const updatedStudent = await res.json();
        setStudent(updatedStudent);
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  // Calculate inactivity information
  const getInactivityInfo = () => {
    if (!problemData.length) {
      return {
        inactive: true,
        lastActive: null,
        daysSinceActive: 'Never active'
      };
    }

    // Sort by date (newest first)
    const sortedProblems = [...problemData].sort((a, b) => 
      new Date(b.dateSolved) - new Date(a.dateSolved)
    );
    
    const lastActivity = sortedProblems[0]?.dateSolved;
    
    if (!lastActivity) return { inactive: true, lastActive: null, daysSinceActive: 'No data' };
    
    const lastActiveDate = new Date(lastActivity);
    const now = new Date();
    const diffTime = Math.abs(now - lastActiveDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      inactive: diffDays >= 7,
      lastActive: lastActiveDate,
      daysSinceActive: diffDays
    };
  };

  const inactivityInfo = getInactivityInfo();

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Never';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className={`p-4 rounded-lg ${dark ? 'bg-gray-800' : 'bg-gray-50'} animate-pulse`}>
        <div className="h-4 w-3/4 bg-gray-400 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-400 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-lg ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Mail className="mr-2" /> 
        Inactivity Monitoring
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <Clock size={18} className="mr-2" />
            Last Activity:
          </span>
          <span className={`font-medium ${inactivityInfo.inactive ? 'text-red-500' : 'text-green-500'}`}>
            {formatDate(inactivityInfo.lastActive)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <Calendar size={18} className="mr-2" />
            Days Since Activity:
          </span>
          <span className={`font-medium ${inactivityInfo.inactive ? 'text-red-500' : 'text-green-500'}`}>
            {typeof inactivityInfo.daysSinceActive === 'number' 
              ? `${inactivityInfo.daysSinceActive} ${inactivityInfo.daysSinceActive === 1 ? 'day' : 'days'}`
              : inactivityInfo.daysSinceActive}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <Mail size={18} className="mr-2" />
            Reminder Emails Sent:
          </span>
          <span className="font-medium">
            {student?.remindersSent || 0}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            {student?.emailNotifications 
              ? <CheckCircle size={18} className="mr-2 text-green-500" /> 
              : <XCircle size={18} className="mr-2 text-red-500" />}
            Email Notifications:
          </span>
          <button
            onClick={toggleNotifications}
            className={`px-3 py-1 text-sm rounded-full ${
              student?.emailNotifications
                ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700'
                : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700'
            }`}
          >
            {student?.emailNotifications ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>
      
      {inactivityInfo.inactive && (
        <div className={`mt-4 p-3 rounded-lg ${dark ? 'bg-yellow-800/30 text-yellow-200' : 'bg-yellow-50 text-yellow-800'}`}>
          <p className="text-sm flex items-start">
            <span className="mr-2 mt-0.5">⚠️</span>
            {student?.emailNotifications 
              ? 'This student will receive a reminder email during the next sync.'
              : 'This student is inactive but has email reminders disabled.'}
          </p>
        </div>
      )}
    </div>
  );
}
