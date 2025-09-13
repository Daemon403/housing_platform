export type Address = {
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

export type Listing = {
  id?: string
  _id?: string
  title: string
  description: string
  price: number
  slug?: string
  status: 'available' | 'rented' | 'maintenance' | 'pending' | 'rejected' | 'sold' | 'inactive' | string
  images: string[]
  address: string | Address
  bedrooms?: number
  bathrooms?: number
  size?: number
  hasWifi?: boolean
  hasParking?: boolean
  hasKitchen?: boolean
  hasWasher?: boolean
  hasTv?: boolean
  hasAirConditioning?: boolean
  hasHeating?: boolean
  hasDesk?: boolean
  propertyType?: string
  roomType?: string
  availableFrom?: string
  minStayMonths?: number
  maxOccupants?: number
  isFurnished?: boolean
  location?: {
    type: string
    coordinates: [number, number]
  }
  amenities?: string[]
  bookings?: Array<{
    id: string
    startDate: string
    endDate: string
    status: 'pending' | 'confirmed' | 'cancelled' | 'rejected'
    user: {
      name: string
      email: string
      phone: string
    }
  }>
  createdAt?: string
  updatedAt?: string
  owner?: {
    id: string
    name: string
    email: string
  }
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
  async checkAvailability(
    listingId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{
    success: boolean;
    available: boolean;
    message: string;
    nextAvailableDates?: { startDate: string; endDate: string };
    availableRanges?: Array<{ startDate: string; endDate: string }>;
  }> {
    const q = new URLSearchParams({ startDate, endDate });
    const response = await http<{
      success: boolean;
      available: boolean;
      message: string;
      nextAvailableDates?: { startDate: string; endDate: string };
      availableRanges?: Array<{ startDate: string; endDate: string }>;
    }>(`/api/v1/listings/${listingId}/availability?${q.toString()}`);
    
    return response;
  },
  async createBooking(token: string, payload: { listingId: string; startDate: string; endDate: string; guests: number; totalPrice: number; paymentMethod?: string }) {
    try {
      const response = await fetch(`${API_URL}/api/v1/bookings`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        // If we have error details from the server, include them in the error
        const errorMessage = data.message || data.error || 'Failed to create booking';
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).details = data.details || {};
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error; // Re-throw to be handled by the caller
    }
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
    return http<Listing>('/api/v1/listings', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    })
  },
  async uploadListingImages(token: string, listingId: string, files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await fetch(`${API_URL}/api/v1/listings/${listingId}/images`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type header - let the browser set it with the correct boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to upload images');
    }

    return response.json();
  },
  async deleteListingImage(token: string, listingId: string, imageUrl: string) {
    return http(`/api/v1/listings/${listingId}/images`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl }),
    });
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
