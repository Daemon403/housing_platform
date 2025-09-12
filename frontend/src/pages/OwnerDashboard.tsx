import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PropertyCard } from '../components/PropertyCard';
import './OwnerDashboard.css';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  user: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string | { street?: string; city?: string; state?: string; country?: string; postalCode?: string };
  status: 'available' | 'rented' | 'maintenance' | 'pending';
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  hasWifi?: boolean;
  hasParking?: boolean;
  hasKitchen?: boolean;
  hasWasher?: boolean;
  hasTv?: boolean;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  hasDesk?: boolean;
  bookings: Booking[];
  images?: string[];
}


interface NewProperty {
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
  minStayMonths: number;
  maxOccupants: number;
  bedrooms: number;
  bathrooms: number;
  size: number;
  isFurnished: boolean;
  hasParking: boolean;
  hasWifi: boolean;
  hasKitchen: boolean;
  hasAirConditioning: boolean;
  hasHeating: boolean;
  hasWasher: boolean;
  hasTv: boolean;
  hasDesk: boolean;
  status: 'available' | 'rented' | 'maintenance' | 'pending';
}

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  const [newProperty, setNewProperty] = useState<NewProperty>({
    title: '',
    description: '',
    price: '',
    address: '',
    location: '',
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
    status: 'available',
  });

  const fetchListings = async (page = 1, limit = 10) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found in localStorage');
        throw new Error('No authentication token found');
      }
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/listings/me?${queryParams}`;
      console.log('Fetching listings from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || `Failed to fetch listings: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Listings data received:', responseData);
      
      // Handle paginated response
      if (responseData && responseData.success && Array.isArray(responseData.data)) {
        setListings(responseData.data);
        setPagination({
          currentPage: responseData.currentPage || 1,
          totalPages: responseData.totalPages || 1,
          totalItems: responseData.total || responseData.data.length,
          itemsPerPage: responseData.data.length || 10
        });
      } else {
        console.warn('Unexpected API response format:', responseData);
        setListings([]);
        setPagination(prev => ({
          ...prev,
          totalItems: 0,
          currentPage: 1,
          totalPages: 1
        }));
      }
      setError(null);
    } catch (err) {
      console.error('Error in fetchListings:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        error: err,
        timestamp: new Date().toISOString()
      });
      setError(`Failed to load your properties. ${err instanceof Error ? err.message : 'Please try again later.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/listings/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete listing');
        }

        fetchListings();
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing. Please try again.');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setNewProperty(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Validate required fields
      if (!newProperty.title || !newProperty.price || !newProperty.address) {
        throw new Error('Please fill in all required fields (title, price, address)');
      }

      const propertyData = {
        ...newProperty,
        price: parseFloat(newProperty.price as string) || 0,
        bedrooms: Number(newProperty.bedrooms) || 1,
        bathrooms: Number(newProperty.bathrooms) || 1,
        size: Number(newProperty.size) || 50,
        minStayMonths: Number(newProperty.minStayMonths) || 1,
        maxOccupants: Number(newProperty.maxOccupants) || 1,
        // Ensure all required fields have default values
        location: newProperty.location || newProperty.address,
        latitude: newProperty.latitude || 0,
        longitude: newProperty.longitude || 0,
        propertyType: newProperty.propertyType || 'apartment',
        roomType: newProperty.roomType || 'private-room',
        availableFrom: newProperty.availableFrom || new Date().toISOString().split('T')[0],
        // Set status to 'pending' as per database schema
        status: 'pending',
      };

      console.log('Submitting property data:', propertyData);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(propertyData),
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('Server responded with error:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        
        let errorMessage = 'Failed to add property';
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.errors) {
          // Handle validation errors
          errorMessage = Object.values(responseData.errors).join('\n');
        }
        throw new Error(errorMessage);
      }

      // Reset form and fetch updated listings
      setNewProperty({
        title: '',
        description: '',
        price: '',
        address: '',
        location: '',
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
        status: 'available',
      });
      
      setShowAddProperty(false);
      fetchListings();
      
    } catch (error) {
      console.error('Error in handleAddProperty:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to add property. Please try again.'}`);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchListings(newPage, pagination.itemsPerPage);
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'homeowner' || user.role === 'admin') {
        fetchListings(pagination.currentPage, pagination.itemsPerPage);
      } else {
        setError('Access denied. Homeowner or admin privileges required.');
        setLoading(false);
      }
    } else {
      setError('Please log in to view this page');
      setLoading(false);
    }
  }, [user, pagination.currentPage, pagination.itemsPerPage]);

  // Debug: log listings when they change
  useEffect(() => {
    console.log('Listings state updated:', listings);
  }, [listings]);

  if (loading) {
    return (
      <div className="container">
        <h1>Owner Dashboard</h1>
        <p>Loading your properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1>Owner Dashboard</h1>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Properties</h1>
        {!showAddProperty && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddProperty(true)}
          >
            Add New Property
          </button>
        )}
      </div>

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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="propertyType">Property Type *</label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={newProperty.propertyType}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="roomType">Room Type *</label>
                <select
                  id="roomType"
                  name="roomType"
                  value={newProperty.roomType}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="private-room">Private Room</option>
                  <option value="entire-place">Entire Place</option>
                  <option value="shared-room">Shared Room</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bedrooms">Bedrooms *</label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  min="1"
                  max="20"
                  value={newProperty.bedrooms}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bathrooms">Bathrooms *</label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  min="1"
                  max="20"
                  step="0.5"
                  value={newProperty.bathrooms}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="size">Size (sq ft) *</label>
                <input
                  type="number"
                  id="size"
                  name="size"
                  min="1"
                  value={newProperty.size}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newProperty.description}
                onChange={handleInputChange}
                rows={4}
                className="form-control"
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
              <label>Available From *</label>
              <input
                type="date"
                id="availableFrom"
                name="availableFrom"
                value={newProperty.availableFrom}
                onChange={handleInputChange}
                required
                className="form-control"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Amenities</label>
              <div className="amenities-grid">
                {[
                  { id: 'hasWifi', label: 'WiFi' },
                  { id: 'hasParking', label: 'Parking' },
                  { id: 'hasKitchen', label: 'Kitchen' },
                  { id: 'hasWasher', label: 'Washer' },
                  { id: 'hasTv', label: 'TV' },
                  { id: 'hasAirConditioning', label: 'Air Conditioning' },
                  { id: 'hasHeating', label: 'Heating' },
                  { id: 'hasDesk', label: 'Desk' },
                  { id: 'isFurnished', label: 'Furnished' },
                ].map(amenity => (
                  <div key={amenity.id} className="form-check">
                    <input
                      type="checkbox"
                      id={amenity.id}
                      name={amenity.id}
                      checked={!!newProperty[amenity.id as keyof NewProperty]}
                      onChange={handleInputChange}
                      className="form-check-input"
                    />
                    <label htmlFor={amenity.id} className="form-check-label">
                      {amenity.label}
                    </label>
                  </div>
                ))}
              </div>
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
        <div className="dashboard-content">
          <div className="stats-container">
            <div className="stat-card">
              <h3>Total Properties</h3>
              <p>{listings.length || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Bookings This Month</h3>
              <p>{
                Array.isArray(listings) ? listings.reduce((count, listing) => {
                  const bookings = Array.isArray(listing?.bookings) ? listing.bookings : [];
                  return count + bookings.filter(b => 
                    b && b.startDate && new Date(b.startDate).getMonth() === new Date().getMonth()
                  ).length;
                }, 0) : 0
              }</p>
            </div>
            <div className="stat-card">
              <h3>Active Listings</h3>
              <p>{Array.isArray(listings) ? listings.filter(l => l?.status === 'available').length : 0}</p>
            </div>
          </div>

          <h2>My Listings</h2>
          {!Array.isArray(listings) || listings.length === 0 ? (
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
            <>
              <div className="listings-grid">
                {listings.map((listing) => (
                  <PropertyCard 
                    key={listing.id}
                    listing={listing}
                    showBookings={true}
                    onDelete={handleDeleteListing}
                  />
                ))}
              </div>
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button 
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
