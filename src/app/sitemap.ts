
import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

function toSlug(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://9jasearch.ng'

    // Static Routes
    const routes = [
        '',
        '/login',
        '/register',
        '/pricing',
        '/add-business',
        '/deals',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 1,
    }))

    // Dynamic Business Routes
    let businessRoutes: MetadataRoute.Sitemap = []
    try {
        const businesses = await prisma.business.findMany({
            select: { slug: true, updatedAt: true },
            where: { isActive: true }
        })

        businessRoutes = businesses.map((business) => ({
            url: `${baseUrl}/business/${business.slug}`,
            lastModified: business.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))
    } catch (error) {
        console.error('Sitemap business fetch failed:', error)
    }

    // Category + City combination routes
    let categoryCityRoutes: MetadataRoute.Sitemap = []
    try {
        const combos = await prisma.business.findMany({
            select: { category: true, city: true },
            where: { isActive: true },
            distinct: ['category', 'city'],
        })

        categoryCityRoutes = combos.map(({ category, city }) => ({
            url: `${baseUrl}/${toSlug(category)}/${toSlug(city)}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))
    } catch (error) {
        console.error('Sitemap category+city fetch failed:', error)
    }

    // City landing page routes
    let cityRoutes: MetadataRoute.Sitemap = []
    try {
        const cities = await prisma.business.findMany({
            select: { city: true },
            where: { isActive: true },
            distinct: ['city'],
        })

        cityRoutes = cities.map(({ city }) => ({
            url: `${baseUrl}/city/${toSlug(city)}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }))
    } catch (error) {
        console.error('Sitemap city fetch failed:', error)
    }

    return [...routes, ...businessRoutes, ...categoryCityRoutes, ...cityRoutes]
}
