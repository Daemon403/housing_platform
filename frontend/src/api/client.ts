export type Listing = {
  id: string
  title: string
  description?: string
  price: string | number
  slug?: string
  status: string
  images?: string[]
  address?: Record<string, any>
  amenities?: string[]
}

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000'

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  baseUrl: API_URL,
  async getListings(params?: { page?: number; pageSize?: number }) {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.pageSize) q.set('limit', String(params.pageSize))
    const data = await http<{ data: Listing[] }>(`/api/v1/listings${q.toString() ? `?${q.toString()}` : ''}`)
    return data.data
  },
  async getListing(id: string) {
    const data = await http<{ data: Listing }>(`/api/v1/listings/${id}`)
    return data.data
  },
  async searchListings(params: {
    q?: string
    minPrice?: number
    maxPrice?: number
    propertyType?: string
    roomType?: string
    page?: number
    pageSize?: number
  }) {
    const q = new URLSearchParams()
    if (params.q) q.set('q', params.q)
    if (params.minPrice != null) q.set('minPrice', String(params.minPrice))
    if (params.maxPrice != null) q.set('maxPrice', String(params.maxPrice))
    if (params.propertyType) q.set('propertyType', params.propertyType)
    if (params.roomType) q.set('roomType', params.roomType)
    if (params.page) q.set('page', String(params.page))
    if (params.pageSize) q.set('pageSize', String(params.pageSize))
    const data = await http<{ data: Listing[]; pagination: any }>(`/api/v1/listings/search?${q.toString()}`)
    return data
  },
  async nearby(params: { lat: number; lng: number; radiusKm: number; page?: number; pageSize?: number }) {
    const q = new URLSearchParams()
    q.set('lat', String(params.lat))
    q.set('lng', String(params.lng))
    q.set('radiusKm', String(params.radiusKm))
    if (params.page) q.set('page', String(params.page))
    if (params.pageSize) q.set('pageSize', String(params.pageSize))
    const data = await http<{ data: Listing[]; pagination: any }>(`/api/v1/listings/nearby?${q.toString()}`)
    return data
  },
  async checkAvailability(listingId: string, startDate: string, endDate: string) {
    const q = new URLSearchParams({ startDate, endDate })
    return http<{ success: true; available: boolean }>(`/api/v1/listings/${listingId}/availability?${q.toString()}`)
  },
  async createBooking(token: string, payload: { listingId: string; startDate: string; endDate: string; guests: number; totalPrice: number; paymentMethod?: string }) {
    return http<{ success: true; data: any }>(`/api/v1/bookings`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
  },
  async getMyBookings(token: string) {
    return http<{ success: true; data: any[] }>(`/api/v1/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  },
  async favorite(token: string, listingId: string) {
    return http<{ success: true }>(`/api/v1/listings/${listingId}/favorite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
  },
  async unfavorite(token: string, listingId: string) {
    return http<{ success: true }>(`/api/v1/listings/${listingId}/favorite`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
  },
  async getFavorites(token: string) {
    return http<{ success: true; data: Listing[] }>(`/api/v1/users/me/favorites`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  },
  // Owner endpoints
  async getMyListings(token: string) {
    return http<{ success: true; data: Listing[] }>(`/api/v1/users/me/listings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  },
  async createListing(token: string, payload: Partial<Listing> & { price: number }) {
    return http<{ success: true; data: Listing }>(`/api/v1/listings`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
  },
  async updateListing(token: string, id: string, payload: Partial<Listing>) {
    return http<{ success: true; data: Listing }>(`/api/v1/listings/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
  },
  async deleteListing(token: string, id: string) {
    return http<{ success: true }>(`/api/v1/listings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
  },
  async getOwnerBookings(token: string, listingId: string) {
    return http<{ success: true; data: any[] }>(`/api/v1/bookings/listing/${listingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  },
  async approveBooking(token: string, bookingId: string) {
    return http<{ success: true; data: any }>(`/api/v1/bookings/${bookingId}/approve`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
    })
  },
  async rejectBooking(token: string, bookingId: string) {
    return http<{ success: true; data: any }>(`/api/v1/bookings/${bookingId}/reject`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
    })
  },
  // Auth updates
  async updateDetails(token: string, payload: Partial<{ name: string; email: string }>) {
    return http<{ success: true; data: any }>(`/api/v1/auth/updatedetails`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload)
    })
  },
  async updatePassword(token: string, payload: { currentPassword: string; newPassword: string }) {
    return http<{ success: true }>(`/api/v1/auth/updatepassword`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload)
    })
  }
}
