export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  modules: ['@nuxt/ui', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },
  typescript: { strict: true },
  runtimeConfig: { demoMode: false },
  ui: { fonts: false },
  app: { head: { title: 'Zonhack · Performance Explorer', meta: [{ name: 'description', content: 'A unified e-commerce performance workspace.' }] } },
})
