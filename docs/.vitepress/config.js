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
            text: 'SSR Context & Initial State',
            link: '/ssr-context',
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
            text: 'Handle Event Options',
            link: '/handle-event',
          },
          {
            text: 'CORS',
            link: '/cors',
          },
          {
            text: 'Plugin Options',
            link: '/plugin',
          },
          {
            text: 'Custom Rendering',
            link: '/custom-rendering',
          },
        ],
      },
      {
        text: 'Recipes',
        children: [
          {
            text: 'Authentication',
            link: '/recipes/authentication',
          },
          {
            text: 'Cloudflare Workers',
            link: '/recipes/cloudflare-workers',
          },
          {
            text: 'Vue',
            link: '/recipes/vue',
          },
          {
            text: 'React',
            link: '/recipes/react',
          },
        ],
      },
      {
        text: 'Extras',
        children: [
          {
            text: 'Useful Plugins',
            link: '/useful-plugins',
          },
          {
            text: 'Troubleshooting',
            link: '/troubleshooting',
          },
        ],
      },
    ],
  },
}
