import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to Railway Reservation System</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#6c757d' }}>
        Book your train tickets easily and securely
      </p>


      {!user ? (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link
            to="/login"


            
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem'
            }}
          >
            Login
          </Link>
          <Link
            to="/register"
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem'
            }}
          >
            Register
          </Link>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Welcome back, {user.name}!
          </p>
          <Link
            to={user.role === 'admin' ? '/admin' : '/dashboard'}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem'
            }}
          >
            Go to Dashboard
          </Link>
        </div>
      )}

      <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '4rem auto' }}>
        <div style={{ padding: '2rem', border: '1px solid #dee2e6', borderRadius: '8px' }}>
          <h3>Easy Booking</h3>
          <p>Search and book train tickets with just a few clicks</p>
        </div>
        <div style={{ padding: '2rem', border: '1px solid #dee2e6', borderRadius: '8px' }}>
          <h3>Secure Payment</h3>
          <p>Your payment information is protected with industry-standard security</p>
        </div>
        <div style={{ padding: '2rem', border: '1px solid #dee2e6', borderRadius: '8px' }}>
          <h3>Real-time Updates</h3>
          <p>Get instant updates on train schedules and seat availability</p>
        </div>
      </div>
    </div>
  );
};

export default Home;