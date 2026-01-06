/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: false,
    remotePatterns: [
      
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },

          // ---------------------------
          //  CONTENT SECURITY POLICY
          // ---------------------------
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // AJOUTS ICI : ajax.googleapis.com, widget.mondialrelay.com, unpkg.com
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hcaptcha.com https://*.hcaptcha.com https://ajax.googleapis.com https://widget.mondialrelay.com https://unpkg.com", 
              
              // AJOUT ICI : unpkg.com (pour le CSS Leaflet)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://hcaptcha.com https://*.hcaptcha.com https://unpkg.com https://widget.mondialrelay.com",              
              "img-src 'self' data: https: https://hcaptcha.com https://*.hcaptcha.com",
              "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
              
              // AJOUT ICI : widget.mondialrelay.com (pour les requêtes API du widget)
              "connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://sentry.hcaptcha.com https://widget.mondialrelay.com",
              
              "frame-src https://hcaptcha.com https://*.hcaptcha.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join("; ")
          }
        ]
      }
    ];
  },
};

export default nextConfig;