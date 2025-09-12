import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OwnerDashboard.css';

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  status: 'available' | 'rented' | 'maintenance';
  bookings: Array<{
    id: string;
    startDate: string;
    endDate: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    user: {
      name: string;
      email: string;
      phone: string;
    };
  }>;
};

export default function OwnerDashboard(): React.ReactElement {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddProperty, setShowAddProperty] = useState(false);
  type ListingStatus = 'active' | 'pending' | 'rejected' | 'sold' | 'inactive';
  
  const [newProperty, setNewProperty] = useState<{
    title: string;
    description: string;
    price: string | number;
    address: string;
    location: string;
    latitude: number;
    longitude: number;
    propertyType: string;
    roomType: string;
    availableFrom: string;
    minStayMonths: number | string;
    maxOccupants: number | string;
    bedrooms: number | string;
    bathrooms: number | string;
    size: number | string;
    isFurnished: boolean;
    hasParking: boolean;
    hasWifi: boolean;
    hasKitchen: boolean;
    hasAirConditioning: boolean;
    hasHeating: boolean;
    hasWasher: boolean;
    hasTv: boolean;
    hasDesk: boolean;
    status: ListingStatus;
  }>({
    title: '',
    description: '',
    price: '',
    address: '',
    location: 'Point',
    latitude: 0,
    longitude: 0,
    propertyType: 'apartment',
    roomType: 'private-room',
    availableFrom: new Date().toISOString().split('T')[0],
    minStayMonths: 1,
    maxOccupants: 1,
    bedrooms: 1,
    bathrooms: 1,
    size: 50,
    isFurnished: false,
    hasParking: false,
    hasWifi: false,
    hasKitchen: false,
    hasAirConditioning: false,
    hasHeating: false,
    hasWasher: false,
    hasTv: false,
    hasDesk: false,
    status: 'pending',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setNewProperty(prev => {
      // Handle different input types
      if (type === 'number') {
        const numValue = parseFloat(value);
        return {
          ...prev,
          [name]: isNaN(numValue) ? 0 : numValue
        };
      } else if (type === 'checkbox') {
        return {
          ...prev,
          [name]: (e.target as HTMLInputElement).checked
        };
      } else if (name === 'availableFrom') {
        return {
          ...prev,
          [name]: value // Keep as string for date input
        };
      } else {
        return {
          ...prev,
          [name]: value
        };
      }
    });
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      // Prepare the listing data with all required fields
      // Ensure coordinates are numbers
      const longitude = typeof newProperty.longitude === 'string' 
        ? parseFloat(newProperty.longitude) 
        : Number(newProperty.longitude) || 0;
      
      const latitude = typeof newProperty.latitude === 'string'
        ? parseFloat(newProperty.latitude)
        : Number(newProperty.latitude) || 0;

      const listingData = {
        title: newProperty.title,
        description: newProperty.description || 'No description provided',
        price: parseFloat(newProperty.price as string) || 0,
        address: newProperty.address,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]  // GeoJSON uses [longitude, latitude] order
        },
        propertyType: newProperty.propertyType,
        roomType: newProperty.roomType,
        availableFrom: new Date(newProperty.availableFrom).toISOString(),
        minStayMonths: Number(newProperty.minStayMonths) || 1,
        maxOccupants: Number(newProperty.maxOccupants) || 1,
        bedrooms: Number(newProperty.bedrooms) || 1,
        bathrooms: parseFloat(newProperty.bathrooms as string) || 1,
        size: Number(newProperty.size) || 50,
        isFurnished: Boolean(newProperty.isFurnished),
        hasParking: Boolean(newProperty.hasParking),
        hasWifi: Boolean(newProperty.hasWifi),
        hasKitchen: Boolean(newProperty.hasKitchen),
        hasAirConditioning: Boolean(newProperty.hasAirConditioning),
        hasHeating: Boolean(newProperty.hasHeating),
        hasWasher: Boolean(newProperty.hasWasher),
        hasTv: Boolean(newProperty.hasTv),
        hasDesk: Boolean(newProperty.hasDesk),
        status: 'pending' as const,
      };

      console.log('Submitting listing data:', listingData);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(listingData),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok) {
        let errorMessage = 'Failed to add property';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Server error details:', errorData);
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      // Reset the form
      setShowAddProperty(false);
      setNewProperty({
        title: '',
        description: '',
        price: '',
        address: '',
        location: 'Point',
        latitude: 0,
        longitude: 0,
        propertyType: 'apartment',
        roomType: 'private-room',
        availableFrom: new Date().toISOString().split('T')[0],
        minStayMonths: 1,
        maxOccupants: 1,
        bedrooms: 1,
        bathrooms: 1,
        size: 50,
        isFurnished: false,
        hasParking: false,
        hasWifi: false,
        hasKitchen: false,
        hasAirConditioning: false,
        hasHeating: false,
        hasWasher: false,
        hasTv: false,
        hasDesk: false,
        status: 'pending' as const,
      });
      
      // Refresh the listings
      if (user?.role === 'homeowner') {
        const fetchResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/listings/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setListings(Array.isArray(data.data) ? data.data : []);
        }
      }
    } catch (err) {
      console.error('Error adding property:', err);
      setError(err instanceof Error ? err.message : 'Failed to add property');
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      if (!user) throw new Error('User not authenticated');

      const endpoint = user.role === 'homeowner' ? 'me' : 'owner';
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/listings/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch listings');
      }

      const data = await response.json();
      setListings(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'homeowner' || user.role === 'admin') {
        fetchListings();
      } else {
        setError('Access denied. Homeowner or admin privileges required.');
        setLoading(false);
      }
    } else {
      setError('Please log in to view this page');
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container">
        <h1>Owner Dashboard</h1>
        <p>Loading your listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1>Owner Dashboard</h1>
        {error && <div className="error-message" style={{ color: 'red', margin: '1rem 0' }}>{error}</div>}
      
      {showAddProperty && (
        <div className="property-form">
          <h2>Add New Property</h2>
          <form onSubmit={handleAddProperty}>
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newProperty.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newProperty.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Price per month ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={newProperty.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={newProperty.address}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={newProperty.status}
                onChange={handleInputChange}
                required
              >
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddProperty(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Property
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    );
  }

  return (
    <div className="container">
      {showAddProperty ? (
        <div className="property-form">
          <h2>Add New Property</h2>
          <form onSubmit={handleAddProperty}>
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newProperty.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newProperty.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Price per month ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={newProperty.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={newProperty.address}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={newProperty.status}
                onChange={handleInputChange}
                required
              >
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddProperty(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Property
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="dashboard-header">
            <h1>Welcome, {user?.name}</h1>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowAddProperty(true)}
            >
              + Add New Property
            </button>
          </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Properties</h3>
          <p>{listings.length}</p>
        </div>
        <div className="stat-card">
          <h3>Bookings This Month</h3>
          <p>{
            listings.reduce((count, listing) => {
              const bookings = listing.bookings || [];
              return count + bookings.filter(b => 
                b && b.startDate && new Date(b.startDate).getMonth() === new Date().getMonth()
              ).length;
            }, 0)
          }</p>
        </div>
        <div className="stat-card">
          <h3>Active Listings</h3>
          <p>{listings.filter(l => l.status === 'available').length}</p>
        </div>
      </div>

      <section className="listings-section">
        <div className="section-header">
          <h2>My Properties</h2>
          <div className="filters">
            <select>
              <option>All Status</option>
              <option>Available</option>
              <option>Rented</option>
              <option>Maintenance</option>
            </select>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="empty-state">
            <p>You don't have any properties listed yet.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowAddProperty(true)}
            >
              List Your First Property
            </button>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((listing) => (
              <div key={listing.id} className="property-card">
                <div className="property-header">
                  <h3>
                    <Link to={`/owner/listings/${listing.id}`}>
                      {listing.title}
                    </Link>
                  </h3>
                  <span className={`status-badge ${listing.status}`}>
                    {listing.status}
                  </span>
                </div>
                <p className="property-address">{listing.address}</p>
                <p className="property-price">${listing.price}/month</p>
                
                <div className="property-bookings">
                  <h4>Upcoming Bookings</h4>
                  {listing.bookings && listing.bookings.length > 0 ? (
                    <ul>
                      {listing.bookings.slice(0, 2).map(booking => (
                        <li key={booking.id} className="booking-item">
                          <span>{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}</span>
                          <span>to</span>
                          <span>{booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}</span>
                          <span className={`status ${booking.status || 'pending'}`}>{booking.status || 'pending'}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No upcoming bookings</p>
                  )}
                </div>
                
                <div className="property-actions">
                  <Link to={`/owner/listings/${listing.id}/edit`} className="btn btn-sm btn-outline" style={{ marginRight: '8px' }}>
                    Edit
                  </Link>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this listing?')) {
                        try {
                          const token = localStorage.getItem('token');
                          if (!token) throw new Error('No authentication token found');
                          
                          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/listings/${listing.id}`, {
                            method: 'DELETE',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                            },
                          });

                          if (!response.ok) {
                            throw new Error('Failed to delete listing');
                          }
                          
                          // Refresh the listings after deletion
                          fetchListings();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Failed to delete listing');
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </section>
      </>
    )}
  </div>
  );
}

// Add these styles to your CSS file
/*
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

.stat-card p {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.listings-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.property-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1.25rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.property-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.property-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.property-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.available {
  background: #e3f9e5;
  color: #1b5e20;
}

.status-badge.rented {
  background: #e3f2fd;
  color: #0d47a1;
}

.status-badge.maintenance {
  background: #ffebee;
  color: #c62828;
}

.property-address {
  color: #666;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.property-price {
  font-weight: bold;
  font-size: 1.2rem;
  margin: 0.5rem 0;
  color: #333;
}

.property-bookings {
  margin: 1rem 0;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.property-bookings h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #555;
}

.booking-item {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.85rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.booking-item:last-child {
  border-bottom: none;
}

.booking-item .status {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-weight: 600;
}

.booking-item .status.confirmed {
  background: #e3f9e5;
  color: #1b5e20;
}

.booking-item .status.pending {
  background: #fff8e1;
  color: #e65100;
}

.booking-item .status.cancelled {
  background: #ffebee;
  color: #c62828;
  text-decoration: line-through;
}

.property-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #eee;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background-color: #1a73e8;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #1557b0;
}

.btn-outline {
  background: white;
  border: 1px solid #ddd;
  color: #333;
}

.btn-outline:hover {
  background: #f5f5f5;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
}
*/
