module.exports = {
  title: 'Vitedge',
  description: 'Edge-side rendering and fullstack Vite framework',
  themeConfig: {
    repo: 'frandiox/vitedge',
    docsDir: 'docs',
    editLinks: true,
    editLinkText: 'Edit this page on GitHub',
    lastUpdated: 'Last Updated',

    algolia: {
      apiKey: 'f98b65240d8346a09d4bdf113beb233c',
      indexName: 'vitedge',
    },

    nav: [
      {
        text: 'Release Notes',
        link: 'https://github.com/frandiox/vitedge/releases',
      },
    ],

    sidebar: [
      {
        text: 'Guide',
        children: [
          {
            text: 'Getting Started',
            link: '/getting-started',
          },
          {
            text: 'Usage',
            link: '/usage',
          },
          {
            text: 'Initial State',
            link: '/initial-state',
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
            text: 'Conditional Rendering',
            link: '/conditional-rendering',
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
      {
        text: 'Extras',
        children: [
          {
            text: 'Common Integrations',
            link: '/integrations',
          },
          {
            text: 'Useful Plugins',
            link: '/useful-plugins',
          },
        ],
      },
    ],
  },
}
