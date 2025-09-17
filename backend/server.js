// /backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Correct file paths for routes and services
const authRoutes = require('./routes/auth.js');
const busRoutes = require('./routes/buses.js');
const profileRoutes = require('./routes/profile.js');
const { updateLocation } = require('./services/liveLocations'); // Assuming liveLocations.js exists

dotenv.config();

// --- Correct Order: Declare app first, then use it ---
const app = express();
const server = http.createServer(app);

// --- Apply middleware here, before routes ---
app.use(cors());
app.use(express.json());

// --- Correct Socket.IO setup ---
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
// ----------------------------------------

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error(err));

// --- Route handlers must be after middleware ---
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/profile', profileRoutes); // Added the profile route here

// Stores socket IDs of connected drivers
const driverSockets = {};

io.on('connection', socket => {
  console.log('New client connected');

  const token = socket.handshake.query.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === 'driver') {
        driverSockets[decoded.id] = socket.id;
      }
    } catch (error) {
      console.error('Socket authentication failed:', error.message);
    }
  }

  socket.on('updateLocation', (data) => {
    updateLocation(data.busNumber, data.location); // Use the liveLocations service
    io.emit('busLocationUpdate', { busNumber: data.busNumber, location: data.location });
  });

  socket.on('passengerOnBus', async (data) => {
    const User = require('./models/User');
    const driver = await User.findOne({ busNumber: data.busNumber, role: 'driver' });
    if (driver && driverSockets[driver._id]) {
      io.to(driverSockets[driver._id]).emit('passengerNotification', {
        passengerName: data.passengerName,
        message: data.message
      });
      console.log(`Notification sent to driver of bus ${data.busNumber}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    for (let id in driverSockets) {
      if (driverSockets[id] === socket.id) {
        delete driverSockets[id];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));