"use client";

import { createContext, useContext, useState, useEffect } from 'react';

// Export the context so it can be imported elsewhere
export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setDark(savedTheme === 'dark');
      } else {
        // Check for system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDark(prefersDark);
      }
    }
  }, []);

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      if (dark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, [dark]);

  const toggleTheme = () => setDark(d => !d);

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Export a hook that can be used directly
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
