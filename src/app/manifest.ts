import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Life Manager',
    short_name: 'Life Manager',
    description: 'Gerenciador pessoal — peso, estudos de inglês e consistência',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#ffffff',
    lang: 'pt-BR',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
