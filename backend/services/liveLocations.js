// /backend/services/liveLocations.js
const activeBusLocations = {};

const updateLocation = (busNumber, location) => {
  activeBusLocations[busNumber] = location;
};

const getLiveLocations = () => {
  return activeBusLocations;
};

module.exports = {
  updateLocation,
  getLiveLocations,
};