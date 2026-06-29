const mongoose = require('mongoose');
const Train = require('./models/Train');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const sampleTrains = [
  {
    number: '12301',
    name: 'Rajdhani Express',
    from: 'New Delhi',
    to: 'Mumbai Central',
    departure: '16:45',
    arrival: '08:55',
    duration: '16h 10m',
    distance: 1384,
    coaches: [
      {
        type: 'AC First Class',
        seats: 24,
        fare: 4500,
        layout: generateLayout(24)
      },
      {
        type: 'AC 2 Tier',
        seats: 48,
        fare: 2800,
        layout: generateLayout(48)
      },
      {
        type: 'AC 3 Tier',
        seats: 72,
        fare: 1800,
        layout: generateLayout(72)
      },
      {
        type: 'Sleeper',
        seats: 72,
        fare: 600,
        layout: generateLayout(72)
      },
      {
        type: 'General',
        seats: 100,
        fare: 200,
        layout: generateLayout(100)
      }
    ]
  },
  {
    number: '12425',
    name: 'Jammu Tawi - New Delhi Express',
    from: 'Jammu Tawi',
    to: 'New Delhi',
    departure: '20:45',
    arrival: '06:30',
    duration: '9h 45m',
    distance: 578,
    coaches: [
      {
        type: 'AC 2 Tier',
        seats: 48,
        fare: 1500,
        layout: generateLayout(48)
      },
      {
        type: 'AC 3 Tier',
        seats: 64,
        fare: 950,
        layout: generateLayout(64)
      },
      {
        type: 'Sleeper',
        seats: 72,
        fare: 450,
        layout: generateLayout(72)
      },
      {
        type: 'General',
        seats: 120,
        fare: 150,
        layout: generateLayout(120)
      }
    ]
  },
  {
    number: '12627',
    name: 'Karnataka Express',
    from: 'Bangalore',
    to: 'New Delhi',
    departure: '20:20',
    arrival: '08:20',
    duration: '36h',
    distance: 2391,
    coaches: [
      {
        type: 'AC First Class',
        seats: 20,
        fare: 5200,
        layout: generateLayout(20)
      },
      {
        type: 'AC 2 Tier',
        seats: 45,
        fare: 3200,
        layout: generateLayout(45)
      },
      {
        type: 'AC 3 Tier',
        seats: 64,
        fare: 2100,
        layout: generateLayout(64)
      },
      {
        type: 'Sleeper',
        seats: 72,
        fare: 750,
        layout: generateLayout(72)
      },
      {
        type: 'General',
        seats: 100,
        fare: 250,
        layout: generateLayout(100)
      }
    ]
  },
  {
    number: '12951',
    name: 'Mumbai Rajdhani',
    from: 'Mumbai Central',
    to: 'New Delhi',
    departure: '16:35',
    arrival: '08:35',
    duration: '16h',
    distance: 1384,
    coaches: [
      {
        type: 'AC First Class',
        seats: 24,
        fare: 4800,
        layout: generateLayout(24)
      },
      {
        type: 'AC 2 Tier',
        seats: 48,
        fare: 2900,
        layout: generateLayout(48)
      },
      {
        type: 'AC 3 Tier',
        seats: 72,
        fare: 1900,
        layout: generateLayout(72)
      },
      {
        type: 'Sleeper',
        seats: 72,
        fare: 650,
        layout: generateLayout(72)
      }
    ]
  },
  {
    number: '12245',
    name: 'Howrah - Yesvantpur Duronto',
    from: 'Howrah',
    to: 'Yesvantpur',
    departure: '14:05',
    arrival: '14:30',
    duration: '24h 25m',
    distance: 1947,
    coaches: [
      {
        type: 'AC First Class',
        seats: 20,
        fare: 4100,
        layout: generateLayout(20)
      },
      {
        type: 'AC 2 Tier',
        seats: 45,
        fare: 2600,
        layout: generateLayout(45)
      },
      {
        type: 'AC 3 Tier',
        seats: 64,
        fare: 1700,
        layout: generateLayout(64)
      },
      {
        type: 'Sleeper',
        seats: 72,
        fare: 550,
        layout: generateLayout(72)
      },
      {
        type: 'General',
        seats: 100,
        fare: 180,
        layout: generateLayout(100)
      }
    ]
  },
  {
    number: '12625',
    name: 'Kerala Express',
    from: 'New Delhi',
    to: 'Thiruvananthapuram Central',
    departure: '11:25',
    arrival: '15:15',
    duration: '51h 50m',
    distance: 3031,
    coaches: [
      { type: 'AC 2 Tier', seats: 46, fare: 3550, layout: generateLayout(46) },
      { type: 'AC 3 Tier', seats: 64, fare: 2480, layout: generateLayout(64) },
      { type: 'Sleeper', seats: 72, fare: 890, layout: generateLayout(72) },
      { type: 'General', seats: 110, fare: 320, layout: generateLayout(110) }
    ]
  },
  {
    number: '12622',
    name: 'Tamil Nadu Express',
    from: 'New Delhi',
    to: 'Chennai Central',
    departure: '22:30',
    arrival: '07:15',
    duration: '32h 45m',
    distance: 2180,
    coaches: [
      { type: 'AC First Class', seats: 20, fare: 4600, layout: generateLayout(20) },
      { type: 'AC 2 Tier', seats: 48, fare: 2980, layout: generateLayout(48) },
      { type: 'AC 3 Tier', seats: 72, fare: 1980, layout: generateLayout(72) },
      { type: 'Sleeper', seats: 72, fare: 720, layout: generateLayout(72) }
    ]
  },
  {
    number: '12723',
    name: 'Telangana Express',
    from: 'Hyderabad',
    to: 'New Delhi',
    departure: '06:00',
    arrival: '07:05',
    duration: '25h 05m',
    distance: 1677,
    coaches: [
      { type: 'AC 2 Tier', seats: 46, fare: 2410, layout: generateLayout(46) },
      { type: 'AC 3 Tier', seats: 72, fare: 1620, layout: generateLayout(72) },
      { type: 'Sleeper', seats: 78, fare: 620, layout: generateLayout(78) },
      { type: 'General', seats: 120, fare: 210, layout: generateLayout(120) }
    ]
  },
  {
    number: '12801',
    name: 'Purushottam Express',
    from: 'Puri',
    to: 'New Delhi',
    departure: '21:30',
    arrival: '05:55',
    duration: '32h 25m',
    distance: 1860,
    coaches: [
      { type: 'AC 2 Tier', seats: 48, fare: 2860, layout: generateLayout(48) },
      { type: 'AC 3 Tier', seats: 72, fare: 1880, layout: generateLayout(72) },
      { type: 'Sleeper', seats: 80, fare: 680, layout: generateLayout(80) },
      { type: 'General', seats: 112, fare: 230, layout: generateLayout(112) }
    ]
  },
  {
    number: '12002',
    name: 'Bhopal Shatabdi',
    from: 'New Delhi',
    to: 'Bhopal Junction',
    departure: '06:00',
    arrival: '14:25',
    duration: '8h 25m',
    distance: 701,
    coaches: [
      { type: 'AC Executive', seats: 32, fare: 1850, layout: generateLayout(32) },
      { type: 'AC Chair Car', seats: 78, fare: 1100, layout: generateLayout(78) }
    ]
  },
  {
    number: '12049',
    name: 'Gatimaan Express',
    from: 'New Delhi',
    to: 'Agra Cantt',
    departure: '08:10',
    arrival: '09:50',
    duration: '1h 40m',
    distance: 188,
    coaches: [
      { type: 'AC Executive', seats: 44, fare: 1650, layout: generateLayout(44) },
      { type: 'AC Chair Car', seats: 80, fare: 950, layout: generateLayout(80) }
    ]
  },
  {
    number: '12650',
    name: 'Karnataka Sampark Kranti',
    from: 'Hazrat Nizamuddin',
    to: 'Bangalore',
    departure: '08:20',
    arrival: '05:30',
    duration: '45h 10m',
    distance: 2524,
    coaches: [
      { type: 'AC 2 Tier', seats: 46, fare: 3320, layout: generateLayout(46) },
      { type: 'AC 3 Tier', seats: 72, fare: 2230, layout: generateLayout(72) },
      { type: 'Sleeper', seats: 80, fare: 790, layout: generateLayout(80) },
      { type: 'General', seats: 120, fare: 270, layout: generateLayout(120) }
    ]
  },
  {
    number: '22824',
    name: 'Bhubaneswar Rajdhani',
    from: 'New Delhi',
    to: 'Bhubaneswar',
    departure: '17:00',
    arrival: '10:35',
    duration: '17h 35m',
    distance: 1798,
    coaches: [
      { type: 'AC First Class', seats: 20, fare: 4380, layout: generateLayout(20) },
      { type: 'AC 2 Tier', seats: 46, fare: 2740, layout: generateLayout(46) },
      { type: 'AC 3 Tier', seats: 72, fare: 1840, layout: generateLayout(72) }
    ]
  }
];

function generateLayout(totalSeats) {
  const rows = Math.ceil(totalSeats / 6);
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

async function seedTrains() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing trains
    await Train.deleteMany({});

    // Calculate total seats for each train
    const trainsWithTotalSeats = sampleTrains.map(train => ({
      ...train,
      totalSeats: train.coaches.reduce((sum, coach) => sum + coach.seats, 0),
      coaches: train.coaches.map(coach => ({
        ...coach,
        availableSeats: coach.seats
      }))
    }));

    await Train.insertMany(trainsWithTotalSeats);

    console.log('Sample trains seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding trains:', error);
    process.exit(1);
  }
}

seedTrains();
