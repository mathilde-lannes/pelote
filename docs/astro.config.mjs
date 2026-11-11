import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://mathilde-lannes.github.io',
  base: '/pelote',
  integrations: [
    starlight({
      title: 'Pelote',
      description:
        'Pelote — Instagram-style Ravelry companion. A photo feed of friends’ projects.',
      expressiveCode: {
        themes: ['dracula', 'solarized-light'],
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/mathilde-lannes/pelote',
        },
      ],
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: true,
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Fira+Sans:wght@400;500;600&display=swap',
          },
        },
      ],
      sidebar: [
        {
          label: 'Specs',
          items: [
            { label: 'Auth', link: '/specs/auth/' },
            { label: 'Feed', link: '/specs/feed/' },
            { label: 'Friends', link: '/specs/friends/' },
            { label: 'Profile', link: '/specs/profile/' },
            { label: 'Settings', link: '/specs/settings/' },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
      lastUpdated: true,
    }),
  ],
  image: {
    service: passthroughImageService(),
  },
  vite: {
    ssr: {
      noExternal: ['zod'],
    },
  },
});
