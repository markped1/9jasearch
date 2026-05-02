import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ── Keyword → category aliases ──────────────────────────────────────
// Maps common search words to the actual category names in the DB
const KEYWORD_ALIASES: Record<string, string[]> = {
  plumber:       ['Plumbing & Pipefitting'],
  plumbing:      ['Plumbing & Pipefitting'],
  electrician:   ['Electrical Installation'],
  electrical:    ['Electrical Installation'],
  wiring:        ['Electrical Installation'],
  carpenter:     ['Carpenters & Woodwork'],
  carpentry:     ['Carpenters & Woodwork'],
  furniture:     ['Carpenters & Woodwork', 'Furniture & Decor'],
  painter:       ['Painters & Decorators'],
  painting:      ['Painters & Decorators'],
  welder:        ['Welding & Fabrication'],
  welding:       ['Welding & Fabrication'],
  fabrication:   ['Welding & Fabrication'],
  'dry clean':   ['Dry Cleaning & Laundry'],
  laundry:       ['Dry Cleaning & Laundry'],
  tailor:        ['Tailoring & Fashion Design'],
  tailoring:     ['Tailoring & Fashion Design'],
  seamstress:    ['Tailoring & Fashion Design'],
  cook:          ['Catering Services'],
  cooking:       ['Catering Services'],
  caterer:       ['Catering Services'],
  catering:      ['Catering Services'],
  chef:          ['Catering Services'],
  nanny:         ['Home Care & Nursing'],
  babysitter:    ['Home Care & Nursing'],
  housekeeper:   ['Home Care & Nursing'],
  'domestic staff': ['Home Care & Nursing'],
  cleaner:       ['Domestic Cleaning Services'],
  cleaning:      ['Domestic Cleaning Services'],
  fumigation:    ['Fumigation & Pest Control'],
  'pest control':['Fumigation & Pest Control'],
  exterminator:  ['Fumigation & Pest Control'],
  tiler:         ['Tiling & Flooring'],
  tiling:        ['Tiling & Flooring'],
  flooring:      ['Tiling & Flooring'],
  roofing:       ['Roofing Contractors'],
  roofer:        ['Roofing Contractors'],
  bricklayer:    ['Bricklayers & Masons'],
  mason:         ['Bricklayers & Masons'],
  'ac repair':   ['AC & Refrigeration Services'],
  'air condition':['AC & Refrigeration Services'],
  generator:     ['Generator Repairs & Servicing', 'Generator Sales'],
  solar:         ['Solar & Renewable Energy'],
  inverter:      ['Solar & Renewable Energy'],
  barber:        ['Barbing Salons'],
  barbershop:    ['Barbing Salons'],
  salon:         ['Beauty Salons & Hair Salons'],
  hairdresser:   ['Beauty Salons & Hair Salons'],
  makeup:        ['Makeup Artists'],
  mua:           ['Makeup Artists'],
  photographer:  ['Photography & Video'],
  photography:   ['Photography & Video'],
  videographer:  ['Photography & Video'],
  tutor:         ['Private Tutors & Lesson Teachers'],
  lesson:        ['Private Tutors & Lesson Teachers'],
  teacher:       ['Private Tutors & Lesson Teachers'],
  mechanic:      ['Auto Repairs & Mechanics'],
  'car repair':  ['Auto Repairs & Mechanics'],
  dispatch:      ['Dispatch Riders'],
  delivery:      ['Dispatch Riders', 'Logistics & Courier Services'],
  courier:       ['Logistics & Courier Services'],
  logistics:     ['Logistics & Courier Services'],
  security:      ['Security Companies'],
  guard:         ['Security Companies'],
  landscaping:   ['Landscaping & Gardening'],
  gardening:     ['Landscaping & Gardening'],
  'interior design': ['Interior Design'],
  decorator:     ['Interior Design', 'Painters & Decorators'],
  mover:         ['Moving & Relocation Services'],
  moving:        ['Moving & Relocation Services'],
  relocation:    ['Moving & Relocation Services'],
  hotel:         ['Hotels & Resorts'],
  lodge:         ['Hotels & Resorts', 'Guest Houses & Lodges'],
  restaurant:    ['Restaurants & Cafes'],
  eatery:        ['Restaurants & Cafes'],
  'fast food':   ['Fast Food & Bukas'],
  buka:          ['Fast Food & Bukas', 'Mama Put & Local Canteens'],
  pharmacy:      ['Pharmacies & Chemists'],
  chemist:       ['Pharmacies & Chemists'],
  hospital:      ['Hospitals & Clinics'],
  clinic:        ['Hospitals & Clinics'],
  doctor:        ['General Practitioners (GP)', 'Hospitals & Clinics'],
  dentist:       ['Dental Clinics'],
  bank:          ['Commercial Banks'],
  school:        ['Nursery & Primary Schools', 'Secondary Schools'],
  university:    ['Universities & Polytechnics'],
  supermarket:   ['Supermarkets & Hypermarkets'],
  market:        ['Open Markets & Stalls'],
  church:        ['Churches'],
  mosque:        ['Mosques'],
  gym:           ['Gyms & Fitness Centres'],
  fitness:       ['Gyms & Fitness Centres'],
  spa:           ['Spas & Wellness Centres'],
  massage:       ['Massage Therapy'],
  suya:          ['Suya & Pepper Soup Spots'],
  bakery:        ['Bakery & Confectionery'],
  bread:         ['Bakery & Confectionery'],
  filling:       ['Filling Stations & Petrol Stations'],
  petrol:        ['Filling Stations & Petrol Stations'],
  fuel:          ['Filling Stations & Petrol Stations'],
  lawyer:        ['Legal Services & Law Firms'],
  solicitor:     ['Legal Services & Law Firms'],
  accountant:    ['Accounting & Auditing'],
  'real estate': ['Real Estate Agents'],
  property:      ['Real Estate Agents', 'Property Developers'],
};

