import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [phone, setPhone] = useState('')
  const [cacUrl, setCacUrl] = useState('')
  const [hostelDocUrl, setHostelDocUrl] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [telegram, setTelegram] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // Removed modal states; use simple inline feedback
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess('')
    try {
      if (mode === 'login') {
        const result = await login(email, password)
        navigate('/dashboard')
      } else {
        await register(name, email, password, role, phone, cacUrl, hostelDocUrl, whatsapp, telegram)
        setError('')
        // Email verification link is sent by backend; no modal
        setSuccess('Registration successful. Please check your email for a verification link, then log in.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Email verification handler removed

  // Resend code handler removed

  // Email verification handled via link; modal removed

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {mode === 'login' ? 'Sign in to your account' : 'Join our hostel finder community'}
          </p>
        </div>
        
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 text-center">
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </h2>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
              {error.includes('Email already in use') && (
                <div className="mt-3">
                  <button
                    onClick={() => setMode('login')}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm underline"
                  >
                    Switch to Login instead
                  </button>
                </div>
              )}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}
          
          <form className="space-y-4" onSubmit={onSubmit}>
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    value={name} 
                    onChange={e=>setName(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="Enter your full name" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select 
                    value={role} 
                    onChange={e=>setRole(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="student">Student</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                {role === 'agent' && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-900">Agent Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input 
                        value={phone} 
                        onChange={e=>setPhone(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        placeholder="+234 123 456 7890" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (Optional)</label>
                      <input 
                        value={whatsapp} 
                        onChange={e=>setWhatsapp(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        placeholder="+234 123 456 7890" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telegram (Optional)</label>
                      <input 
                        value={telegram} 
                        onChange={e=>setTelegram(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        placeholder="@username" 
                      />
                    </div>
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Verification:</strong> Your agent status will be verified through phone number confirmation. 
                        You'll be able to add hostels after email verification.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                type="email" 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                placeholder="Enter your email" 
                required 
              />
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                type={showPassword ? "text" : "password"} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12" 
                placeholder="Enter your password" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.112-6.163m1.664-1.664A9.96 9.96 0 0112 3c5.523 0 10 4.477 10 10a9.96 9.96 0 01-1.664 6.163m-1.664 1.664A10.05 10.05 0 0112 19c-1.02 0-2.01-.153-2.963-.438M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.835-.634 1.627-1.07 2.357M15.5 15.5l-1.5-1.5" /></svg>
                )}
              </button>
            </div>
            <button 
              disabled={loading}
              className="w-full inline-flex justify-center items-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
        
        {/* Email verification UI removed */}
      </div>
      </div>
    </>
  )
}
