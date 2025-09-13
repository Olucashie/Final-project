import { useState } from 'react'

import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false);
  return (
    <header className="bg-white border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">UniHost</Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <NavLink to="/" className={({isActive}) => isActive ? 'text-black' : 'text-black/70 hover:text-black'}>Home</NavLink>
            <NavLink to="/listings" className={({isActive}) => isActive ? 'text-black' : 'text-black/70 hover:text-black'}>Hostels</NavLink>
            <NavLink to="/favorites" className={({isActive}) => isActive ? 'text-black' : 'text-black/70 hover:text-black'}>Favorites</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={({isActive}) => isActive ? 'text-black' : 'text-black/70 hover:text-black'}>
                  {user?.name || 'Dashboard'}{user?.role ? ` (${user.role})` : ''}
                </NavLink>
                <button
                  onClick={async () => {
                    setLoggingOut(true);
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                    logout();
                    setLoggingOut(false);
                  }}
                  className={`text-black/70 hover:text-black relative px-4 py-1 ${loggingOut ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={loggingOut}
                >
                  {loggingOut ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                      Logging out...
                    </span>
                  ) : 'Logout'}
                </button>
              </>
            ) : (
              <NavLink to="/auth" className={({isActive}) => isActive ? 'text-black' : 'text-black/70 hover:text-black'}>Login/Register</NavLink>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
