import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { addFavorite, removeFavorite } from '../lib/api'

export default function PropertyCard({ id, image, title, price, location, school, area, bedrooms, ownerName, createdAt, onView, initiallyFavorited = false }) {
  const { isAuthenticated, token } = useAuth()
  const [favorited, setFavorited] = useState(initiallyFavorited)
  const [loading, setLoading] = useState(false)

  const toggleFavorite = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) return alert('Please login to save favorites')
    try {
      setLoading(true)
      if (favorited) {
        await removeFavorite(id, token)
        setFavorited(false)
      } else {
        await addFavorite(id, token)
        setFavorited(true)
      }
    } catch (err) {
      alert('Failed to update favorites')
    } finally {
      setLoading(false)
    }
  }

  const posted = createdAt ? new Date(createdAt).toLocaleDateString() : ''

  return (
    <div className="bg-white rounded-lg shadow-sm border border-black/10 overflow-hidden">
      <div className="relative">
        <img src={image} alt={title} className="h-48 w-full object-cover" />
        <button disabled={loading} onClick={toggleFavorite} className={`absolute top-2 right-2 inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/90 border border-black/10 ${favorited ? 'text-black' : 'text-black/60'}`} aria-label="Save to favorites">
          <svg xmlns="http://www.w3.org/2000/svg" fill={favorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-black">{title}</h3>
        <p className="text-sm text-black/70">{school}{area ? ` • ${area}` : ''}</p>
        <p className="text-sm text-black/60">{location}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="font-semibold">₦{price} / year</span>
          <span className="text-sm text-black/70">{bedrooms} beds</span>
        </div>
        {(ownerName || posted) && (
          <p className="text-xs text-black/60">Posted by {ownerName || 'Agent'}{posted ? ` • ${posted}` : ''}</p>
        )}
        <button onClick={onView} className="mt-2 w-full inline-flex justify-center items-center gap-2 rounded-md bg-black px-4 py-2 text-white hover:bg-black/90">
          View Details
        </button>
      </div>
    </div>
  )
}
