import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createHostel } from '../lib/api'

export default function AddHostel() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', price: '', location: '', school: '', area: '', bedrooms: '', bathrooms: '', amenities: '', images: '', document: null,
    contactPhone: '', contactWhatsapp: '', contactTelegram: '', verificationDocuments: ''
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
        contactPhone: form.contactPhone,
        contactWhatsapp: form.contactWhatsapp,
        contactTelegram: form.contactTelegram,
        verificationDocuments: form.verificationDocuments ? form.verificationDocuments.split(',').map(url => url.trim()) : []
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Hostel</h1>
            <p className="text-gray-600">Create a listing for your hostel property</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <form className="space-y-8" onSubmit={onSubmit} encType="multipart/form-data">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hostel Title</label>
                  <input 
                    name="title" 
                    value={form.title} 
                    onChange={onChange} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="Enter hostel title" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price per Month (₦)</label>
                  <input 
                    name="price" 
                    value={form.price} 
                    onChange={onChange} 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="Enter price" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
                  <input 
                    name="school" 
                    value={form.school} 
                    onChange={onChange} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="Enter school name" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
                  <input 
                    name="area" 
                    value={form.area} 
                    onChange={onChange} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="Enter area" 
                    required 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location/Landmark</label>
                  <input 
                    name="location" 
                    value={form.location} 
                    onChange={onChange} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="Enter nearby landmark" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Bedrooms</label>
                  <input 
                    name="bedrooms" 
                    value={form.bedrooms} 
                    onChange={onChange} 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="Enter number of bedrooms" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Bathrooms</label>
                  <input 
                    name="bathrooms" 
                    value={form.bathrooms} 
                    onChange={onChange} 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="Enter number of bathrooms" 
                    required 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                  <input 
                    name="amenities" 
                    value={form.amenities} 
                    onChange={onChange} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="WiFi, Air Conditioning, Parking, etc. (comma separated)" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={onChange} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    rows="4" 
                    placeholder="Describe your hostel in detail" 
                  />
                </div>
              </div>
            </div>
            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                  <input 
                    name="contactPhone" 
                    value={form.contactPhone} 
                    onChange={onChange} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="+234 123 456 7890" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                  <input 
                    name="contactWhatsapp" 
                    value={form.contactWhatsapp} 
                    onChange={onChange} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="+234 123 456 7890" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telegram Username</label>
                  <input 
                    name="contactTelegram" 
                    value={form.contactTelegram} 
                    onChange={onChange} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="@username" 
                  />
                </div>
              </div>
            </div>
            
            {/* Verification Documents */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Verification Documents</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document URLs</label>
                <input 
                  name="verificationDocuments" 
                  value={form.verificationDocuments} 
                  onChange={onChange} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="https://drive.google.com/file/..., https://example.com/deed.pdf" 
                />
                <p className="text-sm text-gray-600 mt-2">
                  Provide URLs to documents proving hostel ownership (property deed, rental agreement, etc.). 
                  Separate multiple URLs with commas.
                </p>
              </div>
            </div>
            
            {/* Image Upload */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Hostel Images</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Hostel Image</label>
                <input 
                  name="images" 
                  type="file" 
                  accept="image/*" 
                  onChange={onChange} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  required 
                />
                <p className="text-sm text-gray-600 mt-2">Upload a clear image of your hostel (JPG, PNG, GIF)</p>
              </div>
            </div>
            
            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={()=>navigate(-1)} 
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={loading} 
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Hostel...
                  </div>
                ) : (
                  'Create Hostel'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
