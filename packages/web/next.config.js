/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              // 🔒 SECURITY: Restrict script sources (only self + trusted CDNs)
              "script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
              // Allow inline styles for KaTeX and Mermaid rendering
              "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
              // Restrict image sources
              "img-src 'self' data: https:",
              // Restrict fonts
              "font-src 'self' data: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
              // Prevent framing
              "frame-ancestors 'none'",
              // Connect only to self
              "connect-src 'self'",
              // Default deny
              "default-src 'self'",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
