import { RefreshCw, User, Mail, Phone, Code, Trophy, Clock, Bell, BarChart2, Calendar, ArrowUp, AlertTriangle, ChevronUp, Settings, ArrowLeft } from 'lucide-react';
import ContestHistory from './ContestHistory';
import ProblemSolvingData from './ProblemSolvingData';
import DataSyncStatus from './DataSyncStatus';
import InactivityInfo from './InactivityInfo';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import CronSettings from './CronSettings';
import { useRouter } from 'next/navigation';

// Codeforces rating colors
const getRatingColor = (rating, isDark = false) => {
  if (!rating) return isDark ? '#999999' : '#000000';
  if (rating < 1200) return isDark ? '#aaaaaa' : '#808080'; // gray
  if (rating < 1400) return '#00c000'; // green
  if (rating < 1600) return '#03a89e'; // cyan
  if (rating < 1900) return isDark ? '#4d7aff' : '#0000ff'; // blue
  if (rating < 2100) return '#aa00aa'; // violet
  if (rating < 2400) return '#ff8c00'; // orange
  return '#ff0000'; // red
};

// Get Codeforces rank name based on rating
const getRankName = (rating) => {
  if (!rating) return 'Unrated';
  if (rating < 1200) return 'Newbie';
  if (rating < 1400) return 'Pupil';
  if (rating < 1600) return 'Specialist';
  if (rating < 1900) return 'Expert';
  if (rating < 2100) return 'Candidate Master';
  if (rating < 2400) return 'Master';
  if (rating < 2600) return 'International Master';
  if (rating < 3000) return 'Grandmaster';
  return 'International Grandmaster';
};

