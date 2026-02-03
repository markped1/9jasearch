
import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://eaglesearch.ng' // Replace with actual production URL

    // Static Routes
    const routes = [
        '',
        '/login',
        '/register',
        '/pricing',
        '/add-business',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 1,
    }))

    // Dynamic Business Routes
    const businesses = await prisma.business.findMany({
        select: { slug: true, updatedAt: true },
        where: { isActive: true } // Only active
    })

    const businessRoutes = businesses.map((business) => ({
        url: `${baseUrl}/business/${business.slug}`,
        lastModified: business.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [...routes, ...businessRoutes]
}
