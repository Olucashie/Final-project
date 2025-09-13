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

export async function createHostel(data, token) {
  try {
    let options = { method: 'POST' };
    if (data instanceof FormData) {
      options.body = data;
      options.headers = { ...authHeaders(token) };
    } else {
      options.body = JSON.stringify(data);
      options.headers = { 'Content-Type': 'application/json', ...authHeaders(token) };
    }
    const res = await fetch(`${API_BASE}/hostels`, options);
    if (!res.ok) {
      const errorMessage = await res.text();
      throw new Error(`API error ${res.status}: ${errorMessage}`);
    }
    return await res.json();
  } catch (err) {
    console.error('createHostel failed:', err);
    throw err;
  }
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

