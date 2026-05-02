/**
 * 9jaSearch — OpenStreetMap (Overpass API) Business Seeder
 * ─────────────────────────────────────────────────────────
 * Pulls real Nigerian businesses from OpenStreetMap via the
 * free Overpass API and seeds them into the local database.
 *
 * Run: node prisma/seed-osm.js
 */

const { PrismaClient } = require('@prisma/client');
const https = require('https');

const prisma = new PrismaClient();

// ── Nigerian cities with bounding boxes [south, west, north, east] ──
const CITIES = [
  { name: 'Lagos',         state: 'Lagos',   bbox: [6.35, 3.10, 6.70, 3.75] },
  { name: 'Abuja',         state: 'FCT',     bbox: [8.85, 7.25, 9.20, 7.65] },
  { name: 'Port Harcourt', state: 'Rivers',  bbox: [4.70, 6.90, 5.00, 7.20] },
  { name: 'Kano',          state: 'Kano',    bbox: [11.90, 8.45, 12.10, 8.65] },
  { name: 'Ibadan',        state: 'Oyo',     bbox: [7.30, 3.80, 7.55, 4.05] },
  { name: 'Enugu',         state: 'Enugu',   bbox: [6.35, 7.45, 6.55, 7.60] },
  { name: 'Benin City',    state: 'Edo',     bbox: [6.25, 5.55, 6.45, 5.75] },
  { name: 'Kaduna',        state: 'Kaduna',  bbox: [10.45, 7.35, 10.60, 7.50] },
  { name: 'Owerri',        state: 'Imo',     bbox: [5.44, 6.98, 5.54, 7.08] },
  { name: 'Warri',         state: 'Delta',   bbox: [5.48, 5.68, 5.58, 5.78] },
  { name: 'Abeokuta',      state: 'Ogun',    bbox: [7.10, 3.30, 7.25, 3.45] },
  { name: 'Calabar',       state: 'Cross River', bbox: [4.90, 8.28, 5.05, 8.42] },
  { name: 'Uyo',           state: 'Akwa Ibom', bbox: [5.00, 7.88, 5.10, 7.98] },
  { name: 'Maiduguri',     state: 'Borno',   bbox: [11.80, 13.10, 11.95, 13.25] },
  { name: 'Jos',           state: 'Plateau', bbox: [9.85, 8.85, 9.98, 8.98] },
  { name: 'Ilorin',        state: 'Kwara',   bbox: [8.44, 4.52, 8.56, 4.64] },
  { name: 'Asaba',         state: 'Delta',   bbox: [6.17, 6.72, 6.25, 6.80] },
  { name: 'Akure',         state: 'Ondo',    bbox: [7.22, 5.16, 7.32, 5.26] },
  { name: 'Osogbo',        state: 'Osun',    bbox: [7.74, 4.52, 7.84, 4.62] },
  { name: 'Sokoto',        state: 'Sokoto',  bbox: [13.02, 5.20, 13.12, 5.30] },
];

