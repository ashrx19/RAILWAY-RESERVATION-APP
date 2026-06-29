import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [trains, setTrains] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('trains');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    from: '',
    to: '',
    departure: '',
    arrival: '',
    seats: 100,
    fare: 0
  });

  const fetchTrains = async () => {
    try {
      const response = await api.get('/trains');
      setTrains(response.data);
    } catch (error) {
      console.error('Error fetching trains:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    fetchTrains();
    fetchBookings();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTrain) {
        await api.put(`/trains/${editingTrain._id}`, formData);
      } else {
        await api.post('/trains', formData);
      }
      fetchTrains();
      resetForm();
    } catch (error) {
      console.error('Error saving train:', error);
      alert('Failed to save train');
    }
  };

  const handleEdit = (train) => {
    setEditingTrain(train);
    setFormData({
      number: train.number,
      name: train.name,
      from: train.from,
      to: train.to,
      departure: train.departure,
      arrival: train.arrival,
      seats: train.seats,
      fare: train.fare
    });
    setShowAddForm(true);
  };

  const handleDelete = async (trainId) => {
    if (!window.confirm('Are you sure you want to delete this train?')) return;

    try {
      await api.delete(`/trains/${trainId}`);
      fetchTrains();
    } catch (error) {
      console.error('Error deleting train:', error);
      alert('Failed to delete train');
    }
  };

  const resetForm = () => {
    setFormData({
      number: '',
      name: '',
      from: '',
      to: '',
      departure: '',
      arrival: '',
      seats: 100,
      fare: 0
    });
    setEditingTrain(null);
    setShowAddForm(false);
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      fetchBookings();
      alert('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Admin Dashboard</h1>

      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('trains')}
          style={{
            padding: '0.5rem 1rem',
            marginRight: '0.5rem',
            backgroundColor: activeTab === 'trains' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'trains' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Manage Trains
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: activeTab === 'bookings' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'bookings' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          View Bookings
        </button>
      </div>

      {activeTab === 'trains' && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {showAddForm ? 'Cancel' : 'Add New Train'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #dee2e6', borderRadius: '8px' }}>
              <h3>{editingTrain ? 'Edit Train' : 'Add New Train'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Train Number:</label>
                  <input type="text" name="number" value={formData.number} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} />
                </div>
                <div>
                  <label>Train Name:</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} />
                </div>
                <div>
                  <label>From:</label>
                  <input type="text" name="from" value={formData.from} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} />
                </div>
                <div>
                  <label>To:</label>
                  <input type="text" name="to" value={formData.to} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} />
                </div>
                <div>
                  <label>Departure Time:</label>
                  <input type="text" name="departure" value={formData.departure} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} />
                </div>
                <div>
                  <label>Arrival Time:</label>
                  <input type="text" name="arrival" value={formData.arrival} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} />
                </div>
                <div>
                  <label>Seats:</label>
                  <input type="number" name="seats" value={formData.seats} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} />
                </div>
                <div>
                  <label>Fare:</label>
                  <input type="number" name="fare" value={formData.fare} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} />
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}>
                  {editingTrain ? 'Update' : 'Add'} Train
                </button>
                <button type="button" onClick={resetForm} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div style={{ display: 'grid', gap: '1rem' }}>
            {trains.map(train => (
              <div key={train._id} style={{ border: '1px solid #dee2e6', padding: '1rem', borderRadius: '8px' }}>
                <h3>{train.name} ({train.number})</h3>
                <p>Route: {train.from} → {train.to}</p>
                <p>Time: {train.departure} - {train.arrival}</p>
                <p>Seats: {train.seats} | Fare: ₹{train.fare}</p>
                <div>
                  <button onClick={() => handleEdit(train)} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(train._id)} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <h2>All Bookings</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {bookings.map(booking => (
              <div key={booking._id} style={{ border: '1px solid #dee2e6', padding: '1rem', borderRadius: '8px' }}>
                <h3>{booking.train.name} ({booking.train.number})</h3>
                <p>User: {booking.user.name} ({booking.user.email})</p>
                <p>Journey Date: {new Date(booking.journeyDate).toLocaleDateString()}</p>
                <p>Coach: {booking.coachType} | PNR: {booking.pnr}</p>
                <p>Status: <span style={{ color: booking.status === 'booked' ? 'green' : booking.status === 'confirmed' ? 'blue' : 'red' }}>{booking.status}</span></p>
                <div style={{ marginTop: '1rem' }}>
                  <h4>Passengers:</h4>
                  {booking.passengers.map((passenger, index) => (
                    <div key={index} style={{ backgroundColor: '#f8f9fa', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px' }}>
                      <strong>{passenger.name}</strong> (Age: {passenger.age}, {passenger.gender}) - Seat: {passenger.seatNumber}
                    </div>
                  ))}
                </div>
                <p><strong>Total Fare:</strong> ₹{booking.totalFare}</p>
                {booking.status === 'booked' && (
                  <button
                    onClick={() => cancelBooking(booking._id)}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;