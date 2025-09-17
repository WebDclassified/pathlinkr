'use client';
import { useState, useEffect } from 'react';
import { getCookie, deleteCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import axios from 'axios';
import L from 'leaflet';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Fix for default marker icon in react-leaflet.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Dynamically import Leaflet components to prevent SSR errors
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
const PolylineWithNoSSR = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);


// Driver Avatar/Profile Button Component
function DriverProfileButton() {
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
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {getCookie('name')?.charAt(0) || 'D'}
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

// Main Driver Dashboard Component
export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [driverInfo, setDriverInfo] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [socket, setSocket] = useState(null);
  const router = useRouter();

  // Dummy data for route details (replace with actual API fetch)
  const dummyRouteDetails = {
    routeId: '23',
    totalStops: 15,
    price: '$1.50',
    // Example coordinates for a route (replace with real data for Polyline)
    routeCoordinates: [
      [28.7041, 77.1025], // Example start point
      [28.7100, 77.1100],
      [28.7150, 77.1150],
      [28.7200, 77.1200]  // Example end point
    ]
  };

  // Check role and fetch driver info on component mount
  useEffect(() => {
    const role = getCookie('role');
    if (role !== 'driver') {
      router.push('/login');
    }

    const fetchDriverInfo = async () => {
      try {
        const token = getCookie('token');
        const res = await axios.get(`${process.env.API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDriverInfo(res.data);
      } catch (error) {
        console.error('Failed to fetch driver info:', error);
        // Handle error, e.g., redirect to login if token is invalid
        handleLogout(); // Assuming handleLogout is accessible or defined here
      }
    };
    fetchDriverInfo();

    // Initialize Socket.IO connection
    const token = getCookie('token');
    const newSocket = io(process.env.SOCKET_URL, {
      query: { token },
      transports: ['websocket'] // Force WebSocket to avoid polling issues
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Driver Socket Connected!');
    });

    newSocket.on('passengerNotification', (data) => {
        alert(`Passenger on bus: ${data.passengerName} - ${data.message}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [router]);

  // Handle location tracking
  useEffect(() => {
    let watchId;

    if (isTracking && socket && driverInfo) {
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ latitude, longitude });
            socket.emit('updateLocation', {
              busNumber: driverInfo.busNumber, // Assuming driverInfo has busNumber
              location: { latitude, longitude }
            });
          },
          (error) => {
            console.error('Geolocation error:', error);
            alert('Could not get your location. Please enable location services.');
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
        setIsTracking(false);
      }
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking, socket, driverInfo]);

  const handleStartTracking = () => {
    if (!driverInfo?.busNumber) {
      alert("Bus number not assigned. Cannot start tracking.");
      return;
    }
    setIsTracking(true);
    alert('Tracking started!');
  };

  const handleCancelTracking = () => {
    setIsTracking(false);
    alert('Tracking stopped.');
  };

  // Helper function for logout (can be shared with UserAvatar or DriverProfileButton)
  const handleLogout = () => {
    deleteCookie('token');
    deleteCookie('role');
    deleteCookie('name');
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="p-4 bg-white shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="font-bold text-lg">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Public Vehicle Tracking - Driver</h1>
        </div>
        <DriverProfileButton />
      </nav>

      {/* Main Content */}
      <div className="flex-grow p-4">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg mb-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'home' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-300'
            }`}
          >
            Home
          </button>
          {/* Add other driver-specific tabs if needed */}
        </div>

        {activeTab === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Map Section */}
            <div className="bg-white rounded-lg shadow-md p-4 h-[400px]">
              <h2 className="text-xl font-bold mb-2">My Route Live Map</h2>
              {currentLocation ? (
                <MapWithNoSSR
                  center={[currentLocation.latitude, currentLocation.longitude]}
                  zoom={13}
                  className="w-full h-[calc(100%-32px)] rounded-lg"
                >
                  <TileLayerWithNoSSR
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* Driver's current location marker */}
                  <MarkerWithNoSSR position={[currentLocation.latitude, currentLocation.longitude]}>
                    <PopupWithNoSSR>You are here!</PopupWithNoSSR>
                  </MarkerWithNoSSR>

                  {/* Display the route as a polyline */}
                  {dummyRouteDetails.routeCoordinates && dummyRouteDetails.routeCoordinates.length > 1 && (
                    <PolylineWithNoSSR positions={dummyRouteDetails.routeCoordinates} color="blue" weight={5} />
                  )}
                </MapWithNoSSR>
              ) : (
                <div className="flex items-center justify-center w-full h-[calc(100%-32px)] bg-gray-200 rounded-lg text-gray-600">
                  Loading map... Please enable location services.
                </div>
              )}
            </div>

            {/* Route Information and Controls */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
              <h2 className="text-2xl font-bold mb-4">Route Information</h2>
              
              <div className="flex-grow">
                <div className="mb-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-700 font-medium">Route ID</span>
                    <span className="text-gray-900 font-semibold">{driverInfo?.busRoute || dummyRouteDetails.routeId}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-700 font-medium">Bus Number</span>
                    <span className="text-gray-900 font-semibold">{driverInfo?.busNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-700 font-medium">Total Stops</span>
                    <span className="text-gray-900 font-semibold">{dummyRouteDetails.totalStops}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">Price</span>
                    <span className="text-gray-900 font-semibold">{dummyRouteDetails.price}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleStartTracking}
                  disabled={isTracking}
                  className={`flex-1 py-3 rounded-md text-white font-semibold transition-colors ${
                    isTracking ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isTracking ? 'Tracking...' : 'Start Route'}
                </button>
                <button
                  onClick={handleCancelTracking}
                  disabled={!isTracking}
                  className={`flex-1 py-3 rounded-md text-white font-semibold transition-colors ${
                    !isTracking ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  Cancel Route
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}