// ── OSM amenity/shop/tourism tags → your category names ──
const OSM_TO_CATEGORY = {
  // Food & Hospitality
  restaurant:        'Restaurants & Cafes',
  cafe:              'Restaurants & Cafes',
  fast_food:         'Fast Food & Bukas',
  food_court:        'Fast Food & Bukas',
  bar:               'Bars & Cocktail Lounges',
  pub:               'Pubs & Beer Parlours',
  nightclub:         'Nightclubs & Lounges',
  hotel:             'Hotels & Resorts',
  motel:             'Motels & Inns',
  guest_house:       'Guest Houses & Lodges',
  hostel:            'Guest Houses & Lodges',
  bakery:            'Bakery & Confectionery',
  ice_cream:         'Ice Cream & Desserts',
  juice_bar:         'Juice Bars & Smoothies',

  // Retail
  supermarket:       'Supermarkets & Hypermarkets',
  convenience:       'Mini Marts & Kiosks',
  marketplace:       'Open Markets & Stalls',
  mall:              'Supermarkets & Hypermarkets',
  clothes:           'Fashion & Clothing',
  shoes:             'Shoes & Footwear',
  jewelry:           'Jewellery & Watches',
  electronics:       'Electronics & Gadgets',
  mobile_phone:      'Electronics & Gadgets',
  computer:          'Computer Hardware & Accessories',
  books:             'Bookshops',
  toys:              'Toy Shops',
  furniture:         'Furniture & Decor',
  hardware:          'Nails, Bolts & Hardware',
  paint:             'Paints & Coatings',
  florist:           'Flower Shops & Florists',
  gift:              'Gift Shops',
  cosmetics:         'Cosmetics & Beauty Products',
  perfumery:         'Perfumes & Fragrances',
  optician:          'Eye Clinics & Opticians',
  sports:            'Sports Equipment',
  bicycle:           'Bicycle Sales & Repairs',
  pet:               'Pet Shops & Supplies',
  stationery:        'Office Supplies & Stationery',
  fabric:            'Fabrics & Textiles',
  wholesale:         'Wholesale & Distribution',
  second_hand:       'Second-Hand Goods (Tokunbo)',

  // Healthcare
  hospital:          'Hospitals & Clinics',
  clinic:            'Hospitals & Clinics',
  doctors:           'General Practitioners (GP)',
  dentist:           'Dental Clinics',
  pharmacy:          'Pharmacies & Chemists',
  veterinary:        'Veterinary Services',
  physiotherapist:   'Physiotherapy & Rehab',
  laboratory:        'Diagnostic & Lab Services',
  blood_bank:        'Blood Banks',
  nursing_home:      'Elderly Care Homes',
  social_facility:   'Disability Support Services',

  // Education
  school:            'Nursery & Primary Schools',
  university:        'Universities & Polytechnics',
  college:           'Universities & Polytechnics',
  kindergarten:      'Creches & Daycare Centres',
  driving_school:    'Driving Schools',
  language_school:   'Language Schools',
  music_school:      'Music & Arts Schools',
  dance:             'Dance Schools',
  library:           'Libraries',

  // Finance
  bank:              'Commercial Banks',
  atm:               'POS Services & Agents',
  bureau_de_change:  'Forex & Bureau de Change',
  insurance:         'Insurance Companies',
  microfinance_bank: 'Microfinance Banks',

  // Automotive
  car_repair:        'Auto Repairs & Mechanics',
  car_wash:          'Car Wash & Detailing',
  car_rental:        'Car Hire & Rentals',
  fuel:              'Filling Stations & Petrol Stations',
  tyres:             'Tyre Services & Vulcanisers',
  car_parts:         'Auto Parts & Accessories',
  car_dealership:    'Car Dealerships (New)',

  // Services
  laundry:           'Dry Cleaning & Laundry',
  dry_cleaning:      'Dry Cleaning & Laundry',
  hairdresser:       'Beauty Salons & Hair Salons',
  beauty:            'Beauty Salons & Hair Salons',
  barber:            'Barbing Salons',
  massage:           'Massage Therapy',
  spa:               'Spas & Wellness Centres',
  gym:               'Gyms & Fitness Centres',
  fitness_centre:    'Gyms & Fitness Centres',
  nail_salon:        'Nail Technicians & Nail Salons',
  tailor:            'Tailoring & Fashion Design',
  photo:             'Photography & Video',
  travel_agency:     'Travel Agencies',
  estate_agent:      'Real Estate Agents',
  lawyer:            'Legal Services & Law Firms',
  accountant:        'Accounting & Auditing',
  it:                'Information Technology',
  copyshop:          'Photocopy & Scanning',
  internet_cafe:     'Cybercafes & Business Centres',
  post_office:       'Post Offices',
  courier:           'Logistics & Courier Services',
  security:          'Security Companies',
  cleaning:          'Domestic Cleaning Services',
  pest_control:      'Fumigation & Pest Control',
  electrician:       'Electrical Installation',
  plumber:           'Plumbing & Pipefitting',
  locksmith:         'Key Cutting & Locksmith',
  key_cutter:        'Key Cutting & Locksmith',
  funeral_directors: 'Miscellaneous',
  storage_rental:    'Warehousing & Storage',
  event_venue:       'Event Halls & Venues',
  wedding:           'Wedding Planners',
  catering:          'Catering Services',
  printing:          'Printing & Publishing',
  advertising:       'Advertising & PR',
  graphic_design:    'Graphic Design',
  web_design:        'Web Design & Development',
  solar_energy:      'Solar & Renewable Energy',
  generator:         'Generator Sales',
  construction:      'Construction & Engineering',
  architect:         'Architects',
  surveyor:          'Land Surveyors',
  interior_design:   'Interior Design',
  landscaping:       'Landscaping & Gardening',

  // Religious
  place_of_worship:  'Churches',
  church:            'Churches',
  mosque:            'Mosques',

  // Entertainment & Recreation
  cinema:            'Cinemas & Movie Theatres',
  theatre:           'Comedy Shows & Theatres',
  amusement_arcade:  'Gaming & Arcade Centres',
  bowling_alley:     'Bowling Alleys',
  swimming_pool:     'Swimming Pools',
  sports_centre:     'Sports Complexes',
  stadium:           'Stadiums',
  park:              'Recreational Parks',
  zoo:               'Zoos & Wildlife Parks',
  museum:            'Museums & Cultural Centres',
  art_gallery:       'Art Galleries',
  golf_course:       'Golf Courses',
  tennis:            'Tennis Courts',
  basketball:        'Basketball Courts',
  betting:           'Sports Betting Shops',

  // Agriculture
  farm:              'Crop Farming',
  fish_farm:         'Fish Farming & Aquaculture',
  poultry:           'Poultry Farming',
  agro:              'Agro-Processing & Milling',

  // Logistics
  logistics:         'Logistics & Courier Services',
  warehouse:         'Warehousing & Storage',
  freight:           'Freight Forwarding',
  taxi:              'Taxi & Cab Services',
  bus_station:       'Bus & Coach Services',

  // Energy
  solar:             'Solar & Renewable Energy',
  oil_gas:           'Oil & Gas Services',
};

