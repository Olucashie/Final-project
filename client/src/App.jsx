import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Listings from './pages/Listings'
import PropertyDetail from './pages/PropertyDetail'
import AuthPage from './pages/Auth'
import Favorites from './pages/Favorites'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import AddHostel from './pages/AddHostel'

function App() {
  return (
    <BrowserRouter>
      <div className="container-page">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/listings" element={<Listings />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<ProtectedRoute role="agent" />}>
              <Route path="/hostels/new" element={<AddHostel />} />
            </Route>
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
