export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'server',

  // Environment variables that should be available to both client and server
  publicRuntimeConfig: {
    // Empty, we don't need client-side env vars
  },

  // Environment variables that should be available only on the server
  privateRuntimeConfig: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  },

  // Server middleware for API
  serverMiddleware: [
    { path: '/api', handler: '~/server/api/chat.js' },
    { path: '/api/test', handler: '~/server/api/test.js' }
  ],

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'harryAI',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    ['@nuxtjs/dotenv', { systemvars: true }]
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
