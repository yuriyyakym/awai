/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Awai docs',
  tagline: 'Dependency-free state management library written in TypeScript',
  // favicon: 'img/favicon.ico',
  url: 'https://...',
  baseUrl: '/',
  organizationName: 'yuriyyakym',
  projectName: 'awai',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  plugins: [require.resolve('docusaurus-lunr-search')],
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
        },
        blog: false,
      },
    ],
  ],
};

module.exports = config;
