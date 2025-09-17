// /backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // New import
const authRoutes = require('./routes/auth.js');
const busRoutes = require('./routes/buses.js');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error(err));

// Stores socket IDs of connected drivers to send them specific notifications
const driverSockets = {}; 

io.on('connection', socket => {
  console.log('New client connected');

  // New: Identify driver on connection using a JWT token
  const token = socket.handshake.query.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === 'driver') {
        // Store the socket ID of the authenticated driver
        driverSockets[decoded.id] = socket.id;
      }
    } catch (error) {
      console.error('Socket authentication failed:', error.message);
    }
  }

  socket.on('updateLocation', (data) => {
    io.emit('busLocationUpdate', { busNumber: data.busNumber, location: data.location });
  });

  // New: Handle passenger notifications for a specific driver
  socket.on('passengerOnBus', async (data) => {
    // You'll need to get the driver's user ID from your database based on the bus number.
    const User = require('./models/User'); // Import User model to find driver
    const driver = await User.findOne({ busNumber: data.busNumber, role: 'driver' });
    if (driver && driverSockets[driver._id]) {
      // Find the specific driver's socket and send the notification
      io.to(driverSockets[driver._id]).emit('passengerNotification', {
        passengerName: data.passengerName,
        message: data.message
      });
      console.log(`Notification sent to driver of bus ${data.busNumber}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Remove the socket ID from the driverSockets map on disconnect
    for (let id in driverSockets) {
      if (driverSockets[id] === socket.id) {
        delete driverSockets[id];
        break;
      }
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));