// ── Helpers ──────────────────────────────────────────────────────────

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': '9jaSearch-Seeder/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + data.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80);
}

function makeUniqSlug(base, existing) {
  let slug = base;
  let i = 2;
  while (existing.has(slug)) {
    slug = `${base}-${i++}`;
  }
  existing.add(slug);
  return slug;
}

function guessCategory(tags) {
  const checks = [
    tags.amenity, tags.shop, tags.tourism, tags.leisure,
    tags.office, tags.craft, tags.healthcare, tags.sport,
    tags.landuse, tags.building
  ];
  for (const val of checks) {
    if (val && OSM_TO_CATEGORY[val]) return OSM_TO_CATEGORY[val];
  }
  // Fallback: keyword scan on name
  const name = (tags.name || '').toLowerCase();
  if (name.includes('hospital') || name.includes('clinic')) return 'Hospitals & Clinics';
  if (name.includes('pharmacy') || name.includes('chemist')) return 'Pharmacies & Chemists';
  if (name.includes('bank')) return 'Commercial Banks';
  if (name.includes('school') || name.includes('college')) return 'Nursery & Primary Schools';
  if (name.includes('church') || name.includes('parish')) return 'Churches';
  if (name.includes('mosque') || name.includes('masjid')) return 'Mosques';
  if (name.includes('hotel') || name.includes('lodge')) return 'Hotels & Resorts';
  if (name.includes('restaurant') || name.includes('eatery')) return 'Restaurants & Cafes';
  if (name.includes('supermarket') || name.includes('shoprite')) return 'Supermarkets & Hypermarkets';
  if (name.includes('filling') || name.includes('petrol') || name.includes('fuel')) return 'Filling Stations & Petrol Stations';
  if (name.includes('salon') || name.includes('hair')) return 'Beauty Salons & Hair Salons';
  if (name.includes('barber')) return 'Barbing Salons';
  if (name.includes('gym') || name.includes('fitness')) return 'Gyms & Fitness Centres';
  if (name.includes('market')) return 'Open Markets & Stalls';
  if (name.includes('suya')) return 'Suya & Pepper Soup Spots';
  if (name.includes('bakery') || name.includes('bread')) return 'Bakery & Confectionery';
  if (name.includes('mechanic') || name.includes('auto')) return 'Auto Repairs & Mechanics';
  if (name.includes('solar')) return 'Solar & Renewable Energy';
  if (name.includes('security')) return 'Security Companies';
  if (name.includes('law') || name.includes('legal') || name.includes('chambers')) return 'Legal Services & Law Firms';
  if (name.includes('estate') || name.includes('property') || name.includes('realty')) return 'Real Estate Agents';
  if (name.includes('logistics') || name.includes('courier') || name.includes('delivery')) return 'Logistics & Courier Services';
  return null;
}

function formatPhone(phone) {
  if (!phone) return null;
  // Normalise to +234 format
  let p = phone.replace(/[\s\-().]/g, '');
  if (p.startsWith('0')) p = '+234' + p.slice(1);
  if (p.startsWith('234') && !p.startsWith('+')) p = '+' + p;
  if (!p.startsWith('+')) return null;
  return p.slice(0, 20);
}

function guessHours(tags) {
  const oh = tags.opening_hours || '';
  // Try to extract open/close from "Mo-Fr 08:00-18:00" style
  const match = oh.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  if (match) return { open: match[1], close: match[2] };
  return { open: '08:00', close: '18:00' };
}

// ── Overpass query builder ────────────────────────────────────────────

