import { useState } from 'react'

import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="bg-white border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">UniHost</Link>
          {/* Desktop nav */}
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
                    await new Promise(resolve => setTimeout(resolve, 1000));
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
          {/* Hamburger for mobile */}
          <button
            className="md:hidden flex items-center px-2 py-2 text-black focus:outline-none"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Open menu"
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
        {/* Mobile nav menu */}
        {mobileOpen && (
          <nav className="md:hidden flex flex-col gap-2 py-4 animate-fade-in">
            <NavLink to="/" className={({isActive}) => isActive ? 'text-black font-semibold' : 'text-black/70 hover:text-black'} onClick={() => setMobileOpen(false)}>Home</NavLink>
            <NavLink to="/listings" className={({isActive}) => isActive ? 'text-black font-semibold' : 'text-black/70 hover:text-black'} onClick={() => setMobileOpen(false)}>Hostels</NavLink>
            <NavLink to="/favorites" className={({isActive}) => isActive ? 'text-black font-semibold' : 'text-black/70 hover:text-black'} onClick={() => setMobileOpen(false)}>Favorites</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={({isActive}) => isActive ? 'text-black font-semibold' : 'text-black/70 hover:text-black'} onClick={() => setMobileOpen(false)}>
                  {user?.name || 'Dashboard'}{user?.role ? ` (${user.role})` : ''}
                </NavLink>
                <button
                  onClick={async () => {
                    setLoggingOut(true);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    logout();
                    setLoggingOut(false);
                    setMobileOpen(false);
                  }}
                  className={`text-black/70 hover:text-black relative px-4 py-1 text-left ${loggingOut ? 'opacity-60 cursor-not-allowed' : ''}`}
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
              <NavLink to="/auth" className={({isActive}) => isActive ? 'text-black font-semibold' : 'text-black/70 hover:text-black'} onClick={() => setMobileOpen(false)}>Login/Register</NavLink>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
