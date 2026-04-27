import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Indigo — E-Commerce for Nepal',
    short_name: 'Indigo',
    description: 'The e-commerce platform built for Nepal',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [],
  }
}
