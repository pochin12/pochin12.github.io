// @ts-check
import { defineConfig } from 'astro/config';

import db from '@astrojs/db';

import netlify from '@astrojs/netlify';

import auth from 'auth-astro';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [db(), auth(), react()],
  adapter: netlify(),
  //site: 'https://www.my-site.dev',
  prefetch: true,
  
});