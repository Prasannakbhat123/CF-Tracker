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
    <div className={`min-h-screen ${dark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Navbar */}
      <Navbar onOpenSyncSettings={() => setShowSyncSettings(true)} />
      
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <button 
            onClick={() => {
              setNavigatingToDashboard(true);
              setTimeout(() => router.push('/'), 100);
            }}
            disabled={navigatingToDashboard}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              dark ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            } ${navigatingToDashboard ? 'opacity-80' : ''} shadow-sm border ${dark ? 'border-gray-700' : 'border-gray-200'}`}
          >
            {navigatingToDashboard ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
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

        {/* Profile Header Card */}
        <div className={`rounded-2xl shadow-lg overflow-hidden mb-8 ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="p-6 lg:p-8">
            {/* Header with name and action button */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center ${dark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>
                  <User size={32} className="lg:w-10 lg:h-10" />
                </div>
                <div>
                  <h1 className={`text-3xl lg:text-4xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                    {student.name}
                  </h1>
                  <p className={`text-lg lg:text-xl ${dark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                    @{student.codeforcesHandle}
                  </p>
                </div>
              </div>
              
              {/* Refresh Button */}
              <div className="flex-shrink-0">
                <button 
                  onClick={onRefresh} 
                  disabled={isLoading}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg shadow-md transition-all border ${
                    dark
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-700 disabled:bg-indigo-800/50 disabled:text-indigo-300'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 disabled:bg-indigo-300'
                  } disabled:cursor-not-allowed`}
                >
                  <RefreshCw size={18} className={`${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>

            {/* Info Grid - Responsive layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Information */}
              <div>
                <h3 className={`text-sm uppercase font-semibold mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'} tracking-wider`}>
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className={`${dark ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`} />
                    <span className={`${dark ? 'text-gray-300' : 'text-gray-700'} break-all`}>
                      {student.email}
                    </span>
                  </div>
                  
                  {student.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={18} className={`${dark ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`} />
                      <span className={`${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {student.phone}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Code size={18} className={`${dark ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`} />
                    <span className={`${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {student.codeforcesHandle}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Codeforces Stats */}
              <div>
                <h3 className={`text-sm uppercase font-semibold mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'} tracking-wider`}>
                  Codeforces Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Trophy size={18} className={`${dark ? 'text-amber-400' : 'text-amber-600'} flex-shrink-0`} />
                    <div>
                      <span className="font-medium block text-sm">Current Rating</span>
                      {formatRating(student.currentRating)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <ArrowUp size={18} className={`${dark ? 'text-emerald-400' : 'text-emerald-600'} flex-shrink-0`} />
                    <div>
                      <span className="font-medium block text-sm">Max Rating</span>
                      {formatRating(student.maxRating)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* System Information */}
              <div>
                <h3 className={`text-sm uppercase font-semibold mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'} tracking-wider`}>
                  System Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className={`${dark ? 'text-blue-400' : 'text-blue-600'} flex-shrink-0`} />
                    <div>
                      <span className="font-medium block text-sm">Last Synced</span>
                      <span className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatTimeAgo(student.lastSynced)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Bell size={18} className={`${student.emailNotifications 
                      ? (dark ? 'text-green-400' : 'text-green-600') 
                      : (dark ? 'text-red-400' : 'text-red-600')} flex-shrink-0`} 
                    />
                    <div>
                      <span className="font-medium block text-sm">Email Notifications</span>
                      <span className={`text-sm ${student.emailNotifications 
                        ? (dark ? 'text-green-400' : 'text-green-600') 
                        : (dark ? 'text-red-400' : 'text-red-600')}`}
                      >
                        {student.emailNotifications ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  
                  {student.remindersSent > 0 && (
                    <div className="flex items-center gap-3">
                      <Mail size={18} className={`${dark ? 'text-indigo-400' : 'text-indigo-600'} flex-shrink-0`} />
                      <div>
                        <span className="font-medium block text-sm">Reminders Sent</span>
                        <span className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {student.remindersSent}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Section */}
        <div className="mb-8">
          <div className={`flex border-b ${dark ? 'border-gray-700' : 'border-gray-200'} mb-6`}>
            <button 
              onClick={() => setActiveTab('contests')}
              className={`px-6 py-3 font-medium text-lg -mb-px transition-colors ${
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
              className={`px-6 py-3 font-medium text-lg -mb-px transition-colors ${
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
          
          {/* Tab Content */}
          <div className={`rounded-xl shadow-lg overflow-hidden ${
            dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            {activeTab === 'contests' ? (
              hasContestData ? (
                <div className="p-6">
                  <ContestHistory contests={contestHistory} />
                </div>
              ) : (
                <div className={`p-12 text-center ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar size={64} className="mx-auto mb-6 opacity-30" />
                  <h3 className={`text-xl font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                    No Contest History
                  </h3>
                  <p className="text-lg">No contest history available for this student</p>
                </div>
              )
            ) : (
              hasProblemData ? (
                <div className="p-6">
                  <ProblemSolvingData problems={problemData} />
                </div>
              ) : (
                <div className={`p-12 text-center ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <BarChart2 size={64} className="mx-auto mb-6 opacity-30" />
                  <h3 className={`text-xl font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                    No Problem Data
                  </h3>
                  <p className="text-lg">No problem solving data available for this student</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom Section - Status and Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DataSyncStatus lastSynced={student.lastSynced} />
          <InactivityInfo studentId={student._id} />
        </div>
      </div>
      
      {/* Sync Settings Modal */}
      {showSyncSettings && <CronSettings onClose={() => setShowSyncSettings(false)} />}
    </div>
  );
}
