import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function PropertyDetail() {
  const { id } = useParams()
  const { token } = useAuth()
  const [hostel, setHostel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [messageForm, setMessageForm] = useState({
    name: '',
    email: '',
    message: ''
  })

  useEffect(() => {
    const fetchHostel = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://final-project-za5c.onrender.com/api'}/hostels/${id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        if (!res.ok) throw new Error('Failed to fetch hostel')
        const data = await res.json()
        setHostel(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchHostel()
  }, [id, token])

  const handleMessageSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the message via email or store it in a database
    alert('Message sent! The owner will contact you soon.')
    setMessageForm({ name: '', email: '', message: '' })
  }

  const openWhatsApp = (phone) => {
    const message = `Hi, I'm interested in your hostel listing. Can you provide more details?`
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const openTelegram = (username) => {
    const message = `Hi, I'm interested in your hostel listing. Can you provide more details?`
    const telegramUrl = `https://t.me/${username.replace('@', '')}?text=${encodeURIComponent(message)}`
    window.open(telegramUrl, '_blank')
  }

  if (loading) return <div className="container-page flex items-center justify-center"><div className="text-lg">Loading...</div></div>
  if (error) return <div className="container-page flex items-center justify-center"><div className="text-red-600">Error: {error}</div></div>
  if (!hostel) return <div className="container-page flex items-center justify-center"><div className="text-lg">Hostel not found</div></div>

  return (
    <div className="container-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hostel Images */}
        <div className="aspect-video w-full bg-black/5 rounded-lg overflow-hidden">
          {hostel.images && hostel.images.length > 0 ? (
            <img className="w-full h-full object-cover" src={hostel.images[0]} alt={hostel.title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No image available
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">{hostel.title}</h1>
              <p className="text-2xl font-semibold text-green-600 mb-2">₦{hostel.price?.toLocaleString()} / year</p>
              <p className="text-black/70 text-lg">{hostel.description}</p>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{hostel.bedrooms}</div>
                <div className="text-sm text-gray-600">Bedrooms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{hostel.bathrooms}</div>
                <div className="text-sm text-gray-600">Bathrooms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{hostel.school}</div>
                <div className="text-sm text-gray-600">School</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{hostel.area}</div>
                <div className="text-sm text-gray-600">Area</div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="font-semibold mb-2 text-black text-lg">Location</h3>
              <p className="text-black/70 mb-2">{hostel.location}</p>
              <div className="aspect-video w-full">
                <iframe
                  title="map"
                  className="w-full h-full rounded-lg border border-black/10"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345093745!2d144.9556511155774!3d-37.81732297975101!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ5JzAyLjQiUyAxNDTCsDU3JzI0LjQiRQ!5e0!3m2!1sen!2s!4v1614031200000"
                  allowFullScreen>
                </iframe>
              </div>
            </div>

            {/* Amenities */}
            {hostel.amenities && hostel.amenities.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-black text-lg">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {hostel.amenities.map((amenity, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Status */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2 text-black text-lg">Verification Status</h3>
              <div className="flex items-center gap-2">
                {hostel.isVerified ? (
                  <>
                    <span className="text-green-600">✓</span>
                    <span className="text-green-600 font-medium">Verified Property</span>
                  </>
                ) : (
                  <>
                    <span className="text-yellow-600">⏳</span>
                    <span className="text-yellow-600 font-medium">Pending Verification</span>
                  </>
                )}
              </div>
            </div>
          </section>

          <aside className="lg:col-span-1">
            <div className="bg-white border border-black/10 rounded-lg p-6 space-y-6 sticky top-4">
              <div>
                <h3 className="font-semibold text-black text-lg mb-2">Property Owner</h3>
                <p className="text-gray-700">{hostel.owner?.name}</p>
              </div>

              {/* Contact Methods */}
              <div>
                <h3 className="font-semibold text-black text-lg mb-3">Contact Owner</h3>
                <div className="space-y-3">
                  {hostel.contactPhone && (
                    <button 
                      onClick={() => window.open(`tel:${hostel.contactPhone}`)}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      <span>📞</span>
                      Call {hostel.contactPhone}
                    </button>
                  )}
                  
                  {hostel.contactWhatsapp && (
                    <button 
                      onClick={() => openWhatsApp(hostel.contactWhatsapp)}
                      className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                      <span>💬</span>
                      WhatsApp
                    </button>
                  )}
                  
                  {hostel.contactTelegram && (
                    <button 
                      onClick={() => openTelegram(hostel.contactTelegram)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      <span>✈️</span>
                      Telegram
                    </button>
                  )}
                </div>
              </div>

              {/* Message Form */}
              <div>
                <h3 className="font-semibold text-black text-lg mb-3">Send Message</h3>
                <form className="space-y-3" onSubmit={handleMessageSubmit}>
                  <input 
                    value={messageForm.name}
                    onChange={(e) => setMessageForm({...messageForm, name: e.target.value})}
                    className="w-full border border-black/10 rounded-md px-3 py-2" 
                    placeholder="Your name" 
                    required 
                  />
                  <input 
                    type="email" 
                    value={messageForm.email}
                    onChange={(e) => setMessageForm({...messageForm, email: e.target.value})}
                    className="w-full border border-black/10 rounded-md px-3 py-2" 
                    placeholder="Your email" 
                    required 
                  />
                  <textarea 
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
                    className="w-full border border-black/10 rounded-md px-3 py-2" 
                    rows="4" 
                    placeholder="Your message" 
                    required 
                  />
                  <button className="w-full inline-flex justify-center items-center rounded-md bg-black px-4 py-2 text-white hover:bg-black/90">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
