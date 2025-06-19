import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function ConfigCheck() {
  const [configStatus, setConfigStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkConfig() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/config-check`);
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        const data = await res.json();
        setConfigStatus(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    checkConfig();
  }, []);

  if (loading) {
    return <div>Checking configuration...</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
        <AlertTriangle /> Failed to check configuration: {error}
      </div>
    );
  }

  const hasIssues = !configStatus.apiCredentials.keyConfigured || 
                   !configStatus.apiCredentials.secretConfigured ||
                   !configStatus.mongodb.uriConfigured;

  return (
    <div style={{ 
      padding: '10px', 
      border: `1px solid ${hasIssues ? 'red' : 'green'}`,
      borderRadius: '4px',
      backgroundColor: hasIssues ? '#fff8f8' : '#f8fff8'
    }}>
      <h3>Server Configuration Status</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>
          {configStatus.envFileLoaded ? 
            <CheckCircle color="green" size={16} /> : 
            <XCircle color="red" size={16} />} 
          Environment file loaded: {configStatus.envFileLoaded ? 'Yes' : 'No'}
        </li>
        <li>
          {configStatus.apiCredentials.keyConfigured ? 
            <CheckCircle color="green" size={16} /> : 
            <XCircle color="red" size={16} />} 
          Codeforces API Key: {configStatus.apiCredentials.keyConfigured ? 'Configured' : 'Missing'}
        </li>
        <li>
          {configStatus.apiCredentials.secretConfigured ? 
            <CheckCircle color="green" size={16} /> : 
            <XCircle color="red" size={16} />} 
          Codeforces API Secret: {configStatus.apiCredentials.secretConfigured ? 'Configured' : 'Missing'}
        </li>
        <li>
          {configStatus.mongodb.uriConfigured ? 
            <CheckCircle color="green" size={16} /> : 
            <XCircle color="red" size={16} />} 
          MongoDB URI: {configStatus.mongodb.uriConfigured ? 'Configured' : 'Missing'}
        </li>
      </ul>

      {hasIssues && (
        <div style={{ marginTop: '10px', color: 'red' }}>
          <AlertTriangle /> Configuration issues detected. Please check your server .env file.
        </div>
      )}
    </div>
  );
}
