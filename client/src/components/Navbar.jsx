import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  return (
    <header className="bg-white border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">HostelFinder</Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <NavLink to="/" className={({isActive}) => isActive ? 'text-black' : 'text-black/70 hover:text-black'}>Home</NavLink>
            <NavLink to="/listings" className={({isActive}) => isActive ? 'text-black' : 'text-black/70 hover:text-black'}>Hostels</NavLink>
            <NavLink to="/favorites" className={({isActive}) => isActive ? 'text-black' : 'text-black/70 hover:text-black'}>Favorites</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={({isActive}) => isActive ? 'text-black' : 'text-black/70 hover:text-black'}>
                  {user?.name || 'Dashboard'}{user?.role ? ` (${user.role})` : ''}
                </NavLink>
                <button onClick={logout} className="text-black/70 hover:text-black">Logout</button>
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
