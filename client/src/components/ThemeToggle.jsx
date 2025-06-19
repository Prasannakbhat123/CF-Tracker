"use client";

import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react'; 

export default function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      aria-label="Toggle theme"
      className="flex items-center justify-center p-2 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      {dark ? (
        <Sun size={20} className="text-yellow-500" />
      ) : (
        <Moon size={20} className="text-gray-700" />
      )}
    </button>
  );
}
