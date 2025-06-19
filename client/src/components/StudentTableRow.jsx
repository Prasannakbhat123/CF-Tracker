import { Edit, Trash2, Eye, RefreshCw, Bell, BellOff, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

// Codeforces rating colors
const getRatingColor = (rating, isDark = false) => {
  if (!rating) return isDark ? '#999999' : '#000000'; // Default for null/undefined
  if (rating < 1200) return isDark ? '#aaaaaa' : '#808080'; // gray
  if (rating < 1400) return '#00c000'; // green
  if (rating < 1600) return '#03a89e'; // cyan
  if (rating < 1900) return isDark ? '#4d7aff' : '#0000ff'; // blue
  if (rating < 2100) return '#aa00aa'; // violet
  if (rating < 2400) return '#ff8c00'; // orange
  return '#ff0000'; // red
};

export default function StudentTableRow({ student, setStudents, formatLastSynced }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [toggleNotif, setToggleNotif] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { dark } = useTheme();

  // Check if viewport is mobile sized
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is standard md breakpoint
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleRowClick = (e) => {
    // Only handle clicks on the row itself, not on buttons
    if (e.target.tagName.toLowerCase() !== 'button' && 
        !e.target.closest('button') && 
        isMobile) {
      setShowMobileActions(!showMobileActions);
      e.preventDefault();
      e.stopPropagation();
    }
  };
  const handleDelete = async () => {
    if (!window.confirm('Delete this student?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${student._id}`, { method: 'DELETE' });
    setStudents(students => students.filter(s => s._id !== student._id));
  };
  const handleEdit = () => {
    // Pass the student data to the parent component to handle edit modal
    if (typeof window !== 'undefined') {
      // Create a custom event with the student data
      const editEvent = new CustomEvent('editStudent', { 
        detail: { student },
        bubbles: true 
      });
      // Dispatch the event from a DOM element
      document.dispatchEvent(editEvent);
    }
  };

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${student._id}/sync`, { 
        method: 'POST'
      });
      if (res.ok) {
        // Refresh the student data
        const updatedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${student._id}`);
        const updatedStudent = await updatedRes.json();
        setStudents(students => 
          students.map(s => s._id === updatedStudent._id ? updatedStudent : s)
        );
      } else {
        alert('Failed to sync student data');
      }
    } catch (err) {
      console.error('Error syncing student data:', err);
      alert('Error syncing student data');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleNotifications = async () => {
    if (toggleNotif) return;
    
    setToggleNotif(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${student._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailNotifications: !student.emailNotifications }),
      });
      
      if (res.ok) {
        const updatedStudent = await res.json();
        setStudents(students => 
          students.map(s => s._id === updatedStudent._id ? updatedStudent : s)
        );
      } else {
        alert('Failed to update notification settings');
      }
    } catch (err) {
      console.error('Error updating notification settings:', err);
      alert('Error updating notification settings');
    } finally {
      setToggleNotif(false);
    }
  };

  const handleViewProfile = (e) => {
    if (isMobile) {
      // Prevent navigation if we're in mobile mode - show actions instead
      e.preventDefault();
      e.stopPropagation();
    } else {
      router.push(`/students/${student._id}`);
    }
  };

  // Format the rating number or show "N/A" if not available
  const formatRating = (rating) => {
    if (!rating && rating !== 0) return 'N/A';
    return rating;
  };  return (
    <>
      <tr 
        className={`${dark ? 'hover:bg-gray-800/70 bg-transparent' : 'hover:bg-gray-50'} transition-all group relative ${isMobile ? 'cursor-pointer' : ''}`}
        onClick={handleRowClick}
      >
        {/* Table cells in exact same order as the headers in StudentTable.jsx */}        <td className={`px-6 py-4 whitespace-nowrap ${dark ? 'text-white' : 'text-black'}`}>
          {student.name}
        </td>
        <td className={`px-6 py-4 whitespace-nowrap ${dark ? 'text-gray-300' : 'text-gray-800'}`}>
          {student.email}
        </td>
        <td className={`hidden md:table-cell px-6 py-4 whitespace-nowrap ${dark ? 'text-gray-300' : 'text-gray-800'}`}>
          {student.phone}
        </td>
        <td className={`px-6 py-4 whitespace-nowrap ${dark ? 'text-gray-300' : 'text-gray-800'}`}>
          {student.codeforcesHandle}
        </td>
        <td className="px-6 py-4 whitespace-nowrap font-medium" style={{ color: getRatingColor(student.currentRating, dark) }}>
          {formatRating(student.currentRating)}
        </td>
        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap font-medium" style={{ color: getRatingColor(student.maxRating, dark) }}>
          {formatRating(student.maxRating)}
        </td>
        <td className={`hidden lg:table-cell px-6 py-4 whitespace-nowrap ${dark ? 'text-gray-300' : 'text-gray-800'}`}>
          {formatLastSynced(student.lastSynced)}
        </td>
          
        {/* Floating action menu for desktop - only visible on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center shadow-lg rounded-lg py-1.5 px-2.5 border border-gray-200 dark:border-gray-700"
           style={{ backgroundColor: dark ? 'rgba(31,41,55,0.95)' : 'rgba(250,251,252,0.97)' }}>
          {/* Action buttons for desktop */}
          <span 
            title="Reminder emails sent" 
            className={`flex items-center gap-1 text-xs mr-2 ${dark ? 'text-gray-300' : 'text-gray-500'}`}
          >
            <Mail size={16} className={dark ? 'text-gray-300' : 'text-gray-500'} />
            <span className="ml-0.5">{student.remindersSent || 0}</span>
          </span>
          
          {/* Notification toggle */}
          <button 
            onClick={handleToggleNotifications} 
            title={student.emailNotifications ? "Disable email notifications" : "Enable email notifications"}
            disabled={toggleNotif}
            className={`p-1.5 rounded-full cursor-pointer ${toggleNotif ? 'opacity-50' : 'opacity-100'} ${
              student.emailNotifications 
                ? `${dark ? 'text-green-400 hover:bg-green-900/50' : 'text-green-600 hover:bg-green-100'}`
                : `${dark ? 'text-red-400 hover:bg-red-900/50' : 'text-red-600 hover:bg-red-100'}`
            }`}
          >
            {student.emailNotifications ? <Bell size={16} /> : <BellOff size={16} />}
          </button>
          
          <button 
            onClick={handleViewProfile} 
            title="View profile"
            className={`p-1.5 rounded-full cursor-pointer ${dark ? 'text-indigo-400 hover:bg-indigo-900/50' : 'text-[#160f60] hover:bg-indigo-100'}`}
          >
            <Eye size={16} />
          </button>
          
          <button 
            onClick={handleEdit} 
            title="Edit student"
            className={`p-1.5 rounded-full cursor-pointer ${dark ? 'text-blue-400 hover:bg-blue-900/50' : 'text-blue-600 hover:bg-blue-100'}`}
          >
            <Edit size={16} />
          </button>
          
          <button 
            onClick={handleDelete} 
            title="Delete student"
            className={`p-1.5 rounded-full cursor-pointer ${dark ? 'text-red-400 hover:bg-red-900/50' : 'text-red-600 hover:bg-red-100'}`}
          >
            <Trash2 size={16} />
          </button>
          
          <button 
            onClick={handleSync} 
            title="Sync Codeforces data" 
            disabled={syncing}
            className={`p-1.5 rounded-full cursor-pointer ${
              syncing ? 'opacity-50' : 'opacity-100'
            } ${dark ? 'text-indigo-400 hover:bg-indigo-900/50' : 'text-[#160f60] hover:bg-indigo-100'}`}
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          </button>
        </div>
      </tr>
      
      {/* Mobile action row - only displayed when row is clicked on mobile */}
      {showMobileActions && isMobile && (
        <tr className={`${dark ? 'bg-gray-900/30' : 'bg-gray-50/90'} md:hidden`}>
          <td colSpan="5" className="px-6 py-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span 
                className={`flex items-center gap-1 text-xs ${dark ? 'text-gray-300' : 'text-gray-500'}`}
              >
                <Mail size={16} className={dark ? 'text-gray-300' : 'text-gray-500'} />
                <span className="ml-0.5">{student.remindersSent || 0} reminders</span>
              </span>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleToggleNotifications} 
                  disabled={toggleNotif}
                  className={`p-2 rounded-lg cursor-pointer flex items-center gap-1 ${
                    student.emailNotifications 
                      ? `${dark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`
                      : `${dark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'}`
                  }`}
                >
                  {student.emailNotifications ? <Bell size={16} /> : <BellOff size={16} />}
                  <span className="text-xs">{student.emailNotifications ? 'Notifications On' : 'Notifications Off'}</span>
                </button>
                
                <button 
                  onClick={() => router.push(`/students/${student._id}`)} 
                  className={`p-2 rounded-lg cursor-pointer flex items-center gap-1 ${
                    dark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-[#160f60]'
                  }`}
                >
                  <Eye size={16} />
                  <span className="text-xs">View</span>
                </button>
                
                <button 
                  onClick={handleEdit} 
                  className={`p-2 rounded-lg cursor-pointer flex items-center gap-1 ${
                    dark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  <Edit size={16} />
                  <span className="text-xs">Edit</span>
                </button>
                
                <button 
                  onClick={handleDelete} 
                  className={`p-2 rounded-lg cursor-pointer flex items-center gap-1 ${
                    dark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
                  }`}
                >
                  <Trash2 size={16} />
                  <span className="text-xs">Delete</span>
                </button>
                
                <button 
                  onClick={handleSync} 
                  disabled={syncing}
                  className={`p-2 rounded-lg cursor-pointer flex items-center gap-1 ${
                    syncing ? 'opacity-50' : 'opacity-100'
                  } ${dark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-[#160f60]'}`}
                >
                  <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                  <span className="text-xs">Sync</span>
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
