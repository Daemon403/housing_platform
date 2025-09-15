import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PropertyCard } from '../components/PropertyCard';
import { api } from '../api/client';
import type { Listing as ListingType } from '../api/client';
import './OwnerDashboard.css';

// Extend the ListingType to include isFavorite and handle address/type
interface Listing extends Omit<ListingType, 'address' | 'images'> {
  address: string | { street?: string; city?: string; state?: string; country?: string; postalCode?: string };
  images?: string[];
  isFavorite?: boolean;
}

type TabType = 'properties' | 'favorites';

interface Listing extends Omit<ListingType, 'address' | 'images'> {
  address: string | { street?: string; city?: string; state?: string; country?: string; postalCode?: string };
  images?: string[];
  isFavorite?: boolean;
}

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

type TabType = 'properties' | 'favorites';

const OwnerDashboard: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  if (!token) {
    return null; // Show nothing while redirecting
  }
  // State management
  const [activeTab, setActiveTab] = useState<TabType>('properties');
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Define a type for the property form data
  type PropertyFormData = Omit<ListingType, 'id' | 'createdAt' | 'updatedAt' | 'owner' | 'bookings' | 'slug' | 'price' | 'address' | 'location'> & {
    price: string | number;
    address: string;
    latitude: number;
    longitude: number;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
    minStayMonths: string | number;
    maxOccupants: string | number;
    bedrooms: string | number;
    bathrooms: string | number;
    size: string | number;
  };

  const [newProperty, setNewProperty] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: '',
    address: '',
    location: {
      type: 'Point',
      coordinates: [0, 0]
    },
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
    images: [],
  });

  const [propertyImages, setPropertyImages] = useState<File[]>([]);

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

      } else {
        await api.favorite(token, listingId);
      }
      
      // Update both listings and favorites to reflect the favorite status
      setListings(prevListings => 
        prevListings.map(listing => 
          listing.id === listingId 
            ? { ...listing, isFavorite: !isCurrentlyFavorited } 
            : listing
        )
      );

      // Refresh favorites list
      await fetchFavorites();
    } catch (err) {
      console.error('Error updating favorite status:', err);
    }
  }, [token, fetchFavorites]);

  // Fetch user's listings and favorites on component mount
  const fetchListings = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getUserListings(token, {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      });
      
      setListings(response.listings);
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages,
        totalItems: response.totalCount
      }));
    } catch (err) {
      setError('Failed to load listings. Please try again.');
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  }, [token, pagination.currentPage, pagination.itemsPerPage]);

  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    
    setFavoritesLoading(true);
    setFavoritesError(null);
    
    try {
      const favs = await api.getFavorites(token);
      setFavorites(Array.isArray(favs) ? favs : []);
    } catch (err) {
      setFavoritesError('Failed to load favorites. Please try again.');
      console.error('Error fetching favorites:', err);
    } finally {
      setFavoritesLoading(false);
    }
  }, [token]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
    fetchListings(newPage);
  }, [fetchListings]);

  // Tab navigation
  const renderTab = (tab: TabType, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 font-medium ${
        activeTab === tab
          ? 'border-b-2 border-blue-500 text-blue-600'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );

  // Render loading state
  if (loading && activeTab === 'properties') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error && activeTab === 'properties') {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <button onClick={fetchListings} className="mt-2 text-sm text-red-700 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {activeTab === 'properties' ? 'My Properties' : 'My Favorites'}
        </h1>
        <button
          onClick={() => navigate('/add-property')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'properties' 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
          disabled={activeTab !== 'properties'}
        >
          Add New Property
        </button>
      </div>
      <div className="flex mb-6">
        {renderTab('properties', 'Properties')}
        {renderTab('favorites', 'Favorites')}
      </div>
      {activeTab === 'properties' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <PropertyCard
              key={listing.id}
              listing={{
                ...listing,
                address: formatAddress(listing.address),
                images: Array.isArray(listing.images) ? listing.images : []
              }}
              onToggleFavorite={toggleFavorite}
              isFavorited={listing.isFavorite}
              showActions={true}
            />
          ))}
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
