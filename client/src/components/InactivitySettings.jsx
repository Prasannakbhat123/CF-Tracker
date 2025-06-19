import { useState, useEffect } from 'react';
import { X, Info, Calendar, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function InactivitySettings({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    inactiveCount: 0,
    totalEmails: 0,
    lastRun: null
  });
  const { dark } = useTheme();

  useEffect(() => {
    fetchInactivityStats();
  }, []);

  const fetchInactivityStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inactivity/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching inactivity stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const runInactivityCheck = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inactivity/check`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchInactivityStats(); // Refresh the stats after running the check
        alert('Inactivity check completed successfully!');
      } else {
        throw new Error('Failed to run inactivity check');
      }
    } catch (error) {
      alert('Error running inactivity check: ' + error.message);
      console.error('Error running inactivity check:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`relative w-full max-w-md p-6 rounded-xl shadow-2xl ${dark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 rounded-full p-1 ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <Mail className="mr-2" />
          Inactivity Monitoring
        </h2>

        <div className={`rounded-lg p-4 mb-6 ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center mb-2">
            <Info size={18} className="mr-2 text-blue-500" />
            <p className="text-sm">
              Students who don't solve problems for 7+ days will receive automatic reminder emails.
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className={`p-4 rounded-lg ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h3 className="font-medium mb-2">Inactivity Statistics</h3>
            
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className={`h-4 rounded ${dark ? 'bg-gray-700' : 'bg-gray-300'} w-3/4`}></div>
                <div className={`h-4 rounded ${dark ? 'bg-gray-700' : 'bg-gray-300'} w-1/2`}></div>
                <div className={`h-4 rounded ${dark ? 'bg-gray-700' : 'bg-gray-300'} w-2/3`}></div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Currently inactive students:</span>
                  <span className="font-bold">{stats.inactiveCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total reminder emails sent:</span>
                  <span className="font-bold">{stats.totalEmails}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last check run:</span>
                  <span className="font-bold">{formatDate(stats.lastRun)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm">
            <Calendar size={16} className="mr-1" />
            <span>Checked during daily sync</span>
          </div>
          
          <button 
            onClick={runInactivityCheck}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              dark
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-[#160f60] hover:bg-[#221883] text-white'
            } transition-colors shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : 'Run Check Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
