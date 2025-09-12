import { Link } from 'react-router-dom';
import type { Listing } from '../api/client';
import styles from '../styles/propertyCard.module.css';

interface PropertyCardProps {
  listing: Listing;
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
  const formatAddress = (address: string | any) => {
    if (!address) return 'No address provided';
    if (typeof address === 'string') return address;
    
    const { street = '', city = '', state = '', country = '', postalCode = '' } = address;
    const parts = [];
    
    if (street) parts.push(street);
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (postalCode) parts.push(postalCode);
    if (country) parts.push(country);
    
    return parts.join(', ');
  };

  const formattedAddress = formatAddress(listing.address);

  return (
    <div className={styles.card}>
      <img 
        src={listing.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} 
        alt={listing.title} 
        className={styles.image}
      />
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

        <div className={`${styles.status} ${styles[listing.status || 'available']}`}>
          {listing.status || 'Available'}
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
              <Link to={`/owner/listings/${listing.id}/edit`} className={`${styles.button} ${styles.primary}`}>
                <i className="fas fa-edit"></i> Manage
              </Link>
              {onDelete && (
                <button 
                  className={`${styles.button} ${styles.danger}`}
                  onClick={() => onDelete(listing.id)}
                  title="Delete Property"
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
