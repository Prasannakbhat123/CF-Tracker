import { RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function DataSyncStatus({ lastSynced }) {
  const { dark } = useTheme();
  
  return (
    <div className="flex items-center gap-2">
      <RefreshCw size={16} className={dark ? "text-indigo-400" : "text-[#160f60]"} />
      <span className="text-gray-800 dark:text-gray-300">
        Last Synced: {lastSynced ? new Date(lastSynced).toLocaleString() : 'Never'}
      </span>
    </div>
  );
}
