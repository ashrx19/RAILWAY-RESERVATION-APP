import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#007bff', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Railway Reservation
        </Link>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <>
              <span>Welcome, {user.name}</span>
              {user.role === 'admin' ? (
                <Link to="/admin" style={{ textDecoration: 'none', color: '#007bff' }}>Admin Dashboard</Link>
              ) : (
                <Link to="/dashboard" style={{ textDecoration: 'none', color: '#007bff' }}>My Dashboard</Link>
              )}
              <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none', color: '#007bff' }}>Login</Link>
              <Link to="/register" style={{ textDecoration: 'none', color: '#007bff' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;