import { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function Heatmap({ problems }) {
  const { dark } = useTheme();
  
  // Group by date (YYYY-MM-DD)
  const dateCounts = useMemo(() => {
    const counts = {};
    problems.forEach(p => {
      const date = new Date(p.dateSolved).toISOString().slice(0, 10);
      counts[date] = (counts[date] || 0) + 1;
    });
    return counts;
  }, [problems]);

  // Find the max count for scaling colors
  const maxCount = useMemo(() => {
    return Math.max(1, ...Object.values(dateCounts));
  }, [dateCounts]);

  // Generate last 90 days
  const days = useMemo(() => {
    const result = [];
    const now = new Date();
    
    // First, find the day of week (0 = Sunday, 6 = Saturday)
    const currentDayOfWeek = now.getDay();
    
    // Calculate days to generate
    const daysToGenerate = 91 + (6 - currentDayOfWeek); // 91 days plus extra days to make sure we have full weeks
    
    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
      
      result.push({ 
        date: key, 
        count: dateCounts[key] || 0, 
        dayOfWeek, 
        isToday: i === 0 
      });
    }
    
    return result;
  }, [dateCounts]);
  
  // Format date for tooltip
  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Calculate color based on count
  const getColor = (count, isToday = false) => {
    if (count === 0) {
      return dark 
        ? isToday ? 'rgba(55, 65, 81, 0.8)' : 'rgba(55, 65, 81, 0.5)' // gray-700 with alpha 
        : isToday ? 'rgba(229, 231, 235, 1)' : 'rgba(229, 231, 235, 0.7)'; // gray-200 with alpha
    }
    
    // For dark mode
    if (dark) {
      if (count < maxCount * 0.25) return 'rgba(6, 182, 212, 0.4)';  // cyan-500 with low alpha
      if (count < maxCount * 0.5) return 'rgba(6, 182, 212, 0.6)';   // cyan-500 with medium alpha
      if (count < maxCount * 0.75) return 'rgba(6, 182, 212, 0.8)';  // cyan-500 with high alpha
      return 'rgba(6, 182, 212, 1)';                                // cyan-500 full opacity
    }
    
    // For light mode
    if (count < maxCount * 0.25) return 'rgba(14, 165, 233, 0.3)';   // sky-500 with low alpha
    if (count < maxCount * 0.5) return 'rgba(14, 165, 233, 0.5)';    // sky-500 with medium alpha
    if (count < maxCount * 0.75) return 'rgba(14, 165, 233, 0.7)';   // sky-500 with high alpha
    return 'rgba(14, 165, 233, 0.9)';                               // sky-500 with very high alpha
  };
  
  // Group days by week for grid layout
  const weeks = useMemo(() => {
    const result = [];
    let week = [];
    
    // Generate day labels (Sun, Mon, etc.)
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Arrange days into weeks
    days.forEach((day, index) => {
      // Start new week on Sunday or at beginning
      if (day.dayOfWeek === 0 || index === 0) {
        if (week.length > 0) {
          result.push(week);
        }
        week = [];
      }
      
      // Fill in any missing days at start of first week
      if (index === 0 && day.dayOfWeek !== 0) {
        for (let i = 0; i < day.dayOfWeek; i++) {
          week.push(null); // Empty cell placeholder
        }
      }
      
      week.push(day);
      
      // Push the last week
      if (index === days.length - 1) {
        result.push(week);
      }
    });
    
    return { dayLabels, weeks: result };
  }, [days]);

  return (
    <div className="w-full">
      <div className="flex flex-col">
        {/* Day of week labels */}
        <div className="grid grid-cols-7 mb-1 text-xs">
          {weeks.dayLabels.map((label, i) => (
            <div key={label} className={`h-6 flex items-center justify-center ${i === 0 || i === 6 ? 'text-gray-400' : dark ? 'text-gray-400' : 'text-gray-500'}`}>
              {label}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-1 gap-2">
          {weeks.weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => (
                day === null ? (
                  <div key={`empty-${dayIndex}`} className="h-4 w-4"></div>
                ) : (
                  <div
                    key={day.date}
                    title={`${formatDate(day.date)}: ${day.count} solved`}
                    className={`h-4 w-4 rounded-sm transition-colors duration-150 ${
                      day.isToday ? 'ring-1 ring-offset-1 ring-opacity-50 ' + (dark ? 'ring-cyan-400' : 'ring-blue-400') : ''
                    }`}
                    style={{
                      backgroundColor: getColor(day.count, day.isToday),
                    }}
                  />
                )
              ))}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-end text-xs">
          <span className={dark ? 'text-gray-400' : 'text-gray-500'}>Less</span>
          <div className="flex mx-2 space-x-1">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: getColor(0) }}></div>
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: getColor(Math.ceil(maxCount * 0.25)) }}></div>
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: getColor(Math.ceil(maxCount * 0.5)) }}></div>
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: getColor(Math.ceil(maxCount * 0.75)) }}></div>
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: getColor(maxCount) }}></div>
          </div>
          <span className={dark ? 'text-gray-400' : 'text-gray-500'}>More</span>
        </div>
      </div>
    </div>
  );
}
