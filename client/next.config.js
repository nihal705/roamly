/** @type {import('next').NextConfig} */
function getApiOrigin() {
  let raw =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
      : "");

  if (!raw || typeof raw !== "string") {
    return "http://localhost:5000";
  }

  raw = raw.trim();
  if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
    raw = `https://${raw}`;
  }
  return raw.replace(/\/+$/, "");
}

const API_ORIGIN = getApiOrigin();

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${API_ORIGIN}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
