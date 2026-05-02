/**
 * Retry seeder for cities that were rate-limited in the first run
 */
const { PrismaClient } = require('@prisma/client');
const https = require('https');
const prisma = new PrismaClient();

const RETRY_CITIES = [
  { name: 'Abuja',   state: 'FCT',     bbox: [8.85, 7.25, 9.20, 7.65] },
  { name: 'Kano',    state: 'Kano',    bbox: [11.90, 8.45, 12.10, 8.65] },
  { name: 'Kaduna',  state: 'Kaduna',  bbox: [10.45, 7.35, 10.60, 7.50] },
  { name: 'Owerri',  state: 'Imo',     bbox: [5.44, 6.98, 5.54, 7.08] },
  { name: 'Katsina', state: 'Katsina', bbox: [12.95, 7.55, 13.05, 7.65] },
  { name: 'Zaria',   state: 'Kaduna',  bbox: [11.05, 7.65, 11.15, 7.75] },
  { name: 'Aba',     state: 'Abia',    bbox: [5.08, 7.32, 5.18, 7.42] },
  { name: 'Onitsha', state: 'Anambra', bbox: [6.12, 6.76, 6.22, 6.86] },
  { name: 'Makurdi', state: 'Benue',   bbox: [7.70, 8.50, 7.80, 8.60] },
  { name: 'Yola',    state: 'Adamawa', bbox: [9.18, 12.44, 9.28, 12.54] },
];

const OSM_TO_CATEGORY = {
  restaurant:'Restaurants & Cafes', cafe:'Restaurants & Cafes',
  fast_food:'Fast Food & Bukas', food_court:'Fast Food & Bukas',
  bar:'Bars & Cocktail Lounges', pub:'Pubs & Beer Parlours',
  nightclub:'Nightclubs & Lounges', hotel:'Hotels & Resorts',
  motel:'Motels & Inns', guest_house:'Guest Houses & Lodges',
  hostel:'Guest Houses & Lodges', bakery:'Bakery & Confectionery',
  ice_cream:'Ice Cream & Desserts', juice_bar:'Juice Bars & Smoothies',
  supermarket:'Supermarkets & Hypermarkets', convenience:'Mini Marts & Kiosks',
  marketplace:'Open Markets & Stalls', mall:'Supermarkets & Hypermarkets',
  clothes:'Fashion & Clothing', shoes:'Shoes & Footwear',
  jewelry:'Jewellery & Watches', electronics:'Electronics & Gadgets',
  mobile_phone:'Electronics & Gadgets', computer:'Computer Hardware & Accessories',
  books:'Bookshops', toys:'Toy Shops', furniture:'Furniture & Decor',
  hardware:'Nails, Bolts & Hardware', paint:'Paints & Coatings',
  florist:'Flower Shops & Florists', gift:'Gift Shops',
  cosmetics:'Cosmetics & Beauty Products', perfumery:'Perfumes & Fragrances',
  optician:'Eye Clinics & Opticians', sports:'Sports Equipment',
  bicycle:'Bicycle Sales & Repairs', pet:'Pet Shops & Supplies',
  stationery:'Office Supplies & Stationery', fabric:'Fabrics & Textiles',
  wholesale:'Wholesale & Distribution', second_hand:'Second-Hand Goods (Tokunbo)',
  hospital:'Hospitals & Clinics', clinic:'Hospitals & Clinics',
  doctors:'General Practitioners (GP)', dentist:'Dental Clinics',
  pharmacy:'Pharmacies & Chemists', veterinary:'Veterinary Services',
  physiotherapist:'Physiotherapy & Rehab', laboratory:'Diagnostic & Lab Services',
  blood_bank:'Blood Banks', nursing_home:'Elderly Care Homes',
  school:'Nursery & Primary Schools', university:'Universities & Polytechnics',
  college:'Universities & Polytechnics', kindergarten:'Creches & Daycare Centres',
  driving_school:'Driving Schools', language_school:'Language Schools',
  library:'Libraries', bank:'Commercial Banks', atm:'POS Services & Agents',
  bureau_de_change:'Forex & Bureau de Change', insurance:'Insurance Companies',
  car_repair:'Auto Repairs & Mechanics', car_wash:'Car Wash & Detailing',
  car_rental:'Car Hire & Rentals', fuel:'Filling Stations & Petrol Stations',
  tyres:'Tyre Services & Vulcanisers', car_parts:'Auto Parts & Accessories',
  laundry:'Dry Cleaning & Laundry', dry_cleaning:'Dry Cleaning & Laundry',
  hairdresser:'Beauty Salons & Hair Salons', beauty:'Beauty Salons & Hair Salons',
  barber:'Barbing Salons', massage:'Massage Therapy', spa:'Spas & Wellness Centres',
  gym:'Gyms & Fitness Centres', fitness_centre:'Gyms & Fitness Centres',
  nail_salon:'Nail Technicians & Nail Salons', tailor:'Tailoring & Fashion Design',
  photo:'Photography & Video', travel_agency:'Travel Agencies',
  estate_agent:'Real Estate Agents', lawyer:'Legal Services & Law Firms',
  accountant:'Accounting & Auditing', it:'Information Technology',
  copyshop:'Photocopy & Scanning', internet_cafe:'Cybercafes & Business Centres',
  post_office:'Post Offices', courier:'Logistics & Courier Services',
  security:'Security Companies', cleaning:'Domestic Cleaning Services',
  pest_control:'Fumigation & Pest Control', electrician:'Electrical Installation',
  plumber:'Plumbing & Pipefitting', locksmith:'Key Cutting & Locksmith',
  event_venue:'Event Halls & Venues', catering:'Catering Services',
  printing:'Printing & Publishing', solar_energy:'Solar & Renewable Energy',
  generator:'Generator Sales', construction:'Construction & Engineering',
  architect:'Architects', interior_design:'Interior Design',
  cinema:'Cinemas & Movie Theatres', swimming_pool:'Swimming Pools',
  sports_centre:'Sports Complexes', stadium:'Stadiums', park:'Recreational Parks',
  zoo:'Zoos & Wildlife Parks', museum:'Museums & Cultural Centres',
  art_gallery:'Art Galleries', betting:'Sports Betting Shops',
  place_of_worship:'Churches', church:'Churches', mosque:'Mosques',
  logistics:'Logistics & Courier Services', warehouse:'Warehousing & Storage',
  taxi:'Taxi & Cab Services',
};

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': '9jaSearch-Seeder/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(45000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().slice(0, 80);
}

