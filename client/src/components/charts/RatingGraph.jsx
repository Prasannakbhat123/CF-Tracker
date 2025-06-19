import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler } from 'chart.js';
import { useTheme } from '../../context/ThemeContext';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

export default function RatingGraph({ contests }) {
  const { dark } = useTheme();
  
  // Sort contests by date
  const sortedContests = [...contests].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Get color based on contest rating
  const getRatingGradient = (ctx) => {
    if (!ctx) return dark ? '#5a67d8' : '#4f46e5';
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    if (dark) {
      gradient.addColorStop(0, 'rgba(79, 70, 229, 0.8)'); // indigo-600 with alpha
      gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');   // transparent
    } else {
      gradient.addColorStop(0, 'rgba(79, 70, 229, 0.6)'); // indigo-600 with alpha
      gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');   // transparent
    }
    return gradient;
  };

  const data = {
    labels: sortedContests.map(c => {
      const date = new Date(c.date);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Rating',
        data: sortedContests.map(c => c.newRating),
        fill: 'start',
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return dark ? 'rgba(79, 70, 229, 0.4)' : 'rgba(79, 70, 229, 0.2)';
          }
          return getRatingGradient(ctx);
        },
        borderColor: dark ? '#5a67d8' : '#4f46e5', // indigo
        borderWidth: 2,
        pointBackgroundColor: dark ? '#6366f1' : '#4f46e5',
        pointBorderColor: dark ? '#818cf8' : '#4f46e5',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: dark ? 'rgba(23, 23, 23, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: dark ? '#ffffff' : '#111827',
        bodyColor: dark ? '#e5e7eb' : '#1f2937',
        borderColor: dark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.8)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
        callbacks: {
          title: function(tooltipItems) {
            const index = tooltipItems[0].dataIndex;
            return sortedContests[index].contestName;
          },
          label: function(context) {
            const index = context.dataIndex;
            const contest = sortedContests[index];
            
            let label = `Rating: ${contest.newRating}`;
            if (contest.ratingChange !== 0) {
              label += ` (${contest.ratingChange > 0 ? '+' : ''}${contest.ratingChange})`;
            }
            return label;
          },
          afterLabel: function(context) {
            const index = context.dataIndex;
            const contest = sortedContests[index];
            return `Rank: ${contest.rank}`;
          },
        }
      }
    },
    scales: {
      x: { 
        grid: {
          color: dark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
          drawBorder: false,
        },
        ticks: {
          color: dark ? '#9ca3af' : '#6b7280',
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 8,
        }
      },
      y: { 
        title: { 
          display: true, 
          text: 'Rating',
          color: dark ? '#d1d5db' : '#4b5563',
          font: {
            size: 12,
            weight: 'bold',
          },
        }, 
        grid: {
          color: dark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
          drawBorder: false,
        },
        ticks: {
          color: dark ? '#9ca3af' : '#6b7280',
        },
        beginAtZero: false,
        suggestedMin: function() {
          const min = Math.min(...sortedContests.map(c => c.newRating));
          return Math.max(0, min - 200);
        }(),
        suggestedMax: function() {
          const max = Math.max(...sortedContests.map(c => c.newRating));
          return max + 200;
        }(),
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      line: {
        borderJoinStyle: 'round',
      }
    },
  };
  
  return <Line data={data} options={options} />;
}
