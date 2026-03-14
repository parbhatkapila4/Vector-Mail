import "./src/env.js";

const config = {
  output: "standalone",
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/VectorMail-New.png", permanent: false }];
  },
  experimental: {
    serverComponentsExternalPackages: ["@clerk/backend"],
  },
  webpack: (config, _ctx) => {
    config.output ??= {};
    config.output.chunkLoadTimeout = 120000;
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    const csp = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval'
        https://*.clerk.com
        https://*.clerk.services
        https://*.clerk.accounts.dev
        https://clerk.vectormail.space
        https://*.vectormail.space
        https://hcaptcha.com
        https://*.hcaptcha.com
        https://*.hcaptcha.net
        https://challenges.cloudflare.com;
      script-src-elem 'self' 'unsafe-inline'
        https://*.clerk.com
        https://*.clerk.services
        https://*.clerk.accounts.dev
        https://clerk.vectormail.space
        https://*.vectormail.space
        https://hcaptcha.com
        https://*.hcaptcha.com
        https://*.hcaptcha.net
        https://challenges.cloudflare.com;
      connect-src 'self'
        https://*.clerk.com
        https://*.clerk.services
        https://*.clerk.accounts.dev
        https://clerk.vectormail.space
        https://*.vectormail.space
        https://hcaptcha.com
        https://*.hcaptcha.com
        https://*.hcaptcha.net
        https://challenges.cloudflare.com;
      frame-src
        https://*.clerk.com
        https://*.clerk.services
        https://*.clerk.accounts.dev
        https://clerk.vectormail.space
        https://*.vectormail.space
        https://accounts.vectormail.space
        https://hcaptcha.com
        https://*.hcaptcha.com
        https://*.hcaptcha.net
        https://challenges.cloudflare.com;
      img-src 'self' data: https:;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' data: https://fonts.gstatic.com;
      worker-src 'self' blob:;
      object-src 'none';
    `
      .replace(/\s{2,}/g, " ")
      .trim();

    return [
      {
        source: "/(.*)",
        headers: [{ key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
};

export default config;
