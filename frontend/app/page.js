import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 bg-white shadow-md">
        <div className="font-bold text-lg">
          {/* Assuming you have a logo.png in your public folder */}
          <Image
            src="/logo.png"
            alt="App Logo"
            width={100}
            height={40}
            priority
          />
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link href="#features" className="text-gray-600 hover:text-gray-900">
            Features
          </Link>
          <Link href="/login" className="text-gray-600 hover:text-gray-900">
            Login
          </Link>
          <Link href="/register" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center bg-gray-50 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Track Your Ride<br />in Real-Time, Anytime
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-md mx-auto md:mx-0">
              Track your ride in real-time and stay on schedule with our efficient, user-friendly system.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/login" className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-md text-lg font-medium shadow-lg transition-colors">
                Login as Passenger
              </Link>
              <Link href="/login" className="border-2 border-gray-300 text-gray-800 px-8 py-3 rounded-md text-lg font-medium shadow-sm transition-colors hover:border-gray-400">
                Login as Driver
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center items-center">
            {/* The old placeholder div is replaced with this Image component */}
            <Image
              src="/map.png"
              alt="Live bus tracking map"
              width={500} // Adjust these values to fit your design
              height={350} // Adjust these values to fit your design
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1: Real-time tracking */}
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-4 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time tracking</h3>
              <p className="text-gray-600">See your ride's exact location on a map.</p>
            </div>

            {/* Feature 2: Predictive ETA */}
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-4 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Predictive ETA</h3>
              <p className="text-gray-600">Get accurate estimated times of arrival.</p>
            </div>

            {/* Feature 3: Seat availability */}
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-4 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h2a2 2 0 002-2V7a2 2 0 00-2-2h-2V3a1 1 0 00-1-1H8a1 1 0 00-1 1v2H5a2 2 0 00-2 2v11a2 2 0 002 2h2m0 0a2 2 0 100 4 2 2 0 000-4zm11 0a2 1 0 100 4 2 1 0 000-4zM7 7h10v12H7V7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Seat availability</h3>
              <p className="text-gray-600">Check for available seats on your bus.</p>
            </div>

            {/* Feature 4: Safety features */}
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-4 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Safety features</h3>
              <p className="text-gray-600">Enhanced safety protocols for a secure journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8">
            <Link href="#" className="hover:text-gray-300">Contact Us</Link>
            <Link href="#" className="hover:text-gray-300">Terms</Link>
          </div>
          {/* <div className="text-gray-400">example@domain.com</div> */}
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-twitter"></i></a>
            <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-envelope"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
}