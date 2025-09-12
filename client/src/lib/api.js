export const API_BASE =  'https://final-project-za5c.onrender.com/api'

export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Hostels
export async function listHostels(token, query={}) {
  const qs = new URLSearchParams(query).toString()
  const url = `${API_BASE}/hostels${qs ? `?${qs}` : ''}`
  const res = await fetch(url, { headers: { ...authHeaders(token) } })
  if (!res.ok) throw new Error('Failed to load hostels')
  return res.json()
}

export async function searchHostels(token, query={}) {
  const qs = new URLSearchParams(query).toString()
  const url = `${API_BASE}/hostels/search${qs ? `?${qs}` : ''}`
  const res = await fetch(url, { headers: { ...authHeaders(token) } })
  if (!res.ok) throw new Error('Failed to search hostels')
  return res.json()
}

export async function getHostel(token, id) {
  const res = await fetch(`${API_BASE}/hostels/${id}`, { headers: { ...authHeaders(token) } })
  if (!res.ok) throw new Error('Failed to get hostel')
  return res.json()
}

export async function createHostel(payload, token) {
  const res = await fetch(`${API_BASE}/hostels`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(token) }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('Failed to create hostel')
  return res.json()
}

// Favorites
export async function getFavorites(token) {
  const res = await fetch(`${API_BASE}/favorites`, { headers: { ...authHeaders(token) }})
  if (!res.ok) throw new Error('Failed to fetch favorites')
  return res.json()
}

export async function addFavorite(hostelId, token) {
  const res = await fetch(`${API_BASE}/favorites/add`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(token) }, body: JSON.stringify({ hostelId }) })
  if (!res.ok) throw new Error('Failed to add favorite')
  return res.json()
}

export async function removeFavorite(hostelId, token) {
  const res = await fetch(`${API_BASE}/favorites/remove`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(token) }, body: JSON.stringify({ hostelId }) })
  if (!res.ok) throw new Error('Failed to remove favorite')
  return res.json()
}

