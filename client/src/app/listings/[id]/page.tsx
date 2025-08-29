'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StarIcon, MapPinIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

type Listing = {
  id: string;
  title: string;
  price: number;
  address: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  images: string[];
  rating: number;
  amenities: string[];
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock data
        const mockListing: Listing = {
          id: params.id as string,
          title: 'Modern Apartment near Campus',
          price: 850,
          address: '123 University Ave, College Town',
          description: 'Beautiful 2-bedroom apartment just a 5-minute walk from campus. Recently renovated with modern appliances and finishes.',
          bedrooms: 2,
          bathrooms: 1,
          sqft: 750,
          images: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
          rating: 4.8,
          amenities: [
            'Washer/Dryer',
            'Central AC',
            'Dishwasher',
            'Furnished',
            'Parking',
            'Pet Friendly'
          ],
        };
        
        setListing(mockListing);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Listing not found</h2>
          <button
            onClick={() => router.back()}
            className="btn-primary inline-flex items-center px-4 py-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <Link href="/listings" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back to Listings
        </Link>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Image gallery */}
          <div className="relative h-96 bg-gray-100">
            {listing.images.length > 0 && (
              <img
                src={listing.images[currentImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            )}
            
            {listing.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {listing.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 w-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{listing.title}</h1>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {listing.address}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${listing.price}<span className="text-base font-normal text-gray-500">/month</span></p>
                <div className="flex items-center justify-end">
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1">{listing.rating}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-3">About this property</h2>
              <p className="text-gray-600">{listing.description}</p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-3">Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <HomeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Bedrooms</p>
                    <p className="font-medium">{listing.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Bathrooms</p>
                    <p className="font-medium">{listing.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Square Feet</p>
                    <p className="font-medium">{listing.sqft} sqft</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-3">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {listing.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="w-full btn-primary py-3 text-lg">
                Contact Property Manager
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
