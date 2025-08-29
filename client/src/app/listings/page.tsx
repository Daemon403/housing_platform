'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FunnelIcon, MapPinIcon, StarIcon, HomeIcon } from '@heroicons/react/24/outline';

type Listing = {
  id: string;
  title: string;
  price: number;
  address: string;
  bedrooms: number;
  image: string;
};

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchListings = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockListings: Listing[] = [
          {
            id: '1',
            title: 'Modern Apartment near Campus',
            price: 850,
            address: '123 University Ave',
            bedrooms: 2,
            image: '/placeholder.jpg',
          },
          {
            id: '2',
            title: 'Cozy Studio',
            price: 650,
            address: '456 College St',
            bedrooms: 1,
            image: '/placeholder.jpg',
          },
        ];
        
        setListings(mockListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Student Housing</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Min Price</label>
                <input type="number" className="input-field" placeholder="$" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bedrooms</label>
                <select className="input-field">
                  <option>Any</option>
                  <option>1+</option>
                  <option>2+</option>
                  <option>3+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Property Type</label>
                <select className="input-field">
                  <option>All Types</option>
                  <option>Apartment</option>
                  <option>House</option>
                  <option>Condo</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/listings/${listing.id}`} className="block">
              <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 relative">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs flex items-center">
                    <StarIcon className="h-3 w-3 text-yellow-400 mr-1" />
                    4.8
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">{listing.title}</h3>
                    <p className="font-bold">${listing.price}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {listing.address}
                  </p>
                  <div className="mt-2 text-sm text-gray-600 flex items-center">
                    <HomeIcon className="h-4 w-4 mr-1" />
                    {listing.bedrooms} bed · 1 bath · 750 sqft
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
