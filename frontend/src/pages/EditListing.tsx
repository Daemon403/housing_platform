import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ListingData {
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
  status: string;
}

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useAuth(); // We keep this to ensure authentication is checked
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<ListingData>({
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

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/listings/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch listing');
        }

        const data = await response.json();
        setListing({
          ...data.data,
          // Ensure coordinates are properly set
          latitude: data.data.location?.coordinates?.[1] || 0,
          longitude: data.data.location?.coordinates?.[0] || 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setListing(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
             type === 'number' ? parseFloat(value) || 0 :
             value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/listings/${id}`;
      console.log('Sending request to:', apiUrl);
      
      const requestBody = {
        ...listing,
        location: {
          type: 'Point',
          coordinates: [listing.longitude, listing.latitude]
        }
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json().catch(() => ({}));
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `Failed to update listing (${response.status})`);
      }

      // Show success message and redirect to the owner dashboard
      alert('Listing updated successfully!');
      navigate('/owner');
    } catch (err) {
      console.error('Error updating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="edit-listing">
      <h2>Edit Property</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={listing.title}
            onChange={handleInputChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={listing.description}
            onChange={handleInputChange}
            className="form-control"
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price per month ($) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={listing.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={listing.address}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="latitude">Latitude *</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={listing.latitude}
              onChange={handleInputChange}
              step="0.000001"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="longitude">Longitude *</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={listing.longitude}
              onChange={handleInputChange}
              step="0.000001"
              required
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="propertyType">Property Type *</label>
            <select
              id="propertyType"
              name="propertyType"
              value={listing.propertyType}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="room">Room</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="roomType">Room Type *</label>
            <select
              id="roomType"
              name="roomType"
              value={listing.roomType}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="entire-place">Entire Place</option>
              <option value="private-room">Private Room</option>
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
              value={listing.bedrooms}
              onChange={handleInputChange}
              min="1"
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
              value={listing.bathrooms}
              onChange={handleInputChange}
              min="1"
              step="0.5"
              required
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="size">Size (sq ft) *</label>
            <input
              type="number"
              id="size"
              name="size"
              value={listing.size}
              onChange={handleInputChange}
              min="1"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxOccupants">Max Occupants *</label>
            <input
              type="number"
              id="maxOccupants"
              name="maxOccupants"
              value={listing.maxOccupants}
              onChange={handleInputChange}
              min="1"
              required
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="minStayMonths">Minimum Stay (months) *</label>
            <input
              type="number"
              id="minStayMonths"
              name="minStayMonths"
              value={listing.minStayMonths}
              onChange={handleInputChange}
              min="1"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="availableFrom">Available From *</label>
            <input
              type="date"
              id="availableFrom"
              name="availableFrom"
              value={listing.availableFrom}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Amenities</label>
          <div className="amenities-grid">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isFurnished"
                checked={listing.isFurnished}
                onChange={handleInputChange}
              />
              <span>Furnished</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hasParking"
                checked={listing.hasParking}
                onChange={handleInputChange}
              />
              <span>Parking</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hasWifi"
                checked={listing.hasWifi}
                onChange={handleInputChange}
              />
              <span>WiFi</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hasKitchen"
                checked={listing.hasKitchen}
                onChange={handleInputChange}
              />
              <span>Kitchen</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hasAirConditioning"
                checked={listing.hasAirConditioning}
                onChange={handleInputChange}
              />
              <span>Air Conditioning</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hasHeating"
                checked={listing.hasHeating}
                onChange={handleInputChange}
              />
              <span>Heating</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hasWasher"
                checked={listing.hasWasher}
                onChange={handleInputChange}
              />
              <span>Washer</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hasTv"
                checked={listing.hasTv}
                onChange={handleInputChange}
              />
              <span>TV</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hasDesk"
                checked={listing.hasDesk}
                onChange={handleInputChange}
              />
              <span>Desk</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status *</label>
          <select
            id="status"
            name="status"
            value={listing.status}
            onChange={handleInputChange}
            required
            className="form-control"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/owner/dashboard')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
