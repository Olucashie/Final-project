import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createHostel } from '../lib/api'

export default function AddHostel() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', price: '', location: '', school: '', area: '', bedrooms: '', bathrooms: '', amenities: '', images: '', document: null
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e) => {
    if (e.target.type === 'file') {
      setForm({ ...form, [e.target.name]: e.target.files[0] })
    } else {
      setForm({ ...form, [e.target.name]: e.target.value })
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (!form.images) {
      setError('Hostel image is required.')
      setLoading(false)
      return
    }
    // if (!form.document) {
    //   setError('Hostel document is required.')
    //   setLoading(false)
    //   return
    // }
    try {
      // Build plain JS object for hostel creation
      const payload = {
        title: form.title,
        description: form.description,
        price: form.price,
        location: form.location,
        school: form.school,
        area: form.area,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        amenities: form.amenities,
        images: typeof form.images === 'string' ? [form.images] : [],
      }
      await createHostel(payload, token)
      navigate('/listings')
    } catch (err) {
      setError('Failed to create hostel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-4">Add a new hostel</h1>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit} encType="multipart/form-data">
          <input name="title" value={form.title} onChange={onChange} className="border border-black/10 rounded-md px-3 py-2" placeholder="Title" required />
          <input name="price" value={form.price} onChange={onChange} type="number" className="border border-black/10 rounded-md px-3 py-2" placeholder="Price per month" required />
          <input name="school" value={form.school} onChange={onChange} className="border border-black/10 rounded-md px-3 py-2" placeholder="School" required />
          <input name="area" value={form.area} onChange={onChange} className="border border-black/10 rounded-md px-3 py-2" placeholder="Area" required />
          <input name="location" value={form.location} onChange={onChange} className="border border-black/10 rounded-md px-3 py-2" placeholder="Nearby landmark" required />
          <input name="bedrooms" value={form.bedrooms} onChange={onChange} type="number" className="border border-black/10 rounded-md px-3 py-2" placeholder="Beds" required />
          <input name="bathrooms" value={form.bathrooms} onChange={onChange} type="number" className="border border-black/10 rounded-md px-3 py-2" placeholder="Bathrooms" required />
          <input name="amenities" value={form.amenities} onChange={onChange} className="md:col-span-2 border border-black/10 rounded-md px-3 py-2" placeholder="Amenities (comma separated)" />
          <textarea name="description" value={form.description} onChange={onChange} className="md:col-span-2 border border-black/10 rounded-md px-3 py-2" rows="4" placeholder="Description" />
          <input name="images" type="file" accept="image/*" onChange={onChange} className="md:col-span-2 border border-black/10 rounded-md px-3 py-2" required />
          {/* <input name="document" type="file" accept="application/pdf,image/*" onChange={onChange} className="md:col-span-2 border border-black/10 rounded-md px-3 py-2" required /> */}
          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <button type="button" onClick={()=>navigate(-1)} className="border border-black/10 rounded-md px-4 py-2">Cancel</button>
            <button disabled={loading} className="rounded-md bg-black px-4 py-2 text-white hover:bg-black/90">{loading ? 'Saving...' : 'Create hostel'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
