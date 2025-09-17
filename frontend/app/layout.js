// /frontend/app/layout.js
import './globals.css';
import 'leaflet/dist/leaflet.css'; // Add this line

export const metadata = {
  title: 'Vehicle Tracker App',
  description: 'Track public vehicles in real-time.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}