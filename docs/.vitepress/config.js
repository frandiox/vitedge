module.exports = {
  title: 'Vitedge',
  description: 'Edge-side rendering and fullstack Vite framework',
  themeConfig: {
    repo: 'frandiox/vitedge',
    docsDir: 'docs',
    editLinks: true,
    editLinkText: 'Edit this page on GitHub',
    lastUpdated: 'Last Updated',

    sidebar: [
      {
        text: 'Getting Started',
        link: '/getting-started',
      },
      {
        text: 'Usage',
        link: '/usage',
      },
      {
        text: 'Page Props',
        link: '/props',
      },
      {
        text: 'API',
        link: '/api',
      },
      {
        text: 'Cache',
        link: '/cache',
      },
      {
        text: 'Environment Variables',
        link: '/environment',
      },
      {
        text: 'CORS',
        link: '/cors',
      },
      {
        text: 'Troubleshooting',
        link: '/troubleshooting',
      },
    ],
  },
}
