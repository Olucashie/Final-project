import { useState } from 'react'
import Alert from '../components/Alert'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createHostel } from '../lib/api'

export default function AddHostel() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', price: '', location: '', school: '', address: '', bedrooms: '', bathrooms: '', amenities: '', images: [], video: null, document: null
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onChange = (e) => {
    if (e.target.type === 'file') {
      if (e.target.name === 'images') {
        const newFiles = Array.from(e.target.files || [])
        setForm(prev => {
          const existing = Array.isArray(prev.images) ? prev.images : []
          // merge and ensure uniqueness by name+size+lastModified
          const merged = [...existing, ...newFiles]
          const seen = new Set()
          const unique = []
          for (const f of merged) {
            const key = `${f.name}|${f.size}|${f.lastModified}`
            if (!seen.has(key)) {
              seen.add(key)
              unique.push(f)
            }
          }
          // no client-side cap; server enforces total payload size (~200MB)
          return { ...prev, images: unique }
        })
        // clear the input so selecting the same files again triggers onChange
        try { e.target.value = '' } catch {}
      } else if (e.target.name === 'video') {
        const file = e.target.files && e.target.files[0]
        if (file) {
          const isVideo = (file.type || '').startsWith('video/')
          const maxBytes = 100 * 1024 * 1024 // 100MB to match server
          if (!isVideo) {
            setError('Please select a valid video file')
          } else if (file.size > maxBytes) {
            setError('Video too large. Max 100MB.')
          } else {
            setForm({ ...form, video: file })
          }
        } else {
          setForm({ ...form, video: null })
        }
        // clear input to allow re-selecting the same file
        try { e.target.value = '' } catch {}
      } else if (e.target.name === 'document') {
        const file = e.target.files && e.target.files[0]
        const allowed = new Set(['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
        if (file) {
          if (!allowed.has(file.type)) {
            setError('Document must be PDF, DOC, or DOCX')
          } else {
            setForm({ ...form, document: file })
          }
        } else {
          setForm({ ...form, document: null })
        }
        try { e.target.value = '' } catch {}
      } else {
        setForm({ ...form, [e.target.name]: e.target.files[0] })
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value })
    }
  }

  const removeVideo = () => setForm(prev => ({ ...prev, video: null }))
  const removeDocument = () => setForm(prev => ({ ...prev, document: null }))

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: (Array.isArray(prev.images) ? prev.images : []).filter((_, i) => i !== index)
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Require a document before submitting
    if (!(form.document instanceof File)) {
      setError('Hostel document is required (PDF, DOC, or DOCX).')
      setLoading(false)
      return
    }
    // if (!form.document) {
    //   setError('Hostel document is required.')
    //   setLoading(false)
    //   return
    // }
    try {
      // Submit as multipart/form-data to support image upload
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('price', String(form.price))
      if (form.location) fd.append('location', form.location)
      fd.append('school', form.school)
      fd.append('address', form.address)
      fd.append('bedrooms', String(form.bedrooms))
      fd.append('bathrooms', String(form.bathrooms))
      if (form.amenities) {
        const list = String(form.amenities).split(',').map(s => s.trim()).filter(Boolean)
        for (const a of list) fd.append('amenities', a)
      }
      for (const img of form.images) fd.append('images', img)
      if (form.video instanceof File) fd.append('video', form.video)
      if (form.document instanceof File) fd.append('document', form.document)
      await createHostel(fd, token, (p)=>setProgress(p))
      navigate('/listings')
    } catch (err) {
      setError(err?.message || 'Failed to create hostel')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  return (
    <div className="container-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-4">Add a new hostel</h1>
        {error && (
          <div className="mb-3">
            <Alert type="error" title="Upload failed" message={error} onClose={()=>setError('')} />
          </div>
        )}
        {progress > 0 && (
          <div className="mb-3">
            <div className="h-2 w-full bg-black/10 rounded">
              <div className="h-2 bg-black rounded" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-black/60 mt-1">Uploading: {progress}%</p>
          </div>
        )}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit} encType="multipart/form-data">
          <input name="title" value={form.title} onChange={onChange} className="border border-black/10 rounded-md px-3 py-2" placeholder="Title" required />
          <input name="price" value={form.price} onChange={onChange} type="number" className="border border-black/10 rounded-md px-3 py-2" placeholder="Price per month" required />
          <input name="school" value={form.school} onChange={onChange} className="border border-black/10 rounded-md px-3 py-2" placeholder="School" required />
          <input name="address" value={form.address} onChange={onChange} className="border border-black/10 rounded-md px-3 py-2" placeholder="Address" required />
          <input name="location" value={form.location} onChange={onChange} className="border border-black/10 rounded-md px-3 py-2" placeholder="Nearby landmark" />
          <input name="bedrooms" value={form.bedrooms} onChange={onChange} type="number" className="border border-black/10 rounded-md px-3 py-2" placeholder="Beds" required />
          <input name="bathrooms" value={form.bathrooms} onChange={onChange} type="number" className="border border-black/10 rounded-md px-3 py-2" placeholder="Bathrooms" required />
          <input name="amenities" value={form.amenities} onChange={onChange} className="md:col-span-2 border border-black/10 rounded-md px-3 py-2" placeholder="Amenities (comma separated)" />
          <textarea name="description" value={form.description} onChange={onChange} className="md:col-span-2 border border-black/10 rounded-md px-3 py-2" rows="4" placeholder="Description" required />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-black mb-1 flex items-center gap-2">
              <span>🖼️</span>
              Add Multiple Images
            </label>
            <p className="text-xs text-black/60 mb-2">Upload multiple images (JPG/PNG). Total upload size limit ~200MB.</p>
            <label className="flex items-center justify-center border-2 border-dashed border-black/20 rounded-md p-4 hover:border-black/40 cursor-pointer bg-white">
              <input name="images" type="file" accept="image/*" multiple onChange={onChange} className="sr-only" />
              <div className="text-center">
                <div className="text-sm font-medium text-black">Click to upload</div>
              </div>
            </label>
          </div>
          {Array.isArray(form.images) && form.images.length > 0 && (
            <div className="md:col-span-2 text-xs text-black/60">Selected {form.images.length} images</div>
          )}
          {Array.isArray(form.images) && form.images.length > 0 && (
            <div className="md:col-span-2 grid grid-cols-3 gap-2">
              {form.images.map((f, idx) => (
                <div key={idx} className="relative group">
                  <img src={URL.createObjectURL(f)} alt={`preview-${idx+1}`} className="h-24 w-full object-cover rounded border border-black/10" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-black text-white rounded-full h-6 w-6 flex items-center justify-center text-xs shadow hover:bg-black/80"
                    aria-label={`Remove image ${idx + 1}`}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-black mb-1 flex items-center gap-2">
              <span>🎥</span>
              Add Video (optional)
            </label>
            <p className="text-xs text-black/60 mb-2">Max 100MB. MP4 recommended for best compatibility.</p>
            <label className="flex items-center justify-center border-2 border-dashed border-black/20 rounded-md p-4 hover:border-black/40 cursor-pointer bg-white">
              <input name="video" type="file" accept="video/*" onChange={onChange} className="sr-only" />
              <div className="text-center">
                <div className="text-sm font-medium text-black">Click to upload</div>
              </div>
            </label>
            {form.video && (
              <div className="mt-2 flex items-center justify-between rounded border border-black/10 bg-white px-3 py-2 text-sm">
                <div className="truncate">
                  <span className="font-medium text-black">{form.video.name}</span>
                  <span className="text-black/60 ml-2">({Math.round(form.video.size / 1024 / 1024 * 10) / 10} MB)</span>
                </div>
                <button type="button" onClick={removeVideo} className="text-red-600 hover:text-red-700 text-xs">Remove</button>
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-black mb-1 flex items-center gap-2">
              <span>📄</span>
              Hostel Document (required)
            </label>
            <p className="text-xs text-black/60 mb-2">Upload PDF, DOC, or DOCX that proves ownership/authorization for the hostel.</p>
            <label className="flex items-center justify-center border-2 border-dashed border-black/20 rounded-md p-4 hover:border-black/40 cursor-pointer bg-white">
              <input name="document" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onChange} className="sr-only" />
              <div className="text-center">
                <div className="text-sm font-medium text-black">Click to upload</div>
              </div>
            </label>
            {form.document && (
              <div className="mt-2 flex items-center justify-between rounded border border-black/10 bg-white px-3 py-2 text-sm">
                <div className="truncate">
                  <span className="font-medium text-black">{form.document.name}</span>
                  <span className="text-black/60 ml-2">({Math.round(form.document.size / 1024 / 1024 * 10) / 10} MB)</span>
                </div>
                <button type="button" onClick={removeDocument} className="text-red-600 hover:text-red-700 text-xs">Remove</button>
              </div>
            )}
          </div>
          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <button type="button" onClick={()=>navigate(-1)} className="border border-black/10 rounded-md px-4 py-2">Cancel</button>
            <button disabled={loading} className="rounded-md bg-black px-4 py-2 text-white hover:bg-black/90">{loading ? 'Saving...' : 'Create hostel'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
