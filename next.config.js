/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        'toshankanwar.website',
        'firebasestorage.googleapis.com',
        'images.unsplash.com',
        'via.placeholder.com',
        'res.cloudinary.com',
        'imgur.com',
        'i.imgur.com',
        'picsum.photos',
        'images.pexels.com',
        'images.pixabay.com',
        'cdn.pixabay.com',
        'cdn.shopify.com',
        'storage.googleapis.com',
        'img.freepik.com',
        'freepik.com'
        // Add more domains as needed
      ],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
        {
          protocol: 'http',
          hostname: '**',
        },
      ],
    },
  }
  
  module.exports = nextConfig