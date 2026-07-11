const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sampleTrains } = require('./seed');

const dataDirectory = path.join(__dirname, 'data');
const dataFile = path.join(dataDirectory, 'railway.json');

const id = () => crypto.randomUUID();

function initialData() {
  const trains = sampleTrains.map((train) => ({
    ...train,
    _id: id(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalSeats: train.coaches.reduce((sum, coach) => sum + coach.seats, 0),
    coaches: train.coaches.map((coach) => ({ ...coach, availableSeats: coach.seats })),
    status: 'active',
  }));

  return {
    users: [{
      _id: id(),
      name: 'Railway Admin',
      email: 'admin@railway.local',
      password: bcrypt.hashSync('Admin@123', 10),
      role: 'admin',
      createdAt: new Date().toISOString(),
    }],
    trains,
    bookings: [],
  };
}

function read() {
  if (!fs.existsSync(dataFile)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
    const data = initialData();
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    return data;
  }
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function write(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

module.exports = { read, write, id };
