/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: 'http://localhost:5001',
    SOCKET_URL: 'http://localhost:5001',
  },
};

export default nextConfig;