"use client";

import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onOpenSyncSettings }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { admin, logout } = useAuth();
  const { dark } = useTheme();
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <nav className={`${dark ? 'bg-gray-800 text-white' : 'bg-white text-[#180F79]'} shadow-lg transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-extrabold tracking-wider">CF Tracker</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center h-10 w-10 cursor-pointer rounded-full bg-[#2a1eb0] hover:bg-[#362bb9] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="User menu"
              >
                {admin?.username ? (
                  <span className="text-sm text-white font-medium">{admin.username.charAt(0).toUpperCase()}</span>
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </button>
              
              {dropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 ${dark ? 'bg-gray-700' : 'bg-white'} rounded-md shadow-xl py-1 z-10 ring-1 ring-black ring-opacity-5`}>
                  {admin && (
                    <div className={`px-4 py-2 text-sm ${dark ? 'text-gray-200' : 'text-gray-700'} border-b ${dark ? 'border-gray-600' : ''}`}>
                      Signed in as <span className="font-medium">{admin.username}</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      onOpenSyncSettings();
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center px-4 py-2 cursor-pointer text-sm ${dark ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} w-full text-left`}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Sync Settings
                  </button>
                  
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center px-4 cursor-pointer py-2 text-sm ${dark ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} w-full text-left`}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
