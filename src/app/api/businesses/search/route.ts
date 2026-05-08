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

  // ── Products & items people want to BUY ──────────────────────
  // Building materials
  cement:          ['Building Materials', 'Wholesale & Distribution'],
  'iron rod':      ['Building Materials', 'Welding & Fabrication'],
  'iron rods':     ['Building Materials', 'Welding & Fabrication'],
  'reinforcement': ['Building Materials'],
  'roofing sheet': ['Roofing Materials', 'Building Materials'],
  'roofing sheets':['Roofing Materials', 'Building Materials'],
  'zinc':          ['Roofing Materials', 'Building Materials'],
  'block':         ['Block Industry', 'Building Materials'],
  'blocks':        ['Block Industry', 'Building Materials'],
  'sand':          ['Building Materials', 'Wholesale & Distribution'],
  'gravel':        ['Building Materials'],
  'granite':       ['Building Materials', 'Tiles & Flooring'],
  'tile':          ['Tiles & Flooring', 'Building Materials'],
  'tiles':         ['Tiles & Flooring', 'Building Materials'],
  'paint':         ['Paints & Coatings'],
  'paints':        ['Paints & Coatings'],
  'plank':         ['Carpenters & Woodwork', 'Building Materials'],
  'planks':        ['Carpenters & Woodwork', 'Building Materials'],
  'wood':          ['Carpenters & Woodwork', 'Building Materials'],
  'timber':        ['Carpenters & Woodwork', 'Building Materials'],
  'pipe':          ['Plumbing Materials', 'Plumbing & Pipefitting'],
  'pipes':         ['Plumbing Materials', 'Plumbing & Pipefitting'],
  'wire':          ['Electrical Materials', 'Electrical Installation'],
  'cables':        ['Electrical Materials'],
  'door':          ['Doors & Windows', 'Building Materials'],
  'doors':         ['Doors & Windows', 'Building Materials'],
  'window':        ['Doors & Windows', 'Glass & Aluminium Products'],
  'windows':       ['Doors & Windows', 'Glass & Aluminium Products'],
  'glass':         ['Glass & Aluminium Products'],
  'aluminium':     ['Aluminium & Steel Works', 'Glass & Aluminium Products'],
  'toilet':        ['Sanitary Wares', 'Plumbing Materials'],
  'bathroom':      ['Sanitary Wares'],
  'sink':          ['Sanitary Wares', 'Plumbing Materials'],
  'nail':          ['Nails, Bolts & Hardware'],
  'nails':         ['Nails, Bolts & Hardware'],
  'bolt':          ['Nails, Bolts & Hardware'],
  'bolts':         ['Nails, Bolts & Hardware'],
  'scaffold':      ['Scaffolding Services'],

  // Food & groceries
  'rice':          ['Farm Produce Sellers', 'Supermarkets & Hypermarkets', 'Open Markets & Stalls'],
  'beans':         ['Farm Produce Sellers', 'Open Markets & Stalls'],
  'yam':           ['Farm Produce Sellers', 'Yam & Cassava Sellers'],
  'cassava':       ['Farm Produce Sellers', 'Yam & Cassava Sellers'],
  'garri':         ['Farm Produce Sellers', 'Garri Sellers'],
  'tomato':        ['Farm Produce Sellers', 'Fresh Vegetable Sellers'],
  'tomatoes':      ['Farm Produce Sellers', 'Fresh Vegetable Sellers'],
  'pepper':        ['Farm Produce Sellers', 'Fresh Vegetable Sellers'],
  'onion':         ['Farm Produce Sellers', 'Fresh Vegetable Sellers'],
  'onions':        ['Farm Produce Sellers', 'Fresh Vegetable Sellers'],
  'vegetable':     ['Fresh Vegetable Sellers', 'Farm Produce Sellers'],
  'vegetables':    ['Fresh Vegetable Sellers', 'Farm Produce Sellers'],
  'fruit':         ['Fresh Fruit Sellers', 'Farm Produce Sellers'],
  'fruits':        ['Fresh Fruit Sellers', 'Farm Produce Sellers'],
  'fish':          ['Fresh Fish Sellers', 'Catfish & Tilapia Restaurants'],
  'chicken':       ['Fresh Meat Sellers', 'Chicken & Poultry Sellers'],
  'meat':          ['Fresh Meat Sellers', 'Abattoirs & Meat Processing'],
  'beef':          ['Fresh Meat Sellers', 'Cow Meat (Beef) Sellers'],
  'goat':          ['Goat & Ram Sellers', 'Fresh Meat Sellers'],
  'egg':           ['Egg Sellers', 'Poultry Farming'],
  'eggs':          ['Egg Sellers', 'Poultry Farming'],
  'palm oil':      ['Palm Oil Sellers', 'Farm Produce Sellers'],
  'groundnut oil': ['Groundnut Oil Sellers', 'Farm Produce Sellers'],
  'crayfish':      ['Crayfish & Stockfish Sellers'],
  'stockfish':     ['Crayfish & Stockfish Sellers'],
  'flour':         ['Flour Milling', 'Supermarkets & Hypermarkets'],
  'sugar':         ['Supermarkets & Hypermarkets', 'Wholesale & Distribution'],
  'milk':          ['Dairy & Milk Processing', 'Supermarkets & Hypermarkets'],
  'honey':         ['Honey Sellers'],
  'spice':         ['Spices & Seasoning Production', 'Farm Produce Sellers'],
  'spices':        ['Spices & Seasoning Production'],

  // Electronics & gadgets
  'phone':         ['Mobile Phone Shops', 'Phone Repairs'],
  'laptop':        ['Computer Shops', 'Laptop & Computer Repairers'],
  'computer':      ['Computer Shops', 'Computer Engineers'],
  'tv':            ['Electronics & Gadgets', 'TV & Electronics Repairs'],
  'television':    ['Electronics & Gadgets'],
  'fridge':        ['Household Appliances', 'Refrigerator & Freezer Technicians'],
  'refrigerator':  ['Household Appliances', 'Refrigerator & Freezer Technicians'],
  'freezer':       ['Household Appliances', 'Refrigerator & Freezer Technicians'],
  'washing machine':['Household Appliances', 'Washing Machine Technicians'],
  'air conditioner':['AC & Refrigeration Services', 'Household Appliances'],
  'ac':            ['AC & Refrigeration Services'],
  'fan':           ['Household Appliances', 'Electronics & Gadgets'],
  'blender':       ['Household Appliances', 'Kitchenware & Cookware'],
  'microwave':     ['Household Appliances'],
  'printer':       ['Computer Shops', 'Printer Repairers'],
  'battery':       ['Inverter & Battery Sales', 'Electronics & Gadgets'],
  'charger':       ['Phone Accessories', 'Electronics & Gadgets'],
  'earphone':      ['Phone Accessories', 'Electronics & Gadgets'],
  'headphone':     ['Phone Accessories', 'Electronics & Gadgets'],
  'power bank':    ['Phone Accessories', 'Electronics & Gadgets'],
  'cctv':          ['CCTV & Surveillance Systems', 'CCTV & Alarm Installers'],
  'camera':        ['Electronics & Gadgets', 'Photography & Video'],

  // Clothing & fashion
  'cloth':         ['Fashion & Clothing', 'Tailoring & Fashion Design'],
  'clothes':       ['Fashion & Clothing'],
  'dress':         ['Fashion & Clothing', 'Tailoring & Fashion Design'],
  'shoe':          ['Shoes & Footwear'],
  'shoes':         ['Shoes & Footwear'],
  'bag':           ['Bags & Accessories'],
  'bags':          ['Bags & Accessories'],
  'fabric':        ['Fabrics & Textiles', 'Ankara & Aso-Oke Sellers'],
  'ankara':        ['Ankara & Aso-Oke Sellers'],
  'lace':          ['Lace & George Fabric Sellers'],
  'wig':           ['Wigs & Hair Extensions'],
  'wigs':          ['Wigs & Hair Extensions'],
  'jewellery':     ['Jewellery & Watches'],
  'jewelry':       ['Jewellery & Watches'],
  'watch':         ['Jewellery & Watches'],
  'perfume':       ['Perfumes & Fragrances'],
  'cosmetics':     ['Cosmetics & Beauty Products'],

  // Automotive
  'tyre':          ['Tyre Services & Vulcanisers', 'Auto Parts & Accessories'],
  'tyres':         ['Tyre Services & Vulcanisers'],
  'engine oil':    ['Lubricants & Engine Oil', 'Auto Parts & Accessories'],
  'spare part':    ['Car Spare Parts', 'Auto Parts & Accessories'],
  'spare parts':   ['Car Spare Parts', 'Auto Parts & Accessories'],
  'car part':      ['Car Spare Parts'],
  'car parts':     ['Car Spare Parts'],
  'battery car':   ['Auto Parts & Accessories'],

  // Fuel & energy
  'diesel':        ['Filling Stations & Petrol Stations', 'Petroleum Products'],
  'kerosene':      ['Petroleum Products', 'Gas & Cooking Fuel'],
  'cooking gas':   ['Gas & Cooking Fuel'],
  'lpg':           ['LPG & CNG Stations', 'Gas & Cooking Fuel'],
  'solar panel':   ['Solar & Renewable Energy', 'Solar Panel Installation'],

  // Office & stationery
  'stationery':    ['Stationery & Art Supplies', 'Office Supplies & Stationery'],
  'book':          ['Bookshops', 'Books & Educational Materials'],
  'books':         ['Bookshops', 'Books & Educational Materials'],
  'pen':           ['Stationery & Art Supplies', 'Office Supplies & Stationery'],
  'paper':         ['Office Supplies & Stationery', 'Printing & Publishing'],
  'photocopy':     ['Business Centres (Xerox & Printing)', 'Photocopy & Scanning'],
  'xerox':         ['Business Centres (Xerox & Printing)'],
  'printing':      ['Printing & Publishing', 'Business Centres (Xerox & Printing)'],
  'lamination':    ['Binding & Lamination Services'],
  'binding':       ['Binding & Lamination Services'],

  // Agriculture
  'fertilizer':    ['Fertiliser & Agro-Chemicals'],
  'fertiliser':    ['Fertiliser & Agro-Chemicals'],
  'seedling':      ['Seedlings & Nursery Plants'],
  'seedlings':     ['Seedlings & Nursery Plants'],
  'feed':          ['Livestock Feed Sellers', 'Poultry Farming'],
  'poultry':       ['Poultry Farming', 'Chicken & Poultry Sellers'],
  'day old chick': ['Poultry Farming', 'Hatchery Services'],

  // Healthcare products
  'drug':          ['Pharmacies & Chemists'],
  'drugs':         ['Pharmacies & Chemists'],
  'medicine':      ['Pharmacies & Chemists'],
  'supplement':    ['Pharmacies & Chemists', 'Vitamins & Supplements'],
  'vitamin':       ['Pharmacies & Chemists', 'Vitamins & Supplements'],
  'condom':        ['Pharmacies & Chemists'],
  'glasses':       ['Eye Clinics & Opticians', 'Optical Shops & Glasses'],
  'contact lens':  ['Eye Clinics & Opticians'],

  // Furniture & home
  'mattress':      ['Bedding & Mattresses', 'Foam & Mattress Manufacturers'],
  'bed':           ['Furniture & Decor', 'Bedding & Mattresses'],
  'sofa':          ['Furniture & Decor'],
  'chair':         ['Furniture & Decor'],
  'table':         ['Furniture & Decor'],
  'wardrobe':      ['Furniture & Decor', 'Carpenters & Woodwork'],
  'curtain':       ['Curtains & Blinds'],
  'rug':           ['Furniture & Decor'],
  'carpet':        ['Furniture & Decor', 'Carpet & Upholstery Cleaning'],
  'pot':           ['Kitchenware & Cookware'],
  'pots':          ['Kitchenware & Cookware'],
  'cookware':      ['Kitchenware & Cookware'],
  'gas cooker':    ['Kitchenware & Cookware', 'Gas & Cooking Fuel'],
  'stove':         ['Kitchenware & Cookware'],

  // Buy/sell intent words — map to relevant categories
  'buy':           [], // handled by product words
  'sell':          ['Open Markets & Stalls', 'Wholesale & Distribution'],
  'wholesale':     ['Wholesale & Distribution'],
  'retail':        ['Supermarkets & Hypermarkets', 'Mini Marts & Kiosks'],
  'cheap':         ['Open Markets & Stalls', 'Wholesale & Distribution'],
  'affordable':    ['Open Markets & Stalls'],
  'dealer':        ['Wholesale & Distribution'],
  'supplier':      ['Wholesale & Distribution', 'Importers & Exporters'],
  'distributor':   ['Wholesale & Distribution'],
  'importer':      ['Importers & Exporters'],
  'exporter':      ['Importers & Exporters'],
};

