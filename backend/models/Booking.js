const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  seatNumber: { type: String, required: true }
});

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  journeyDate: { type: Date, required: true },
  coachType: { type: String, required: true },
  coachIndex: { type: Number, required: true },
  passengers: [passengerSchema],
  totalFare: { type: Number, required: true },
  status: { type: String, enum: ['booked', 'cancelled', 'confirmed'], default: 'booked' },
  pnr: { type: String, unique: true },
  bookingId: { type: String, unique: true }
}, { timestamps: true });

// Generate PNR and booking ID before saving
bookingSchema.pre('save', function() {
  if (!this.pnr) {
    this.pnr = 'PNR' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  if (!this.bookingId) {
    this.bookingId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