function buildQuery(bbox) {
  const [s, w, n, e] = bbox;
  const area = `(${s},${w},${n},${e})`;

  // Query nodes and ways with name tag for common amenity/shop types
  return `
[out:json][timeout:60];
(
  node["amenity"]["name"]${area};
  node["shop"]["name"]${area};
  node["tourism"]["name"]${area};
  node["leisure"]["name"]${area};
  node["office"]["name"]${area};
  node["craft"]["name"]${area};
  node["healthcare"]["name"]${area};
  way["amenity"]["name"]${area};
  way["shop"]["name"]${area};
  way["tourism"]["name"]${area};
);
out center tags 500;
`.trim();
}

// ── Main seeder ───────────────────────────────────────────────────────

async function fetchCity(city) {
  const query = buildQuery(city.bbox);
  const encoded = encodeURIComponent(query);
  const url = `https://overpass-api.de/api/interpreter?data=${encoded}`;

  console.log(`  📡 Querying OSM for ${city.name}...`);
  try {
    const data = await httpsGet(url);
    return data.elements || [];
  } catch (err) {
    console.warn(`  ⚠️  Failed to fetch ${city.name}: ${err.message}`);
    return [];
  }
}

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   9jaSearch — OpenStreetMap Business Seeder          ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  // Load existing slugs to avoid duplicates
  const existing = await prisma.business.findMany({ select: { slug: true } });
  const slugSet = new Set(existing.map(b => b.slug));
  console.log(`📦 ${slugSet.size} businesses already in database\n`);

  let totalImported = 0;
  let totalSkipped = 0;

  for (const city of CITIES) {
    console.log(`\n🏙️  Processing ${city.name}, ${city.state}...`);

    const elements = await fetchCity(city);
    console.log(`  📍 ${elements.length} OSM elements found`);

    let cityCount = 0;

    for (const el of elements) {
      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || '';

      // Skip unnamed or very short names
      if (!name || name.length < 3) continue;

      // Determine category
      const category = guessCategory(tags);
      if (!category) continue;

      // Get coordinates
      let lat = el.lat;
      let lng = el.lon;
      if (!lat && el.center) { lat = el.center.lat; lng = el.center.lon; }
      if (!lat) continue;

      // Build slug
      const baseSlug = slugify(`${name}-${city.name}`);
      const slug = makeUniqSlug(baseSlug, slugSet);

      // Phone
      const rawPhone = tags.phone || tags['contact:phone'] || tags['phone:NG'] || '';
      const phone = formatPhone(rawPhone) || `+234${Math.floor(700000000 + Math.random() * 99999999)}`;

      // Email (OSM rarely has this — use placeholder)
      const emailSlug = slugify(name).replace(/-/g, '').slice(0, 20);
      const email = tags.email || tags['contact:email'] || `info@${emailSlug}.ng`;

      // Website
      const website = tags.website || tags['contact:website'] || null;

      // Address
      const houseNum = tags['addr:housenumber'] || '';
      const street   = tags['addr:street'] || '';
      const address  = [houseNum, street].filter(Boolean).join(' ') || `${name}, ${city.name}`;

      // Hours
      const { open, close } = guessHours(tags);

      // Description
      const description = tags.description ||
        `${name} is a ${category.toLowerCase()} business located in ${city.name}, ${city.state}, Nigeria.`;

      // Religion tag → refine category
      let finalCategory = category;
      if (tags.religion === 'muslim' || tags.religion === 'islam') finalCategory = 'Mosques';
      if (tags.religion === 'christian') finalCategory = 'Churches';

      try {
        await prisma.business.create({
          data: {
            name,
            slug,
            category: finalCategory,
            description,
            address,
            city: city.name,
            state: city.state,
            phone,
            email,
            website,
            lat,
            lng,
            openingTime: open,
            closingTime: close,
            isActive: true,
            isVerified: false,
            status: 'APPROVED',
            tier: 'FREE',
            rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
            reviewCount: Math.floor(Math.random() * 50),
            tags: JSON.stringify([finalCategory]),
            images: '[]',
          }
        });
        cityCount++;
        totalImported++;
      } catch (err) {
        if (!err.message.includes('Unique constraint')) {
          console.warn(`    ⚠️  ${name}: ${err.message}`);
        }
        totalSkipped++;
      }
    }

    console.log(`  ✅ Imported ${cityCount} businesses from ${city.name}`);

    // Be polite to the Overpass API — wait 2s between cities
    await sleep(2000);
  }

  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log(`║  ✅ Done! Imported: ${String(totalImported).padEnd(6)} | Skipped: ${String(totalSkipped).padEnd(6)}  ║`);
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
}

main()
  .catch(err => { console.error('Fatal error:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
