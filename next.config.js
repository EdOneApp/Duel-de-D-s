/** @type {import('next').NextConfig} */

// Nom du dépôt GitHub -> le site est servi sous https://<user>.github.io/Duel-de-D-s/
// Surcharge possible via la variable d'environnement NEXT_PUBLIC_BASE_PATH.
const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH !== undefined
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : '/Duel-de-D-s';

const nextConfig = {
  output: 'export',
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
