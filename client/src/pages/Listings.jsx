import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import { listHostels, searchHostels } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Listings() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const params = useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search])
  const { token, user } = useAuth()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        setLoading(true)
        const hasFilters = Object.keys(params).length > 0
        
        // If user is an agent, show only their own hostels
        if (user?.role === 'agent') {
          const agentParams = { ...params, mine: 'true' }
          const data = hasFilters ? await searchHostels(token, agentParams) : await listHostels(token, { mine: 'true' })
          if (!active) return
          setItems(data || [])
        } else {
          // For students and admins, show all hostels
          const data = hasFilters ? await searchHostels(token, params) : await listHostels(token)
          if (!active) return
          setItems(data || [])
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [token, params, user?.role])

  const onFilterSubmit = (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const next = new URLSearchParams({
      school: form.get('school') || '',
      area: form.get('area') || '',
      location: form.get('location') || '',
      minPrice: form.get('minPrice') || '',
      maxPrice: form.get('maxPrice') || '',
      bedrooms: form.get('bedrooms') || '',
    })
    // Remove empty params
    for (const [k, v] of Array.from(next.entries())) if (!v) next.delete(k)
    navigate(`/listings?${next.toString()}`)
  }

  return (
    <div className="container-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            {user?.role === 'agent' ? 'My Hostels' : 'Available Hostels'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'agent' 
              ? 'Manage and view all your hostel listings' 
              : 'Browse and find the perfect hostel for you'
            }
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 bg-white border border-black/10 rounded-lg p-4 h-max">
            <h3 className="font-semibold mb-3 text-black">
              {user?.role === 'agent' ? 'Filter my hostels' : 'Filter hostels'}
            </h3>
          <form className="space-y-3" onSubmit={onFilterSubmit}>
            <input name="school" defaultValue={params.school || ''} placeholder="School" className="w-full border border-black/10 rounded-md px-3 py-2" />
            <input name="area" defaultValue={params.area || ''} placeholder="Area" className="w-full border border-black/10 rounded-md px-3 py-2" />
            <input name="location" defaultValue={params.location || ''} placeholder="Nearby landmark" className="w-full border border-black/10 rounded-md px-3 py-2" />
            <input name="minPrice" defaultValue={params.minPrice || ''} placeholder="Min Price" type="number" className="w-full border border-black/10 rounded-md px-3 py-2" />
            <input name="maxPrice" defaultValue={params.maxPrice || ''} placeholder="Max Price" type="number" className="w-full border border-black/10 rounded-md px-3 py-2" />
            <select name="bedrooms" defaultValue={params.bedrooms || ''} className="w-full border border-black/10 rounded-md px-3 py-2">
              <option value="">Any Beds</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
            <button className="w-full inline-flex justify-center items-center rounded-md bg-black px-4 py-2 text-white hover:bg-black/90">Apply</button>
          </form>
        </aside>

        <section className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <span className="ml-3 text-black/70">Loading hostels...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-black/10 bg-white p-8 text-center">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-lg font-semibold text-black mb-2">
                {user?.role === 'agent' ? 'No hostels yet' : 'No hostels available'}
              </h3>
              <p className="text-black/70 mb-4">
                {user?.role === 'agent' 
                  ? 'Start by adding your first hostel listing to get started.' 
                  : 'Check back later for new hostel listings.'
                }
              </p>
              {user?.role === 'agent' && (
                <button 
                  onClick={() => navigate('/hostels/new')}
                  className="inline-flex items-center rounded-md bg-black px-4 py-2 text-white hover:bg-black/90"
                >
                  Add Your First Hostel
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(p => (
                <PropertyCard
                  key={p._id}
                  id={p._id}
                  image={p.images?.[0] || 'https://picsum.photos/seed/hostel/800/600'}
                  title={p.title}
                  price={p.price}
                  location={p.location}
                  school={p.school}
                  area={p.area}
                  bedrooms={p.bedrooms}
                  ownerName={p.owner?.name}
                  createdAt={p.createdAt}
                  onView={() => navigate(`/properties/${p._id}`)}
                />
              ))}
            </div>
          )}
        </section>
        </div>
      </div>
    </div>
  )
}
