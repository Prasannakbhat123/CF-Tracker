import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../../context/ThemeContext';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function BarChart({ problems }) {
  const { dark } = useTheme();
  
  // Bucket problems by rating (e.g., 800, 900, ... 2500)
  const buckets = {};
  problems.forEach(p => {
    const rating = p.rating || 'Unrated';
    buckets[rating] = (buckets[rating] || 0) + 1;
  });
  
  // Sort ratings numerically, keeping 'Unrated' at the end
  const sortedRatings = Object.keys(buckets)
    .sort((a, b) => {
      if (a === 'Unrated') return 1;
      if (b === 'Unrated') return -1;
      return parseInt(a) - parseInt(b);
    });
  
  // Generate colors based on difficulty
  const getColorForRating = (rating, alpha = 1) => {
    if (rating === 'Unrated') return `rgba(156, 163, 175, ${alpha})`;  // gray-400
    
    const ratingNum = parseInt(rating);
    if (ratingNum < 1200) return `rgba(107, 114, 128, ${alpha})`;      // gray-500
    if (ratingNum < 1400) return `rgba(5, 150, 105, ${alpha})`;        // emerald-600
    if (ratingNum < 1600) return `rgba(14, 165, 233, ${alpha})`;       // sky-500
    if (ratingNum < 1900) return `rgba(79, 70, 229, ${alpha})`;        // indigo-600
    if (ratingNum < 2100) return `rgba(147, 51, 234, ${alpha})`;       // purple-600
    if (ratingNum < 2400) return `rgba(249, 115, 22, ${alpha})`;       // orange-500
    return `rgba(220, 38, 38, ${alpha})`;                              // red-600
  };
  
  const data = {
    labels: sortedRatings.map(r => r === 'Unrated' ? 'Unrated' : `${r}`),
    datasets: [
      {
        label: 'Problems Solved',
        data: sortedRatings.map(r => buckets[r]),
        backgroundColor: sortedRatings.map(r => getColorForRating(r, dark ? 0.8 : 0.7)),
        borderColor: sortedRatings.map(r => getColorForRating(r, 1)),
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: sortedRatings.map(r => getColorForRating(r, dark ? 0.9 : 0.8)),
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
        callbacks: {
          title: function(tooltipItems) {
            const rating = tooltipItems[0].label;
            return rating === 'Unrated' ? 'Unrated Problems' : `Difficulty: ${rating}`;
          },
          label: function(context) {
            const count = context.raw;
            return `${count} problem${count !== 1 ? 's' : ''} solved`;
          }
        }
      }
    },
    scales: {
      x: { 
        title: { 
          display: true, 
          text: 'Problem Rating',
          color: dark ? '#d1d5db' : '#4b5563',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: dark ? '#9ca3af' : '#6b7280',
        }
      },
      y: { 
        title: { 
          display: true, 
          text: 'Problems Solved',
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
          stepSize: 1,
          precision: 0
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    layout: {
      padding: {
        top: 10
      }
    }
  };
  
  return <Bar data={data} options={options} />;
}
