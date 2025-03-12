/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        "lookaside.fbsbx.com", // Facebook profile images
        "platform-lookaside.fbsbx.com", // Another FB image source
        "scontent.xx.fbcdn.net", // Facebook CDN
        "lh3.googleusercontent.com", // Google profile images
        "avatars.githubusercontent.com", // GitHub profile images
        "pbs.twimg.com", // Twitter/X profile images
        "res.cloudinary.com", // Cloudinary (if used)
        "images.unsplash.com", // Unsplash (if used)
        "cdn.pixabay.com", // Pixabay (if used)
        "i.imgur.com", // Imgur (if used)
      ],
    },
  };
  
  module.exports = nextConfig;
  