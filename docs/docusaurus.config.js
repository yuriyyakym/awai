/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Awai docs',
  tagline: 'Dependency-free state management library written in TypeScript',
  favicon: '/logo.svg',
  staticDirectories: ['static'],
  url: 'https://awai.js.org',
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
      items: [
        {
          href: 'https://github.com/yuriyyakym/awai',
          position: 'right',
          className: 'header--github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
  },
  plugins: [
    require.resolve('docusaurus-lunr-search'),
    process.env.VERCEL_ENV === 'production' && [
      '@docusaurus/plugin-google-gtag',
      {
        trackingID: process.env.GA_TRACKING_ID,
        anonymizeIP: true,
      },
    ],
  ].filter(Boolean),
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: ['./styles/custom.css'],
        },
      },
    ],
  ],
};

module.exports = config;
