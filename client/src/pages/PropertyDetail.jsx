import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import { API_BASE } from '../lib/api'
import { verifyHostel, unverifyHostel, deleteHostel } from '../lib/api'

export default function PropertyDetail() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const [hostel, setHostel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [messageForm, setMessageForm] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [modal, setModal] = useState({ open: false, title: '', content: null, type: 'info', onConfirm: null, confirmText: 'Confirm' })

  const closeModal = () => setModal(prev => ({ ...prev, open: false, onConfirm: null }))
  const openInfo = (title, content) => setModal({ open: true, title, content, type: 'info', onConfirm: null, confirmText: 'OK' })
  const openError = (title, content) => setModal({ open: true, title, content, type: 'error', onConfirm: null, confirmText: 'OK' })
  const openConfirm = (title, content, onConfirm, confirmText = 'Confirm') => setModal({ open: true, title, content, type: 'info', onConfirm, confirmText })
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    const fetchHostel = async () => {
      try {
        const res = await fetch(`${API_BASE}/hostels/${id}`, {
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

  const isAdmin = user?.role === 'admin'
  const canDelete = isAdmin || (user?.role === 'agent' && hostel?.owner && (hostel.owner._id === user?.id))

  const handleApprove = async () => {
    try {
      await verifyHostel(hostel._id, token)
      setHostel(prev => ({ ...prev, isVerified: true }))
    } catch (e) {
      openError('Action failed', 'Failed to approve hostel')
    }
  }

  const handleUnapprove = async () => {
    try {
      await unverifyHostel(hostel._id, token)
      setHostel(prev => ({ ...prev, isVerified: false }))
    } catch (e) {
      openError('Action failed', 'Failed to set hostel to pending')
    }
  }

  const handleDelete = async () => {
    if (!canDelete) return
    openConfirm(
      'Delete hostel?',
      <div>
        <p className="text-black/80">Are you sure you want to delete this hostel? This action cannot be undone.</p>
      </div>,
      async () => {
        try {
          await deleteHostel(hostel._id, token)
          closeModal()
          window.location.href = '/listings'
        } catch (e) {
          closeModal()
          openError('Delete failed', e?.message || 'Failed to delete hostel')
        }
      },
      'Delete'
    )
  }

  const handleMessageSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the message via email or store it in a database
    openInfo('Message sent', 'The owner will contact you soon.')
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

  // Initialize map with geocoded address and a blinking marker
  useEffect(() => {
    const address = hostel?.address?.trim()
    if (!address) return

    let isCancelled = false

    const ensureLeaflet = () => {
      if (window.L) return Promise.resolve()
      return new Promise((resolve, reject) => {
        // Load CSS
        const linkId = 'leaflet-css'
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link')
          link.id = linkId
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }

        // Load JS
        const scriptId = 'leaflet-js'
        if (document.getElementById(scriptId)) {
          const existing = document.getElementById(scriptId)
          existing.addEventListener('load', () => resolve())
          existing.addEventListener('error', reject)
          if (window.L) resolve()
          return
        }
        const script = document.createElement('script')
        script.id = scriptId
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.async = true
        script.onload = () => resolve()
        script.onerror = reject
        document.body.appendChild(script)
      })
    }

    const geocode = async (q) => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
      const res = await fetch(url, {
        headers: {
          // Nominatim prefers an identifiable UA; browsers set their own UA header.
          'Accept': 'application/json'
        }
      })
      if (!res.ok) throw new Error('Failed to geocode address')
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) throw new Error('Address not found')
      const { lat, lon } = data[0]
      return [parseFloat(lat), parseFloat(lon)]
    }

    const init = async () => {
      try {
        await ensureLeaflet()
        if (isCancelled) return
        const [lat, lon] = await geocode(address)
        if (isCancelled) return
        const L = window.L

        // Create map or update existing
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = L.map(mapContainerRef.current).setView([lat, lon], 18)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(mapInstanceRef.current)
        } else {
          mapInstanceRef.current.setView([lat, lon], 18)
        }

        // Create or move marker with blinking effect
        const icon = L.divIcon({
          className: 'blink-marker',
          html: '<div class="pin"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 24]
        })

        if (!markerRef.current) {
          markerRef.current = L.marker([lat, lon], { icon }).addTo(mapInstanceRef.current)
        } else {
          markerRef.current.setLatLng([lat, lon])
          markerRef.current.setIcon(icon)
        }
      } catch (e) {
        // Silently fail; map may remain empty if geocoding fails
        // Optionally could set an error state
        console.warn('Map init failed:', e)
      }
    }

    init()

    return () => {
      isCancelled = true
      // Do not destroy the map to allow quick re-renders; cleanup on unmount below
    }
  }, [hostel?.address])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove() } catch {}
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  if (loading) return <div className="container-page flex items-center justify-center"><div className="text-lg">Loading...</div></div>
  if (error) return <div className="container-page flex items-center justify-center"><div className="text-red-600">Error: {error}</div></div>
  if (!hostel) return <div className="container-page flex items-center justify-center"><div className="text-lg">Hostel not found</div></div>

  return (
    <div className="container-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Media Gallery */}
        <div className="space-y-4">
          {/* Main Media Display */}
          <div className="aspect-video w-full bg-black/5 rounded-lg overflow-hidden relative">
            {(() => {
              const allMedia = [
                ...(hostel.images || []).map(url => ({ type: 'image', url })),
                ...(hostel.videos || []).map(url => ({ type: 'video', url }))
              ]
              
              if (allMedia.length === 0) {
                return (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No media available
                  </div>
                )
              }
              
              const currentMedia = allMedia[currentMediaIndex]
              const apiBaseUrl = API_BASE
              const mediaUrl = currentMedia.url.startsWith('http') 
                ? currentMedia.url 
                : `${apiBaseUrl.replace('/api', '')}${currentMedia.url}`
              
              return (
                <>
                  {currentMedia.type === 'image' ? (
                    <img 
                      className="w-full h-full object-cover" 
                      src={mediaUrl} 
                      alt={`${hostel.title} - Image ${currentMediaIndex + 1}`}
                      onError={(e) => {
                        console.error('Image failed to load:', mediaUrl)
                        e.target.src = 'https://picsum.photos/seed/hostel/800/600'
                      }}
                    />
                  ) : (
                    <video 
                      className="w-full h-full object-cover" 
                      controls
                      poster="https://picsum.photos/seed/video/800/600"
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                      onError={(e) => {
                        console.error('Video failed to load:', mediaUrl)
                      }}
                    >
                      <source src={mediaUrl} type="video/mp4" />
                      <source src={mediaUrl} type="video/webm" />
                      <source src={mediaUrl} type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  
                  {/* Media Navigation Arrows */}
                  {allMedia.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentMediaIndex(prev => prev === 0 ? allMedia.length - 1 : prev - 1)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        aria-label="Previous media"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCurrentMediaIndex(prev => prev === allMedia.length - 1 ? 0 : prev + 1)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        aria-label="Next media"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {/* Media Counter */}
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        {currentMediaIndex + 1} / {allMedia.length}
                      </div>
                      
                      {/* Media Type Indicator */}
                      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm capitalize">
                        {currentMedia.type}
                      </div>
                    </>
                  )}
                </>
              )
            })()}
          </div>
          
          {/* Media Thumbnails */}
          {(() => {
            const allMedia = [
              ...(hostel.images || []).map(url => ({ type: 'image', url })),
              ...(hostel.videos || []).map(url => ({ type: 'video', url }))
            ]
            
            if (allMedia.length > 1) {
              return (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allMedia.map((media, index) => {
                    const apiBaseUrl = API_BASE
                    const mediaUrl = media.url.startsWith('http') 
                      ? media.url 
                      : `${apiBaseUrl.replace('/api', '')}${media.url}`
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentMediaIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors relative ${
                          currentMediaIndex === index 
                            ? 'border-blue-500' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {media.type === 'image' ? (
                          <img 
                            className="w-full h-full object-cover" 
                            src={mediaUrl}
                            alt={`Thumbnail ${index + 1}`}
                            onError={(e) => {
                              e.target.src = 'https://picsum.photos/seed/thumb/200/200'
                            }}
                          />
                        ) : (
                          <>
                            <video 
                              className="w-full h-full object-cover" 
                              muted
                            >
                              <source src={mediaUrl} type="video/mp4" />
                            </video>
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            }
            return null
          })()}
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
                <div className="text-2xl font-bold text-black">{hostel.address}</div>
                <div className="text-sm text-gray-600">Address</div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="font-semibold mb-2 text-black text-lg">Location</h3>
              <div className="text-black/80 mb-2">
                <div><span className="font-medium">Address:</span> {hostel.address}</div>
                {hostel.location && (
                  <div className="text-black/70 text-sm"><span className="font-medium">Nearby landmark:</span> {hostel.location}</div>
                )}
              </div>
              <div className="aspect-video w-full">
                <iframe
                  title="map"
                  className="w-full h-full rounded-lg border border-black/10"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(hostel.address || '')}&output=embed`}
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
              {(isAdmin || canDelete) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {isAdmin && (
                    hostel.isVerified ? (
                      <button onClick={handleUnapprove} className="inline-flex items-center rounded-md border border-black/20 px-3 py-1.5 text-sm hover:bg-black/5">Set to Pending</button>
                    ) : (
                      <button onClick={handleApprove} className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">Approve</button>
                    )
                  )}
                  {canDelete && (
                    <button onClick={handleDelete} className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700">Delete Hostel</button>
                  )}
                  {hostel.document && (
                    <a
                      href={hostel.document.startsWith('http') ? hostel.document : `${API_BASE.replace('/api', '')}${hostel.document}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-md border border-black/20 px-3 py-1.5 text-sm hover:bg-black/5"
                    >
                      View Document
                    </a>
                  )}
                </div>
              )}
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
      <Modal
        open={modal.open}
        title={modal.title}
        onClose={closeModal}
        onConfirm={modal.onConfirm || undefined}
        confirmText={modal.confirmText}
        type={modal.type}
      >
        {modal.content}
      </Modal>
      </div>
    </div>
  )
}