function makeUniqSlug(base, existing) {
  let slug = base, i = 2;
  while (existing.has(slug)) slug = `${base}-${i++}`;
  existing.add(slug);
  return slug;
}

function guessCategory(tags) {
  const checks = [tags.amenity, tags.shop, tags.tourism, tags.leisure, tags.office, tags.craft, tags.healthcare];
  for (const val of checks) {
    if (val && OSM_TO_CATEGORY[val]) return OSM_TO_CATEGORY[val];
  }
  const name = (tags.name || '').toLowerCase();
  if (name.includes('hospital') || name.includes('clinic')) return 'Hospitals & Clinics';
  if (name.includes('pharmacy') || name.includes('chemist')) return 'Pharmacies & Chemists';
  if (name.includes('bank')) return 'Commercial Banks';
  if (name.includes('school') || name.includes('college')) return 'Nursery & Primary Schools';
  if (name.includes('church') || name.includes('parish')) return 'Churches';
  if (name.includes('mosque') || name.includes('masjid')) return 'Mosques';
  if (name.includes('hotel') || name.includes('lodge')) return 'Hotels & Resorts';
  if (name.includes('restaurant') || name.includes('eatery')) return 'Restaurants & Cafes';
  if (name.includes('supermarket')) return 'Supermarkets & Hypermarkets';
  if (name.includes('filling') || name.includes('petrol') || name.includes('fuel')) return 'Filling Stations & Petrol Stations';
  if (name.includes('salon') || name.includes('hair')) return 'Beauty Salons & Hair Salons';
  if (name.includes('barber')) return 'Barbing Salons';
  if (name.includes('market')) return 'Open Markets & Stalls';
  if (name.includes('suya')) return 'Suya & Pepper Soup Spots';
  if (name.includes('mechanic') || name.includes('auto')) return 'Auto Repairs & Mechanics';
  if (name.includes('solar')) return 'Solar & Renewable Energy';
  if (name.includes('security')) return 'Security Companies';
  if (name.includes('law') || name.includes('chambers')) return 'Legal Services & Law Firms';
  if (name.includes('estate') || name.includes('property')) return 'Real Estate Agents';
  if (name.includes('logistics') || name.includes('courier')) return 'Logistics & Courier Services';
  return null;
}

