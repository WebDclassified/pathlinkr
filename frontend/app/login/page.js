'use client';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';
import Link from 'next/link';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(`${process.env.API_URL}/api/auth/login`, data);
      setCookie('token', res.data.token);
      setCookie('role', res.data.role);
      setCookie('name', res.data.name);
      
      if (res.data.role === 'driver') {
        router.push('/dashboard/driver');
      } else {
        router.push('/dashboard/passenger');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Check if the server is running.';
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
      {/* Change max-w-lg to max-w-md for a more standard size */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden"> 
        <div className="p-10">
          <h2 className="text-4xl font-bold mb-8 text-center">Login</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            <div className="text-sm text-blue-500 hover:underline cursor-pointer">
              Forgot password?
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none"
            >
              Login
            </button>
            <div className="mt-4 text-center">
              <span className="text-gray-500">Don't have an account? </span>
              <Link href="/register" className="text-blue-500 font-medium hover:underline">
                Sign Up
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