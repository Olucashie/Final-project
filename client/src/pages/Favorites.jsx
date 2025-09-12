import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getFavorites } from '../lib/api'
import PropertyCard from '../components/PropertyCard'

export default function Favorites() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        setLoading(true)
        const data = await getFavorites(token)
        if (!active) return
        setItems(data)
      } catch (e) {
        if (!active) return
        setError('Failed to load favorites')
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [token])

  if (loading) return <div className="container-page"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-black">Loading...</div></div>
  if (error) return <div className="container-page"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-red-600">{error}</div></div>

  return (
    <div className="container-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-4 text-black">Your Favorites</h1>
        {items.length === 0 ? (
          <p className="text-black/70">No favorites yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(p => (
              <PropertyCard key={p._id} id={p._id} image={p.images?.[0] || 'https://picsum.photos/seed/fav/800/600'} title={p.title} price={p.price} location={p.location} bedrooms={p.bedrooms} initiallyFavorited onView={() => navigate(`/properties/${p._id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
