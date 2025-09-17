// /backend/routes/buses.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth.js');
const { getLiveLocations } = require('../services/liveLocations'); // Assuming a service for locations

// Route to get a specific driver's bus information
router.get('/driver-info', authMiddleware, async (req, res) => {
  try {
    const driver = await User.findById(req.user.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(200).json({
      driverName: driver.name,
      busNumber: driver.busNumber,
      busRoute: driver.busRoute,
      busTiming: driver.busTiming,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get static bus information by bus number
router.get('/info/:busNumber', async (req, res) => {
  try {
    const busNumber = req.params.busNumber.toUpperCase();
    const driver = await User.findOne({ role: 'driver', busNumber });
    if (!driver) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.status(200).json({
      driverName: driver.name,
      driverMobile: driver.mobileNumber,
      busRoute: driver.busRoute,
      busTiming: driver.busTiming,
      busNumber: driver.busNumber,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get a list of all unique bus routes
router.get('/all-routes', async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }, 'busRoute -_id');
    const uniqueRoutes = [...new Set(drivers.map((d) => d.busRoute))];
    res.status(200).json({ routes: uniqueRoutes.map((r) => ({ number: r, name: `Route ${r}` })) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get real-time arrival and nearby bus information
router.get('/live-info', async (req, res) => {
  const { userLat, userLon } = req.query;

  if (!userLat || !userLon) {
    return res.status(400).json({ message: 'User location is required' });
  }

  try {
    const drivers = await User.find({ role: 'driver' });
    const userLocation = { latitude: parseFloat(userLat), longitude: parseFloat(userLon) };
    const activeBusLocations = getLiveLocations(); // Retrieve live locations from a centralized service

    let nextBusInfo = null;
    let nearbyBusCount = 0;

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of Earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    };

    let minDistance = Infinity;

    for (const driver of drivers) {
      if (activeBusLocations[driver.busNumber]) {
        const busLocation = activeBusLocations[driver.busNumber];
        const distance = calculateDistance(
          userLocation.latitude, userLocation.longitude,
          busLocation.latitude, busLocation.longitude
        );

        if (distance <= 2) {
          nearbyBusCount++;
        }

        const averageSpeedKmH = 20;
        const arrivalTimeMin = (distance / averageSpeedKmH) * 60;

        if (arrivalTimeMin < minDistance) {
          minDistance = arrivalTimeMin;
          nextBusInfo = {
            busNumber: driver.busNumber,
            arrivalTime: Math.round(arrivalTimeMin),
          };
        }
      }
    }

    res.status(200).json({
      nearbyBusCount,
      nextBus: nextBusInfo,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// New route to get a list of all active buses with details
router.get('/all-active', async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' });
    const activeBuses = drivers.map(driver => ({
      busNumber: driver.busNumber,
      busRoute: driver.busRoute,
      busTiming: driver.busTiming,
      driverName: driver.name,
    }));
    res.status(200).json({ activeBuses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;