// Expand query into category terms using aliases
function expandQuery(q: string): string[] {
  const lower = q.toLowerCase().trim();
  const terms: string[] = [q]; // always include original

  for (const [keyword, categories] of Object.entries(KEYWORD_ALIASES)) {
    if (lower.includes(keyword)) {
      terms.push(...categories);
    }
  }
  return [...new Set(terms)];
}

// Helper to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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

        // Query filter — expand keywords to category aliases
        if (q) {
            const terms = expandQuery(q);
            whereConditions.push({
                OR: terms.flatMap(term => [
                    { name: { contains: term } },
                    { category: { contains: term } },
                    { description: { contains: term } },
                    { tags: { contains: term } },
                ])
            });
        }

        // Text Location filter (ignored if using lat/lng)
        // SQLite LIKE is case-insensitive for ASCII — normalise to title case
        if (location && (!lat || !lng)) {
            const locTitle = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
            const locLower = location.toLowerCase();
            whereConditions.push({
                OR: [
                    { city: { contains: location } },
                    { city: { contains: locTitle } },
                    { city: { contains: locLower } },
                    { state: { contains: location } },
                    { state: { contains: locTitle } },
                    { address: { contains: location } },
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
            // For geo search fetch all matching, for text search fetch extra then slice
            take: (lat && lng) ? undefined : limit * 3,
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
                return { ...biz, distance: 999999 };
            });

            // Sort by distance ascending (featured get a 5km boost)
            businesses.sort((a: any, b: any) => {
                const scoreA = a.distance - (a.isFeatured ? 5 : 0);
                const scoreB = b.distance - (b.isFeatured ? 5 : 0);
                return scoreA - scoreB;
            });

            // Filter to 100km radius — wide enough to always return results in Nigeria
            const nearby = businesses.filter((biz: any) => biz.distance < 100);
            businesses = nearby.length > 0 ? nearby : businesses.slice(0, limit);
        }

        // Limit results
        businesses = businesses.slice(0, limit);

        return NextResponse.json(businesses);
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
