import React from 'react';
import { Link } from 'react-router-dom';
import type { Listing } from '../api/client';
import { ImageSlideshow } from './ImageSlideshow';
import styles from '../styles/propertyCard.module.css';

interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export type PropertyCardListing = Omit<Listing, 'images' | 'address'> & {
  images?: string[];
  address: string | Address;
  id: string; // Ensure id is always a string
};

interface PropertyCardProps {
  listing: PropertyCardListing;
  showBookings?: boolean;
  showActions?: boolean;
  isFavorited?: boolean;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (listingId: string, isFavorited: boolean) => void;
  onEdit?: (id: string) => void; // Added onEdit prop
}

export function PropertyCard({ 
  listing, 
  showBookings = false, 
  showActions = true,
  isFavorited = false,
  onDelete,
  onToggleFavorite,
  onEdit
}: PropertyCardProps) {
  const listingId = listing.id || '';
  const formatAddress = (address: string | { street?: string; city?: string; state?: string; postalCode?: string; country?: string } | undefined): string => {
    if (!address) return 'No address provided';
    if (typeof address === 'string') return address;
    
    // Handle Address object
    const { street, city, state, postalCode, country } = address;
    const parts: string[] = [];
    if (street) parts.push(street);
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (postalCode) parts.push(postalCode);
    if (country) parts.push(country);
    
    return parts.length > 0 ? parts.join(', ') : 'No address provided';
  };

  const formattedAddress = formatAddress(listing.address);

  // Convert file paths to HTTP URLs if needed
  const processImageUrl = (url: string | undefined): string => {
    if (!url) return '';
    
    // If it's already a full URL, return as is
    if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) {
      return url;
    }
    
    // If it's a relative path, prepend the API URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Handle different path formats
    if (url.startsWith('/')) {
      // Remove leading slash if present to prevent double slashes
      return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    
    // Handle paths that might be missing the uploads prefix
    if (!url.startsWith('uploads/')) {
      return `${baseUrl}/uploads/${url}`;
    }
    
    return `${baseUrl}/${url}`;
  };

  // Path to the placeholder image in the public directory
  const fallbackImage = '/images/placeholder.png';
  
  // Process all available images for the slideshow, with error handling and fallback
  const processedImages = React.useMemo(() => {
    if (!listing.images || !Array.isArray(listing.images) || listing.images.length === 0) {
      return [fallbackImage];
    }
    
    // Process and filter images
    const images = listing.images
      .map(img => {
        try {
          const processed = processImageUrl(img);
          return processed || null;
        } catch (e) {
          console.warn('Failed to process image URL:', img, e);
          return null;
        }
      })
      .filter((img): img is string => Boolean(img));
    
    // If no valid images were found, use the fallback
    return images.length > 0 ? images : [fallbackImage];
  }, [listing.images]);

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <ImageSlideshow 
          images={processedImages} 
          className={styles.slideshow} 
          interval={processedImages.length > 1 ? 5000 : 0}
        />
        {onToggleFavorite && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(listingId, isFavorited);
            }}
            className={`${styles.favoriteButton} ${isFavorited ? styles.favorited : ''}`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill={isFavorited ? 'currentColor' : 'none'} 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              style={{ width: '1.5rem', height: '1.5rem' }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          </button>
        )}
        {listing.status && (
          <div className={`${styles.statusBadge} ${styles[listing.status] || ''}`}>
            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <Link to={`/listing/${listing.id}`}>{listing.title}</Link>
          </h3>
          <div className={styles.address}>
            <i className="fas fa-map-marker-alt"></i>
            {formattedAddress}
          </div>
        </div>


        <div className={styles.price}>
          ${listing.price?.toLocaleString()}
          <span>/month</span>
        </div>

        <div className={styles.details}>
          {listing.bedrooms && (
            <div className={styles.detailItem}>
              <i className="fas fa-bed"></i>
              <span>{listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
            </div>
          )}
          {listing.bathrooms && (
            <div className={styles.detailItem}>
              <i className="fas fa-bath"></i>
              <span>{listing.bathrooms} {listing.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            </div>
          )}
          {listing.size && (
            <div className={styles.detailItem}>
              <i className="fas fa-ruler-combined"></i>
              <span>{listing.size} sqft</span>
            </div>
          )}
        </div>

        <div className={styles.amenities}>
          {listing.hasWifi && <span className={styles.amenity}><i className="fas fa-wifi"></i> WiFi</span>}
          {listing.hasParking && <span className={styles.amenity}><i className="fas fa-parking"></i> Parking</span>}
          {listing.hasKitchen && <span className={styles.amenity}><i className="fas fa-utensils"></i> Kitchen</span>}
          {listing.hasWasher && <span className={styles.amenity}><i className="fas fa-tshirt"></i> Washer</span>}
          {listing.hasTv && <span className={styles.amenity}><i className="fas fa-tv"></i> TV</span>}
          {listing.hasAirConditioning && <span className={styles.amenity}><i className="fas fa-snowflake"></i> AC</span>}
          {listing.hasHeating && <span className={styles.amenity}><i className="fas fa-thermometer-three-quarters"></i> Heating</span>}
          {listing.hasDesk && <span className={styles.amenity}><i className="fas fa-laptop-house"></i> Workspace</span>}
        </div>

        {showBookings && listing.bookings && listing.bookings.length > 0 && (
          <div className={styles.bookings}>
            <h4>Upcoming Bookings</h4>
            <ul className={styles.bookingList}>
              {listing.bookings.slice(0, 2).map(booking => (
                <li key={booking.id} className={styles.bookingItem}>
                  <i className="far fa-calendar"></i>
                  <div className={styles.bookingDates}>
                    <span>{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}</span>
                    <i className="fas fa-arrow-right"></i>
                    <span>{booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <span className={`${styles.bookingStatus} ${styles[booking.status || 'pending']}`}>
                    <i className={`fas fa-${booking.status === 'confirmed' ? 'check-circle' : booking.status === 'cancelled' ? 'times-circle' : 'clock'}`}></i>
                    {booking.status || 'pending'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showActions && (
          <div className={styles.footer}>
            {listing.bookings && listing.bookings.length > 0 && (
            <div className={styles.bookingCount}>
              {listing.bookings.length} {listing.bookings.length === 1 ? 'Booking' : 'Bookings'}
            </div>
          )}
            <div className={styles.actions}>
              {listing.id && (
                <>
                  <Link to={`/owner/listings/${listing.id}/edit`} className={`${styles.button} ${styles.primary}`}>
                    <i className="fas fa-edit"></i> Manage
                  </Link>
                  {onDelete && (
                    <button 
                      className={`${styles.button} ${styles.danger}`}
                      onClick={() => listing.id && onDelete(listing.id)}
                      title="Delete Property"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
