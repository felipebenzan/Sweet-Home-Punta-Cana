import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Sweet Home Punta Cana',
        short_name: 'Sweet Home PC',
        description: 'Adults-Only Guest House Near Bávaro Beach',
        start_url: '/',
        display: 'standalone',
        background_color: '#fff',
        theme_color: '#fff',
        icons: [
            {
                src: '/official-favicon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
