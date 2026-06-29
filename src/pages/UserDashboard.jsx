import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const quickDateChoices = [
  { label: 'Today', offset: 0 },
  { label: 'Tomorrow', offset: 1 },
  { label: 'Day After', offset: 2 },
];

const passengerOptions = [1, 2, 3, 4, 5, 6];

const dashboardShell = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '2rem 1rem 3rem',
};

const sectionCard = {
  border: '1px solid rgba(21, 69, 122, 0.12)',
  borderRadius: '24px',
  background:
    'linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(243,248,255,0.98) 100%)',
  boxShadow: '0 24px 60px rgba(17, 57, 110, 0.09)',
};

const inputStyle = {
  width: '100%',
  padding: '0.95rem 1rem',
  borderRadius: '16px',
  border: '1px solid rgba(20, 73, 134, 0.16)',
  backgroundColor: '#fff',
  fontSize: '0.96rem',
  color: '#14335f',
};

const tabButtonStyle = (active) => ({
  padding: '0.8rem 1.2rem',
  borderRadius: '999px',
  border: '1px solid transparent',
  background: active ? '#123d74' : '#eef4fb',
  color: active ? '#fff' : '#335985',
  cursor: 'pointer',
  fontWeight: 700,
});

const UserDashboard = () => {
  const [trains, setTrains] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState({ fromStations: [], routesByFrom: {}, trains: [] });
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: getDateWithOffset(0),
    passengerCount: 1,
  });
  const [freeCancellation, setFreeCancellation] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);

  const availableDestinations = useMemo(() => {
    if (!searchParams.from) {
      return [];
    }

    return meta.routesByFrom[searchParams.from] || [];
  }, [meta.routesByFrom, searchParams.from]);

  const topRoutes = useMemo(() => {
    const routeCount = meta.trains.reduce((acc, train) => {
      const key = `${train.from} to ${train.to}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(routeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [meta.trains]);

  useEffect(() => {
    fetchMeta();
    fetchBookings();
  }, []);

  useEffect(() => {
    if (searchParams.from && searchParams.to && !availableDestinations.includes(searchParams.to)) {
      setSearchParams((current) => ({ ...current, to: '' }));
    }
  }, [availableDestinations, searchParams.from, searchParams.to]);

  const fetchMeta = async () => {
    try {
      const response = await api.get('/trains/meta/options');
      setMeta(response.data);
      setTrains(response.data.trains.slice(0, 6));
    } catch (error) {
      console.error('Error fetching train options:', error);
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

  const handleSearchChange = (field, value) => {
    setSearchParams((current) => ({
      ...current,
      [field]: field === 'passengerCount' ? Number(value) : value,
      ...(field === 'from' ? { to: '' } : {}),
    }));
  };

  const searchTrains = async () => {
    setLoading(true);
    try {
      const response = await api.get('/trains', {
        params: {
          from: searchParams.from || undefined,
          to: searchParams.to || undefined,
        },
      });

      setTrains(response.data);
      setSearchDone(true);
    } catch (error) {
      console.error('Error searching trains:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      fetchBookings();
      fetchMeta();
      alert('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(132, 194, 255, 0.28), transparent 28%), linear-gradient(180deg, #eef6ff 0%, #f9fbff 38%, #ffffff 100%)',
      }}
    >
      <div style={dashboardShell}>
        <div
          style={{
            ...sectionCard,
            padding: '2rem',
            marginBottom: '1.5rem',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 'auto -80px -120px auto',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'rgba(44, 130, 246, 0.12)',
              filter: 'blur(10px)',
            }}
          />
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: '760px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  backgroundColor: '#d9ebff',
                  color: '#0f4a8a',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                Smart Route Search
              </div>
              <h1 style={{ margin: 0, fontSize: '2.4rem', color: '#102f56', lineHeight: 1.1 }}>
                Find trains faster with live route dropdowns, cleaner booking flow, and richer coach choices.
              </h1>
              <p style={{ margin: '0.9rem 0 0', color: '#4c678a', maxWidth: '620px', fontSize: '1rem' }}>
                Pick a boarding city first, then choose from only the destinations that actually exist for that route. Passenger count, journey date, and coach booking all stay connected through the full flow.
              </p>
            </div>

            <div
              style={{
                minWidth: '250px',
                padding: '1rem',
                borderRadius: '20px',
                background: 'linear-gradient(180deg, #123d74 0%, #1959a4 100%)',
                color: '#fff',
              }}
            >
              <div style={{ fontSize: '0.8rem', opacity: 0.78, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Network Snapshot
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.4rem' }}>{meta.trains.length}</div>
              <div style={{ opacity: 0.85 }}>seeded trains available now</div>
              <div style={{ marginTop: '1rem', fontSize: '0.94rem', opacity: 0.9 }}>
                {meta.fromStations.length} origin stations and route-aware destination options.
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('search')} style={tabButtonStyle(activeTab === 'search')}>
            Search & Book
          </button>
          <button onClick={() => setActiveTab('bookings')} style={tabButtonStyle(activeTab === 'bookings')}>
            My Bookings
          </button>
        </div>

        {activeTab === 'search' && (
          <>
            <div style={{ ...sectionCard, padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                }}
              >
                <Field label="Boarding From">
                  <select
                    value={searchParams.from}
                    onChange={(e) => handleSearchChange('from', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select starting point</option>
                    {meta.fromStations.map((station) => (
                      <option key={station} value={station}>
                        {station}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Destination To">
                  <select
                    value={searchParams.to}
                    onChange={(e) => handleSearchChange('to', e.target.value)}
                    style={inputStyle}
                    disabled={!searchParams.from}
                  >
                    <option value="">{searchParams.from ? 'Select destination' : 'Choose from first'}</option>
                    {availableDestinations.map((station) => (
                      <option key={station} value={station}>
                        {station}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Journey Date">
                  <input
                    type="date"
                    value={searchParams.date}
                    min={getDateWithOffset(0)}
                    onChange={(e) => handleSearchChange('date', e.target.value)}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Passengers">
                  <select
                    value={searchParams.passengerCount}
                    onChange={(e) => handleSearchChange('passengerCount', e.target.value)}
                    style={inputStyle}
                  >
                    {passengerOptions.map((count) => (
                      <option key={count} value={count}>
                        {count} Passenger{count > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {quickDateChoices.map((choice) => (
                    <button
                      key={choice.label}
                      type="button"
                      onClick={() => handleSearchChange('date', getDateWithOffset(choice.offset))}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '999px',
                        border:
                          searchParams.date === getDateWithOffset(choice.offset)
                            ? '1px solid #0b60d0'
                            : '1px solid rgba(11, 96, 208, 0.18)',
                        backgroundColor:
                          searchParams.date === getDateWithOffset(choice.offset) ? '#dcebff' : '#f8fbff',
                        color: '#0d4f9d',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      {choice.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFreeCancellation((current) => !current)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '999px',
                      border: freeCancellation ? '1px solid #16955d' : '1px solid rgba(22, 149, 93, 0.2)',
                      backgroundColor: freeCancellation ? '#e9fff4' : '#f9fffc',
                      color: freeCancellation ? '#13784c' : '#376953',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    {freeCancellation ? 'Free cancellation active' : 'Add free cancellation'}
                  </button>
                </div>

                <button
                  onClick={searchTrains}
                  disabled={loading}
                  style={{
                    padding: '0.95rem 1.4rem',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff6a3d 0%, #ff8351 100%)',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer',
                    minWidth: '180px',
                    boxShadow: '0 14px 30px rgba(255, 106, 61, 0.22)',
                  }}
                >
                  {loading ? 'Searching...' : 'Search Trains'}
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 2.1fr) minmax(280px, 0.9fr)',
                gap: '1.5rem',
                alignItems: 'start',
              }}
            >
              <div style={{ display: 'grid', gap: '1rem' }}>
                {trains.length === 0 && searchDone ? (
                  <div style={{ ...sectionCard, padding: '1.5rem' }}>
                    <h3 style={{ marginTop: 0, color: '#173a66' }}>No trains matched this route</h3>
                    <p style={{ marginBottom: 0, color: '#587191' }}>
                      Change the origin, destination, or date to see other available trains.
                    </p>
                  </div>
                ) : (
                  trains.map((train) => (
                    <div key={train._id} style={{ ...sectionCard, padding: '1.3rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          flexWrap: 'wrap',
                          marginBottom: '1rem',
                        }}
                      >
                        <div>
                          <h3 style={{ margin: 0, color: '#123860', fontSize: '1.28rem' }}>
                            {train.name}{' '}
                            <span style={{ color: '#5b7393', fontSize: '0.95rem' }}>#{train.number}</span>
                          </h3>
                          <div style={{ marginTop: '0.45rem', color: '#446483', fontWeight: 600 }}>
                            {train.from} to {train.to}
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, auto)',
                            gap: '0.85rem',
                            color: '#1c477c',
                            alignItems: 'center',
                          }}
                        >
                          <JourneyStat label="Dep" value={train.departure} />
                          <JourneyStat label="Duration" value={train.duration} />
                          <JourneyStat label="Arr" value={train.arrival} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <MetaPill label={`${train.distance} km`} />
                        <MetaPill label={`${train.coaches.length} coach classes`} />
                        <MetaPill label={`${train.coaches.reduce((sum, coach) => sum + coach.availableSeats, 0)} seats left`} />
                        {freeCancellation && <MetaPill label="Free cancellation plan available" highlight />}
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
                          gap: '0.8rem',
                        }}
                      >
                        {train.coaches.map((coach, index) => {
                          const status = getCoachStatus(coach.availableSeats);
                          return (
                            <div
                              key={`${train._id}-${coach.type}-${index}`}
                              style={{
                                borderRadius: '18px',
                                border: '1px solid rgba(13, 82, 162, 0.14)',
                                padding: '1rem',
                                background: '#fff',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  gap: '0.5rem',
                                  alignItems: 'flex-start',
                                }}
                              >
                                <strong style={{ color: '#113d73' }}>{coach.type}</strong>
                                <span
                                  style={{
                                    padding: '0.28rem 0.55rem',
                                    borderRadius: '999px',
                                    backgroundColor: status.background,
                                    color: status.color,
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                  }}
                                >
                                  {status.label}
                                </span>
                              </div>
                              <div style={{ marginTop: '0.8rem', color: '#4e6c8e', fontSize: '0.92rem' }}>
                                {coach.availableSeats} of {coach.seats} seats available
                              </div>
                              <div style={{ marginTop: '0.35rem', fontSize: '1.2rem', fontWeight: 800, color: '#102f56' }}>
                                Rs. {coach.fare}
                              </div>
                              <Link
                                to={`/book/${train._id}/${index}`}
                                state={{
                                  journeyDate: searchParams.date,
                                  passengerCount: searchParams.passengerCount,
                                  from: searchParams.from,
                                  to: searchParams.to,
                                }}
                                style={{
                                  display: 'inline-flex',
                                  marginTop: '0.9rem',
                                  padding: '0.72rem 0.95rem',
                                  borderRadius: '12px',
                                  background: coach.availableSeats > 0 ? '#154d8f' : '#b6c1cf',
                                  color: '#fff',
                                  textDecoration: 'none',
                                  fontWeight: 700,
                                  pointerEvents: coach.availableSeats > 0 ? 'auto' : 'none',
                                }}
                              >
                                {coach.availableSeats > 0 ? 'Select coach' : 'Waitlist only'}
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ ...sectionCard, padding: '1.25rem' }}>
                  <h3 style={{ marginTop: 0, color: '#143864' }}>Popular route combinations</h3>
                  <div style={{ display: 'grid', gap: '0.7rem' }}>
                    {topRoutes.map(([route, count]) => (
                      <div
                        key={route}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          padding: '0.85rem 0.95rem',
                          borderRadius: '16px',
                          backgroundColor: '#f5f9ff',
                          color: '#254d7e',
                        }}
                      >
                        <span>{route}</span>
                        <strong>{count} trains</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ ...sectionCard, padding: '1.25rem' }}>
                  <h3 style={{ marginTop: 0, color: '#143864' }}>Current search</h3>
                  <div style={{ display: 'grid', gap: '0.65rem', color: '#4b6485' }}>
                    <SummaryRow label="Boarding" value={searchParams.from || 'Any origin'} />
                    <SummaryRow label="Destination" value={searchParams.to || 'Any destination'} />
                    <SummaryRow label="Journey date" value={formatDate(searchParams.date)} />
                    <SummaryRow
                      label="Passengers"
                      value={`${searchParams.passengerCount} traveller${searchParams.passengerCount > 1 ? 's' : ''}`}
                    />
                    <SummaryRow label="Protection" value={freeCancellation ? 'Free cancellation selected' : 'Standard fare'} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'bookings' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {bookings.map((booking) => (
              <div key={booking._id} style={{ ...sectionCard, padding: '1.25rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, color: '#123860' }}>
                      {booking.train.name} <span style={{ color: '#587191' }}>#{booking.train.number}</span>
                    </h3>
                    <div style={{ marginTop: '0.3rem', color: '#5a728f' }}>
                      {booking.train.from} to {booking.train.to}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '999px',
                      backgroundColor: booking.status === 'cancelled' ? '#ffe6e6' : '#e5f3ff',
                      color: booking.status === 'cancelled' ? '#a33d3d' : '#0d4f9d',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                    }}
                  >
                    {booking.status}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.85rem',
                    marginTop: '1rem',
                    color: '#4f6686',
                  }}
                >
                  <SummaryTile label="Journey Date" value={new Date(booking.journeyDate).toLocaleDateString()} />
                  <SummaryTile label="Coach" value={booking.coachType} />
                  <SummaryTile label="PNR" value={booking.pnr} />
                  <SummaryTile label="Total Fare" value={`Rs. ${booking.totalFare}`} />
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ marginBottom: '0.7rem', color: '#163d6d' }}>Passenger Details</h4>
                  <div style={{ display: 'grid', gap: '0.7rem' }}>
                    {booking.passengers.map((passenger, index) => (
                      <div
                        key={`${booking._id}-${index}`}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '16px',
                          backgroundColor: '#f6f9fe',
                          color: '#496581',
                        }}
                      >
                        <strong style={{ color: '#153f71' }}>{passenger.name}</strong> | Age {passenger.age} | {passenger.gender} | Seat {passenger.seatNumber}
                      </div>
                    ))}
                  </div>
                </div>

                {booking.status === 'booked' && (
                  <button
                    onClick={() => cancelBooking(booking._id)}
                    style={{
                      marginTop: '1rem',
                      padding: '0.78rem 1rem',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#d94b4b',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <label style={{ display: 'grid', gap: '0.55rem', color: '#34587f', fontWeight: 700 }}>
    <span>{label}</span>
    {children}
  </label>
);

const JourneyStat = ({ label, value }) => (
  <div style={{ minWidth: '82px' }}>
    <div style={{ fontSize: '0.75rem', color: '#6381a2', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {label}
    </div>
    <div style={{ fontWeight: 800 }}>{value}</div>
  </div>
);

const MetaPill = ({ label, highlight = false }) => (
  <span
    style={{
      padding: '0.45rem 0.75rem',
      borderRadius: '999px',
      backgroundColor: highlight ? '#e8fff3' : '#f3f7fc',
      color: highlight ? '#147a50' : '#516d8f',
      fontWeight: 700,
      fontSize: '0.85rem',
    }}
  >
    {label}
  </span>
);

const SummaryTile = ({ label, value }) => (
  <div style={{ padding: '0.9rem 1rem', borderRadius: '16px', backgroundColor: '#f6f9fe' }}>
    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#6a84a3', letterSpacing: '0.08em' }}>
      {label}
    </div>
    <div style={{ marginTop: '0.3rem', fontWeight: 800, color: '#143864' }}>{value}</div>
  </div>
);

const SummaryRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
    <span>{label}</span>
    <strong style={{ color: '#173d6e' }}>{value}</strong>
  </div>
);

function getCoachStatus(availableSeats) {
  if (availableSeats > 20) {
    return { label: `Available ${availableSeats}`, color: '#18794e', background: '#e6fff2' };
  }

  if (availableSeats > 0) {
    return { label: `Fast filling ${availableSeats}`, color: '#a25f00', background: '#fff2df' };
  }

  return { label: 'Sold out', color: '#8f4040', background: '#ffe8e8' };
}

function getDateWithOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : 'Not selected';
}

export default UserDashboard;
