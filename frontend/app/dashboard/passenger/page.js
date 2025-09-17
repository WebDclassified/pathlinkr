'use client';
import { useState, useEffect } from 'react';
import { getCookie, deleteCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import axios from 'axios';
import L from 'leaflet';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic'; // Import dynamic for client-side rendering

// Fix for default marker icon in react-leaflet.
// NOTE: This can also be placed in a separate file and imported.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapWithNoSSR = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayerWithNoSSR = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const MarkerWithNoSSR = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const PopupWithNoSSR = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// A simple user avatar component with a dropdown
function UserAvatar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    deleteCookie('token');
    deleteCookie('role');
    deleteCookie('name');
    router.push('/login');
  };

  return (
    <div className="relative">
      <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
          {getCookie('name')?.charAt(0) || 'U'}
        </div>
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <Link
            href="/profile-update"
            onClick={() => setDropdownOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            Update Profile
          </Link>
          <button
            onClick={handleLogout}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

// Reusable Data Block Component
function DataBlock({ title, value, icon }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'bus': return '🚌';
      case 'route': return '🗺️';
      case 'clock': return '⏰';
      case 'search': return '🔍';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-start space-y-2">
      <div className="flex items-center space-x-2">
        <span className="text-3xl">{getIcon(icon)}</span>
        <span className="text-xl font-bold text-gray-800">{title}</span>
      </div>
      <p className="text-4xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
}

// Vehicles Content Component
function VehiclesContent() {
  const [buses, setBuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBus, setSelectedBus] = useState(null);
  const [destination, setDestination] = useState('');

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await axios.get(`${process.env.API_URL}/api/buses/all-active`);
        setBuses(res.data.activeBuses);
      } catch (error) {
        console.error('Failed to fetch buses:', error);
      }
    };
    fetchBuses();
  }, []);

  const filteredBuses = buses.filter(bus =>
    bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.busRoute.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectBus = async (busNumber) => {
    try {
      const res = await axios.get(`${process.env.API_URL}/api/buses/info/${busNumber}`);
      setSelectedBus(res.data);
    } catch (error) {
      console.error('Failed to get bus info:', error);
    }
  };

  const handleImOnTheBus = () => {
    if (selectedBus && destination) {
      const socket = io(process.env.SOCKET_URL);
      socket.emit('passengerOnBus', {
        busNumber: selectedBus.busNumber,
        passengerName: getCookie('name'),
        message: `I am on bus ${selectedBus.busNumber} heading to ${destination}.`,
      });
      alert('Driver has been notified!');
    } else {
      alert('Please select a bus and enter your destination.');
    }
  };

  return (
    <div className="mt-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Available Vehicles</h2>
      
      <input
        type="text"
        placeholder="Search by bus number or route"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border rounded-md mb-4"
      />

      <div className="grid grid-cols-1 gap-4">
        {filteredBuses.length > 0 ? (
          filteredBuses.map(bus => (
            <div
              key={bus.busNumber}
              className="p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => handleSelectBus(bus.busNumber)}
            >
              <p className="font-semibold">Bus: {bus.busNumber}</p>
              <p className="text-sm text-gray-600">Route: {bus.busRoute}</p>
              <p className="text-sm text-gray-600">Timing: {bus.busTiming}</p>
            </div>
          ))
        ) : (
          <p>No vehicles available.</p>
        )}
      </div>

      {selectedBus && (
        <div className="mt-8 p-6 border-t border-gray-200">
          <h3 className="text-xl font-bold mb-4">Selected Vehicle Details</h3>
          <p><strong>Bus Number:</strong> {selectedBus.busNumber}</p>
          <p><strong>Bus Route:</strong> {selectedBus.busRoute}</p>
          <p><strong>Bus Timing:</strong> {selectedBus.busTiming}</p>
          <p><strong>Driver Name:</strong> {selectedBus.driverName}</p>
          <p><strong>Driver Mobile:</strong> {selectedBus.driverMobile}</p>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">My Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md"
              placeholder="e.g. City Square"
            />
            <button
              onClick={handleImOnTheBus}
              className="w-full mt-2 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              I'm on this bus
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Passenger Dashboard Component
export default function PassengerDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeBuses, setActiveBuses] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [liveMetrics, setLiveMetrics] = useState({ nextBus: null, nearbyBusCount: 0 });
  const router = useRouter();

  useEffect(() => {
    const role = getCookie('role');
    if (role !== 'passenger') {
      router.push('/login');
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      });
    }

    const socket = io(process.env.SOCKET_URL);
    socket.on('busLocationUpdate', (data) => {
      setActiveBuses(prevBuses => {
        const busIndex = prevBuses.findIndex(bus => bus.busNumber === data.busNumber);
        if (busIndex > -1) {
          const newBuses = [...prevBuses];
          newBuses[busIndex] = data;
          return newBuses;
        } else {
          return [...prevBuses, data];
        }
      });
    });

    const fetchRoutes = async () => {
      try {
        const res = await axios.get(`${process.env.API_URL}/api/buses/all-routes`);
        setAllRoutes(res.data.routes);
      } catch (error) {
        console.error('Failed to fetch routes:', error);
      }
    };
    fetchRoutes();

    const fetchLiveMetrics = async () => {
      if (!userLocation) return;
      try {
        const res = await axios.get(`${process.env.API_URL}/api/buses/live-info`, {
          params: {
            userLat: userLocation.latitude,
            userLon: userLocation.longitude,
          }
        });
        setLiveMetrics(res.data);
      } catch (error) {
        console.error('Failed to fetch live metrics:', error);
      }
    };

    fetchLiveMetrics();
    const intervalId = setInterval(fetchLiveMetrics, 30000);

    return () => {
      socket.disconnect();
      clearInterval(intervalId);
    };
  }, [router, userLocation]);

  const aboutContent = (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">About the System</h2>
      <p className="text-gray-600">
        This is a public vehicle tracking system designed to help you navigate the city efficiently.
        The data shown here is updated in real-time, providing accurate information about bus locations,
        routes, and arrival times.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <nav className="p-4 bg-white shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="font-bold text-lg">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Public Vehicle Tracking</h1>
        </div>
        <UserAvatar />
      </nav>

      <div className="flex-grow p-4">
        <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'home' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-300'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'vehicles' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-300'
            }`}
          >
            Vehicles
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'routes' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-300'
            }`}
          >
            Routes
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'about' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-300'
            }`}
          >
            About
          </button>
        </div>

        {activeTab === 'home' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4 h-96">
              <h2 className="text-xl font-bold mb-2">Live Bus Map</h2>
              {/* Use dynamically imported map components */}
              <MapWithNoSSR center={[userLocation?.latitude || 28.7041, userLocation?.longitude || 77.1025]} zoom={11} className="w-full h-80 rounded-lg">
                <TileLayerWithNoSSR
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {activeBuses.map((bus) => (
                  <MarkerWithNoSSR key={bus.busNumber} position={[bus.location.latitude, bus.location.longitude]}>
                    <PopupWithNoSSR>
                      Bus {bus.busNumber} is here!
                    </PopupWithNoSSR>
                  </MarkerWithNoSSR>
                ))}
              </MapWithNoSSR>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DataBlock title="Vehicles" value={activeBuses.length} icon="bus" />
              <DataBlock title="Routes" value={allRoutes.length} icon="route" />
              <DataBlock title="Arrival Time" value={liveMetrics.nextBus ? `${liveMetrics.nextBus.arrivalTime} min` : '--'} icon="clock" />
              <DataBlock title="Nearby" value={liveMetrics.nearbyBusCount} icon="search" />
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && <VehiclesContent />}

        {activeTab === 'routes' && (
          <div className="mt-4 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Available Routes</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allRoutes.length > 0 ? (
                allRoutes.map((route) => (
                  <li key={route.number} className="p-4 bg-gray-100 rounded-lg text-gray-800 font-semibold hover:bg-gray-200 transition-colors">
                    Route: {route.number}
                  </li>
                ))
              ) : (
                <p>No routes available.</p>
              )}
            </ul>
          </div>
        )}

        {activeTab === 'about' && aboutContent}
      </div>
    </div>
  );
}