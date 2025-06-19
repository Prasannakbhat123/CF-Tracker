import { useState, useEffect } from 'react';
import { X, Search, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function TestHandleForm({ onClose }) {
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [serverConfig, setServerConfig] = useState(null);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [useAuth, setUseAuth] = useState(true);
  const { dark } = useTheme();

  // Check server configuration on component mount
  useEffect(() => {
    async function checkServerConfig() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/env-check`);
        if (res.ok) {
          const data = await res.json();
          setServerConfig(data);
        } else {
          setError('Could not check server configuration');
        }
      } catch (err) {
        setError('Error connecting to server: ' + err.message);
      } finally {
        setCheckingConfig(false);
      }
    }
    
    checkServerConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handle) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log(`Testing handle: ${handle}...`);
      const url = `${process.env.NEXT_PUBLIC_API_URL}/test-codeforces/${handle}${useAuth ? '?useAuth=true' : ''}`;
      const res = await fetch(url);
      
      let errorData;
      try {
        const responseText = await res.text();
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          console.error('Raw error response:', responseText);
          throw new Error(`Server error: ${res.status}. Raw response not JSON.`);
        }
      } catch (parseError) {
        throw new Error(`Server error: ${res.status}. Could not parse response.`);
      }
      
      if (!res.ok) {
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }
      
      setResult(errorData);
    } catch (err) {
      console.error('Error testing handle:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className={`relative max-w-2xl w-full rounded-lg shadow-xl ${dark ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-6 max-h-[90vh] overflow-y-auto light-text-fix dark:dark-text-fix`}
          style={{color: dark ? 'white' : 'black'}}>
        {/* Close button */}
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <X size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
        
        {/* Header */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-black dark:text-white light-text-fix dark:dark-text-fix">
            <Search className="text-[#160f60] dark:text-indigo-400" size={24} />
            Test Codeforces Handle
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Check if a Codeforces handle exists and retrieve user data
          </p>
        </div>
        
        {/* Configuration status */}
        {checkingConfig ? (
          <div className="flex items-center justify-center py-4 text-gray-700 dark:text-gray-300">
            <Loader size={20} className="animate-spin mr-2" />
            <span>Checking server configuration...</span>
          </div>
        ) : serverConfig ? (
          <div className="mb-6 p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2 text-black dark:text-white light-text-fix dark:dark-text-fix">Server Configuration</h3>
            <div className={`p-4 rounded-lg mb-3 ${
              serverConfig.requiredVariables.every(v => v.set) 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30'
            }`}>
              <p className="text-gray-800 dark:text-gray-300 mb-1">
                <span className="font-medium">.env file:</span> {serverConfig.envFileLoaded ? 'Loaded ✅' : 'Not found ❌'}
              </p>
              <p className="text-gray-800 dark:text-gray-300 mb-2">
                <span className="font-medium">Path:</span> {serverConfig.envFilePath}
              </p>
              <p className="text-gray-800 dark:text-gray-300 font-medium mb-1">Required variables:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {serverConfig.requiredVariables.map(v => (
                  <li key={v.name} className="flex items-center">
                    <span className={`${v.set ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} mr-1`}>
                      {v.set ? '✅' : '❌'}
                    </span>
                    <span className="text-gray-800 dark:text-gray-300">{v.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {!serverConfig.requiredVariables.every(v => v.set) && (
              <div className="text-red-600 dark:text-red-400 font-medium">
                <p>Please check your server .env file and restart the server!</p>
              </div>
            )}
          </div>
        ) : null}
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <input 
              type="text" 
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Enter Codeforces handle"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#160f60] dark:focus:ring-indigo-500"
            />
            <button 
              type="submit"
              disabled={loading || !handle}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md ${
                loading || !handle 
                  ? 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed' 
                  : 'bg-[#160f60] hover:bg-[#0e0940] text-white'
              } transition-colors`}
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
              Test
            </button>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center gap-2 text-gray-800 dark:text-gray-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={useAuth}
                onChange={(e) => setUseAuth(e.target.checked)}
                className="h-4 w-4 text-[#160f60] focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <span>Use API authentication (if fails, it will try without auth)</span>
            </label>
          </div>
        </form>
        
        {error && (
          <div className="p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-100 dark:border-red-800/30 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}
        
        {result && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                <h3 className="text-lg font-semibold mb-3 text-black dark:text-white light-text-fix dark:dark-text-fix">User Profile</h3>
                <div className="space-y-2">
                  <p className="text-gray-800 dark:text-gray-300">
                    <span className="font-medium">Handle:</span> {result.userData.handle}
                  </p>
                  <p className="text-gray-800 dark:text-gray-300">
                    <span className="font-medium">Rating:</span> <span className="font-bold" style={{ color: getRatingColor(result.userData.rating) }}>{result.userData.rating}</span>
                  </p>
                  <p className="text-gray-800 dark:text-gray-300">
                    <span className="font-medium">Max Rating:</span> <span className="font-bold" style={{ color: getRatingColor(result.userData.maxRating) }}>{result.userData.maxRating}</span>
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                <h3 className="text-lg font-semibold mb-3 text-black dark:text-white light-text-fix dark:dark-text-fix">Activity Summary</h3>
                <div className="space-y-2">
                  <p className="text-gray-800 dark:text-gray-300">
                    <span className="font-medium">Contests Participated:</span> {result.contestCount}
                  </p>
                  <p className="text-gray-800 dark:text-gray-300">
                    <span className="font-medium">Problems Solved:</span> {result.problemCount}
                  </p>
                  <p className="text-gray-800 dark:text-gray-300">
                    <span className="font-medium">Recent Activity:</span> {result.recentSubmissions.length > 0 ? 'Active' : 'None'}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-black dark:text-white light-text-fix dark:dark-text-fix">Recent Submissions</h3>
              {result.recentSubmissions.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Problem</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Verdict</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                      {result.recentSubmissions.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3 whitespace-nowrap text-gray-800 dark:text-gray-300">
                            {sub.problemName} ({sub.contestId}{sub.index})
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-800 dark:text-gray-300">
                            {sub.rating || 'Unrated'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`font-medium ${
                              sub.verdict === 'OK' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {sub.verdict}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-800 dark:text-gray-300">
                            {new Date(sub.time).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
                  No recent submissions found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get Codeforces rating color
function getRatingColor(rating) {
  if (!rating) return '#000000';
  if (rating < 1200) return '#808080'; // gray
  if (rating < 1400) return '#008000'; // green
  if (rating < 1600) return '#03a89e'; // cyan
  if (rating < 1900) return '#0000ff'; // blue
  if (rating < 2100) return '#aa00aa'; // violet
  if (rating < 2400) return '#ff8c00'; // orange
  return '#ff0000'; // red
}
