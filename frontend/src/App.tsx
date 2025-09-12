import { Link, Navigate, Route, Routes, useSearchParams, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { api, type Listing } from './api/client'
import { FilterBar, type Filters } from './components/FilterBar'
import { useAuth } from './context/AuthContext'

function Header() {
  const { user, logout } = useAuth()
  return (
    <header style={{ borderBottom: '1px solid #eee', padding: '12px 16px', display: 'flex', gap: 16, alignItems: 'center' }}>
      <Link to="/" style={{ fontWeight: 700, textDecoration: 'none' }}>Student Housing</Link>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/search">Search</Link>
        {user && <Link to="/bookings">My Bookings</Link>}
        {user && user.role === 'homeowner' && <Link to="/owner">Owner Dashboard</Link>}
      </nav>
      <div style={{ marginLeft: 'auto', opacity: 0.6, fontSize: 13 }}>API: {api.baseUrl}</div>
      <div style={{ marginLeft: 16 }}>
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <span> · </span>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <span style={{ marginRight: 8 }}>Hi, {user.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #eee', padding: 16, textAlign: 'center', marginTop: 24, fontSize: 13, opacity: 0.7 }}>
      © {new Date().getFullYear()} Student Housing Platform
    </footer>
  )
}

function ListingCard({ l }: { l: Listing }) {
  return (
    <li style={{ border: '1px solid #eee', padding: '12px', borderRadius: 8, marginBottom: 8 }}>
      <div style={{ fontWeight: 600 }}>
        <Link to={`/listing/${l.id}`} style={{ textDecoration: 'none' }}>{l.title}</Link>
      </div>
      <div style={{ fontSize: 14, opacity: 0.8 }}>Price: ${l.price} • Status: {l.status}</div>
    </li>
  )
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
    <main className="container">
      <h1>Discover Housing</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {!loading && !error && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {listings.map((l) => <ListingCard key={l.id} l={l} />)}
          {listings.length === 0 && <li>No listings found.</li>}
        </ul>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button disabled={page<=1} onClick={() => setPage((p)=>p-1)}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p)=>p+1)}>Next</button>
      </div>
    </main>
  )
}

function ListingDetailPage() {
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { id } = useParams()
  const { user, token } = useAuth()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [avail, setAvail] = useState<string>('')
  const [bookingMsg, setBookingMsg] = useState<string>('')
  const canFavorite = !!token
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
            <p style={{ opacity: 0.8, fontSize: 14 }}>Address: {listing.address.street}, {listing.address.city}, {listing.address.state}</p>
          )}
          {listing.amenities && listing.amenities.length > 0 && (
            <p>Amenities: {listing.amenities.join(', ')}</p>
          )}

          <div style={{ borderTop: '1px solid #eee', marginTop: 16, paddingTop: 16 }}>
            <h3>Availability</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
              <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
              <button onClick={async ()=>{
                if (!id || !startDate || !endDate) return
                try{ const r = await api.checkAvailability(id, startDate, endDate); setAvail(r.available? 'Available' : 'Not available') }catch(e:any){ setAvail('Error checking availability') }
              }}>Check</button>
              {avail && <span>{avail}</span>}
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
            {!token ? <p>Login to add to favorites.</p> : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={async ()=>{ try{ await api.favorite(token!, listing.id); setFavMsg('Added to favorites') }catch{ setFavMsg('Failed') } }}>Add</button>
                <button onClick={async ()=>{ try{ await api.unfavorite(token!, listing.id); setFavMsg('Removed from favorites') }catch{ setFavMsg('Failed') } }}>Remove</button>
                {favMsg && <span>{favMsg}</span>}
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
  const [email, setEmail] = useState('alice@student.edu')
  const [password, setPassword] = useState('Password123!')
  const [error, setError] = useState<string| null>(null)
  const [ok, setOk] = useState('')
  return (
    <main className="container">
      <h1>Login</h1>
      <div style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button onClick={async ()=>{
          try{ setError(null); await login(email, password); setOk('Logged in') }catch(e:any){ setError('Login failed') }
        }}>Login</button>
        {error && <p style={{ color:'crimson' }}>{error}</p>}
        {ok && <p>{ok}</p>}
      </div>
    </main>
  )
}

function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('Test User')
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('Password123!')
  const [role, setRole] = useState<'student'|'homeowner'>('student')
  const [error, setError] = useState<string| null>(null)
  const [ok, setOk] = useState('')
  return (
    <main className="container">
      <h1>Register</h1>
      <div style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <select value={role} onChange={(e)=>setRole(e.target.value as any)}>
          <option value="student">Student</option>
          <option value="homeowner">Homeowner</option>
        </select>
        <button onClick={async ()=>{
          try{ setError(null); await register({ name, email, password, role }); setOk('Registered') }catch(e:any){ setError('Register failed') }
        }}>Create account</button>
        {error && <p style={{ color:'crimson' }}>{error}</p>}
        {ok && <p>{ok}</p>}
      </div>
    </main>
  )
}

function MyBookingsPage() {
  const { token } = useAuth()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string| null>(null)
  if (!token) return <Navigate to="/login" replace />
  useEffect(() => { api.getMyBookings(token).then((d)=>setRows(d.data)).catch((e)=>setError(e.message)).finally(()=>setLoading(false)) }, [token])
  return (
    <main className="container">
      <h1>My Bookings</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      <ul style={{ listStyle:'none', padding:0 }}>
        {rows.map((b)=> (
          <li key={b.id} style={{ border:'1px solid #eee', padding:12, borderRadius:8, marginBottom:8 }}>
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  )
}
