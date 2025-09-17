'use client';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import axios from 'axios';

export default function DriverDashboard() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('Off');
  const [busInfo, setBusInfo] = useState(null);
  const [passengerNotifications, setPassengerNotifications] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = getCookie('token');
    const role = getCookie('role');
    
    if (role !== 'driver' || !token) {
      router.push('/login');
    } else {
      // Fetch driver-specific bus info from the backend
      const fetchBusInfo = async () => {
        try {
          const res = await axios.get(`${process.env.API_URL}/api/buses/driver-info`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setBusInfo(res.data);
        } catch (error) {
          console.error('Failed to fetch bus info:', error);
        }
      };
      fetchBusInfo();
    }
  }, [router]);

  useEffect(() => {
    if (busInfo) {
      const socket = io(process.env.SOCKET_URL, {
        query: { token: getCookie('token') }
      });
      
      socket.on('passengerNotification', (data) => {
        setPassengerNotifications(prev => [...prev, data]);
      });
      
      return () => {
        socket.off('passengerNotification');
        socket.disconnect();
      };
    }
  }, [busInfo]);

  const toggleLocation = () => {
    if (status === 'Off') {
      if (navigator.geolocation) {
        setStatus('On');
        const socket = io(process.env.SOCKET_URL);
        const watchId = navigator.geolocation.watchPosition(position => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(newLocation);
          socket.emit('updateLocation', { busNumber: busInfo.busNumber, location: newLocation });
        }, error => {
          console.error(error);
          alert('Could not get location. Please enable location services.');
        });
        localStorage.setItem('watchId', watchId);
      } else {
        alert('Geolocation is not supported by your browser.');
      }
    } else {
      setStatus('Off');
      const watchId = localStorage.getItem('watchId');
      if (watchId) {
        navigator.geolocation.clearWatch(parseInt(watchId));
        localStorage.removeItem('watchId');
      }
      setLocation(null);
    }
  };

  if (!busInfo) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100">Loading bus information...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Driver Dashboard</h1>
      <div className="w-full max-w-md p-6 bg-white rounded shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-2">Bus: {busInfo.busNumber}</h2>
        <p><strong>Route:</strong> {busInfo.busRoute}</p>
        <p><strong>Timing:</strong> {busInfo.busTiming}</p>
        <p className="mt-4">Live Location Status: <span className={`font-bold ${status === 'On' ? 'text-green-500' : 'text-red-500'}`}>{status}</span></p>
        <button onClick={toggleLocation} className={`mt-4 w-full py-2 rounded-md text-white ${status === 'On' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
          {status === 'On' ? 'Stop Sharing Location' : 'Start Sharing Location'}
        </button>
      </div>

      {location && (
        <div className="mt-4 p-4 border rounded-md bg-white w-full max-w-md">
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
        </div>
      )}

      {passengerNotifications.length > 0 && (
        <div className="mt-6 w-full max-w-md p-6 bg-white rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Passenger Notifications</h3>
          {passengerNotifications.map((note, index) => (
            <div key={index} className="border-b last:border-b-0 py-2">
              <p><strong>From:</strong> {note.passengerName}</p>
              <p><strong>Message:</strong> {note.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}