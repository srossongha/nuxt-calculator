import tailwindcss from "@tailwindcss/vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // kept for the Pinia store coming later — remove if that plan changes
  modules: ['@pinia/nuxt'],
  imports: {
    dirs: ['stores'],
  },
  vite: {
    plugins: [
      tailwindcss()
    ]
  },
  css: [
    '~/assets/css/main.css'
  ]
})
