// @ts-check
import { defineConfig } from 'astro/config';



import netlify from '@astrojs/netlify';

import auth from 'auth-astro';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [auth(), react()],
  adapter: netlify(),
  //site: 'https://www.my-site.dev',
  prefetch: true,
  
});