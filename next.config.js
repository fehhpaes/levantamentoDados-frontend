/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações padrão do Next.js
};

module.exports = async () => {
  const withPWA = (await import('next-pwa')).default({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  });
  
  return withPWA(nextConfig);
};
