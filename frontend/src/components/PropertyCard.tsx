import { Link } from 'react-router-dom';
import type { Listing } from '../api/client';
import { ImageSlideshow } from './ImageSlideshow';
import styles from '../styles/propertyCard.module.css';

type PropertyCardListing = Omit<Listing, 'images' | 'address'> & {
  images?: string[];
  address: string | { street?: string; city?: string; state?: string; postalCode?: string; country?: string };
};

interface PropertyCardProps {
  listing: PropertyCardListing;
  showBookings?: boolean;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export function PropertyCard({ 
  listing, 
  showBookings = false, 
  showActions = true,
  onDelete 
}: PropertyCardProps) {
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
  const processImageUrl = (url: string) => {
    if (!url) return '';
    
    // If it's already a full URL, return as is
    if (url.startsWith('http') || url.startsWith('//')) {
      return url;
    }
    
    // If it's a relative path starting with 'uploads/', just prepend the API URL
    if (url.startsWith('uploads/')) {
      return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${url}`;
    }
    
    // For any other relative path, assume it's in the uploads directory
    const cleanPath = url.replace(/^[\\/]*(uploads[\\/])?/, 'uploads/');
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${cleanPath}`;
  };

  // Create a simple placeholder image as a data URL
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgODAwIDUwMCI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y1ZjVmNSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObSBJbWFnZSBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==';
  
  // Get a random image from the available images, or use fallback
  const getRandomImage = (images: string[]) => {
    if (!images || images.length === 0) return fallbackImage;
    const randomIndex = Math.floor(Math.random() * images.length);
    return processImageUrl(images[randomIndex]);
  };

  // Use a single random image for the card
  const displayImage = (listing.images && listing.images.length > 0)
    ? getRandomImage(listing.images)
    : fallbackImage;

  // Keep images as an array for the slideshow component
  const images = [displayImage];

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <ImageSlideshow images={images} className={styles.slideshow} />
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
