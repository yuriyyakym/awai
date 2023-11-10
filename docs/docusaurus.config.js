/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Awai docs',
  tagline: 'Dependency-free state management library written in TypeScript',
  favicon: '/logo.svg',
  staticDirectories: ['static'],
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
  themeConfig: {
    navbar: {
      title: 'Awai',
      logo: {
        alt: 'Awai docs',
        src: '/logo.svg',
        target: '_self',
        width: 32,
        height: 32,
      },
    },
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
