const express = require('express');
const Train = require('../models/Train');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { from, to } = req.query;
  const query = {};

  if (from) {
    query.from = new RegExp(`^${escapeRegex(from)}$`, 'i');
  }

  if (to) {
    query.to = new RegExp(`^${escapeRegex(to)}$`, 'i');
  }

  const trains = await Train.find(query).sort({ from: 1, to: 1, departure: 1 });
  res.json(trains);
});

router.get('/meta/options', auth, async (req, res) => {
  const trains = await Train.find({}, 'from to number name departure arrival duration distance coaches').sort({
    from: 1,
    to: 1,
  });

  const fromStations = [...new Set(trains.map((train) => train.from))];
  const routesByFrom = trains.reduce((acc, train) => {
    if (!acc[train.from]) {
      acc[train.from] = [];
    }

    if (!acc[train.from].includes(train.to)) {
      acc[train.from].push(train.to);
    }

    return acc;
  }, {});

  Object.keys(routesByFrom).forEach((station) => {
    routesByFrom[station].sort((a, b) => a.localeCompare(b));
  });

  res.json({
    fromStations,
    routesByFrom,
    trains,
  });
});

router.get('/:id/seats/:coachIndex', auth, async (req, res) => {
  const train = await Train.findById(req.params.id);
  if (!train) return res.status(404).json({ message: 'Train not found' });

  const coachIndex = parseInt(req.params.coachIndex);
  if (coachIndex < 0 || coachIndex >= train.coaches.length) {
    return res.status(404).json({ message: 'Coach not found' });
  }

  const coach = train.coaches[coachIndex];
  res.json({
    coach: coach,
    layout: coach.layout,
    availableSeats: coach.availableSeats
  });
});

router.post('/', auth, adminOnly, async (req, res) => {
  const { coaches, ...trainData } = req.body;

  // Calculate total seats
  const totalSeats = coaches.reduce((sum, coach) => sum + coach.seats, 0);

  // Generate seat layouts for each coach
  const coachesWithLayout = coaches.map(coach => {
    const layout = generateSeatLayout(coach.type, coach.seats);
    return {
      ...coach,
      availableSeats: coach.seats,
      layout: layout
    };
  });

  const train = await Train.create({
    ...trainData,
    coaches: coachesWithLayout,
    totalSeats: totalSeats
  });

  res.status(201).json(train);
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const { coaches, ...trainData } = req.body;

  if (coaches) {
    const totalSeats = coaches.reduce((sum, coach) => sum + coach.seats, 0);
    trainData.totalSeats = totalSeats;
    trainData.coaches = coaches.map(coach => ({
      ...coach,
      availableSeats: coach.seats,
      layout: generateSeatLayout(coach.type, coach.seats)
    }));
  }

  const train = await Train.findByIdAndUpdate(req.params.id, trainData, { new: true });
  res.json(train);
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await Train.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Helper function to generate seat layout
function generateSeatLayout(coachType, totalSeats) {
  const rows = Math.ceil(totalSeats / 6); // 6 seats per row (3+3)
  const layout = [];

  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < 6; j++) {
      const seatNumber = i * 6 + j + 1;
      if (seatNumber <= totalSeats) {
        row.push(`S${seatNumber}`);
      } else {
        row.push('');
      }
    }
    layout.push(row);
  }

  return layout;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = router;
