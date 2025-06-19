import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ArrowUp, ArrowDown, CalendarDays, Trophy, AlertTriangle } from 'lucide-react';
import RatingGraph from './charts/RatingGraph';

const FILTERS = [
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: '365 days', value: 365 },
  { label: 'All time', value: 3650 }, // ~10 years, effectively "all"
];

export default function ContestHistory({ contests }) {
  const [filter, setFilter] = useState(90);
  const { dark } = useTheme();

  const cutoff = Date.now() - filter * 24 * 60 * 60 * 1000;
  const filtered = contests.filter(c => new Date(c.date).getTime() >= cutoff);

  // Calculate some stats
  const totalContests = filtered.length;
  const avgRatingChange = totalContests ? 
    Math.round(filtered.reduce((sum, c) => sum + c.ratingChange, 0) / totalContests) : 0;
  const bestPerformance = filtered.length ? 
    filtered.reduce((best, current) => current.ratingChange > best.ratingChange ? current : best, filtered[0]) : null;
  const worstPerformance = filtered.length ? 
    filtered.reduce((worst, current) => current.ratingChange < worst.ratingChange ? current : worst, filtered[0]) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-xl font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>
          <span className="flex items-center gap-2">
            <Trophy size={20} className={dark ? 'text-amber-400' : 'text-amber-600'} />
            Contest Performance
          </span>
        </h3>          <div className={`flex rounded-lg overflow-hidden shadow-sm border ${dark ? 'border-gray-700' : 'border-gray-200'}`}>          {FILTERS.map((f, index) => (            <button
              key={f.value}
              onClick={() => setFilter(f.value)}              
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-0 cursor-pointer ${
                filter === f.value
                  ? 'bg-indigo-600 text-white' 
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
              <div className="text-sm uppercase font-medium mb-1 text-gray-500 dark:text-gray-400">Total Contests</div>
              <div className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{totalContests}</div>
            </div>
            
            <div className={`rounded-lg p-4 ${
              dark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="text-sm uppercase font-medium mb-1 text-gray-500 dark:text-gray-400">Avg. Rating Change</div>
              <div className={`text-2xl font-bold flex items-center ${
                avgRatingChange > 0 
                  ? 'text-green-500'
                  : avgRatingChange < 0 
                    ? 'text-red-500' 
                    : dark ? 'text-white' : 'text-gray-800'
              }`}>
                {avgRatingChange > 0 && <ArrowUp size={18} className="mr-1" />}
                {avgRatingChange < 0 && <ArrowDown size={18} className="mr-1" />}
                {avgRatingChange > 0 ? '+' : ''}{avgRatingChange}
              </div>
            </div>
            
            {bestPerformance && (
            <div className={`rounded-lg p-4 ${
              dark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="text-sm uppercase font-medium mb-1 text-gray-500 dark:text-gray-400">Best Performance</div>
              <div className={`text-2xl font-bold text-green-500 flex items-center`}>
                <ArrowUp size={18} className="mr-1" />
                +{bestPerformance.ratingChange}
              </div>
              <div className="text-xs truncate mt-1 text-gray-500 dark:text-gray-400">{bestPerformance.contestName}</div>
            </div>
            )}
            
            {worstPerformance && (
            <div className={`rounded-lg p-4 ${
              dark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="text-sm uppercase font-medium mb-1 text-gray-500 dark:text-gray-400">Worst Performance</div>
              <div className={`text-2xl font-bold text-red-500 flex items-center`}>
                <ArrowDown size={18} className="mr-1" />
                {worstPerformance.ratingChange}
              </div>
              <div className="text-xs truncate mt-1 text-gray-500 dark:text-gray-400">{worstPerformance.contestName}</div>
            </div>
            )}
          </div>
          
          {/* Rating graph */}
          <div className={`rounded-lg p-4 ${
            dark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="h-64">
              <RatingGraph contests={filtered} />
            </div>
          </div>
          
          {/* Contest table */}
          <div className={`rounded-lg overflow-hidden border ${
            dark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={dark ? 'bg-gray-800' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      dark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Date</th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      dark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Contest</th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      dark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Rank</th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      dark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Δ Rating</th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      dark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Unsolved</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${dark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filtered.map(c => (
                    <tr key={c.contestId} className={dark ? 'bg-gray-850 hover:bg-gray-800/60' : 'bg-white hover:bg-gray-50'}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${dark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={14} className="opacity-70" />
                          {new Date(c.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>
                        <div className="font-medium">{c.contestName}</div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="font-medium">{c.rank}</div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}>
                        <span className={`inline-flex items-center ${
                          c.ratingChange > 0 
                            ? 'text-green-500' 
                            : c.ratingChange < 0 
                              ? 'text-red-500' 
                              : dark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {c.ratingChange > 0 && <ArrowUp size={16} className="mr-0.5" />}
                          {c.ratingChange < 0 && <ArrowDown size={16} className="mr-0.5" />}
                          {c.ratingChange > 0 ? '+' : ''}{c.ratingChange}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {c.problemsUnsolved > 0 ? (
                          <span className="inline-flex items-center">
                            <AlertTriangle size={14} className={`mr-1 ${
                              dark ? 'text-amber-400' : 'text-amber-500'
                            }`} />
                            {c.problemsUnsolved}
                          </span>
                        ) : (
                          <span>0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className={`flex flex-col items-center justify-center py-10 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          <CalendarDays size={48} className="mb-4 opacity-40" />
          <p className="text-lg">No contests found in the selected time period</p>
          <button 
            onClick={() => setFilter(FILTERS[FILTERS.length - 1].value)}
            className={`mt-4 px-4 py-2 rounded-md ${
              dark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Show all contests
          </button>
        </div>
      )}
    </div>
  );
}