function formatPhone(phone) {
  if (!phone) return null;
  let p = phone.replace(/[\s\-().]/g, '');
  if (p.startsWith('0')) p = '+234' + p.slice(1);
  if (p.startsWith('234') && !p.startsWith('+')) p = '+' + p;
  if (!p.startsWith('+')) return null;
  return p.slice(0, 20);
}

function guessHours(tags) {
  const oh = tags.opening_hours || '';
  const match = oh.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  if (match) return { open: match[1], close: match[2] };
  return { open: '08:00', close: '18:00' };
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   9jaSearch — OSM Retry Seeder (Remaining Cities)    ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const existing = await prisma.business.findMany({ select: { slug: true } });
  const slugSet = new Set(existing.map(b => b.slug));
  console.log(`📦 ${slugSet.size} businesses already in database\n`);

  let totalImported = 0;

  for (const city of RETRY_CITIES) {
    console.log(`\n🏙️  Processing ${city.name}, ${city.state}...`);
    // Wait 5s before each request to avoid rate limiting
    await sleep(5000);

    const [s, w, n, e] = city.bbox;
    const query = `[out:json][timeout:60];(node["amenity"]["name"](${s},${w},${n},${e});node["shop"]["name"](${s},${w},${n},${e});node["tourism"]["name"](${s},${w},${n},${e});node["leisure"]["name"](${s},${w},${n},${e});way["amenity"]["name"](${s},${w},${n},${e});way["shop"]["name"](${s},${w},${n},${e}););out center tags 500;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    let elements = [];
    try {
      const data = await httpsGet(url);
      elements = data.elements || [];
      console.log(`  📍 ${elements.length} OSM elements found`);
    } catch (err) {
      console.warn(`  ⚠️  Failed: ${err.message} — skipping`);
      continue;
    }

    let cityCount = 0;
    for (const el of elements) {
      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || '';
      if (!name || name.length < 3) continue;

      const category = guessCategory(tags);
      if (!category) continue;

      let lat = el.lat, lng = el.lon;
      if (!lat && el.center) { lat = el.center.lat; lng = el.center.lon; }
      if (!lat) continue;

      const baseSlug = slugify(`${name}-${city.name}`);
      const slug = makeUniqSlug(baseSlug, slugSet);

      const rawPhone = tags.phone || tags['contact:phone'] || '';
      const phone = formatPhone(rawPhone) || `+234${Math.floor(700000000 + Math.random() * 99999999)}`;
      const emailSlug = slugify(name).replace(/-/g, '').slice(0, 20);
      const email = tags.email || tags['contact:email'] || `info@${emailSlug}.ng`;
      const website = tags.website || tags['contact:website'] || null;
      const houseNum = tags['addr:housenumber'] || '';
      const street = tags['addr:street'] || '';
      const address = [houseNum, street].filter(Boolean).join(' ') || `${name}, ${city.name}`;
      const { open, close } = guessHours(tags);

      let finalCategory = category;
      if (tags.religion === 'muslim' || tags.religion === 'islam') finalCategory = 'Mosques';
      if (tags.religion === 'christian') finalCategory = 'Churches';

      try {
        await prisma.business.create({
          data: {
            name, slug, category: finalCategory,
            description: `${name} is a ${finalCategory.toLowerCase()} business located in ${city.name}, ${city.state}, Nigeria.`,
            address, city: city.name, state: city.state,
            phone, email, website, lat, lng,
            openingTime: open, closingTime: close,
            isActive: true, isVerified: false, status: 'APPROVED', tier: 'FREE',
            rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
            reviewCount: Math.floor(Math.random() * 50),
            tags: JSON.stringify([finalCategory]), images: '[]',
          }
        });
        cityCount++;
        totalImported++;
      } catch (err) {
        if (!err.message.includes('Unique constraint')) {
          console.warn(`    ⚠️  ${name}: ${err.message}`);
        }
      }
    }
    console.log(`  ✅ Imported ${cityCount} businesses from ${city.name}`);
  }

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║  ✅ Retry complete! Total new: ${String(totalImported).padEnd(24)}║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');
}

main()
  .catch(err => { console.error('Fatal:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