export default function ProfileView({ student, contestHistory, problemData, isLoading, onRefresh }) {
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState('contests');
  const [showSyncSettings, setShowSyncSettings] = useState(false);
  const [navigatingToDashboard, setNavigatingToDashboard] = useState(false);
  const router = useRouter();
  
  // Check if we have actual data to display
  const hasContestData = Array.isArray(contestHistory) && contestHistory.length > 0;
  const hasProblemData = Array.isArray(problemData) && problemData.length > 0;
  
  // Format the date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      
      // Format: May 25, 2025, 3:45 PM
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      
      return date.toLocaleString('en-US', options);
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffSec < 60) return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
      if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
      if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
      if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
      
      const diffMonth = Math.floor(diffDay / 30);
      if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
      
      const diffYear = Math.floor(diffMonth / 12);
      return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`;
    } catch (e) {
      return 'Invalid date';
    }
  };
    // Format rating with color and rank name
  const formatRating = (rating) => {
    const displayRating = (rating || rating === 0) ? rating : 'N/A';
    const rankName = getRankName(rating);
    
    return (
      <div className="flex items-center flex-wrap gap-2">
        <span className="font-semibold text-xl" style={{ color: getRatingColor(rating, dark) }}>
          {displayRating}
        </span>
        {rating && (
          <span className="text-xs px-2 py-1 rounded-full shadow-sm whitespace-nowrap" 
                style={{ 
                  backgroundColor: getRatingColor(rating, dark),
                  color: rating >= 1600 ? 'white' : 'black',
                }}>
            {rankName}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`w-full ${dark ? 'text-white' : 'text-gray-800'}`}>
      {/* Navbar */}
      <Navbar onOpenSyncSettings={() => setShowSyncSettings(true)} />
      
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">        {/* Back button */}        <div className="mb-4">
          <button 
            onClick={() => {
              setNavigatingToDashboard(true);
              // Add a small delay to show loading state before navigation
              setTimeout(() => router.push('/'), 100);
            }}
            disabled={navigatingToDashboard}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              dark ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${navigatingToDashboard ? 'opacity-80' : ''}`}
          >
            {navigatingToDashboard ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                <span>Navigating to Dashboard...</span>
              </>
            ) : (
              <>
                <ArrowLeft size={18} />
                <span>Back to Dashboard</span>
              </>
            )}
          </button>
        </div>
        
        {/* Profile header */}
        <div className={`rounded-2xl shadow-lg overflow-hidden mb-6 ${dark ? 'bg-gray-850 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="relative">
            {/* Profile info section */}
            <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'} mb-1 flex items-center gap-2`}>
                  <User size={22} className={dark ? 'text-indigo-300' : 'text-indigo-600'} />
                  {student.name}
                  <span className={`ml-1 text-base font-medium ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                    ({student.codeforcesHandle})
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 mt-4">
                  <div className="flex items-center gap-2">
                    <Mail size={18} className={dark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={dark ? 'text-gray-300' : 'text-gray-600'}>
                      {student.email}
                    </span>
                  </div>
                  
                  {student.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={18} className={dark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={dark ? 'text-gray-300' : 'text-gray-600'}>
                      {student.phone}
                    </span>
                  </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Code size={18} className={dark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={dark ? 'text-gray-300' : 'text-gray-600'}>
                      {student.codeforcesHandle}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Trophy size={18} className={dark ? 'text-amber-400' : 'text-amber-600'} />
                    <span className="font-medium">Current Rating:</span>
                    {formatRating(student.currentRating)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ArrowUp size={18} className={dark ? 'text-emerald-400' : 'text-emerald-600'} />
                    <span className="font-medium">Max Rating:</span>
                    {formatRating(student.maxRating)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock size={18} className={dark ? 'text-blue-400' : 'text-blue-600'} />
                    <span className="font-medium">Last Synced:</span>
                    <span>{formatTimeAgo(student.lastSynced)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Bell size={18} className={student.emailNotifications 
                      ? (dark ? 'text-green-400' : 'text-green-600') 
                      : (dark ? 'text-red-400' : 'text-red-600')} 
                    />
                    <span className="font-medium">Notifications:</span>
                    <span className={student.emailNotifications 
                      ? (dark ? 'text-green-400' : 'text-green-600') 
                      : (dark ? 'text-red-400' : 'text-red-600')}
                    >
                      {student.emailNotifications ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  {student.remindersSent > 0 && (
                    <div className="flex items-center gap-2">
                      <Mail size={18} className={dark ? 'text-indigo-400' : 'text-indigo-600'} />
                      <span className="font-medium">Reminders Sent:</span>
                      <span>{student.remindersSent}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions section */}
              <div>                <button 
                  onClick={onRefresh} 
                  disabled={isLoading}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-all border cursor-pointer ${
                    dark
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-700 disabled:bg-indigo-800/50 disabled:text-indigo-300'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 disabled:bg-indigo-300'
                  } disabled:cursor-not-allowed [&>*]:p-0 [&>*]:m-0 [&>*]:inline-flex`}
                >
                  <RefreshCw size={16} className={`${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>
          </div>        </div>
        
        {/* Tabs */}
        <div className="mb-6">
          <div className={`flex border-b ${dark ? 'border-gray-700' : 'border-gray-200'} mb-4`}>            <button 
              onClick={() => setActiveTab('contests')}
              className={`px-4 py-2 font-medium -mb-px bg-transparent hover:bg-transparent cursor-pointer [&>*]:p-0 [&>*]:m-0 ${
                activeTab === 'contests'
                  ? dark 
                    ? 'text-indigo-400 border-b-2 border-indigo-500' 
                    : 'text-indigo-600 border-b-2 border-indigo-600'
                  : dark 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Contest History
            </button>
            <button 
              onClick={() => setActiveTab('problems')}
              className={`px-4 py-2 font-medium -mb-px bg-transparent hover:bg-transparent cursor-pointer [&>*]:p-0 [&>*]:m-0 ${
                activeTab === 'problems'
                  ? dark 
                    ? 'text-indigo-400 border-b-2 border-indigo-500' 
                    : 'text-indigo-600 border-b-2 border-indigo-600'
                  : dark 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Problem Solving
            </button>
          </div>
          
          {/* Tab content */}
          <div className={`rounded-xl shadow-md overflow-hidden ${
            dark ? 'bg-gray-850 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            {activeTab === 'contests' ? (
              hasContestData ? (
                <div className="p-4">
                  <ContestHistory contests={contestHistory} />
                </div>
              ) : (
                <div className={`p-8 text-center ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                  <h3 className={`text-lg font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>No Contest History</h3>
                  <p>No contest history available for this student</p>
                </div>
              )
            ) : (
              hasProblemData ? (
                <div className="p-4">
                  <ProblemSolvingData problems={problemData} />
                </div>
              ) : (
                <div className={`p-8 text-center ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <BarChart2 size={48} className="mx-auto mb-4 opacity-30" />
                  <h3 className={`text-lg font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>No Problem Data</h3>
                  <p>No problem solving data available for this student</p>
                </div>
              )
            )}
          </div>
        </div>
          {/* Last Sync Status */}
        <div className={`mb-6 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6`}>
          <div>
            <DataSyncStatus lastSynced={student.lastSynced} />
          </div>
          {/* <div>
            <InactivityInfo studentId={student._id} />
          </div> */}
        </div>
        
        {/* Inactivity Monitoring */}
        <div className={`mb-6 mt-6 col-span-1 sm:col-span-2 lg:col-span-2`}>
          <InactivityInfo studentId={student._id} />
        </div>
      </div>
      
      {/* Sync Settings Modal */}
      {showSyncSettings && <CronSettings onClose={() => setShowSyncSettings(false)} />}
    </div>
  );
}