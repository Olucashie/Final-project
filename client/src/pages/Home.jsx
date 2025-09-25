import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import { listHostels } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        setLoading(true)
        const data = await listHostels(token, user?.role === 'agent' ? { mine: 'true' } : {})
        if (!active) return
        setItems((data || []).slice(0, 6))
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [token, user?.role])

  const handleSearch = (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const params = new URLSearchParams({
      school: form.get('school') || '',
      address: form.get('address') || '',
      location: form.get('location') || '',
      minPrice: form.get('minPrice') || '',
      maxPrice: form.get('maxPrice') || '',
      bedrooms: form.get('bedrooms') || '',
    })
    navigate(`/listings?${params.toString()}`)
  }

  return (
    <div className="container-page">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-sky-500 to-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl text-white">
            <span className="inline-block text-xs tracking-wide uppercase bg-white/20 rounded-full px-3 py-1 mb-3">Global School Hostels</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">Find student-friendly hostels near your campus</h1>
            <p className="mt-4 text-white/90">Search by school and area to discover verified hostels posted by trusted agents.</p>
          </div>

          <form onSubmit={handleSearch} className="mt-8 grid grid-cols-1 md:grid-cols-6 gap-3">
            <input name="school" placeholder="School (e.g., University of Lagos)" className="border border-white/20 bg-white rounded-md px-3 py-2 placeholder-black/50" />
            <input name="address" placeholder="Address (e.g., Akoka)" className="border border-white/20 bg-white rounded-md px-3 py-2 placeholder-black/50" />
            <input name="location" placeholder="Nearby landmark" className="border border-white/20 bg-white rounded-md px-3 py-2 placeholder-black/50" />
            <input name="minPrice" placeholder="Min Price" type="number" className="border border-white/20 bg-white rounded-md px-3 py-2 placeholder-black/50" />
            <input name="maxPrice" placeholder="Max Price" type="number" className="border border-white/20 bg-white rounded-md px-3 py-2 placeholder-black/50" />
            <select name="bedrooms" className="border border-white/20 bg-white rounded-md px-3 py-2">
              <option value="">Any Beds</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
            <button className="md:col-span-6 inline-flex justify-center items-center rounded-md bg-black/90 px-4 py-2 text-white hover:bg-black">Search hostels</button>
          </form>
        </div>
      </section>

      {/* Featured */}
      <section className="bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Latest hostels (by agents)</h2>
            <button onClick={() => navigate('/listings')} className="hidden sm:inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700">View all</button>
          </div>

          {loading ? (
            <p className="text-slate-700">Loading hostels...</p>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-700">No hostels yet. Agents can add hostels from Dashboard → Add new hostel.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(p => (
                <PropertyCard
                  key={p._id}
                  id={p._id}
                  image={p.images?.[0] || 'https://picsum.photos/seed/hostel/800/600'}
                  images={p.images}
                  title={p.title}
                  price={p.price}
                  location={p.location}
                  school={p.school}
                  address={p.address}
                  bedrooms={p.bedrooms}
                  ownerName={p.owner?.name}
                  createdAt={p.createdAt}
                  onView={() => navigate(`/properties/${p._id}`)}
                />
              ))}
            </div>
          )}

          <div className="sm:hidden mt-6">
            <button onClick={() => navigate('/listings')} className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Browse more hostels</button>
          </div>
        </div>
      </section>
    </div>
  )
}
