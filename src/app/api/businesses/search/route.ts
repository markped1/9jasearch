import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Helper to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const limit = parseInt(searchParams.get('limit') || '25');
    const featured = searchParams.get('featured') === 'true';
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const attributes = searchParams.get('attributes')?.split(',').filter(Boolean) || [];
    const verified = searchParams.get('verified') === 'true';
    const hasDeals = searchParams.get('hasDeals') === 'true';

    try {
        // Build where conditions
        const whereConditions: any[] = [{ isActive: true }];

        // Query filter (name or category)
        if (q) {
            whereConditions.push({
                OR: [
                    { name: { contains: q } },
                    { category: { contains: q } },
                    { description: { contains: q } },
                    { tags: { contains: q } }
                ]
            });
        }

        // Text Location filter (ignored if using lat/lng)
        if (location && (!lat || !lng)) {
            whereConditions.push({
                OR: [
                    { city: { contains: location } },
                    { state: { contains: location } },
                    { address: { contains: location } }
                ]
            });
        }

        // Featured filter
        if (featured) {
            whereConditions.push({ isFeatured: true });
        }

        // Verified filter
        if (verified) {
            whereConditions.push({ isVerified: true });
        }

        // Has Deals filter
        if (hasDeals) {
            whereConditions.push({
                offers: {
                    some: { isActive: true }
                }
            });
        }

        // Build order by based on sortBy parameter
        let orderBy: any[] = [];
        if (!lat || !lng) {
            orderBy = [
                { isFeatured: 'desc' },
                { tier: 'desc' }
            ];

            switch (sortBy) {
                case 'rating':
                    orderBy = [
                        { isFeatured: 'desc' },
                        { rating: 'desc' },
                        { reviewCount: 'desc' }
                    ];
                    break;
                case 'reviews':
                    orderBy = [
                        { isFeatured: 'desc' },
                        { reviewCount: 'desc' },
                        { rating: 'desc' }
                    ];
                    break;
                default:
                    orderBy.push({ rating: 'desc' }, { reviewCount: 'desc' });
            }
        }

        let businesses = await prisma.business.findMany({
            where: {
                AND: whereConditions
            },
            take: (!lat || !lng) ? limit * 2 : undefined, // Fetch all if doing geo-sort, else fetch extra
            orderBy: (!lat || !lng) ? orderBy : undefined
        });

        // Post-filter by attributes (search in description and tags)
        if (attributes.length > 0) {
            const attributeKeywords: Record<string, string[]> = {
                quiet: ['quiet', 'peaceful', 'calm', 'serene'],
                affordable: ['affordable', 'budget', 'cheap', 'low cost'],
                luxury: ['luxury', 'premium', 'upscale', 'exclusive'],
                fast: ['fast', 'quick', 'speedy', 'express'],
                delivery: ['delivery', 'delivers'],
                family: ['family', 'kids', 'children']
            };

            businesses = businesses.filter(biz => {
                const searchText = `${biz.description || ''} ${biz.tags || ''} ${biz.name}`.toLowerCase();
                return attributes.some(attr => {
                    const keywords = attributeKeywords[attr] || [attr];
                    return keywords.some(kw => searchText.includes(kw));
                });
            });
        }

        // Sort by distance if lat/lng provided
        if (lat && lng) {
            businesses = businesses.map((biz: any) => {
                if (biz.lat && biz.lng) {
                    return {
                        ...biz,
                        distance: calculateDistance(lat, lng, biz.lat, biz.lng)
                    };
                }
                return { ...biz, distance: 999999 }; // Far away if no coords
            });

            // Filter out businesses that are extremely far if user meant 'near me'
            // Let's say 50km radius for 'near me'
            businesses = businesses.filter((biz: any) => biz.distance < 50);

            // Sort by distance ascending
            businesses.sort((a: any, b: any) => {
                // Featured businesses still get a slight bump? 
                // Creating a score: distance - (featured * 5km boost)
                const scoreA = a.distance - (a.isFeatured ? 5 : 0);
                const scoreB = b.distance - (b.isFeatured ? 5 : 0);
                return scoreA - scoreB;
            });
        }

        // Limit results
        businesses = businesses.slice(0, limit);

        return NextResponse.json(businesses);
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
