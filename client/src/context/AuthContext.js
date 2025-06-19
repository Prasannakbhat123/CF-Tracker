'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedAdmin = localStorage.getItem('admin');
    
    if (storedToken && storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
    
    setLoading(false);
  }, []);
  
  // Login function
  const login = async (username, password) => {
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }
      
      const data = await res.json();
      
      // Store token and admin data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      
      setAdmin(data.admin);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin');
    setAdmin(null);
    router.push('/login');
  };
  
  // Get auth header for API requests
  const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  return (
    <AuthContext.Provider value={{
      admin,
      isAuthenticated: !!admin,
      loading,
      error,
      login,
      logout,
      getAuthHeader
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
