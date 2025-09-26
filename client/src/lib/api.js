export const API_BASE =   'https://finale-project-8z1n.onrender.com/api'

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

export async function createHostel(data, token, onProgress) {
  try {
    if (data instanceof FormData && typeof XMLHttpRequest !== 'undefined') {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/hostels`);
        xhr.setRequestHeader('Authorization', authHeaders(token).Authorization || '');
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable && typeof onProgress === 'function') {
            const percent = Math.round((evt.loaded / evt.total) * 100);
            onProgress(percent);
          }
        };
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              try { resolve(JSON.parse(xhr.responseText)); } catch { resolve({}); }
            } else {
              reject(new Error(`API error ${xhr.status}: ${xhr.responseText}`));
            }
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(data);
      });
      return; // caller can refetch list
    }
    // Fallback to fetch without progress
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

export async function deleteHostel(id, token) {
  const res = await fetch(`${API_BASE}/hostels/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders(token) }
  })
  if (!res.ok) {
    let msg = 'Failed to delete hostel'
    try { const j = await res.json(); if (j?.message) msg = j.message } catch {}
    throw new Error(msg)
  }
  return res.json()
}

// Admin: verify/unverify hostel
export async function verifyHostel(id, token) {
  const res = await fetch(`${API_BASE}/hostels/${id}/verify`, {
    method: 'POST',
    headers: { ...authHeaders(token) }
  })
  if (!res.ok) throw new Error('Failed to verify hostel')
  return res.json()
}

export async function unverifyHostel(id, token) {
  const res = await fetch(`${API_BASE}/hostels/${id}/unverify`, {
    method: 'POST',
    headers: { ...authHeaders(token) }
  })
  if (!res.ok) throw new Error('Failed to unverify hostel')
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