// Expand query into category terms using aliases
function expandQuery(q: string): string[] {
  const lower = q.toLowerCase().trim();

  // Strip purchase/intent words — "buy cement" → "cement"
  const intentStripped = lower
    .replace(/\b(buy|sell|purchase|get|find|where to|where can i|i want|i need|looking for|need to buy|want to buy|how to get|price of|cost of|cheap|affordable)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const terms: string[] = [q, intentStripped].filter(Boolean);

  // Check both original and stripped version against aliases
  for (const checkStr of [lower, intentStripped]) {
    for (const [keyword, categories] of Object.entries(KEYWORD_ALIASES)) {
      if (categories.length > 0 && checkStr.includes(keyword)) {
        terms.push(...categories);
      }
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
    const openNow = searchParams.get('openNow') === 'true';

    try {
        // Build where conditions
        const whereConditions: any[] = [{ isActive: true }];

        // Query filter — expand keywords to category aliases
        // mode: 'insensitive' required for PostgreSQL (Neon)
        if (q) {
            const terms = expandQuery(q);
            whereConditions.push({
                OR: terms.flatMap(term => [
                    { name: { contains: term, mode: 'insensitive' as const } },
                    { category: { contains: term, mode: 'insensitive' as const } },
                    { description: { contains: term, mode: 'insensitive' as const } },
                    { tags: { contains: term, mode: 'insensitive' as const } },
                ])
            });
        }

        // Location filter — mode: 'insensitive' for PostgreSQL
        if (location && (!lat || !lng)) {
            whereConditions.push({
                OR: [
                    { city: { contains: location, mode: 'insensitive' as const } },
                    { state: { contains: location, mode: 'insensitive' as const } },
                    { address: { contains: location, mode: 'insensitive' as const } },
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

        // Open Now filter — Nigeria time is UTC+1
        if (openNow) {
            const nowUtc = new Date();
            // Nigeria is UTC+1
            const nowNigeria = new Date(nowUtc.getTime() + 60 * 60 * 1000);
            const hours = nowNigeria.getUTCHours().toString().padStart(2, '0');
            const minutes = nowNigeria.getUTCMinutes().toString().padStart(2, '0');
            const currentTime = `${hours}:${minutes}`; // e.g. "14:30"

            // Filter businesses where openingTime <= currentTime <= closingTime
            whereConditions.push({
                openingTime: { not: null, lte: currentTime },
                closingTime: { not: null, gte: currentTime },
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

        // ── Smart fallback — like Google, always return something ──
        if (businesses.length === 0 && q) {
            // Step 1: Try individual words from the query
            const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 2);
            if (words.length > 1) {
                const wordConditions = words.flatMap(word => [
                    { name: { contains: word, mode: 'insensitive' as const } },
                    { category: { contains: word, mode: 'insensitive' as const } },
                    { description: { contains: word, mode: 'insensitive' as const } },
                    { tags: { contains: word, mode: 'insensitive' as const } },
                ]);
                const fallback1Where: any = { isActive: true, OR: wordConditions };
                if (location) {
                    fallback1Where.OR = wordConditions;
                    const locTitle = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
                    businesses = await prisma.business.findMany({
                        where: {
                            AND: [
                                { isActive: true },
                                { OR: wordConditions },
                                { OR: [
                                    { city: { contains: location, mode: 'insensitive' as const } },
                                    { city: { contains: locTitle } },
                                    { state: { contains: location, mode: 'insensitive' as const } },
                                ]}
                            ]
                        },
                        take: limit,
                        orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }]
                    });
                } else {
                    businesses = await prisma.business.findMany({
                        where: { AND: [{ isActive: true }, { OR: wordConditions }] },
                        take: limit,
                        orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }]
                    });
                }
            }

            // Step 2: If still nothing, return popular businesses in the same city
            if (businesses.length === 0 && location) {
                const locTitle = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
                businesses = await prisma.business.findMany({
                    where: {
                        AND: [
                            { isActive: true },
                            { OR: [
                                { city: { contains: location, mode: 'insensitive' as const } },
                                { city: { contains: locTitle } },
                            ]}
                        ]
                    },
                    take: limit,
                    orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }, { reviewCount: 'desc' }]
                });
            }

            // Step 3: If still nothing, return top-rated businesses nationally
            if (businesses.length === 0) {
                businesses = await prisma.business.findMany({
                    where: { isActive: true },
                    take: limit,
                    orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }, { reviewCount: 'desc' }]
                });
            }
        }

        return NextResponse.json(businesses);
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
