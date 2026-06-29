const express = require('express');
const Booking = require('../models/Booking');
const Train = require('../models/Train');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { trainId, journeyDate, coachType, coachIndex, passengers, selectedSeats } = req.body;

  const train = await Train.findById(trainId);
  if (!train) return res.status(404).json({ message: 'Train not found' });

  if (coachIndex < 0 || coachIndex >= train.coaches.length) {
    return res.status(404).json({ message: 'Coach not found' });
  }

  const coach = train.coaches[coachIndex];
  if (coach.type !== coachType) {
    return res.status(400).json({ message: 'Coach type mismatch' });
  }

  if (coach.availableSeats < passengers.length) {
    return res.status(400).json({ message: 'Not enough seats available' });
  }

  if (!Array.isArray(passengers) || passengers.length === 0) {
    return res.status(400).json({ message: 'Passenger details are required' });
  }

  if (!Array.isArray(selectedSeats) || selectedSeats.length !== passengers.length) {
    return res.status(400).json({ message: 'Selected seats must match passenger count' });
  }

  const uniqueSeats = new Set(selectedSeats);
  if (uniqueSeats.size !== selectedSeats.length) {
    return res.status(400).json({ message: 'Duplicate seats selected' });
  }

  const layout = coach.layout;
  const availableSeatSet = new Set(
    layout.flat().filter((seat) => seat && seat !== 'booked')
  );

  for (const seat of selectedSeats) {
    if (!availableSeatSet.has(seat)) {
      return res.status(400).json({ message: `Seat ${seat} is no longer available` });
    }
  }

  for (let i = 0; i < layout.length; i++) {
    for (let j = 0; j < layout[i].length; j++) {
      if (selectedSeats.includes(layout[i][j])) {
        layout[i][j] = 'booked';
      }
    }
  }

  const passengersWithSeats = passengers.map((passenger, index) => ({
    ...passenger,
    seatNumber: selectedSeats[index]
  }));

  const totalFare = coach.fare * passengers.length;

  const booking = await Booking.create({
    user: req.user.id,
    train: trainId,
    journeyDate,
    coachType,
    coachIndex,
    passengers: passengersWithSeats,
    totalFare
  });

  // Update coach available seats
  coach.availableSeats -= passengers.length;
  await train.save();

  res.status(201).json(booking);
});

router.get('/', auth, async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { user: req.user.id };
  const bookings = await Booking.find(query)
    .populate('train')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

router.put('/:id/cancel', auth, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not allowed' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ message: 'Booking already cancelled' });
  }

  booking.status = 'cancelled';
  await booking.save();

  // Restore seats
  const train = await Train.findById(booking.train);
  const coach = train.coaches[booking.coachIndex];

  // Free up seats in layout
  booking.passengers.forEach(passenger => {
    for (let i = 0; i < coach.layout.length; i++) {
      for (let j = 0; j < coach.layout[i].length; j++) {
        if (coach.layout[i][j] === 'booked' && isSeatPosition(coach.layout, passenger.seatNumber, i, j)) {
          coach.layout[i][j] = passenger.seatNumber;
          break;
        }
      }
    }
  });

  coach.availableSeats += booking.passengers.length;
  await train.save();

  res.json(booking);
});

module.exports = router;

function isSeatPosition(layout, seatNumber, rowIndex, colIndex) {
  let counter = 0;

  for (let i = 0; i < layout.length; i++) {
    for (let j = 0; j < layout[i].length; j++) {
      if (layout[i][j] === '' || layout[i][j] === undefined) {
        continue;
      }

      counter += 1;
      if (`S${counter}` === seatNumber) {
        return i === rowIndex && j === colIndex;
      }
    }
  }

  return false;
}
