import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Listing as ListingType } from '../api/client';
import { PropertyCard } from '../components/PropertyCard';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './OwnerDashboard.css';

// Types
type TabType = 'properties' | 'favorites';
// new stuff 

// Define the shape of a property card listing
interface PropertyCardListing {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  size: number;
  status: string;
  isFavorite?: boolean;
}

// Extend the base ListingType with our custom fields
interface Listing extends Omit<ListingType, 'address' | 'images' | 'status'> {
  address: string | { street?: string; city?: string; state?: string; country?: string; postalCode?: string };
  images: string[];
  isFavorite?: boolean;
  maximum_occupancy?: number;
  current_occupancy?: number;
  maxOccupants?: number;
  id: string;
  status: 'available' | 'rented' | 'maintenance' | 'pending' | 'rejected' | 'sold' | 'inactive';
}

const OwnerDashboard: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
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

  // Navigation function for adding new property
  const handleAddProperty = useCallback(() => {
    navigate('/owner/listings/new');
  }, [navigate]);

  // Handle tab change
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // Fetch favorites
  const fetchFavorites = useCallback(async () => {
    if (!token) return;

    try {
      const response = await api.getFavorites(token);

      // Transform the favorites to include the isFavorite flag
      const favoritesWithFlag = response.data.map((favorite: ListingType) => ({
        ...favorite,
        isFavorite: true,
        // Ensure required fields have default values
        id: favorite.id || '',
        address: favorite.address || '',
        images: favorite.images || [],
        status: (favorite.status as 'available' | 'rented' | 'maintenance' | 'pending' | 'rejected' | 'sold' | 'inactive') || 'inactive'
      } as Listing));

      setFavorites(favoritesWithFlag);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      toast.error('Failed to load favorites');
    }
  }, [token]);

  // Fetch owner's listings with pagination
  const fetchListings = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!token) return;

      setLoading(true);
      try {
        // Call the API with just the token
        const response = await api.getMyListings(token);

        // The response should have a data property with the listings array
        const listingsData = response.data || [];
        
        // Apply client-side pagination since the API doesn't support it natively
        const paginatedListings = listingsData.slice(
          (page - 1) * limit,
          page * limit
        );
        
        // Transform the listings to include the isFavorite flag and ensure required fields
        const listingsWithFavorites = paginatedListings.map((listing: ListingType) => ({
          ...listing,
          isFavorite: favorites.some((fav) => fav.id === listing.id),
          // Ensure required fields have default values
          id: listing.id || '',
          address: listing.address || '',
          images: listing.images || [],
          status: (listing.status as 'available' | 'rented' | 'maintenance' | 'pending' | 'rejected' | 'sold' | 'inactive') || 'inactive'
        } as Listing));

        setListings(listingsWithFavorites);
        
        // Set pagination based on the response or use defaults
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(listingsData.length / limit),
          totalItems: listingsData.length,
          itemsPerPage: limit,
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load properties. Please try again later.');
        toast.error('Failed to load properties');
      } finally {
        setLoading(false);
      }
    },
    [token, favorites]
  );

  // Initial data fetch
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchListings(pagination.currentPage, pagination.itemsPerPage);
    fetchFavorites();
  }, [token, navigate, fetchListings, fetchFavorites, pagination.currentPage, pagination.itemsPerPage]);

  // Convert listing to PropertyCard format
  const toPropertyCardListing = useCallback(
    (listing: Listing): PropertyCardListing => ({
      id: listing.id,
      title: listing.title || 'No Title',
      description: listing.description || '',
      price: listing.price || 0,
      address: typeof listing.address === 'string'
        ? listing.address
        : `${listing.address?.street || ''}, ${listing.address?.city || ''}`.trim(),
      images: Array.isArray(listing.images) ? listing.images : [],
      bedrooms: listing.bedrooms || 0,
      bathrooms: listing.bathrooms || 0,
      size: listing.size || 0,
      status: listing.status || 'inactive',
      isFavorite: listing.isFavorite,
    }),
    []
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > pagination.totalPages) return;
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
      fetchListings(newPage, pagination.itemsPerPage);
    },
    [pagination.totalPages, pagination.itemsPerPage, fetchListings]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (listingId: string, isCurrentlyFavorited: boolean) => {
      if (!token) return;

      try {
        if (isCurrentlyFavorited) {
          await api.unfavorite(token, listingId);
        } else {
          await api.favorite(token, listingId);
        }

        // Update local state
        setListings((prevListings) =>
          prevListings.map((listing) =>
            listing.id === listingId
              ? { ...listing, isFavorite: !isCurrentlyFavorited }
              : listing
          )
        );

        // Update favorites list
        setFavorites((prevFavorites) =>
          isCurrentlyFavorited
            ? prevFavorites.filter((fav) => fav.id !== listingId)
            : [
                ...prevFavorites,
                {
                  ...listings.find((l) => l.id === listingId)!,
                  isFavorite: true,
                },
              ]
        );
      } catch (err) {
        console.error('Error toggling favorite:', err);
        toast.error('Failed to update favorites');
      }
    },
    [token, listings]
  );

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <button
          onClick={() => fetchListings(pagination.currentPage, pagination.itemsPerPage)}
          className="ml-2 px-2 py-1 text-xs font-semibold text-red-700 hover:text-red-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {activeTab === 'properties' ? 'My Properties' : 'My Favorites'}
        </h1>
        <button
          onClick={handleAddProperty}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors shadow-md hover:shadow-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Property
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('properties')}
            className={`${activeTab === 'properties'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Properties
          </button>
          <button
            onClick={() => handleTabChange('favorites')}
            className={`${activeTab === 'favorites'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Favorites
          </button>
        </nav>
      </div>

      {activeTab === 'properties' ? (
        <>
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="mt-2 text-lg font-medium text-gray-900">No properties found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new property.</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleAddProperty}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Property
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <PropertyCard
                    listing={{
                      id: listing.id,
                      title: listing.title,
                      description: listing.description || 'No description available',
                      price: listing.price,
                      address: listing.address as string,
                      images: listing.images || [],
                      bedrooms: listing.bedrooms,
                      bathrooms: listing.bathrooms,
                      size: listing.size,
                      isFavorite: listing.isFavorite || false,
                      status: listing.status,
                    }}
                    onFavoriteToggle={() => toggleFavorite(listing.id, listing.isFavorite || false)}
                    isFavorited={listing.isFavorite || false}
                  />
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {listing.current_occupancy || 0} / {listing.maximum_occupancy || 1} occupied
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/owner/listings/${listing.id}/edit`)}
                          className="text-sm text-primary-600 hover:text-primary-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {}}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No favorites yet</h3>
              <p className="mt-1 text-sm text-gray-500">Properties you favorite will appear here.</p>
            </div>
          ) : (
            favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <PropertyCard
                  listing={toPropertyCardListing(favorite)}
                  onFavoriteToggle={() => toggleFavorite(favorite.id, true)}
                />
                <div className="p-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {favorite.current_occupancy || 0} / {favorite.maximum_occupancy || 1} occupied
                    </span>
                    <button
                      onClick={() => navigate(`/listings/${favorite.id}`)}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {pagination.totalPages > 1 && activeTab === 'properties' && (
        <div className="mt-8 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              // Calculate page number based on current page and total pages
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.currentPage <= 3) {
                pageNum = i + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    pagination.currentPage === pageNum
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};
export default OwnerDashboard;
