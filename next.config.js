/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",
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
        https://clerk.parbhat.dev
        https://*.clerk.com
        https://*.clerk.services
        https://*.clerk.accounts.dev
        https://hcaptcha.com
        https://*.hcaptcha.com
        https://*.hcaptcha.net
        https://challenges.cloudflare.com;
      connect-src 'self'
        https://clerk.parbhat.dev
        https://*.clerk.com
        https://*.clerk.services
        https://*.clerk.accounts.dev
        https://hcaptcha.com
        https://*.hcaptcha.com
        https://*.hcaptcha.net
        https://challenges.cloudflare.com;
      frame-src
        https://clerk.parbhat.dev
        https://*.clerk.com
        https://*.clerk.services
        https://*.clerk.accounts.dev
        https://hcaptcha.com
        https://*.hcaptcha.com
        https://*.hcaptcha.net
        https://challenges.cloudflare.com;
      img-src 'self' data: https:;
      style-src 'self' 'unsafe-inline';
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
