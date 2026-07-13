const express = require('express');
const { read, write, id } = require('../jsonStore');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();
const sortTrains = (trains) => trains.sort((a, b) => `${a.from}${a.to}${a.departure}`.localeCompare(`${b.from}${b.to}${b.departure}`));

router.get('/', auth, (req, res) => {
  const { from, to } = req.query;
  let trains = read().trains;
  if (from) trains = trains.filter((train) => train.from.toLowerCase() === from.toLowerCase());
  if (to) trains = trains.filter((train) => train.to.toLowerCase() === to.toLowerCase());
  res.json(sortTrains(trains));
});

router.get('/meta/options', auth, (req, res) => {
  const trains = sortTrains(read().trains);
  const fromStations = [...new Set(trains.map((train) => train.from))];
  const routesByFrom = {};
  trains.forEach((train) => {
    routesByFrom[train.from] ??= [];
    if (!routesByFrom[train.from].includes(train.to)) routesByFrom[train.from].push(train.to);
  });
  Object.values(routesByFrom).forEach((routes) => routes.sort());
  res.json({ fromStations, routesByFrom, trains });
});

router.get('/:id/seats/:coachIndex', auth, (req, res) => {
  const train = read().trains.find((entry) => entry._id === req.params.id);
  const coach = train?.coaches[Number(req.params.coachIndex)];
  if (!train) return res.status(404).json({ message: 'Train not found' });
  if (!coach) return res.status(404).json({ message: 'Coach not found' });
  res.json({ coach, layout: coach.layout, availableSeats: coach.availableSeats });
});

router.post('/', auth, adminOnly, (req, res) => {
  const data = read();
  const train = prepareTrain({ ...req.body, _id: id() });
  data.trains.push(train); write(data);
  res.status(201).json(train);
});

router.put('/:id', auth, adminOnly, (req, res) => {
  const data = read(); const index = data.trains.findIndex((entry) => entry._id === req.params.id);
  if (index < 0) return res.status(404).json({ message: 'Train not found' });
  data.trains[index] = prepareTrain({ ...data.trains[index], ...req.body, _id: req.params.id });
  write(data); res.json(data.trains[index]);
});

router.delete('/:id', auth, adminOnly, (req, res) => {
  const data = read(); data.trains = data.trains.filter((entry) => entry._id !== req.params.id); write(data);
  res.json({ message: 'Deleted' });
});

function prepareTrain(train) {
  const coaches = (train.coaches || []).map((coach) => ({ ...coach, availableSeats: coach.seats, layout: generateSeatLayout(coach.seats) }));
  return { ...train, coaches, totalSeats: coaches.reduce((sum, coach) => sum + coach.seats, 0), status: train.status || 'active', updatedAt: new Date().toISOString() };
}
function generateSeatLayout(totalSeats) { return Array.from({ length: Math.ceil(totalSeats / 6) }, (_, row) => Array.from({ length: 6 }, (_, col) => row * 6 + col < totalSeats ? `S${row * 6 + col + 1}` : '')); }
module.exports = router;
