// @ts-check
import { defineConfig } from 'astro/config';



import netlify from '@astrojs/netlify';

import auth from 'auth-astro';

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [auth()],
  adapter: netlify(),
  //site: 'https://www.my-site.dev',
  prefetch: true,
  
});