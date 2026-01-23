/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            // Note : On garde 'unsafe-eval' pour la compatibilité Stripe/Next.js en dev
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://hcaptcha.com https://*.hcaptcha.com https://ajax.googleapis.com https://widget.mondialrelay.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://hcaptcha.com https://*.hcaptcha.com https://unpkg.com https://widget.mondialrelay.com; img-src 'self' data: https: https://hcaptcha.com https://*.hcaptcha.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; frame-src https://js.stripe.com https://hooks.stripe.com https://hcaptcha.com https://*.hcaptcha.com; connect-src 'self' https://api.stripe.com https://hcaptcha.com https://*.hcaptcha.com https://widget.mondialrelay.com;"
          }
        ]
      }
    ];
  },
};

export default nextConfig;