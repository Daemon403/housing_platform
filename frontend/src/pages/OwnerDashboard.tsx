import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Listing as ListingType } from '../api/client';
import { PropertyCard } from '../components/PropertyCard';
import type { PropertyCardListing } from '../components/PropertyCard';
import './OwnerDashboard.css';

// Extend the ListingType to include isFavorite and handle address/type
interface Listing extends Omit<ListingType, 'address' | 'images'> {
  address: string | { street?: string; city?: string; state?: string; country?: string; postalCode?: string };
  images?: string[];
  isFavorite?: boolean;
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
  const [error, setError] = useState<string | null>(null);
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

  const fetchListings = useCallback(async (page = 1, limit = 10) => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const listingsData = await api.getMyListings(token);
      const listingsArray = Array.isArray(listingsData) ? listingsData : [];

      setListings(listingsArray);
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages: Math.ceil(listingsArray.length / limit),
        totalItems: listingsArray.length
      }));
    } catch (err) {
      setError('Failed to load listings. Please try again.');
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch favorites from API
  const fetchFavorites = useCallback(async () => {
    if (!token) return;

    try {
      const favs = await api.getFavorites(token);
      setFavorites(Array.isArray(favs) ? favs : []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  }, [token]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (listingId: string, isCurrentlyFavorited: boolean) => {
    if (!token) return;

    try {
      if (isCurrentlyFavorited) {
        await api.unfavorite(token, listingId);
      } else {
        await api.favorite(token, listingId);
      }

      // Update local state
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
      console.error('Error toggling favorite:', err);
    }
  }, [token, fetchFavorites]);

  // Ensure listing has required properties for PropertyCard
  const toPropertyCardListing = (listing: Listing): PropertyCardListing => ({
    ...listing,
    id: listing.id || '',
    title: listing.title || 'No Title',
    description: listing.description || '',
    price: listing.price || 0,
    status: listing.status || 'inactive',
    address: listing.address || '',
    images: Array.isArray(listing.images) ? listing.images : []
  });

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    fetchListings(newPage, pagination.itemsPerPage);
  }, [fetchListings, pagination.itemsPerPage]);

  // Fetch data on component mount
  useEffect(() => {
    if (token) {
      fetchListings(pagination.currentPage, pagination.itemsPerPage);
      fetchFavorites();
    }
  }, [token, fetchListings, fetchFavorites, pagination.currentPage, pagination.itemsPerPage]);

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
        <button
          onClick={() => fetchListings(pagination.currentPage, pagination.itemsPerPage)}
          className="mt-2 text-sm text-red-700 hover:underline"
        >
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
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'properties'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Properties
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'favorites'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Favorites
        </button>
      </div>

      {activeTab === 'properties' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <PropertyCard
              key={listing.id}
              listing={toPropertyCardListing(listing)}
              onToggleFavorite={toggleFavorite}
              isFavorited={!!listing.isFavorite}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <PropertyCard
              key={favorite.id}
              listing={toPropertyCardListing(favorite)}
              onToggleFavorite={toggleFavorite}
              isFavorited={true}
              showActions={false}
            />
          ))}
          {favorites.length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No favorite properties yet. Start by favoriting some properties!
            </div>
          )}
        </div>
      )}
      
      {pagination.totalPages > 1 && activeTab === 'properties' && (
        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="flex items-center">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
export default OwnerDashboard;
