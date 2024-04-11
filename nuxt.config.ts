// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt',
  ],
  build: {
    transpile: ['trpc-nuxt'],
  },
  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
});
