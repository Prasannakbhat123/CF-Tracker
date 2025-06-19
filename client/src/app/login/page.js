'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, AlertCircle, LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { isAuthenticated, login } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect if already logged in
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(formData.username, formData.password);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-cover bg-center"
         style={{backgroundImage: "url('/images/login-bg.png')"}}>
      
      <div className="w-full flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md bg-white/20 backdrop-blur-4xl rounded-2xl shadow-2xl p-8 border border-black">
          <div className="text-center mb-10">
            {/* <div className="inline-block p-4 bg-white/50 rounded-full mb-5 backdrop-blur-sm">
              <LogIn className="h-10 w-10 text-[#180F79]" />
            </div> */}
            <h1 className="text-4xl font-extrabold text-[#160f60] tracking-tight">
              Admin Login
            </h1>
            <p className="mt-3 text-gray-500">Enter your credentials to access your account</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#180F79] mb-1">
                Username
              </label>
              <div className="relative">
                <input
  type="text"
  id="username"
  name="username"
  value={formData.username}
  onChange={handleChange}
  required
  className="w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition duration-150 ease-in-out text-white placeholder-white/60"
  style={{
    background: 'rgba(255,255,255,0.15)',
    WebkitBackdropFilter: 'blur(12px)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '12px 16px 12px 3rem'
  }}
  placeholder="Enter your username"
/>

                <User className="h-5 w-5 text-[#180F79] absolute left-3 top-4 pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#180F79] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition duration-150 ease-in-out text-white placeholder-white/60"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '12px 16px 12px 3rem'
                  }}
                  placeholder="Enter your password"
                />
                <Lock className="h-5 w-5 text-[#180F79] absolute left-3 top-4 pointer-events-none" />
              </div>
            </div>
            
            <div>
              <button 
                type="submit" 
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white cursor-pointer"
                style={{ backgroundColor: '#180F79' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Sign In
                    <LogIn className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}





