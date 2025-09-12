import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
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
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [verificationLoading, setVerificationLoading] = useState(false)
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const result = await login(email, password)
        if (result.needsVerification) {
          setError('Please verify your email before logging in. Check your email for verification code.')
          setShowVerification(true)
          return
        }
        navigate('/dashboard')
      } else {
        await register(name, email, password, role, phone, cacUrl, hostelDocUrl, whatsapp, telegram)
        setShowVerification(true)
        setError('')
      }
    } catch (err) {
      if (err.message.includes('Email already in use')) {
        setError('This email is already registered. Please try logging in instead or use a different email.')
      } else {
        setError(err.message || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  const onVerifyEmail = async (e) => {
    e.preventDefault()
    setError('')
    setVerificationLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, verificationCode })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      
      // Update auth context with verified user
      const { user, token } = data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setVerificationLoading(false)
    }
  }

  const onResendCode = async () => {
    setError('')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setError('Verification code sent successfully!')
    } catch (err) {
      setError(err.message || 'Failed to resend code')
    }
  }

  return (
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                type="password" 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                placeholder="Enter your password" 
                required 
              />
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
        
        {/* Email Verification Form */}
        {showVerification && (
          <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verify Your Email</h2>
              <p className="text-gray-600">
                We've sent a verification code to <strong className="text-gray-900">{email}</strong>
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={onVerifyEmail}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Enter Verification Code</label>
                <input 
                  value={verificationCode} 
                  onChange={e=>setVerificationCode(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-4 text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="000000" 
                  maxLength="6"
                  required 
                />
              </div>
              
              <button 
                disabled={verificationLoading}
                className="w-full inline-flex justify-center items-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-white font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {verificationLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button 
                onClick={onResendCode}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
