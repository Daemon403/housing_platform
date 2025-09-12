import { Link, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './OwnerLayout.css';

export default function OwnerLayout() {
  const { user, logout } = useAuth();

  if (user?.role !== 'homeowner') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="owner-layout">
      <header className="owner-header">
        <div className="container">
          <div className="owner-nav">
            <Link to="/owner" className="logo">Owner Dashboard</Link>
            <nav>
              <Link to="/owner/listings">My Listings</Link>
              <Link to="/owner/bookings">Bookings</Link>
              <Link to="/owner/messages">Messages</Link>
              <button onClick={logout} className="btn btn-link">Logout</button>
            </nav>
          </div>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
