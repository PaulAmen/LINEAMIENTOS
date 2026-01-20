import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  site: 'https://TU_USUARIO.github.io',
  base: '/LINEAMIENTOS',
  integrations: [svelte()],
  build: {
    assets: '_astro'
  }
});
