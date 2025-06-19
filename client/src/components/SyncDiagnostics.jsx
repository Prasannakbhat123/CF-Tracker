import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, Clock, CheckCircle, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SyncDiagnostics({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [cronStatus, setCronStatus] = useState(null);
  const [runningTest, setRunningTest] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const { dark } = useTheme();

  useEffect(() => {
    fetchCronStatus();
  }, []);

  const fetchCronStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/status`);
      if (response.ok) {
        const data = await response.json();
        setCronStatus(data);
      }
    } catch (error) {
      console.error('Error fetching cron status:', error);
    } finally {
      setLoading(false);
    }
  };

  const runDiagnosticSync = async () => {
    try {
      setRunningTest(true);
      setTestResults(null);

      // Run a manual sync
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/codeforces`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Fetch updated cron status
        await fetchCronStatus();
        
        setTestResults({
          success: data.success,
          message: data.message,
          stats: data.stats
        });
      } else {
        setTestResults({
          success: false,
          message: 'Sync failed with server error'
        });
      }
    } catch (error) {
      console.error('Error running diagnostic sync:', error);
      setTestResults({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setRunningTest(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Never';
    try {
      return new Date(date).toLocaleString();
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
          <RefreshCw className="mr-2" />
          Sync Diagnostics
        </h2>

        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className={`h-4 rounded ${dark ? 'bg-gray-700' : 'bg-gray-300'} w-3/4`}></div>
            <div className={`h-4 rounded ${dark ? 'bg-gray-700' : 'bg-gray-300'} w-1/2`}></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className="font-medium mb-2 flex items-center">
                <Clock size={16} className="mr-2" />
                Cron Job Status
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-bold flex items-center">
                    {cronStatus?.active ? 
                      <CheckCircle size={16} className="mr-1 text-green-500" /> : 
                      <AlertCircle size={16} className="mr-1 text-red-500" />}
                    {cronStatus?.active ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Run:</span>
                  <span className="font-bold">{formatDate(cronStatus?.lastRun)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Currently Running:</span>
                  <span className="font-bold flex items-center">
                    {cronStatus?.isRunning ? 
                      <RefreshCw size={16} className="mr-1 animate-spin text-blue-500" /> : 
                      <CheckCircle size={16} className="mr-1 text-green-500" />}
                    {cronStatus?.isRunning ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Current Schedule:</span>
                  <span className="font-bold">{cronStatus?.schedule || 'Default'}</span>
                </div>
              </div>
            </div>
            
            {testResults && (
              <div className={`p-4 rounded-lg ${
                testResults.success 
                  ? (dark ? 'bg-green-900/30 text-green-200' : 'bg-green-50 text-green-800')
                  : (dark ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-800')
              }`}>
                <h3 className="font-medium mb-2 flex items-center">
                  {testResults.success 
                    ? <CheckCircle size={16} className="mr-2" /> 
                    : <AlertCircle size={16} className="mr-2" />}
                  Test Results
                </h3>
                <p className="mb-2">{testResults.message}</p>
                
                {testResults.stats && (
                  <div className="text-sm mt-2">
                    <div className="flex justify-between">
                      <span>Successful syncs:</span>
                      <span className="font-bold">{testResults.stats.successCount} / {testResults.stats.total}</span>
                    </div>
                    {testResults.stats.errorCount > 0 && (
                      <div className="flex justify-between">
                        <span>Failed syncs:</span>
                        <span className="font-bold">{testResults.stats.errorCount}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={runDiagnosticSync}
              disabled={runningTest}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
                dark
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-[#160f60] hover:bg-[#221883] text-white'
              } transition-colors shadow-md ${runningTest ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {runningTest ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Running Diagnostic Sync...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Run Diagnostic Sync
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
