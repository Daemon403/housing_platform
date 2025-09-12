import { Link, Route, Routes, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import { api, type Listing } from './api/client'

function Header() {
  return (
    <header style={{ borderBottom: '1px solid #eee', padding: '12px 16px', display: 'flex', gap: 16, alignItems: 'center' }}>
      <Link to="/" style={{ fontWeight: 700, textDecoration: 'none' }}>Student Housing</Link>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/search">Search</Link>
      </nav>
      <div style={{ marginLeft: 'auto', opacity: 0.6, fontSize: 13 }}>API: {api.baseUrl}</div>
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
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    api.getListings({ pageSize: 20 })
      .then((d) => setListings(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])
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
    </main>
  )
}

function ListingDetailPage() {
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const id = location.pathname.split('/').pop() as string
  useEffect(() => {
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
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  const runSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.searchListings({
        q,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: 1,
        pageSize: 20,
      })
      setResults(data.data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const qp = new URLSearchParams()
    if (q) qp.set('q', q)
    if (minPrice) qp.set('minPrice', minPrice)
    if (maxPrice) qp.set('maxPrice', maxPrice)
    setSearchParams(qp)
  }, [q, minPrice, maxPrice])

  return (
    <main className="container">
      <h1>Search Listings</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
        <input placeholder="Min Price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <input placeholder="Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        <button onClick={runSearch}>Search</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {results.map((l) => <ListingCard key={l.id} l={l} />)}
      </ul>
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

export default function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  )
}
