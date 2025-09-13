import { Link, Navigate, Route, Routes, useSearchParams, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import './styles/index.css' // Our new unified styles
import { api, type Listing } from './api/client'
import { PropertyCard } from './components/PropertyCard'
// CSS modules removed in favor of utility classes
import { FilterBar, type Filters } from './components/FilterBar'
import { useAuth } from './context/AuthContext'
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerLayout from './pages/owner/OwnerLayout';
import EditListing from './pages/EditListing';

function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: '/search', label: 'Search' },
    ...(user ? [{ to: '/bookings', label: 'My Bookings' }] : []),
    ...(user?.role === 'homeowner' ? [{ to: '/owner', label: 'Owner Dashboard' }] : []),
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                StudentHousing
              </span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 hover:text-primary-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary-500 text-sm font-medium transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:ml-6 md:flex md:items-center">
            {!user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="ml-4 flex items-center md:ml-6">
                <div className="relative">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                      Hi, {user.name}
                    </span>
                    <button
                      onClick={logout}
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={`mobile-${link.to}`}
                to={link.to}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 hover:border-primary-500"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!user ? (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="space-y-1 px-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="px-4">
                  <div className="text-sm font-medium text-gray-500">Signed in as</div>
                  <div className="text-sm font-medium text-gray-900 truncate">{user.email}</div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
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
  const [guests, setGuests] = useState(1)
  const [isBooking, setIsBooking] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [availability, setAvailability] = useState<{
    available: boolean;
    message: string;
    nextAvailableDates?: { startDate: string; endDate: string };
    availableRanges?: Array<{ startDate: string; endDate: string }>;
  } | null>(null)
  const [bookingMsg, setBookingMsg] = useState<{type: 'success' | 'error', message: string | React.ReactNode} | null>(null)
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

          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium mb-3">Check Availability</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                  <input 
                    id="checkInDate"
                    type="date" 
                    value={startDate} 
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setStartDate(e.target.value)} 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                  <input 
                    id="checkOutDate"
                    type="date" 
                    value={endDate} 
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    className="px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!startDate || !endDate || isCheckingAvailability}
                    onClick={async () => {
                      if (!id || !startDate || !endDate) return;
                      setIsCheckingAvailability(true);
                      try {
                        const res = await api.checkAvailability(id, startDate, endDate);
                        setAvailability(res);
                      } catch (error) {
                        console.error('Error checking availability:', error);
                        setAvailability({
                          available: false,
                          message: 'Error checking availability. Please try again.'
                        });
                      } finally {
                        setIsCheckingAvailability(false);
                      }
                    }}
                  >
                    {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
                  </button>
                </div>
              </div>
              
              {availability && (
                <div className={`p-3 rounded-md ${
                  availability.available 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-yellow-50 text-yellow-800'
                }`}>
                  <p className="font-medium">{availability.message}</p>
                  
                  {!availability.available && availability.nextAvailableDates && (
                    <div className="mt-2">
                      <p className="text-sm">Next available dates:</p>
                      <button
                        onClick={() => {
                          setStartDate(availability.nextAvailableDates!.startDate);
                          setEndDate(availability.nextAvailableDates!.endDate);
                        }}
                        className="mt-1 text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline"
                      >
                        {new Date(availability.nextAvailableDates.startDate).toLocaleDateString()} - {new Date(availability.nextAvailableDates.endDate).toLocaleDateString()}
                      </button>
                    </div>
                  )}
                  
                  {!availability.available && availability.availableRanges && availability.availableRanges.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm">Other available date ranges:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {availability.availableRanges.map((range, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setStartDate(range.startDate);
                              // Set end date to 1 day after start by default
                              const end = new Date(range.startDate);
                              end.setDate(end.getDate() + 1);
                              setEndDate(end.toISOString().split('T')[0]);
                            }}
                            className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded border border-gray-300 hover:bg-gray-100"
                          >
                            {new Date(range.startDate).toLocaleDateString()}
                            {range.startDate !== range.endDate && ` - ${new Date(range.endDate).toLocaleDateString()}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <h3 className="text-lg font-medium mb-3">Book this place</h3>
            {!token ? (
              <p className="text-gray-600">
                Please <Link to="/login" className="text-primary-600 hover:underline">login</Link> to request a booking.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                    <input 
                      id="startDate"
                      type="date" 
                      value={startDate} 
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)} 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                    <input 
                      id="endDate"
                      type="date" 
                      value={endDate} 
                      min={startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEndDate(e.target.value)} 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                    <input 
                      type="number" 
                      id="guests"
                      min={1} 
                      max={listing.maxOccupants || 10}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {bookingMsg && (
                  <div className={`p-3 rounded-md ${bookingMsg.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {bookingMsg.message}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-lg font-medium">
                    {listing.price ? `$${listing.price} / night` : 'Price not available'}
                  </div>
                  <button 
                    onClick={async () => {
                      if (!id || !startDate || !endDate) { 
                        setBookingMsg({type: 'error', message: 'Please select check-in and check-out dates'}); 
                        return; 
                      }
                      
                      if (new Date(startDate) >= new Date(endDate)) {
                        setBookingMsg({type: 'error', message: 'Check-out date must be after check-in date'});
                        return;
                      }
                      setIsBooking(true);
                      setBookingMsg(null);
                      
                      try {
                        // Validate dates first
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        if (start < today) {
                          throw new Error('Check-in date cannot be in the past');
                        }
                        if (end <= start) {
                          throw new Error('Check-out date must be after check-in date');
                        }

                        // Check availability
                        const availability = await api.checkAvailability(id, startDate, endDate);
                        
                        if (!availability.available) {
                          if (availability.nextAvailableDates) {
                            throw new Error(
                              `The selected dates are not available. Next available: ${new Date(availability.nextAvailableDates.startDate).toLocaleDateString()} - ${new Date(availability.nextAvailableDates.endDate).toLocaleDateString()}`
                            );
                          } else {
                            throw new Error('The selected dates are not available. Please try different dates.');
                          }
                        }

                        // Calculate total price
                        const numNights = Math.ceil(
                          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                        ) || 1;
                        const totalPrice = Number(listing.price) * numNights;
                        
                        // Create the booking
                        await api.createBooking(token, { 
                          listingId: id, 
                          startDate: start.toISOString().split('T')[0],
                          endDate: end.toISOString().split('T')[0],
                          guests,
                          totalPrice
                        });
                        
                        setBookingMsg({
                          type: 'success', 
                          message: 'Booking requested successfully! We\'ll get back to you soon.'
                        });
                        setStartDate('');
                        setEndDate('');
                        setGuests(1);
                      } catch (e: any) {
                        console.error('Booking error:', e);
                        let errorMessage = 'Failed to process your booking. ';
                        
                        // Handle different types of errors
                        if (e.status === 400) {
                          if (e.details && Array.isArray(e.details)) {
                            // Handle validation errors from the server
                            errorMessage += e.details.map((d: any) => d.message).join(' ');
                          } else if (e.message.includes('not available')) {
                            errorMessage = e.message;
                          } else {
                            errorMessage += 'Please check your input and try again.';
                          }
                        } else if (e.status === 409) {
                          errorMessage = 'You already have a booking for these dates.';
                        } else if (e.message) {
                          errorMessage = e.message;
                        } else {
                          errorMessage += 'Please try again later.';
                        }
                        
                        setBookingMsg({
                          type: 'error',
                          message: errorMessage
                        });
                      } finally {
                        setIsBooking(false);
                      }
                    }}
                    disabled={isBooking}
                    className="px-6 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBooking ? 'Processing...' : 'Request to Book'}
                  </button>
                </div>
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
