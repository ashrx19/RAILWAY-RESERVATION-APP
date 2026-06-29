import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const wrapperStyle = {
  maxWidth: '1240px',
  margin: '0 auto',
  padding: '2rem 1rem 3rem',
};

const panelStyle = {
  border: '1px solid rgba(21, 69, 122, 0.12)',
  borderRadius: '24px',
  background: 'linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)',
  boxShadow: '0 24px 55px rgba(17, 57, 110, 0.08)',
};

const inputStyle = {
  width: '100%',
  padding: '0.9rem 1rem',
  borderRadius: '14px',
  border: '1px solid rgba(22, 75, 135, 0.16)',
  backgroundColor: '#fff',
  color: '#183b67',
};

const emptyPassenger = { name: '', age: '', gender: 'Male' };

const BookTrain = () => {
  const { trainId, coachIndex } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const [train, setTrain] = useState(null);
  const [coach, setCoach] = useState(null);
  const [seatLayout, setSeatLayout] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerCount, setPassengerCount] = useState(Number(state.passengerCount) || 1);
  const [passengers, setPassengers] = useState(createPassengers(Number(state.passengerCount) || 1));
  const [journeyDate, setJourneyDate] = useState(state.journeyDate || getDateWithOffset(0));
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  const totalFare = useMemo(() => (coach ? coach.fare * passengerCount : 0), [coach, passengerCount]);

  useEffect(() => {
    const fetchTrain = async () => {
      setPageLoading(true);
      try {
        const response = await api.get('/trains');
        const foundTrain = response.data.find((item) => item._id === trainId);

        if (!foundTrain) {
          setError('Train not found');
          return;
        }

        const coachIdx = Number(coachIndex);
        const selectedCoach = foundTrain.coaches[coachIdx];

        if (!selectedCoach) {
          setError('Coach not found');
          return;
        }

        setTrain(foundTrain);
        setCoach(selectedCoach);

        const seatResponse = await api.get(`/trains/${trainId}/seats/${coachIdx}`);
        setSeatLayout(seatResponse.data.layout);
      } catch (fetchError) {
        console.error('Error fetching train:', fetchError);
        setError('Failed to load train details');
      } finally {
        setPageLoading(false);
      }
    };

    fetchTrain();
  }, [trainId, coachIndex]);

  useEffect(() => {
    setPassengers((current) => syncPassengers(current, passengerCount));
    setSelectedSeats((current) => current.slice(0, passengerCount));
  }, [passengerCount]);

  const handleSeatClick = (seat) => {
    if (!seat || seat === 'booked') {
      return;
    }

    setSelectedSeats((current) => {
      if (current.includes(seat)) {
        return current.filter((item) => item !== seat);
      }

      if (current.length >= passengerCount) {
        return current;
      }

      return [...current, seat];
    });
  };

  const handlePassengerChange = (index, field, value) => {
    setPassengers((current) =>
      current.map((passenger, passengerIndex) =>
        passengerIndex === index ? { ...passenger, [field]: value } : passenger
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!journeyDate) {
      setError('Please select journey date');
      return;
    }

    if (selectedSeats.length !== passengerCount) {
      setError(`Please select ${passengerCount} seat${passengerCount > 1 ? 's' : ''}`);
      return;
    }

    const hasIncompletePassenger = passengers.some(
      (passenger) => !passenger.name || !passenger.age || !passenger.gender
    );

    if (hasIncompletePassenger) {
      setError('Please complete all passenger details');
      return;
    }

    setLoading(true);

    try {
      await api.post('/bookings', {
        trainId,
        journeyDate,
        coachType: coach.type,
        coachIndex: Number(coachIndex),
        selectedSeats,
        passengers: passengers.map((passenger) => ({
          ...passenger,
          age: Number(passenger.age),
        })),
      });

      alert('Booking successful');
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div style={{ padding: '2rem', color: '#21466f' }}>Loading booking details...</div>;
  }

  if (!train || !coach) {
    return <div style={{ padding: '2rem', color: '#9a3d3d' }}>{error || 'Unable to load booking page'}</div>;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top right, rgba(135, 191, 255, 0.28), transparent 25%), linear-gradient(180deg, #f1f7ff 0%, #f9fbff 42%, #ffffff 100%)',
      }}
    >
      <div style={wrapperStyle}>
        <div style={{ ...panelStyle, padding: '1.75rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  backgroundColor: '#dcecff',
                  color: '#0f4c93',
                  fontWeight: 700,
                  marginBottom: '0.9rem',
                }}
              >
                Booking Workspace
              </div>
              <h2 style={{ margin: 0, color: '#143763', fontSize: '2rem' }}>
                {train.name} <span style={{ color: '#5a7390' }}>#{train.number}</span>
              </h2>
              <p style={{ margin: '0.65rem 0 0', color: '#55708f' }}>
                {state.from || train.from} to {state.to || train.to} | {train.departure} departure | {train.arrival} arrival
              </p>
            </div>

            <div
              style={{
                minWidth: '220px',
                borderRadius: '20px',
                padding: '1rem',
                background: 'linear-gradient(180deg, #123d74 0%, #1a5ba7 100%)',
                color: '#fff',
              }}
            >
              <div style={{ opacity: 0.8, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Coach Selected
              </div>
              <div style={{ marginTop: '0.4rem', fontSize: '1.4rem', fontWeight: 800 }}>{coach.type}</div>
              <div style={{ marginTop: '0.5rem', opacity: 0.92 }}>
                {coach.availableSeats} of {coach.seats} seats open
              </div>
              <div style={{ marginTop: '0.35rem', opacity: 0.92 }}>Rs. {coach.fare} per passenger</div>
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              ...panelStyle,
              padding: '1rem 1.2rem',
              marginBottom: '1rem',
              color: '#9c3535',
              background: 'linear-gradient(180deg, #fff7f7 0%, #fff2f2 100%)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
              gap: '1.25rem',
              alignItems: 'start',
            }}
          >
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ ...panelStyle, padding: '1.4rem' }}>
                <h3 style={{ marginTop: 0, color: '#153c6f' }}>Journey preferences</h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <Field label="Journey Date">
                    <input
                      type="date"
                      min={getDateWithOffset(0)}
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Passenger Count">
                    <select
                      value={passengerCount}
                      onChange={(e) => setPassengerCount(Number(e.target.value))}
                      style={inputStyle}
                    >
                      {[1, 2, 3, 4, 5, 6].map((count) => (
                        <option key={count} value={count}>
                          {count} Passenger{count > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              <div style={{ ...panelStyle, padding: '1.4rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, color: '#153c6f' }}>Select seats</h3>
                    <p style={{ margin: '0.35rem 0 0', color: '#5a7390' }}>
                      Pick exactly {passengerCount} seat{passengerCount > 1 ? 's' : ''} for this booking.
                    </p>
                  </div>
                  <div style={{ color: '#163d6d', fontWeight: 700 }}>
                    Selected: {selectedSeats.length}/{passengerCount}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, minmax(44px, 1fr))',
                    gap: '0.6rem',
                  }}
                >
                  {seatLayout.flatMap((row, rowIndex) =>
                    row.map((seat, colIndex) => {
                      const isBooked = seat === 'booked';
                      const isSelected = selectedSeats.includes(seat);
                      const isDisabled = !seat || isBooked;

                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          type="button"
                          onClick={() => handleSeatClick(seat)}
                          disabled={isDisabled}
                          style={{
                            minHeight: '48px',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid #0f60d0' : '1px solid rgba(21, 79, 143, 0.14)',
                            backgroundColor: isBooked ? '#ffdede' : isSelected ? '#dbeaff' : seat ? '#eff7ff' : '#f7f8fa',
                            color: isBooked ? '#ab4444' : isSelected ? '#0f4c93' : '#34587f',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          {seat || ''}
                        </button>
                      );
                    })
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  <LegendBadge label="Available" bg="#eff7ff" color="#34587f" />
                  <LegendBadge label="Selected" bg="#dbeaff" color="#0f4c93" />
                  <LegendBadge label="Booked" bg="#ffdede" color="#ab4444" />
                </div>
              </div>

              <div style={{ ...panelStyle, padding: '1.4rem' }}>
                <h3 style={{ marginTop: 0, color: '#153c6f' }}>Passenger details</h3>
                <div style={{ display: 'grid', gap: '0.9rem' }}>
                  {passengers.map((passenger, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '1rem',
                        borderRadius: '18px',
                        backgroundColor: '#f6f9fe',
                        border: '1px solid rgba(21, 79, 143, 0.08)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          marginBottom: '0.8rem',
                        }}
                      >
                        <strong style={{ color: '#153c6f' }}>Passenger {index + 1}</strong>
                        <span style={{ color: '#587191', fontWeight: 700 }}>
                          Seat: {selectedSeats[index] || 'Not selected'}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                          gap: '0.9rem',
                        }}
                      >
                        <Field label="Full Name">
                          <input
                            type="text"
                            value={passenger.name}
                            onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                            style={inputStyle}
                          />
                        </Field>
                        <Field label="Age">
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={passenger.age}
                            onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                            style={inputStyle}
                          />
                        </Field>
                        <Field label="Gender">
                          <select
                            value={passenger.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                            style={inputStyle}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ ...panelStyle, padding: '1.4rem', position: 'sticky', top: '1rem' }}>
              <h3 style={{ marginTop: 0, color: '#153c6f' }}>Booking summary</h3>
              <div style={{ display: 'grid', gap: '0.8rem', color: '#55708f' }}>
                <SummaryRow label="Route" value={`${train.from} to ${train.to}`} />
                <SummaryRow label="Duration" value={train.duration} />
                <SummaryRow label="Coach" value={coach.type} />
                <SummaryRow label="Journey Date" value={new Date(journeyDate).toLocaleDateString()} />
                <SummaryRow label="Passengers" value={`${passengerCount}`} />
                <SummaryRow
                  label="Seats"
                  value={selectedSeats.length ? selectedSeats.join(', ') : 'Choose seats'}
                />
              </div>

              <div
                style={{
                  marginTop: '1.2rem',
                  padding: '1rem',
                  borderRadius: '18px',
                  background: 'linear-gradient(180deg, #123d74 0%, #1858a3 100%)',
                  color: '#fff',
                }}
              >
                <div style={{ opacity: 0.82, fontSize: '0.84rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Estimated Total
                </div>
                <div style={{ marginTop: '0.45rem', fontSize: '2rem', fontWeight: 800 }}>Rs. {totalFare}</div>
                <div style={{ marginTop: '0.35rem', opacity: 0.9 }}>
                  {coach.fare} x {passengerCount} passenger{passengerCount > 1 ? 's' : ''}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: '1.25rem',
                  padding: '1rem 1.1rem',
                  borderRadius: '14px',
                  border: 'none',
                  background: loading ? '#9eb6d4' : 'linear-gradient(135deg, #ff6a3d 0%, #ff8351 100%)',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Booking...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <label style={{ display: 'grid', gap: '0.5rem', color: '#34587f', fontWeight: 700 }}>
    <span>{label}</span>
    {children}
  </label>
);

const SummaryRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
    <span>{label}</span>
    <strong style={{ color: '#173d6e' }}>{value}</strong>
  </div>
);

const LegendBadge = ({ label, bg, color }) => (
  <span
    style={{
      padding: '0.45rem 0.75rem',
      borderRadius: '999px',
      backgroundColor: bg,
      color,
      fontWeight: 700,
      fontSize: '0.85rem',
    }}
  >
    {label}
  </span>
);

function createPassengers(count) {
  return Array.from({ length: count }, () => ({ ...emptyPassenger }));
}

function syncPassengers(current, count) {
  if (current.length === count) {
    return current;
  }

  if (current.length > count) {
    return current.slice(0, count);
  }

  return [...current, ...createPassengers(count - current.length)];
}

function getDateWithOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
}

export default BookTrain;
