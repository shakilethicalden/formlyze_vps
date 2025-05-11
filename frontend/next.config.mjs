/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**', // This allows all HTTPS domains
        },
        {
          protocol: 'http',
          hostname: '**', // This allows all HTTP domains (for development)
        },
      ],
      // Optional: You can also configure other image settings
      // minimumCacheTTL: 60, // Cache images for 60 seconds
      // formats: ['image/webp'], // Enable WebP format
      // deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Default device sizes
      // imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Default image sizes
    },
  };
  
  export default nextConfig;