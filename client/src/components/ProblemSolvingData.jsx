import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { BarChart2, Code, Calendar, PieChart, Award, TrendingUp, CalendarClock } from 'lucide-react';
import BarChart from './charts/BarChart';
import Heatmap from './charts/Heatmap';

const FILTERS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: 'All time', value: 3650 }, // ~10 years, effectively "all"
];

export default function ProblemSolvingData({ problems }) {
  const [filter, setFilter] = useState(30);
  const { dark } = useTheme();
  
  const cutoff = Date.now() - filter * 24 * 60 * 60 * 1000;
  const filtered = problems.filter(p => new Date(p.dateSolved).getTime() >= cutoff);

  // Most difficult problem solved
  const mostDifficult = filtered.reduce((max, p) => (!max || (p.rating > max.rating)) ? p : max, null);

  // Stats
  const totalSolved = filtered.length;
  const avgRating = totalSolved ? Math.round(filtered.reduce((sum, p) => sum + (p.rating || 0), 0) / totalSolved) : 0;
  const avgPerDay = Math.round(totalSolved / filter * 10) / 10;
  
  // Group problems by category/tags
  const problemsByTag = filtered.reduce((acc, problem) => {
    if (problem.tags && Array.isArray(problem.tags)) {
      problem.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
    }
    return acc;
  }, {});
  
  // Sort tags by count
  const topTags = Object.entries(problemsByTag)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className={`text-xl font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>
          <span className="flex items-center gap-2">
            <Code size={20} className={dark ? 'text-emerald-400' : 'text-emerald-600'} />
            Problem Solving Stats
          </span>
        </h3>
        
        <div className={`flex flex-wrap rounded-lg overflow-hidden shadow-sm border ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
          {FILTERS.map((f, index) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors border-0 cursor-pointer min-w-[60px] flex-1 sm:flex-none ${
                filter === f.value
                  ? 'bg-emerald-600 text-white' 
                  : dark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${
                index === 0 ? 'rounded-l-lg' : ''
              } ${
                index === FILTERS.length - 1 ? 'rounded-r-lg' : ''
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      
      {filtered.length > 0 ? (
        <>
          {/* Stats summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`rounded-lg p-4 ${
              dark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="text-sm uppercase font-medium mb-1 text-gray-500 dark:text-gray-400">Total Problems</div>
              <div className={`text-2xl font-bold flex items-center gap-2 ${dark ? 'text-white' : 'text-gray-800'}`}>
                {totalSolved}
              </div>
            </div>
            
            <div className={`rounded-lg p-4 ${
              dark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="text-sm uppercase font-medium mb-1 text-gray-500 dark:text-gray-400">Avg. Rating</div>
              <div className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>
                {avgRating || 'N/A'}
              </div>
            </div>
            
            <div className={`rounded-lg p-4 ${
              dark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="text-sm uppercase font-medium mb-1 text-gray-500 dark:text-gray-400">Avg. Per Day</div>
              <div className={`text-2xl font-bold flex items-center gap-2 ${dark ? 'text-white' : 'text-gray-800'}`}>
                {avgPerDay}
              </div>
            </div>
            
            {mostDifficult && (
            <div className={`rounded-lg p-4 ${
              dark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="text-sm uppercase font-medium mb-1 text-gray-500 dark:text-gray-400">Hardest Problem</div>
              <div className={`text-2xl font-bold flex items-center gap-2 ${dark ? 'text-white' : 'text-gray-800'}`}>
                {mostDifficult.rating || 'N/A'}
              </div>
              <div className="text-xs truncate mt-1 text-gray-500 dark:text-gray-400">{mostDifficult.problemName}</div>
            </div>
            )}
          </div>
          
          {/* Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Problem difficulty distribution */}
            <div className={`rounded-lg p-4 ${
              dark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <h4 className={`text-base font-medium mb-4 flex items-center gap-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                <BarChart2 size={16} className={dark ? 'text-blue-400' : 'text-blue-600'} />
                Problem Difficulty Distribution
              </h4>
              <div className="h-64">
                <BarChart problems={filtered} />
              </div>
            </div>
            
            {/* Submission heatmap */}
            <div className={`rounded-lg p-4 ${
              dark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <h4 className={`text-base font-medium mb-4 flex items-center gap-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Calendar size={16} className={dark ? 'text-green-400' : 'text-green-600'} />
                Submission Activity
              </h4>
              <Heatmap problems={filtered} />
            </div>
          </div>
          
          {/* Top problem tags/categories */}
          {topTags.length > 0 && (
          <div className={`rounded-lg p-4 ${
            dark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h4 className={`text-base font-medium mb-4 flex items-center gap-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <PieChart size={16} className={dark ? 'text-purple-400' : 'text-purple-600'} />
              Top Problem Categories
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => (
                <div key={tag} className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 ${
                  dark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                }`}>
                  <span>{tag}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    dark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>{count}</span>
                </div>
              ))}
            </div>
          </div>
          )}
        </>
      ) : (
        <div className={`flex flex-col items-center justify-center py-10 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Code size={48} className="mb-4 opacity-40" />
          <p className="text-lg">No problems solved in the selected time period</p>
          <button 
            onClick={() => setFilter(FILTERS[FILTERS.length - 1].value)}
            className={`mt-4 px-4 py-2 rounded-md ${
              dark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Show all problems
          </button>
        </div>
      )}
    </div>
  );
}
