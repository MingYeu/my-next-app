// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// };

// export default nextConfig;

////////////

// /** @type {import('next').NextConfig} */
// import withBundleAnalyzer from '@next/bundle-analyzer';

// const nextConfig = {
//   reactStrictMode: true,
// };

// export default withBundleAnalyzer({
//   enabled: process.env.ANALYZE === 'true',
//   ...nextConfig,
// });

/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');
const nextConfig = {
    reactStrictMode: true,

    i18n,
};

module.exports = nextConfig;
