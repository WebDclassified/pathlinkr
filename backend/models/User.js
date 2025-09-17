// /backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['driver', 'passenger'], default: 'passenger' },
  busNumber: { type: String, required: function() { return this.role === 'driver'; } },
  busRoute: { type: String, required: function() { return this.role === 'driver'; } },
  busTiming: { type: String, required: function() { return this.role === 'driver'; } },
});

module.exports = mongoose.model('User', UserSchema);