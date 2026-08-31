/** @type {import('next').NextConfig} */

// Le site est publié sur un domaine personnalisé (duel.myoctogone.com) servi à la racine,
// donc pas de basePath par défaut.
// Pour un déploiement sous https://<user>.github.io/Duel-de-D-s/ (sans domaine perso),
// builder avec NEXT_PUBLIC_BASE_PATH=/Duel-de-D-s.
const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH !== undefined
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : '';

const nextConfig = {
  output: 'export',
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
