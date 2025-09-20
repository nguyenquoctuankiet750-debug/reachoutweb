const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // tắt PWA khi dev
});

module.exports = withPWA({
  reactStrictMode: true,
  env: {
    HASURA_ADMIN_SECRET:
      "ul1dZR5xWNZRugZmp5M71HaeUx6CHkbXbB0XDkha6Y3Rbl2poJ9XJ6PCQJkDH9MB",
  },
});
