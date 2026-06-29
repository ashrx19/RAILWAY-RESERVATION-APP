const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['AC First Class', 'AC 2 Tier', 'AC 3 Tier', 'Sleeper', 'General', 'AC Executive', 'AC Chair Car']
  },
  seats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  fare: { type: Number, required: true },
  layout: { type: [[String]], default: [] } // 2D array for seat layout
});

const trainSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departure: { type: String, required: true },
  arrival: { type: String, required: true },
  duration: { type: String, default: '' },
  distance: { type: Number, default: 0 },
  coaches: [coachSchema],
  totalSeats: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'cancelled', 'delayed'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Train', trainSchema);
