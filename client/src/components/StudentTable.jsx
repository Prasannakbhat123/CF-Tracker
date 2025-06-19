import StudentTableRow from './StudentTableRow';
import { Plus, Download, Settings, Search, Mail } from 'lucide-react'; 
import { useState, useEffect } from 'react';
import StudentForm from './StudentForm';
import CronSettings from './CronSettings';
import TestHandleForm from './TestHandleForm';
import InactivitySettings from './InactivitySettings';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../context/ThemeContext';

export default function StudentTable({ students, setStudents }) {
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTestHandle, setShowTestHandle] = useState(false);
  const [showInactivitySettings, setShowInactivitySettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentToEdit, setStudentToEdit] = useState(null);
  const { dark } = useTheme();

  // Listen for edit events
  useEffect(() => {
    const handleEditEvent = (event) => {
      setStudentToEdit(event.detail.student);
      setShowForm(true);
    };

    document.addEventListener('editStudent', handleEditEvent);
    
    // Cleanup
    return () => {
      document.removeEventListener('editStudent', handleEditEvent);
    };
  }, []);

  const handleAdd = () => {
    setStudentToEdit(null); // Reset any previous edit state
    setShowForm(true);
  };
  
  const handleFormClose = () => {
    setShowForm(false);
    setStudentToEdit(null);
  };
  
  const handleSettings = () => setShowSettings(true);
  const handleSettingsClose = () => setShowSettings(false);
  const handleTestHandle = () => setShowTestHandle(true);
  const handleTestHandleClose = () => setShowTestHandle(false);
  const handleInactivitySettings = () => setShowInactivitySettings(true);
  const handleInactivitySettingsClose = () => setShowInactivitySettings(false);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.codeforcesHandle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = () => {
    // Simple CSV export
    const headers = ['Name', 'Email', 'Phone', 'Codeforces Handle', 'Current Rating', 'Max Rating'];
    const rows = students.map(s =>
      [s.name, s.email, s.phone, s.codeforcesHandle, s.currentRating, s.maxRating].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format the last synced time as "X time ago"
  const formatLastSynced = (date) => {
    if (!date) return 'Never';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <section className="w-full">
      {/* Header with actions and search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAdd}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer ${
              dark
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-[#160f60] hover:bg-[#221883] text-white'
            } transition-colors shadow-md`}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Student</span>
            <span className="sm:hidden">Add</span>
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleSettings}
              className={`flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-lg cursor-pointer ${
                dark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-white hover:bg-gray-50 text-[#160f60] border border-[#160f60]/30'
              } transition-colors shadow-sm`}
              title="Sync Settings"
            >
              <Settings size={18} />
              <span className="hidden sm:inline ml-1">Sync Settings</span>
            </button>
            
            {/* <button
              onClick={handleTestHandle}
              className={`flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-lg ${
                dark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-white hover:bg-gray-50 text-[#160f60] border border-[#160f60]/30'
              } transition-colors shadow-sm`}
              title="Test CF Handle"
            >
              <Search size={18} />
              <span className="hidden sm:inline ml-1">Test Handle</span>
            </button> */}
            
            <button
              onClick={handleInactivitySettings}
              className={`flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-lg cursor-pointer ${
                dark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-white hover:bg-gray-50 text-[#160f60] border border-[#160f60]/30'
              } transition-colors shadow-sm`}
              title="Inactivity Monitoring"
            >
              <Mail size={18} />
              <span className="hidden sm:inline ml-1">Inactivity</span>
            </button>
            
            <button
              onClick={handleDownload}
              className={`flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-lg cursor-pointer ${
                dark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-white hover:bg-gray-50 text-[#160f60] border border-[#160f60]/30'
              } transition-colors shadow-sm`}
              title="Download CSV"
            >
              <Download size={18} />
              <span className="hidden sm:inline ml-1">Export</span>
            </button>
          </div>
        </div>
        
        {/* Search input */}
        <div className={`relative w-full md:w-64 ${dark ? 'text-white' : 'text-black'}`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className={`${dark ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              dark 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-indigo-500'
                : 'bg-white border-gray-300 text-black placeholder-gray-500 focus:border-[#160f60]'
            } focus:outline-none focus:ring-1 ${
              dark ? 'focus:ring-indigo-500' : 'focus:ring-[#160f60]'
            } transition-colors`}
          />
        </div>
      </div>      {/* Table container with shadows and rounded corners */}      <div className={`overflow-hidden rounded-xl ${dark ? 'bg-gray-850' : 'bg-white'} shadow-xl border ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${dark ? 'divide-gray-700' : 'divide-gray-200'} relative`}>
            <thead className={`${dark ? 'bg-gray-900/60' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${dark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Name</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${dark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Email</th>
                <th className={`hidden md:table-cell px-6 py-4 text-left text-xs font-semibold ${dark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Phone</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${dark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>CF Handle</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${dark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Rating</th>
                <th className={`hidden md:table-cell px-6 py-4 text-left text-xs font-semibold ${dark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Max</th>
                <th className={`hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold ${dark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Last Synced</th>
              </tr>
            </thead>
            <tbody className={`${dark ? 'bg-gray-850' : ''} divide-y ${dark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredStudents.map(student => (
                <StudentTableRow
                  key={student._id}
                  student={student}
                  setStudents={setStudents}
                  formatLastSynced={formatLastSynced}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
        {showForm && (
        <StudentForm 
          onClose={handleFormClose} 
          setStudents={setStudents} 
          initialData={studentToEdit} 
        />
      )}
      {showSettings && <CronSettings onClose={handleSettingsClose} />}
      {showTestHandle && <TestHandleForm onClose={handleTestHandleClose} />}
      {showInactivitySettings && <InactivitySettings onClose={handleInactivitySettingsClose} />}
    </section>
  );
}