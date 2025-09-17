'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [role, setRole] = useState('passenger');
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      await axios.post(`${process.env.API_URL}/api/auth/register`, { ...data, role });
      alert('Registration successful! Please log in.');
      router.push('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Check if the server is running.';
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-10">
          <h2 className="text-4xl font-bold mb-8 text-center">Sign Up</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                {...register('name')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input
                type="text"
                {...register('mobileNumber')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                {...register('password')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="passenger">Passenger</option>
                <option value="driver">Driver</option>
              </select>
            </div>
            {role === 'driver' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bus Number</label>
                  <input
                    type="text"
                    {...register('busNumber')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bus Route</label>
                  <input
                    type="text"
                    {...register('busRoute')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bus Timing</label>
                  <input
                    type="text"
                    {...register('busTiming')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </>
            )}
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none"
            >
              Sign Up
            </button>
            <div className="mt-4 text-center">
              <span className="text-gray-500">Already have an account? </span>
              <Link href="/login" className="text-blue-500 font-medium hover:underline">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
      <footer className="w-full text-center text-gray-600 py-6 mt-6">
        {/* <div className="text-gray-500">example@domain.com</div> */}
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="text-gray-400 hover:text-gray-600"><i className="fab fa-facebook-f"></i></a>
          <a href="#" className="text-gray-400 hover:text-gray-600"><i className="fab fa-twitter"></i></a>
          <a href="#" className="text-gray-400 hover:text-gray-600"><i className="fab fa-youtube"></i></a>
        </div>
      </footer>
    </div>
  );
}