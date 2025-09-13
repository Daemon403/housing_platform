import { Link, Navigate, Route, Routes, useSearchParams, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import './styles/index.css' // Our new unified styles
import { api, type Listing, type Address } from './api/client'
import { PropertyCard } from './components/PropertyCard'
// CSS modules removed in favor of utility classes
import { FilterBar, type Filters } from './components/FilterBar'
import { useAuth } from './context/AuthContext'
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerLayout from './pages/owner/OwnerLayout';
import EditListing from './pages/EditListing';

function Header() {
  const { user, logout } = useAuth()
  return (
    <header className="border-b border-gray-200 py-3 px-4 flex items-center gap-4">
      <Link to="/" className="font-bold text-lg no-underline text-primary-700 hover:text-primary-800">Student Housing</Link>
      <nav className="flex gap-3">
        <Link to="/search" className="text-gray-700 hover:text-primary-600 transition-colors">Search</Link>
        {user && <Link to="/bookings" className="text-gray-700 hover:text-primary-600 transition-colors">My Bookings</Link>}
        {user?.role === 'homeowner' && <Link to="/owner" className="text-gray-700 hover:text-primary-600 transition-colors">Owner Dashboard</Link>}
      </nav>
      <div className="ml-auto opacity-60 text-sm">API: {api.baseUrl}</div>
      <div className="ml-4">
        {!user ? (
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-primary-600 hover:text-primary-800 transition-colors">Login</Link>
            <span className="text-gray-400">·</span>
            <Link to="/register" className="text-primary-600 hover:text-primary-800 transition-colors">Register</Link>
          </div>
        ) : (
          <>
            <span className="mr-2">Hi, {user.name}</span>
            <button 
              onClick={logout} 
              className="ml-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 py-4 text-center mt-6 text-sm text-gray-500">
      Student Housing Platform &copy; {new Date().getFullYear()}
    </footer>
  )
}

function ListingCard({ l }: { l: Listing }) {
  return <PropertyCard listing={l} showActions={false} />;
}

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(Number(searchParams.get('page') || '1'))
  const pageSize = 12

  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.searchListings({ page, pageSize })
      setListings(data.data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { run() }, [page])
  useEffect(() => { setSearchParams(new URLSearchParams({ page: String(page) })) }, [page])
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Discover Student Housing</h1>
      
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading listings: {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!loading && !error && (
        <>
          {listings.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((l) => (
                <li key={l.id}>
                  <ListingCard l={l} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No listings found</h3>
              <p className="mt-1 text-gray-500">Check back later for new student housing options.</p>
            </div>
          )}
          
          {(listings.length > 0 || page > 1) && (
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-700">
                Page <span className="font-medium">{page}</span>
              </span>
              
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={listings.length < pageSize}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  listings.length < pageSize
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}

function ListingDetailPage() {
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { id } = useParams()
  const { token } = useAuth()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [availability, setAvailability] = useState<{available: boolean; message: string} | null>(null)
  const [bookingMsg, setBookingMsg] = useState<string>('')
  const [favMsg, setFavMsg] = useState('')
  useEffect(() => {
    if (!id) return
    api.getListing(id)
      .then((d) => setListing(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])
  return (
    <main className="container">
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {listing && (
        <div>
          <h1>{listing.title}</h1>
          <p>Status: {listing.status}</p>
          <p>Price: ${listing.price}</p>
          {listing.description && <p>{listing.description}</p>}
          {listing.images && listing.images.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {listing.images.map((src, idx) => (
                <img key={idx} src={src} alt="listing" style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 6 }} />
              ))}
            </div>
          )}
          {listing.address && (
            <p style={{ opacity: 0.8, fontSize: 14 }}>
              Address: {typeof listing.address === 'string' 
                ? listing.address 
                : `${listing.address.street || ''}${listing.address.street ? ', ' : ''}${listing.address.city || ''}${(listing.address.city && listing.address.state) ? ', ' : ''}${listing.address.state || ''}`.trim()}
            </p>
          )}
          {listing.amenities && listing.amenities.length > 0 && (
            <p>Amenities: {listing.amenities.join(', ')}</p>
          )}

          <div style={{ borderTop: '1px solid #eee', marginTop: 16, paddingTop: 16 }}>
            <h3>Availability</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
              <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
              <button onClick={async () => {
                if (!id || !startDate || !endDate) return
                try {
                  const response = await api.checkAvailability(id, startDate, endDate)
                  setAvailability({
                    available: response.available,
                    message: response.available ? 'Available' : 'Not available for the selected dates'
                  })
                } catch (error: any) {
                  setAvailability({
                    available: false,
                    message: 'Error checking availability: ' + (error.message || 'Unknown error')
                  })
                }
              }}>Check</button>
              {availability && (
                <span style={{ color: availability.available ? 'green' : 'red' }}>
                  {availability.message}
                </span>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #eee', marginTop: 16, paddingTop: 16 }}>
            <h3>Book this place</h3>
            {!token && <p>Please <Link to="/login">login</Link> to request a booking.</p>}
            {token && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
                <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
                <input type="number" placeholder="Guests" min={1} defaultValue={1} id="guests" />
                <button onClick={async ()=>{
                  const guests = Number((document.getElementById('guests') as HTMLInputElement).value || '1')
                  if (!id || !startDate || !endDate) { setBookingMsg('Pick dates'); return }
                  try{
                    const totalPrice = Number(listing.price) || 0
                    await api.createBooking(token, { listingId: id, startDate, endDate, guests, totalPrice })
                    setBookingMsg('Booking requested!')
                  }catch(e:any){ setBookingMsg('Booking failed') }
                }}>Request Booking</button>
                {bookingMsg && <span>{bookingMsg}</span>}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #eee', marginTop: 16, paddingTop: 16 }}>
            <h3>Favorites</h3>
            {!token ? (
              <p>Login to add to favorites.</p>
            ) : !listing ? (
              <p>Loading listing details...</p>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button 
                  onClick={async () => { 
                    if (!listing.id) {
                      setFavMsg('Invalid listing ID');
                      return;
                    }
                    try { 
                      await api.favorite(token, listing.id); 
                      setFavMsg('Added to favorites');
                    } catch (error) { 
                      console.error('Failed to add to favorites:', error);
                      setFavMsg('Failed to add to favorites');
                    } 
                  }}
                  style={{ padding: '8px 12px', cursor: 'pointer' }}
                >
                  Add to Favorites
                </button>
                <button 
                  onClick={async () => { 
                    if (!listing.id) {
                      setFavMsg('Invalid listing ID');
                      return;
                    }
                    try { 
                      await api.unfavorite(token, listing.id); 
                      setFavMsg('Removed from favorites');
                    } catch (error) { 
                      console.error('Failed to remove from favorites:', error);
                      setFavMsg('Failed to remove from favorites');
                    } 
                  }}
                  style={{ padding: '8px 12px', cursor: 'pointer' }}
                >
                  Remove from Favorites
                </button>
                {favMsg && <span style={{ marginLeft: '10px', color: '#666' }}>{favMsg}</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [results, setResults] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(Number(searchParams.get('page') || '1'))
  const [filters, setFilters] = useState<Filters>({
    q: searchParams.get('q') || '',
    propertyType: searchParams.get('propertyType') || '',
    roomType: searchParams.get('roomType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    lat: searchParams.get('lat') || '',
    lng: searchParams.get('lng') || '',
    radiusKm: searchParams.get('radiusKm') || ''
  })

  const runSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const common = {
        q: filters.q || undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        propertyType: filters.propertyType || undefined,
        roomType: filters.roomType || undefined,
        page,
        pageSize: 12,
      }
      let data
      if (filters.lat && filters.lng && filters.radiusKm) {
        data = await api.nearby({ lat: Number(filters.lat), lng: Number(filters.lng), radiusKm: Number(filters.radiusKm), page, pageSize: 12 })
      } else {
        data = await api.searchListings(common)
      }
      setResults(data.data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const qp = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) qp.set(k, String(v)) })
    qp.set('page', String(page))
    setSearchParams(qp)
  }, [filters, page])

  useEffect(() => { runSearch() }, [filters, page])

  return (
    <main className="container">
      <h1>Search Listings</h1>
      <FilterBar value={filters} onChange={setFilters} onSearch={runSearch} />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {results.map((l) => <ListingCard key={l.id} l={l} />)}
      </ul>
      <div style={{ display: 'flex', gap: 8 }}>
        <button disabled={page<=1} onClick={() => setPage((p)=>p-1)}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p)=>p+1)}>Next</button>
      </div>
    </main>
  )
}

function NotFoundPage() {
  return (
    <main className="container">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/">Go Home</Link>
    </main>
  )
}

function LoginPage() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password')
      return
    }

    setIsSubmitting(true)
    try {
      await login(formData.email, formData.password)
      // On success, the AuthContext will handle the redirect
    } catch (err: any) {
      // More specific error messages based on the error response
      try {
        const errorData = JSON.parse(err.message)
        setError(errorData.error || 'Login failed. Please try again.')
      } catch {
        setError('Login failed. Please check your credentials and try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', maxWidth: '420px' }}>
        <div>
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
            autoComplete="username"
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="password">Password *</label>
            <Link to="/forgot-password" style={{ fontSize: '0.875rem' }}>Forgot password?</Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            minLength={6}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        {error && <p style={{ color: 'crimson', margin: '8px 0 0' }}>{error}</p>}
        
        <p style={{ marginTop: '16px', textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </main>
  )
}

function RegisterPage() {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'homeowner',
    phone: '',
    university: '',
    studentId: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required')
      setIsSubmitting(false)
      return
    }

    if (formData.role === 'student' && !formData.university) {
      setError('University is required for students')
      setIsSubmitting(false)
      return
    }

    try {
      await register(formData)
      // Success state will be handled by the AuthContext redirect
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', maxWidth: '420px' }}>
        <div>
          <label htmlFor="name">Full Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password *</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            minLength={6}
            required
          />
        </div>

        <div>
          <label htmlFor="role">I am a *</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="student">Student</option>
            <option value="homeowner">Homeowner</option>
          </select>
        </div>

        <div>
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (123) 456-7890"
          />
        </div>

        {formData.role === 'student' && (
          <>
            <div>
              <label htmlFor="university">University *</label>
              <input
                id="university"
                name="university"
                type="text"
                value={formData.university}
                onChange={handleChange}
                placeholder="University Name"
                required={formData.role === 'student'}
              />
            </div>
            <div>
              <label htmlFor="studentId">Student ID</label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Student ID (if applicable)"
              />
            </div>
          </>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>

        {error && <p style={{ color: 'crimson', margin: '8px 0 0' }}>{error}</p>}
        
        <p style={{ marginTop: '16px', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </form>
    </main>
  )
}

function MyBookingsPage() {
  const { token } = useAuth()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  if (!token) return <Navigate to="/login" replace />
  useEffect(() => { 
    api.getMyBookings(token).then((d) => setRows(d.data)).catch((e) => setError(e.message)).finally(() => setLoading(false)) 
  }, [token])
  return (
    <main className="container">
      <h1>My Bookings</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {rows.map((b) => (
          <li key={b.id} style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, marginBottom: 8 }}>
            <div><b>Listing:</b> {b.listing?.title || b.listingId}</div>
            <div><b>When:</b> {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</div>
            <div><b>Status:</b> {b.status}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/bookings" element={<MyBookingsPage />} />
        
        {/* Owner Routes */}
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<OwnerDashboard />} />
          <Route path="listings/:id/edit" element={<EditListing />} />
          <Route path="listings" element={<div>Listings Management</div>} />
          <Route path="bookings" element={<div>Bookings Management</div>} />
          <Route path="messages" element={<div>Messages</div>} />
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  )
}
