import { useState, useEffect } from 'react';
import { X, Save, UserPlus, Loader } from 'lucide-react';
import { checkHandleExists } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function StudentForm({ onClose, setStudents, initialData }) {  const [form, setForm] = useState(
    initialData || { name: '', email: '', phone: '', codeforcesHandle: '', emailNotifications: true }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [handleValidation, setHandleValidation] = useState({
    checking: false,
    exists: false,
    message: ''
  });
  const [validation, setValidation] = useState({
    email: { valid: true, message: '' },
    phone: { valid: true, message: '' }
  });
  const { dark } = useTheme();

  // Check if the handle exists when it changes (with debounce)
  useEffect(() => {
    if (!form.codeforcesHandle || form.codeforcesHandle.length < 2) {
      setHandleValidation({ checking: false, exists: false, message: '' });
      return;
    }

    // Skip validation if we're editing and the handle hasn't changed
    if (initialData && initialData.codeforcesHandle === form.codeforcesHandle) {
      setHandleValidation({ checking: false, exists: false, message: '' });
      return;
    }

    const timer = setTimeout(async () => {
      setHandleValidation({ checking: true, exists: false, message: 'Checking...' });
      try {
        const result = await checkHandleExists(form.codeforcesHandle);
        if (result.exists) {
          setHandleValidation({ 
            checking: false, 
            exists: true, 
            message: 'This Codeforces handle is already registered' 
          });
        } else {
          setHandleValidation({ 
            checking: false, 
            exists: false, 
            message: 'This handle is available' 
          });
        }
      } catch (err) {
        setHandleValidation({ 
          checking: false, 
          exists: false, 
          message: 'Could not verify handle' 
        });
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [form.codeforcesHandle, initialData]);
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    
    // Validate email
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const valid = emailRegex.test(value);
      const hasGmail = value.toLowerCase().includes('@gmail.com');
      const hasOutlook = value.toLowerCase().includes('@outlook.com');
      const hasHotmail = value.toLowerCase().includes('@hotmail.com');
      const hasYahoo = value.toLowerCase().includes('@yahoo.com');
      
      setValidation(prev => ({
        ...prev,
        email: {
          valid: valid,
          message: !valid ? 'Please enter a valid email address' : 
                   (!hasGmail && !hasOutlook && !hasHotmail && !hasYahoo) ? 
                   'Common email domains: gmail.com, outlook.com, hotmail.com, yahoo.com' : ''
        }
      }));
    }
    
    // Validate phone number
    if (name === 'phone') {
      // Allow empty phone number
      if (value === '') {
        setValidation(prev => ({
          ...prev,
          phone: { valid: true, message: '' }
        }));
        return;
      }
      
      const phoneRegex = /^\d{10}$/;
      const valid = phoneRegex.test(value);
      setValidation(prev => ({
        ...prev,
        phone: {
          valid: valid,
          message: !valid ? 'Phone number should be exactly 10 digits' : ''
        }
      }));
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate all fields before submission
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = emailRegex.test(form.email);
    
    let phoneValid = true;
    if (form.phone !== '') {
      const phoneRegex = /^\d{10}$/;
      phoneValid = phoneRegex.test(form.phone);
    }
    
    // Update validation state
    setValidation({
      email: {
        valid: emailValid,
        message: !emailValid ? 'Please enter a valid email address' : ''
      },
      phone: {
        valid: phoneValid,
        message: !phoneValid ? 'Phone number should be exactly 10 digits' : ''
      }
    });
    
    // Check if there are any validation errors
    if (!emailValid || !phoneValid) {
      setError('Please fix the validation errors before submitting.');
      return;
    }
    
    // Prevent submission if handle is already in use
    if (handleValidation.exists) {
      setError('This Codeforces handle is already registered. Please use a different handle.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Add a message to indicate data is being synced
      if (!initialData) {
        setForm(prev => ({ ...prev, status: 'Creating student and syncing Codeforces data...' }));
      }
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/students${initialData ? '/' + initialData._id : ''}`,
        {
          method: initialData ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save student');
      }

      const updated = await res.json();
      
      // Update the students list with the new data
      setStudents(students =>
        initialData
          ? students.map(s => (s._id === updated._id ? updated : s))
          : [...students, updated]
      );
      
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">      <div className={`relative max-w-xl w-full rounded-lg shadow-xl ${dark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} p-6 max-h-[90vh] overflow-y-auto`}>
        {/* Close button */}
        <button 
          type="button" 
          onClick={onClose} 
          className={`absolute top-4 right-4 p-1.5 rounded-full cursor-pointer ${dark ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors`}
          aria-label="Close"
        >
          <X size={20} className={`${dark ? "text-gray-400" : "text-gray-500"}`} />
        </button>
        
        {/* Header */}
        <div className={`mb-6 border-b ${dark ? "border-gray-700" : "border-gray-200"} pb-4`}>          <h2 className={`text-2xl font-bold flex items-center gap-2 ${dark ? "text-gray-100" : "text-gray-900"}`}>
            {initialData ? (
              <>
                <Save className={`${dark ? "text-indigo-400" : "text-[#160f60]"}`} size={24} />
                Edit Student
              </>
            ) : (
              <>
                <UserPlus className={`${dark ? "text-indigo-400" : "text-[#160f60]"}`} size={24} />
                Add Student
              </>
            )}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>          {error && (
            <div className={`p-4 mb-6 rounded-lg ${dark ? "bg-red-900/20 text-red-200 border-red-800/30" : "bg-red-50 text-red-800 border-red-100"} border`}>
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div>              <label htmlFor="name" className={`block text-sm font-medium mb-1 ${dark ? "text-gray-300" : "text-gray-800"}`}>
                Name
              </label>
              <input 
                id="name"
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="Name" 
                required 
                className={`w-full px-4 py-2 border ${dark ? "border-gray-600" : "border-gray-300"} rounded-md ${dark ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"} focus:outline-none focus:ring-2 ${dark ? "focus:ring-indigo-500" : "focus:ring-[#160f60]"}`}
              />
            </div>
              <div>              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${dark ? "text-gray-300" : "text-gray-800"}`}>
                Email
              </label>
              <input 
                id="email"
                name="email" 
                type="email"
                value={form.email} 
                onChange={handleChange} 
                placeholder="Email" 
                required 
                className={`w-full px-4 py-2 border ${!validation.email.valid ? 'border-red-400 dark:border-red-600' : dark ? "border-gray-600" : "border-gray-300"} rounded-md ${dark ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"} focus:outline-none focus:ring-2 ${!validation.email.valid ? 'focus:ring-red-500' : dark ? "focus:ring-indigo-500" : "focus:ring-[#160f60]"}`}
              />
              {!validation.email.valid && (
                <p className="text-sm mt-1 text-red-600 dark:text-red-400">
                  {validation.email.message}
                </p>
              )}
              {validation.email.valid && validation.email.message && (
                <p className="text-sm mt-1 text-amber-600 dark:text-amber-400">
                  {validation.email.message}
                </p>
              )}
            </div>
            
            <div>              <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${dark ? "text-gray-300" : "text-gray-800"}`}>
                Phone (10 digits)
              </label>
              <input 
                id="phone"
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                placeholder="Phone" 
                className={`w-full px-4 py-2 border ${!validation.phone.valid ? 'border-red-400 dark:border-red-600' : dark ? "border-gray-600" : "border-gray-300"} rounded-md ${dark ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"} focus:outline-none focus:ring-2 ${!validation.phone.valid ? 'focus:ring-red-500' : dark ? "focus:ring-indigo-500" : "focus:ring-[#160f60]"}`}
              />
              {!validation.phone.valid && (
                <p className="text-sm mt-1 text-red-600 dark:text-red-400">
                  {validation.phone.message}
                </p>
              )}
            </div>
            
            <div>              <label htmlFor="codeforcesHandle" className={`block text-sm font-medium mb-1 ${dark ? "text-gray-300" : "text-gray-800"}`}>
                Codeforces Handle
              </label>
              <input 
                id="codeforcesHandle"
                name="codeforcesHandle" 
                value={form.codeforcesHandle} 
                onChange={handleChange} 
                placeholder="Codeforces Handle" 
                required 
                className={`w-full px-4 py-2 border rounded-md ${dark ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"} focus:outline-none focus:ring-2 ${
                  handleValidation.exists 
                    ? 'border-red-400 dark:border-red-600 focus:ring-red-500' 
                    : handleValidation.checking 
                      ? 'border-gray-300 dark:border-gray-600 focus:ring-gray-500' 
                      : handleValidation.message 
                        ? 'border-green-400 dark:border-green-600 focus:ring-green-500' 
                        : `border-gray-300 dark:border-gray-600 ${dark ? "focus:ring-indigo-500" : "focus:ring-[#160f60]"}`
                }`}
              />
              {handleValidation.message && (
                <p className={`text-sm mt-1 ${
                  handleValidation.exists 
                    ? 'text-red-600 dark:text-red-400' 
                    : handleValidation.checking 
                      ? 'text-gray-500 dark:text-gray-400' 
                      : 'text-green-600 dark:text-green-400'
                }`}>
                  {handleValidation.message}
                </p>
              )}
              {initialData && initialData.codeforcesHandle !== form.codeforcesHandle && (
                <p className="text-sm mt-1 text-blue-600 dark:text-blue-400">
                  Note: Changing the handle will trigger an immediate data sync.
                </p>
              )}
              {!initialData && (
                <p className="text-sm mt-1 text-blue-600 dark:text-blue-400">
                  Note: Adding a new student will sync their Codeforces data automatically.
                </p>
              )}
            </div>
            
            <div>              <label className={`flex items-center gap-2 ${dark ? "text-gray-300" : "text-gray-800"} cursor-pointer`}>
                <input 
                  type="checkbox" 
                  name="emailNotifications" 
                  checked={form.emailNotifications} 
                  onChange={handleChange}
                  className={`h-4 w-4 ${dark ? "text-indigo-500" : "text-[#160f60]"} focus:ring-indigo-500 ${dark ? "border-gray-600" : "border-gray-300"} rounded`}
                />
                <span>Receive inactivity email notifications</span>
              </label>
            </div>
          </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              type="submit" 
              disabled={loading || handleValidation.exists || handleValidation.checking || !validation.email.valid || !validation.phone.valid}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md cursor-pointer ${
                loading || handleValidation.exists || handleValidation.checking || !validation.email.valid || !validation.phone.valid
                  ? 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed' 
                  : 'bg-[#160f60] hover:bg-[#0e0940] text-white'
              } transition-colors font-medium`}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  {initialData ? 'Updating...' : 'Creating & Syncing...'}
                </>
              ) : (
                <>
                  {initialData ? <Save size={18} /> : <UserPlus size={18} />}
                  {initialData ? 'Update' : 'Add Student'}
                </>
              )}
            </button>
          </div>
          
          {form.status && (
            <div className="mt-4 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-[#160f60] dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/30">
              {form.status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
