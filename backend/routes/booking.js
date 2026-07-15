const express = require('express');
const { read, write, id } = require('../jsonStore');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, (req, res) => {
  const { trainId, journeyDate, coachType, coachIndex, passengers, selectedSeats } = req.body;
  const data = read(); const train = data.trains.find((entry) => entry._id === trainId); const coach = train?.coaches[Number(coachIndex)];
  if (!train) return res.status(404).json({ message: 'Train not found' });
  if (!coach || coach.type !== coachType) return res.status(400).json({ message: 'Coach not found or type mismatch' });
  if (!Array.isArray(passengers) || !passengers.length || !Array.isArray(selectedSeats) || selectedSeats.length !== passengers.length) return res.status(400).json({ message: 'Passenger and seat details must match' });
  const available = new Set(coach.layout.flat().filter((seat) => seat && seat !== 'booked'));
  if (new Set(selectedSeats).size !== selectedSeats.length || selectedSeats.some((seat) => !available.has(seat))) return res.status(400).json({ message: 'One or more selected seats are unavailable' });
  coach.layout = coach.layout.map((row) => row.map((seat) => selectedSeats.includes(seat) ? 'booked' : seat)); coach.availableSeats -= passengers.length;
  const booking = { _id: id(), user: req.user.id, train: trainId, journeyDate, coachType, coachIndex: Number(coachIndex), passengers: passengers.map((passenger, index) => ({ ...passenger, seatNumber: selectedSeats[index] })), totalFare: coach.fare * passengers.length, status: 'booked', pnr: `PNR${Date.now()}${Math.random().toString(36).slice(2, 7).toUpperCase()}`, bookingId: `BK${Date.now()}`, createdAt: new Date().toISOString() };
  data.bookings.push(booking); write(data); res.status(201).json(booking);
});

router.get('/', auth, (req, res) => {
  const data = read(); const bookings = data.bookings.filter((booking) => req.user.role === 'admin' || booking.user === req.user.id).map((booking) => ({ ...booking, train: data.trains.find((train) => train._id === booking.train), user: data.users.find((user) => user._id === booking.user) })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(bookings);
});

router.put('/:id/cancel', auth, (req, res) => {
  const data = read(); const booking = data.bookings.find((entry) => entry._id === req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (booking.user !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed' });
  if (booking.status === 'cancelled') return res.status(400).json({ message: 'Booking already cancelled' });
  const train = data.trains.find((entry) => entry._id === booking.train); const coach = train.coaches[booking.coachIndex];
  booking.passengers.forEach(({ seatNumber }) => { const n = Number(seatNumber.slice(1)); const row = Math.floor((n - 1) / 6); const col = (n - 1) % 6; coach.layout[row][col] = seatNumber; });
  coach.availableSeats += booking.passengers.length; booking.status = 'cancelled'; write(data); res.json(booking);
});
module.exports = router;
